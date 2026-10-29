import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, encrypt, idSchema, normalizePhone, pagination, pageResult } from './common';
import { Config } from './config';
import { Db } from './db';

export const resources: Record<string, { singular: string; kind: string; admin?: boolean }> = {
  'contact-numbers': { singular: 'contact-number', kind: 'contact' },
  'contact-groups': { singular: 'contact-group', kind: 'contact_group' },
  blacklists: { singular: 'blacklist', kind: 'blacklist' },
  'dlt-templates': { singular: 'dlt-template', kind: 'dlt_template' },
  'dlt-template-groups': { singular: 'dlt-template-group', kind: 'template_group' },
  'manage-sender-ids': { singular: 'manage-sender-id', kind: 'sender_id' },
  'wa-account-configurations': { singular: 'wa-account-configuration', kind: 'wa_account', admin: true },
  'wa-templates': { singular: 'wa-template', kind: 'wa_template' },
  'wa-qrcodes': { singular: 'wa-qrcode', kind: 'wa_qrcode' },
  'wa-files': { singular: 'wa-file', kind: 'wa_media' },
  'voice-file-list': { singular: 'voice-upload', kind: 'voice_file' },
  'credit-requests': { singular: 'credit-request', kind: 'credit_request' },
  roles: { singular: 'role', kind: 'role', admin: true },
  'two-ways-smses': { singular: 'two-ways-sms', kind: 'two_way' },
  notifications: { singular: 'notification', kind: 'notification' },
  'ip-white-list-for-apis': { singular: 'ip-white-list-for-api', kind: 'ip_whitelist', admin: true },
  'administration/primary-routes': { singular: 'administration/primary-route', kind: 'primary_route', admin: true },
  'administration/secondary-routes': { singular: 'administration/secondary-route', kind: 'secondary_route', admin: true },
  'administration/dlrcode-list': { singular: 'administration/dlrcode', kind: 'dlr_code', admin: true },
  'administration/invalid-series-list': { singular: 'administration/invalid-series', kind: 'invalid_series', admin: true },
  'administration/notification-templates': { singular: 'administration/notification-template', kind: 'notification_template', admin: true },
  'administration/documents': { singular: 'administration/document', kind: 'api_document', admin: true },
  'administration/all-countries': { singular: 'administration/country', kind: 'country', admin: true },
  'administration/user-wise-monthly-reports': { singular: 'administration/user-wise-monthly-report', kind: 'user_report', admin: true },
  'wa-charges': { singular: 'set-wa-charge', kind: 'wa_charge', admin: true },
};
export const permissions = ['contacts:write', 'campaign:create', 'campaign:cancel', 'chat:reply', 'users:write', 'billing:write', 'billing:transfer', 'resources:write', 'admin:write'];
export class Resources {
  constructor(private db: Db, private cfg: Config) {}
  private publicData(row: any) {
    const { credentials_encrypted, ...data } = row.data;
    return { ...data, id: Number(row.id), created_at: row.created_at, updated_at: row.updated_at, ...(credentials_encrypted ? { credentials_configured: true } : {}) };
  }
  private validate(kind: string, body: any, partial = false): Record<string, any> {
    let data = z.record(z.string(), z.unknown()).parse(body);
    // Ownership/identity fields are authoritative columns, never client-controlled metadata.
    data = Object.fromEntries(Object.entries(data).filter(([k]) => !['id', 'tenant_id', 'created_by', 'created_at', 'updated_at', 'credentials_encrypted'].includes(k)));
    if (['contact', 'blacklist'].includes(kind)) {
      const phone = data.phone ?? data.mobile_number ?? data.mobile;
      if (phone !== undefined || !partial) data.phone = normalizePhone(z.string().parse(phone));
    }
    if (!partial && !['contact', 'blacklist', 'ip_whitelist', 'wa_charge', 'credit_request'].includes(kind)) {
      if (!data.name && !data.title && !data.template_name && !data.sender_id && !data.message) throw new ApiError(422, 'A name, title, template_name, sender_id, or message is required.');
    }
    if (kind === 'role' && data.permissions !== undefined) data.permissions = z.array(z.enum(permissions as [string, ...string[]])).parse(data.permissions);
    if (data.credentials !== undefined) {
      data.credentials_encrypted = encrypt(JSON.stringify(data.credentials), this.cfg.ENCRYPTION_KEY);
      delete data.credentials;
    }
    for (const k of ['access_token', 'api_key', 'api_token', 'password', 'secret']) {
      if (data[k] !== undefined) throw new ApiError(422, `Put ${k} inside credentials so it is encrypted.`);
    }
    return data;
  }
  async handle(actor: Actor, method: string, path: string, query: any, body: any): Promise<{ handled: boolean; data?: any }> {
    for (const [plural, spec] of Object.entries(resources)) {
      const singular = path === spec.singular;
      const isList = path === plural;
      const detail = path.startsWith(`${spec.singular}/`) ? path.slice(spec.singular.length + 1) : null;
      if (!singular && !isList && !detail) continue;
      if (spec.admin) authorize(actor, 'admin:write');
      if (isList && ['GET', 'POST'].includes(method)) return { handled: true, data: await this.list(actor, spec.kind, query, body) };
      if (detail && method === 'GET') return { handled: true, data: await this.get(actor, spec.kind, detail) };
      if (singular && method === 'POST') {
        authorize(actor, ['contact', 'contact_group', 'blacklist'].includes(spec.kind) ? 'contacts:write' : 'resources:write');
        return { handled: true, data: await this.create(actor, spec.kind, body) };
      }
      if (detail && ['PUT', 'PATCH', 'DELETE'].includes(method)) {
        authorize(actor, ['contact', 'contact_group', 'blacklist'].includes(spec.kind) ? 'contacts:write' : 'resources:write');
        const id = idSchema.parse(detail);
        const row = method === 'DELETE'
          ? (await this.db.query('DELETE FROM resources WHERE id=$1 AND tenant_id=$2 AND kind=$3 RETURNING *', [id, actor.tenant_id, spec.kind])).rows[0]
          : (await this.db.query('UPDATE resources SET data=data||$1::jsonb,updated_at=now() WHERE id=$2 AND tenant_id=$3 AND kind=$4 RETURNING *', [this.validate(spec.kind, body, true), id, actor.tenant_id, spec.kind])).rows[0];
        if (!row) throw new ApiError(404, 'Record not found.');
        await this.audit(actor, `${spec.kind}.${method.toLowerCase()}`, String(id));
        return { handled: true, data: method === 'DELETE' ? { id, deleted: true } : this.publicData(row) };
      }
      throw new ApiError(405, 'Method not supported for this resource.');
    }
    return { handled: false };
  }
  async list(actor: Actor, kind: string, query: any, body: any = {}) {
    const p = pagination(query);
    const search = String(body.search ?? body.name ?? '').slice(0, 200);
    const total = Number((await this.db.query("SELECT count(*) FROM resources WHERE tenant_id=$1 AND kind=$2 AND data::text ILIKE $3", [actor.tenant_id, kind, `%${search}%`])).rows[0].count);
    const rows = (await this.db.query("SELECT * FROM resources WHERE tenant_id=$1 AND kind=$2 AND data::text ILIKE $3 ORDER BY id DESC LIMIT $4 OFFSET $5", [actor.tenant_id, kind, `%${search}%`, p.perPage, p.offset])).rows.map(r => this.publicData(r));
    return pageResult(rows, total, p.page, p.perPage);
  }
  async get(actor: Actor, kind: string, id: unknown) {
    const row = (await this.db.query('SELECT * FROM resources WHERE tenant_id=$1 AND kind=$2 AND id=$3', [actor.tenant_id, kind, idSchema.parse(id)])).rows[0];
    if (!row) throw new ApiError(404, 'Record not found.');
    return this.publicData(row);
  }
  async create(actor: Actor, kind: string, body: any) {
    const data = this.validate(kind, body);
    const row = await this.db.transaction(async c => {
      if (data.group_id) {
        const group = await c.query("SELECT id FROM resources WHERE id=$1 AND tenant_id=$2 AND kind='contact_group'", [idSchema.parse(data.group_id), actor.tenant_id]);
        if (!group.rowCount) throw new ApiError(422, 'Contact group not found.');
      }
      const r = (await c.query('INSERT INTO resources(tenant_id,kind,data,created_by) VALUES($1,$2,$3,$4) RETURNING *', [actor.tenant_id, kind, data, actor.id])).rows[0];
      await c.query('INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,$3,$4)', [actor.tenant_id, actor.id, `${kind}.create`, String(r.id)]);
      return r;
    });
    return this.publicData(row);
  }
  async audit(actor: Actor, action: string, target?: string) {
    await this.db.query('INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,$3,$4)', [actor.tenant_id, actor.id, action, target || null]);
  }
  async bulk(actor: Actor, kind: string, body: any) {
    authorize(actor, 'resources:write');
    const input = z.object({ ids: z.array(idSchema).min(1).max(100), action: z.enum(['delete', 'enable', 'disable']) }).parse(body);
    const result = input.action === 'delete'
      ? await this.db.query('DELETE FROM resources WHERE tenant_id=$1 AND kind=$2 AND id=ANY($3::bigint[])', [actor.tenant_id, kind, input.ids])
      : await this.db.query('UPDATE resources SET data=data||$1::jsonb,updated_at=now() WHERE tenant_id=$2 AND kind=$3 AND id=ANY($4::bigint[])', [{ status: input.action === 'enable' ? 1 : 0 }, actor.tenant_id, kind, input.ids]);
    await this.audit(actor, `${kind}.bulk.${input.action}`, input.ids.join(','));
    return { affected: result.rowCount };
  }
  async importMetadata(actor: Actor, kind: string, records: Record<string, string>[]) {
    const rows = records.map(r => this.validate(kind, r));
    return this.db.transaction(async c => {
      for (const data of rows) await c.query('INSERT INTO resources(tenant_id,kind,data,created_by) VALUES($1,$2,$3,$4)', [actor.tenant_id, kind, data, actor.id]);
      await c.query('INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,$3,$4)', [actor.tenant_id, actor.id, `${kind}.import`, String(rows.length)]);
      return { imported: rows.length };
    });
  }
}
