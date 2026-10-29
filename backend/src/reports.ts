import { randomUUID } from 'node:crypto';
import { Actor } from './auth';
import { ApiError, pagination, pageResult, safeCsv } from './common';
import { Db } from './db';
import { Files } from './files';
import { assertUserScope, scopeArgs, scopeCte } from './scope';

export class Reports {
  private running = false;
  constructor(private db: Db, private files: Files) {}
  async dashboard(actor: Actor) {
    const counts = (await this.db.query(`${scopeCte} SELECT channel,status,count(*)::int AS total FROM messages WHERE user_id IN (SELECT id FROM scoped_users) GROUP BY channel,status`, scopeArgs(actor))).rows;
    const campaigns = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM campaigns WHERE user_id IN (SELECT id FROM scoped_users)`, scopeArgs(actor))).rows[0].count);
    const contacts = Number((await this.db.query("SELECT count(*) FROM resources WHERE tenant_id=$1 AND kind='contact'", [actor.tenant_id])).rows[0].count);
    const wallet = (await this.db.query('SELECT balance,reserved FROM wallets WHERE user_id=$1', [actor.id])).rows[0];
    return { campaigns, contacts, messages: counts, wallet, currency: 'INR', unit: 'paise' };
  }
  async messages(actor: Actor, query: any, body: any = {}) {
    const p = pagination(query);
    const values = [...scopeArgs(actor), body.channel || null, body.status || null, body.campaign_id || body.send_sms_id || null];
    const where = 'user_id IN (SELECT id FROM scoped_users) AND ($4::text IS NULL OR channel=$4) AND ($5::text IS NULL OR status=$5) AND ($6::bigint IS NULL OR campaign_id=$6)';
    const count = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM messages WHERE ${where}`, values)).rows[0].count);
    return pageResult((await this.db.query(`${scopeCte} SELECT * FROM messages WHERE ${where} ORDER BY id DESC LIMIT $7 OFFSET $8`, [...values, p.perPage, p.offset])).rows, count, p.page, p.perPage);
  }
  async summary(actor: Actor, body: any = {}) {
    return (await this.db.query(`${scopeCte} SELECT channel,date_trunc('day',created_at) AS day,status,count(*)::int AS total,sum(cost)::text AS cost_paise
      FROM messages WHERE user_id IN (SELECT id FROM scoped_users) AND ($4::text IS NULL OR channel=$4) GROUP BY channel,day,status ORDER BY day DESC LIMIT 365`, [...scopeArgs(actor), body.channel || null])).rows;
  }
  async requestExport(actor: Actor, filters: any) {
    const id = randomUUID();
    // Explicit fields only. Tenant scope always comes from the authenticated session.
    const selected = { channel: filters.channel || null, status: filters.status || null, campaign_id: filters.campaign_id || filters.send_sms_id || null };
    await this.db.query('INSERT INTO exports(id,tenant_id,user_id,filters) VALUES($1,$2,$3,$4)', [id, actor.tenant_id, actor.id, selected]);
    return { id, export_id: id, status: 'queued' };
  }
  async getExport(actor: Actor, id: string) {
    const row = (await this.db.query('SELECT * FROM exports WHERE id=$1 AND tenant_id=$2', [id, actor.tenant_id])).rows[0];
    if (!row) throw new ApiError(404, 'Export not found.');
    await assertUserScope(this.db, actor, Number(row.user_id));
    return row;
  }
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      await this.db.query("UPDATE exports SET status='queued' WHERE status='processing' AND lease_until<now()");
      const job = await this.db.transaction(async c => {
        const row = (await c.query("SELECT * FROM exports WHERE status='queued' ORDER BY created_at FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0];
        if (row) await c.query("UPDATE exports SET status='processing',lease_until=now()+interval '10 minutes' WHERE id=$1", [row.id]);
        return row;
      });
      if (!job) return;
      try {
        const filter = job.filters;
        const user = (await this.db.query('SELECT * FROM users WHERE id=$1 AND active=true', [job.user_id])).rows[0];
        if (!user) throw new ApiError(403, 'Export owner is inactive.');
        const actor = { id: Number(user.id), tenant_id: Number(job.tenant_id), role: user.role } as Actor;
        // Bounded pilot export; return a real error rather than silently truncating larger reports.
        const rows = (await this.db.query(`${scopeCte} SELECT id,campaign_id,recipient,channel,status,cost,created_at FROM messages WHERE user_id IN (SELECT id FROM scoped_users)
          AND ($4::text IS NULL OR channel=$4) AND ($5::text IS NULL OR status=$5) AND ($6::bigint IS NULL OR campaign_id=$6)
          ORDER BY id LIMIT 50001`, [...scopeArgs(actor), filter.channel, filter.status, filter.campaign_id])).rows;
        if (rows.length > 50000) throw new ApiError(422, 'Narrow the filters: pilot export limit is 50,000 messages.');
        const columns = ['id','campaign_id','recipient','channel','status','cost','created_at'];
        const csv = [columns.join(','), ...rows.map(r => columns.map(k => safeCsv(r[k])).join(','))].join('\r\n');
        const file = await this.files.save(actor, `report-${job.id}.csv`, 'text/csv', Buffer.from(csv));
        await this.db.query("UPDATE exports SET status='completed',file_id=$1,lease_until=NULL,updated_at=now() WHERE id=$2", [file.id, job.id]);
      } catch (e) {
        await this.db.query("UPDATE exports SET status='failed',error=$1,lease_until=NULL,updated_at=now() WHERE id=$2", [e instanceof Error ? e.message : 'Export failed', job.id]);
      }
    } finally { this.running = false; }
  }
}
