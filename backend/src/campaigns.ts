import { PoolClient } from 'pg';
import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, normalizePhone, pagination, pageResult, sha256, smsSegments } from './common';
import { Config } from './config';
import { Db } from './db';
import { Channel, ProviderFailure, Providers } from './providers';
import { assertUserScope, scopeArgs, scopeCte } from './scope';
import {templateMessageSchema} from './whatsapp-template';

export class Campaigns {
  private running = false;
  constructor(private db: Db, private cfg: Config, private providers: Providers, private notify: (tenant: number, event: any) => void = () => {}) {}
  async create(actor: Actor, channel: Channel, body: any, key: string, internalChat = false) {
    authorize(actor, 'campaign:create');
    const billedUser = body.user_id === undefined ? actor.id : idSchema.parse(body.user_id);
    if (billedUser !== actor.id) { authorize(actor, 'users:write'); await assertUserScope(this.db, actor, billedUser); }
    const input = z.object({ name: z.string().min(1).max(200).default('Campaign'), message: z.string().max(10000).default(''),
      recipients: z.array(z.string()).min(1).max(10000), schedule_at: z.iso.datetime({ offset: true }).optional(),
      payload: z.record(z.string(), z.unknown()).default({}) }).parse({ ...body, message: body.message ?? body.msg,
      recipients: body.recipients ?? (typeof body.mobile_numbers === 'string' ? body.mobile_numbers.split(/[,\n]/).filter(Boolean) : body.mobile_numbers),
      payload: { ...(body.payload || {}), ...(body.template ? { template: body.template } : {}), ...(body.variables ? { variables: body.variables } : {}), ...(body.flow_id ? { flow_id: body.flow_id } : {}) } });
    z.string().min(8).max(200).parse(key);
    const phones = [...new Set(input.recipients.map(normalizePhone))];
    if (channel === 'sms' && !input.message) throw new ApiError(422, 'SMS message is required to calculate segment cost.');
    if (channel === 'sms' && this.cfg.PROVIDER_MODE === 'live') {
      const template = process.env.MSG91_TEMPLATE_TEXT;
      const variables = input.payload.variables as Record<string, unknown> | undefined;
      if (!template || !variables || typeof variables !== 'object') throw new ApiError(503, 'Configure approved MSG91_TEMPLATE_TEXT and campaign variables before live sending.');
      if (input.payload.flow_id && input.payload.flow_id !== process.env.MSG91_FLOW_ID) throw new ApiError(422, 'Campaign flow does not match the configured approved flow.');
      const rendered = template.replace(/\{\{([a-zA-Z0-9_]+)\}\}/g, (_match, name) => {
        if (typeof variables[name] !== 'string') throw new ApiError(422, `Missing template variable: ${name}`);
        return variables[name] as string;
      });
      if (rendered !== input.message) throw new ApiError(422, 'Displayed message must match the approved flow text and variables for accurate billing.');
    }
    if (input.payload.text && !internalChat) throw new ApiError(422, 'Plain text replies must use the chat endpoint.');
    if(!internalChat&&['chat_id','workflow_run_id','automation_run_id','internal_chat'].some(key=>input.payload[key]!==undefined))throw new ApiError(422,'Internal message fields are not accepted from campaign clients.');
    if(channel==='whatsapp')input.payload.internal_chat=internalChat;
    if (channel === 'whatsapp' && this.cfg.PROVIDER_MODE === 'live') {
      if (!input.payload.template && !internalChat) throw new ApiError(422, 'WhatsApp template is required.');
    }
    if(channel==='whatsapp'){
      if(internalChat&&input.payload.chat_id){
        const chat=(await this.db.query('SELECT c.phone_number_id FROM chat_messages m JOIN conversations c ON c.id=m.conversation_id WHERE m.id=$1 AND m.tenant_id=$2',[input.payload.chat_id,actor.tenant_id])).rows[0];
        if(!chat)throw new ApiError(404,'Chat message not found.');
        if(chat.phone_number_id)input.payload.phone_number_id=chat.phone_number_id;
      }
      const accounts=(await this.db.query("SELECT phone_number_id,templates FROM meta_connections WHERE tenant_id=$1 AND status='connected' AND ($2::text IS NULL OR phone_number_id=$2)",[actor.tenant_id,input.payload.phone_number_id||null])).rows;
      if(accounts.length===1)input.payload.phone_number_id=accounts[0].phone_number_id;
      else if(this.cfg.PROVIDER_MODE==='live'||input.payload.phone_number_id||accounts.length>1)throw new ApiError(422,'Select a connected WhatsApp sender belonging to this business.');
      if(input.payload.template&&accounts.length===1){
        const template=templateMessageSchema.parse(input.payload.template);input.payload.template=template;
        if(!accounts[0].templates.some((t:any)=>t.name===template.name&&t.language===template.language.code&&t.status==='APPROVED'))throw new ApiError(422,'Template is not approved for the selected sender. Synchronize templates first.');
      }
    }
    const userRow = (await this.db.query('SELECT parent_user_id FROM users WHERE id=$1', [billedUser])).rows[0];
    const parentUserId = userRow?.parent_user_id ? Number(userRow.parent_user_id) : null;
    let markupPaise = 0;
    if (parentUserId) {
      const markupRow = (await this.db.query('SELECT markup_paise, markup_percent FROM reseller_markups WHERE reseller_id=$1 AND channel=$2 AND active=true', [parentUserId, channel])).rows[0];
      if (markupRow) {
        const baseCostForOne = channel === 'sms' ? this.cfg.SMS_UNIT_PRICE_PAISE * smsSegments(input.message) : channel === 'whatsapp' ? this.cfg.WHATSAPP_UNIT_PRICE_PAISE : this.cfg.VOICE_UNIT_PRICE_PAISE;
        markupPaise = Number(markupRow.markup_paise) + Math.round((Number(markupRow.markup_percent) / 100) * baseCostForOne);
      }
    }
    const basePrice = channel === 'sms' ? this.cfg.SMS_UNIT_PRICE_PAISE * smsSegments(input.message) : channel === 'whatsapp' ? this.cfg.WHATSAPP_UNIT_PRICE_PAISE : this.cfg.VOICE_UNIT_PRICE_PAISE;
    const price = basePrice + markupPaise;
    const cost = phones.length * price;
    const requestHash = sha256(JSON.stringify({ channel, user_id: billedUser, ...input, recipients: phones }));
    return this.db.transaction(async c => {
      // Serialize wallet operations and duplicate requests per tenant.
      const wallet = (await c.query('SELECT * FROM wallets WHERE tenant_id=$1 AND user_id=$2 FOR UPDATE', [actor.tenant_id, billedUser])).rows[0];
      const existing = (await c.query('SELECT * FROM campaigns WHERE user_id=$1 AND idempotency_key=$2', [billedUser, key])).rows[0];
      if (existing) {
        if (existing.request_hash !== requestHash) throw new ApiError(409, 'Idempotency key was used for a different request.');
        return existing;
      }
      const blocked = await c.query("SELECT data->>'phone' AS phone FROM resources WHERE tenant_id=$1 AND kind='blacklist'", [actor.tenant_id]);
      if (blocked.rows.some(r => phones.includes(r.phone))) throw new ApiError(422, 'Campaign contains blacklisted recipients.');
      if(channel==='whatsapp'&&(await c.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=ANY($2::text[]) AND opted_out=true',[actor.tenant_id,phones])).rowCount)throw new ApiError(422,'Recipient opted out of WhatsApp messaging.');
      let requiresApproval=false;
      if(channel==='whatsapp'&&!internalChat){
        const eligible=Number((await c.query('SELECT count(*) FROM contact_consent WHERE tenant_id=$1 AND phone=ANY($2::text[]) AND opted_out=false AND opted_in_at IS NOT NULL',[actor.tenant_id,phones])).rows[0].count);
        if(eligible!==phones.length)throw new ApiError(422,'Every broadcast recipient needs recorded WhatsApp opt-in consent.');
        await c.query('INSERT INTO broadcast_policies(tenant_id) VALUES($1) ON CONFLICT DO NOTHING',[actor.tenant_id]);
        requiresApproval=(await c.query('SELECT require_approval FROM broadcast_policies WHERE tenant_id=$1',[actor.tenant_id])).rows[0].require_approval;
      }
      if (!wallet || Number(wallet.balance) - Number(wallet.reserved) < cost) throw new ApiError(422, 'Insufficient available credits.');
      const campaign = (await c.query(`INSERT INTO campaigns(tenant_id,user_id,channel,name,payload,scheduled_at,idempotency_key,request_hash,total,cost)
        VALUES($1,$2,$3,$4,$5,COALESCE($6::timestamptz,now()),$7,$8,$9,$10) RETURNING *`,
        [actor.tenant_id, billedUser, channel, input.name, { ...input.payload, message: input.message }, input.schedule_at || null, key, requestHash, phones.length, cost])).rows[0];
      if(requiresApproval){await c.query("UPDATE campaigns SET status='pending_approval' WHERE id=$1",[campaign.id]);campaign.status='pending_approval';}
      await c.query(`INSERT INTO messages(campaign_id,tenant_id,recipient,channel,cost,markup_cost,parent_user_id,next_attempt_at,user_id)
        SELECT $1,$2,phone,$3,$4,$5,$6,COALESCE($8::timestamptz,now()),$7 FROM unnest($9::text[]) AS phone`,
        [campaign.id, actor.tenant_id, channel, price, markupPaise, parentUserId, billedUser, input.schedule_at || null, phones]);
      await c.query('UPDATE wallets SET reserved=reserved+$1 WHERE user_id=$2', [cost, billedUser]);
      await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,'reserve',$3,$4,$5)", [actor.tenant_id, billedUser, cost, `campaign:${campaign.id}`, actor.id]);
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'campaign.create',$3)", [actor.tenant_id, actor.id, String(campaign.id)]);
      return campaign;
    });
  }
  async list(actor: Actor, query: any, body: any = {}, channel?: Channel) {
    const p = pagination(query);
    const where = 'user_id IN (SELECT id FROM scoped_users) AND ($4::text IS NULL OR channel=$4) AND ($5::text IS NULL OR status=$5)';
    const args = [...scopeArgs(actor), channel || null, body.status || null];
    const total = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM campaigns WHERE ${where}`, args)).rows[0].count);
    const rows = (await this.db.query(`${scopeCte} SELECT * FROM campaigns WHERE ${where} ORDER BY id DESC LIMIT $6 OFFSET $7`, [...args, p.perPage, p.offset])).rows;
    return pageResult(rows, total, p.page, p.perPage);
  }
  async get(actor: Actor, id: unknown) {
    const row = (await this.db.query('SELECT * FROM campaigns WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, idSchema.parse(id)])).rows[0];
    if (!row) throw new ApiError(404, 'Campaign not found.');
    await assertUserScope(this.db, actor, Number(row.user_id));
    const stats = (await this.db.query('SELECT status,count(*)::int AS count FROM messages WHERE campaign_id=$1 AND tenant_id=$2 GROUP BY status', [row.id, actor.tenant_id])).rows;
    return { ...row, counts: Object.fromEntries(stats.map(r => [r.status, r.count])) };
  }
  async cancel(actor: Actor, id: unknown) {
    authorize(actor, 'campaign:cancel');
    await this.get(actor, id);
    return this.db.transaction(async c => {
      // Same lock order as settlement (message -> wallet); avoid campaign row locks here.
      const rows = (await c.query("SELECT * FROM messages WHERE tenant_id=$1 AND campaign_id=$2 AND status='queued' ORDER BY id FOR UPDATE", [actor.tenant_id, idSchema.parse(id)])).rows;
      const campaign = (await c.query('SELECT * FROM campaigns WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, id])).rows[0];
      if (!campaign) throw new ApiError(404, 'Campaign not found.');
      for (const row of rows) await this.release(c, row, 'cancelled');
      await c.query("UPDATE campaigns SET status='cancelled',updated_at=now() WHERE tenant_id=$1 AND id=$2", [actor.tenant_id, id]);
      return { id, status: 'cancelled', unsent_cancelled: rows.length };
    });
  }
  private async release(c: PoolClient, row: any, status: string, error?: string) {
    if (row.charged) return;
    await c.query('UPDATE wallets SET reserved=reserved-$1 WHERE user_id=$2', [row.cost, row.user_id]);
    await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference) VALUES($1,$2,'release',$3,$4) ON CONFLICT DO NOTHING", [row.tenant_id, row.user_id, row.cost, `message:${row.id}`]);
    await c.query('UPDATE messages SET status=$1,error=$2,lease_until=NULL,updated_at=now() WHERE id=$3', [status, error || null, row.id]);
  }
  async tick() {
    if (this.running) return;
    this.running = true;
    try {
      // A crash after submission can mean acceptance. Expired leases must be reconciled, not resent.
      const expired = await this.db.query("UPDATE messages SET status='uncertain',error='Worker interrupted; reconcile with provider',lease_until=NULL WHERE status='sending' AND lease_until<now() RETURNING campaign_id");
      for (const row of expired.rows) await this.refresh(row.campaign_id);
      for (let i = 0; i < 10; i++) {
        const row = await this.db.transaction(async c => {
          const message = (await c.query(`SELECT m.*,c.payload FROM messages m JOIN campaigns c ON c.id=m.campaign_id LEFT JOIN broadcast_policies b ON b.tenant_id=m.tenant_id
            WHERE m.status='queued' AND m.next_attempt_at<=now() AND c.status IN ('queued','processing')
            AND (m.channel<>'whatsapp' OR c.payload->>'internal_chat'='true' OR COALESCE(b.paused,false)=false)
            AND NOT EXISTS(SELECT 1 FROM meta_connections mc WHERE mc.tenant_id=m.tenant_id AND mc.phone_number_id=c.payload->>'phone_number_id' AND mc.quality_rating='RED' AND c.payload->>'internal_chat'='false')
            ORDER BY m.id FOR UPDATE OF m SKIP LOCKED LIMIT 1`)).rows[0];
          if (!message) return null;
          if(message.channel==='whatsapp'&&!message.payload.internal_chat&&!message.dispatch_reserved_at){
            await c.query("INSERT INTO broadcast_daily_usage(tenant_id,day) VALUES($1,(now() AT TIME ZONE 'UTC')::date) ON CONFLICT DO NOTHING",[message.tenant_id]);
            const usage=(await c.query("SELECT * FROM broadcast_daily_usage WHERE tenant_id=$1 AND day=(now() AT TIME ZONE 'UTC')::date FOR UPDATE",[message.tenant_id])).rows[0];
            const policy=(await c.query('SELECT daily_limit FROM broadcast_policies WHERE tenant_id=$1',[message.tenant_id])).rows[0];
            if(usage.dispatches>=(policy?.daily_limit||1000)){await c.query("UPDATE messages SET next_attempt_at=((now() AT TIME ZONE 'UTC')::date+1) AT TIME ZONE 'UTC' WHERE id=$1",[message.id]);return null;}
            await c.query('UPDATE broadcast_daily_usage SET dispatches=dispatches+1 WHERE tenant_id=$1 AND day=$2',[message.tenant_id,usage.day]);
            await c.query('UPDATE messages SET dispatch_reserved_at=now() WHERE id=$1',[message.id]);
          }
          await c.query("UPDATE messages SET status='sending',attempts=attempts+1,lease_until=now()+interval '2 minutes' WHERE id=$1", [message.id]);
          await c.query("UPDATE campaigns SET status='processing',updated_at=now() WHERE id=$1 AND status='queued'", [message.campaign_id]);
          return message;
        });
        if (!row) break;
        try {
          if(row.channel==='whatsapp'){
            if(row.payload.text&&this.cfg.PROVIDER_MODE==='live'&&!(await this.db.query("SELECT 1 FROM chat_messages outgoing JOIN chat_messages incoming ON incoming.conversation_id=outgoing.conversation_id AND incoming.tenant_id=outgoing.tenant_id WHERE outgoing.id=$1 AND outgoing.tenant_id=$2 AND incoming.direction='in' AND incoming.created_at>now()-interval '24 hours' LIMIT 1",[row.payload.chat_id,row.tenant_id])).rowCount)throw new ProviderFailure('Customer service window expired before dispatch.');
            if(row.payload.phone_number_id&&!(await this.db.query("SELECT 1 FROM meta_connections WHERE tenant_id=$1 AND phone_number_id=$2 AND status='connected'",[row.tenant_id,row.payload.phone_number_id])).rowCount)throw new ProviderFailure('WhatsApp connection was disconnected before submission.');
            const optedOut=await this.db.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=$2 AND opted_out=true',[row.tenant_id,row.recipient]);
            if(optedOut.rowCount)throw new ProviderFailure('Customer opted out before submission.');
            if(!row.payload.internal_chat&&!(await this.db.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=$2 AND opted_out=false AND opted_in_at IS NOT NULL',[row.tenant_id,row.recipient])).rowCount)throw new ProviderFailure('WhatsApp opt-in consent is no longer available.');
            if(row.payload.template&&row.payload.phone_number_id){
              const account=(await this.db.query('SELECT templates FROM meta_connections WHERE tenant_id=$1 AND phone_number_id=$2',[row.tenant_id,row.payload.phone_number_id])).rows[0];
              if(!account?.templates.some((t:any)=>t.name===row.payload.template.name&&t.language===row.payload.template.language.code&&t.status==='APPROVED'))throw new ProviderFailure('Template is no longer approved.');
            }
            if(row.payload.workflow_run_id){const blocked=await this.db.query("SELECT 1 FROM workflow_runs r JOIN conversations c ON c.id=r.conversation_id WHERE r.id=$1 AND r.tenant_id=$2 AND (c.bot_paused=true OR c.state='closed')",[row.payload.workflow_run_id,row.tenant_id]);if(blocked.rowCount)throw new ProviderFailure('Workflow paused before submission.');}
            if(row.payload.automation_run_id){const blocked=await this.db.query("SELECT 1 FROM automation_runs r JOIN conversations c ON c.id=r.conversation_id WHERE r.id=$1 AND r.tenant_id=$2 AND (c.bot_paused=true OR c.state='closed')",[row.payload.automation_run_id,row.tenant_id]);if(blocked.rowCount)throw new ProviderFailure('Automation paused before submission.');}
          }
          const result = await this.providers.send({ id: String(row.id), tenant_id:Number(row.tenant_id),recipient: row.recipient, channel: row.channel, payload: row.payload });
          await this.db.transaction(async c => {
            const locked = (await c.query('SELECT * FROM messages WHERE id=$1 FOR UPDATE', [row.id])).rows[0];
            if (locked.charged) return;
            await c.query('UPDATE wallets SET balance=balance-$1,reserved=reserved-$1 WHERE user_id=$2', [row.cost, row.user_id]);
            await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference) VALUES($1,$2,'charge',$3,$4)", [row.tenant_id, row.user_id, row.cost, `message:${row.id}`]);
            if (locked.parent_user_id && Number(locked.markup_cost) > 0) {
              const markup = Number(locked.markup_cost);
              await c.query('UPDATE wallets SET balance=balance+$1 WHERE user_id=$2', [markup, locked.parent_user_id]);
              await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,'markup_rebate',$3,$4,$5)",
                [row.tenant_id, locked.parent_user_id, markup, `reconcile:message:${row.id}`, row.user_id]);
            }
            await c.query("UPDATE messages SET provider=$1,provider_id=$2,status=$3,charged=true,lease_until=NULL,updated_at=now() WHERE id=$4",
              [result.provider, result.id, result.simulated && this.cfg.MOCK_DELIVERY ? 'delivered' : 'submitted', row.id]);
            if (row.payload.chat_id) await c.query("UPDATE chat_messages SET provider_id=$1,status=$4 WHERE id=$2 AND tenant_id=$3", [result.id, row.payload.chat_id, row.tenant_id,result.simulated && this.cfg.MOCK_DELIVERY?'delivered':'submitted']);
          });
        } catch (error) {
          await this.db.transaction(async c => {
            const locked = (await c.query('SELECT * FROM messages WHERE id=$1 FOR UPDATE', [row.id])).rows[0];
            if (locked.charged) return;
            if (error instanceof ProviderFailure && error.uncertain) {
              await c.query("UPDATE messages SET status='uncertain',error=$1,lease_until=NULL WHERE id=$2", [error.message, row.id]);
            } else if (error instanceof ProviderFailure && error.retryable && locked.attempts < 4) {
              await c.query("UPDATE messages SET status='queued',error=$1,lease_until=NULL,next_attempt_at=now()+interval '60 seconds' WHERE id=$2", [error.message, row.id]);
            } else await this.release(c, locked, 'failed', error instanceof Error ? error.message : 'Provider error');
            if (row.payload.chat_id) await c.query("UPDATE chat_messages SET status='needs_attention' WHERE id=$1 AND tenant_id=$2", [row.payload.chat_id, row.tenant_id]);
          });
        }
        await this.refresh(row.campaign_id);
        this.notify(Number(row.tenant_id), { command: 'campaign.updated', data: { id: row.campaign_id, user_id: row.user_id } });
      }
    } finally { this.running = false; }
  }
  async refresh(id: unknown) {
    await this.db.query(`UPDATE campaigns SET status=CASE
      WHEN EXISTS(SELECT 1 FROM messages WHERE campaign_id=$1 AND status='uncertain') THEN 'needs_attention'
      WHEN EXISTS(SELECT 1 FROM messages WHERE campaign_id=$1 AND status IN ('queued','sending')) THEN 'processing'
      WHEN EXISTS(SELECT 1 FROM messages WHERE campaign_id=$1 AND status='submitted') THEN 'submitted'
      ELSE 'completed' END,updated_at=now() WHERE id=$1 AND status!='cancelled'`, [id]);
  }
  async delivery(provider: string, providerId: string, status: string, eventKey: string, payload: any) {
    if (!['submitted', 'delivered', 'read', 'failed'].includes(status)) throw new ApiError(422, 'Unsupported delivery status.');
    const result = await this.db.transaction(async c => {
      const row = (await c.query('SELECT * FROM messages WHERE provider=$1 AND provider_id=$2 FOR UPDATE', [provider, providerId])).rows[0];
      // Retry callback if it races the send response. Never acknowledge and silently lose it.
      if (!row) throw new ApiError(503, 'Submission not recorded yet; retry callback.');
      const inserted = await c.query('INSERT INTO delivery_events(provider,event_key,message_id,payload) VALUES($1,$2,$3,$4) ON CONFLICT DO NOTHING RETURNING id', [provider, eventKey, row.id, payload]);
      if (!inserted.rowCount) return row;
      const ranks: Record<string, number> = { submitted: 1, failed: 2, delivered: 3, read: 4 };
      if ((ranks[status] || 0) > (ranks[row.status] || 0)) {
        await c.query('UPDATE messages SET status=$1,updated_at=now() WHERE id=$2', [status, row.id]);
        await c.query('UPDATE chat_messages SET status=$1 WHERE provider_id=$2 AND tenant_id=$3',[status,providerId,row.tenant_id]);
      }
      // Accepted messages are billed once. Delivery failures are not auto-refunded; provider billing varies.
      return row;
    });
    await this.refresh(result.campaign_id);
    this.notify(Number(result.tenant_id), { command: 'delivery.updated', data: { id: result.id, status, user_id: result.user_id } });
  }
  async reconcile(actor: Actor, id: unknown, body: any) {
    authorize(actor, 'billing:write');
    const owner = (await this.db.query('SELECT user_id FROM messages WHERE id=$1 AND tenant_id=$2', [idSchema.parse(id), actor.tenant_id])).rows[0];
    if (!owner) throw new ApiError(404, 'Message not found.');
    await assertUserScope(this.db, actor, Number(owner.user_id));
    const input = z.object({ outcome: z.enum(['accepted', 'not_accepted']), provider: z.enum(['msg91', 'meta', 'exotel', 'mock']).optional(), provider_id: z.string().min(1).optional(), reason: z.string().min(10).max(1000) }).parse(body);
    if (input.outcome === 'accepted' && (!input.provider || !input.provider_id)) throw new ApiError(422, 'Accepted submissions require provider and provider_id.');
    const row = await this.db.transaction(async c => {
      const row = (await c.query("SELECT * FROM messages WHERE id=$1 AND tenant_id=$2 AND status='uncertain' FOR UPDATE", [idSchema.parse(id), actor.tenant_id])).rows[0];
      if (!row) throw new ApiError(404, 'Uncertain message not found.');
      if (input.outcome === 'accepted') {
        await c.query('UPDATE wallets SET balance=balance-$1,reserved=reserved-$1 WHERE user_id=$2', [row.cost, row.user_id]);
        await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,'charge',$3,$4,$5)", [actor.tenant_id, row.user_id, row.cost, `message:${row.id}`, actor.id]);
        await c.query("UPDATE messages SET charged=true,status='submitted',provider=$1,provider_id=$2,error=NULL WHERE id=$3", [input.provider, input.provider_id, row.id]);
      } else await this.release(c, row, 'failed', input.reason);
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'message.reconcile',$3)", [actor.tenant_id, actor.id, JSON.stringify({ id: row.id, ...input })]);
      return row;
    });
    await this.refresh(row.campaign_id);
    return { reconciled: true };
  }
  async resend(actor: Actor, campaignId: unknown, key: string, messageId?: unknown) {
    const original = await this.get(actor, campaignId);
    const rows = (await this.db.query("SELECT recipient FROM messages WHERE campaign_id=$1 AND tenant_id=$2 AND status IN ('failed','cancelled') AND ($3::bigint IS NULL OR id=$3)", [original.id, actor.tenant_id, messageId === undefined ? null : idSchema.parse(messageId)])).rows;
    if (!rows.length) throw new ApiError(409, 'No failed or cancelled messages can be resent. Uncertain submissions require reconciliation first.');
    return this.create(actor, original.channel, { name: `Resend: ${original.name}`, message: original.payload.message,
      recipients: rows.map(r => r.recipient), payload: original.payload, user_id: original.user_id }, key);
  }
  async finish(actor: Actor, id: unknown) {
    authorize(actor, 'campaign:cancel'); await this.get(actor, id);
    if ((await this.db.query("SELECT 1 FROM messages WHERE campaign_id=$1 AND status IN ('queued','sending','uncertain') LIMIT 1", [id])).rowCount) throw new ApiError(409, 'Campaign has pending or uncertain messages.');
    await this.refresh(id); return this.get(actor, id);
  }
}
