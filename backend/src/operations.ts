import { hash } from 'bcryptjs';
import { isIP } from 'node:net';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, passwordSchema, sha256, token, pagination, pageResult } from './common';
import { Config } from './config';
import { Db } from './db';
import { Resources, permissions } from './resources';
import { assertUserScope } from './scope';

export const operationPaths = ['administration/app-setting-update','user-action','user-change-api-key','enable-additional-security','reset-user-password',
  'dlt-templates-assign-to-users','assign-sender-id','dlt-templates-assign-to-group','administration/change-dlt-template-priority',
  'credit-request-reply','user-notification-read-all','user-notification-delete','unread-notification-count','notification-read/',
  'user-documents','user-document/','document-code-lang','get-dlr-explanation/','administration/get-user-route-info',
  'administration/assign-route-to-user','administration/change-user-priority-for-send-sms','administration/informing-user-about-server',
  'administration/wa-rate-card','server-info','wa-generate-payload/','wa-chatbots-self-webhook','wa-rate-card'];

export class Operations {
  constructor(private db: Db, private cfg: Config, private resources: Resources) {}
  async handle(actor: Actor, method: string, path: string, body: any, query: any): Promise<{ handled: boolean; data?: any }> {
    const result = (data: any) => ({ handled: true, data });
    const post = () => { if (method !== 'POST') throw new ApiError(405, 'Use POST.'); };
    if (path === 'administration/app-setting-update') {
      post(); authorize(actor, 'admin:write');
      const input = z.object({ name: z.string().min(1).max(200), support_email: z.email().optional() }).parse(body);
      const existing = (await this.db.query("SELECT id FROM resources WHERE tenant_id=$1 AND kind='app_setting' LIMIT 1", [actor.tenant_id])).rows[0];
      if (existing) await this.db.query('UPDATE resources SET data=$1,updated_at=now() WHERE id=$2', [input, existing.id]);
      else await this.resources.create(actor, 'app_setting', input);
      return result(input);
    }
    if (path === 'user-action') {
      post(); authorize(actor, 'users:write');
      const rawIds = body.ids ?? body.user_ids ?? (body.id ? [body.id] : undefined);
      let rawAction = body.action;
      if (!rawAction) {
        if (body.status === 1 || body.status === '1' || body.status === true) rawAction = 'enable';
        else if (body.status === 0 || body.status === '0' || body.status === false) rawAction = 'disable';
      }
      const input = z.object({ ids: z.array(idSchema).min(1).max(100), action: z.enum(['enable','disable']) }).parse({ ids: rawIds, action: rawAction });
      if (input.ids.includes(actor.id)) throw new ApiError(422, 'Cannot change your own status in bulk.');
      for (const id of input.ids) await assertUserScope(this.db, actor, id);
      if (actor.role !== 'admin' && (await this.db.query("SELECT 1 FROM users WHERE id=ANY($1::bigint[]) AND role='admin'", [input.ids])).rowCount) throw new ApiError(403, 'Only administrators can manage administrator accounts.');
      await this.db.transaction(async c => {
        await c.query('UPDATE users SET active=$1 WHERE tenant_id=$2 AND id=ANY($3::bigint[])', [input.action === 'enable', actor.tenant_id, input.ids]);
        if (input.action === 'disable') await c.query('UPDATE sessions SET revoked_at=now() WHERE user_id=ANY($1::bigint[])', [input.ids]);
      });
      return result({ affected: input.ids.length });
    }
    if (path === 'reset-user-password') {
      post(); authorize(actor, 'users:write');
      const input = z.object({ user_id: idSchema, password: passwordSchema }).parse(body);
      await assertUserScope(this.db, actor, input.user_id);
      if (actor.role !== 'admin' && (await this.db.query("SELECT 1 FROM users WHERE id=$1 AND role='admin'", [input.user_id])).rowCount) throw new ApiError(403, 'Only administrators can reset administrator credentials.');
      await this.db.transaction(async c => {
        await c.query('UPDATE users SET password_hash=$1 WHERE id=$2 AND tenant_id=$3', [await hash(input.password, 12), input.user_id, actor.tenant_id]);
        await c.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1', [input.user_id]);
      });
      await this.resources.audit(actor, 'user.password.reset', String(input.user_id));
      return result({ reset: true });
    }
    if (path === 'user-change-api-key') {
      post(); const userId = body.user_id === undefined ? actor.id : idSchema.parse(body.user_id);
      if (userId !== actor.id) authorize(actor, 'users:write');
      await assertUserScope(this.db, actor, userId);
      const scopes = z.array(z.enum(permissions as [string, ...string[]])).max(20).parse(body.scopes ?? ['campaign:create']);
      const user = (await this.db.query('SELECT role,permissions FROM users WHERE id=$1', [userId])).rows[0];
      if (actor.role !== 'admin' && scopes.some(s => !actor.permissions.includes(s))) throw new ApiError(403, 'Cannot issue a key broader than your own permissions.');
      if (actor.role !== 'admin' && user.role === 'admin') throw new ApiError(403, 'Only administrators can issue administrator API keys.');
      if (user.role !== 'admin' && scopes.some(s => !user.permissions.includes(s))) throw new ApiError(403, 'API key cannot exceed user permissions.');
      const key = `krad_${token()}`; const id = randomUUID();
      await this.db.transaction(async c => {
        await c.query('UPDATE api_keys SET revoked_at=now() WHERE user_id=$1 AND revoked_at IS NULL', [userId]);
        await c.query('INSERT INTO api_keys(id,tenant_id,user_id,key_hash,scopes) VALUES($1,$2,$3,$4,$5)', [id, actor.tenant_id, userId, sha256(key), scopes]);
      });
      return result({
        api_key: key,
        app_key: key,
        key_id: id,
        app_secret: id,
        scopes,
        notice: 'Shown once; store securely.'
      });
    }
    if (path === 'enable-additional-security') {
      post(); const userId = body.user_id === undefined ? actor.id : idSchema.parse(body.user_id);
      if (userId !== actor.id) authorize(actor, 'users:write');
      await assertUserScope(this.db, actor, userId);
      const rawIps = Array.isArray(body.allowed_ips) ? body.allowed_ips : (typeof body.allowed_ips === 'string' && body.allowed_ips ? [body.allowed_ips] : []);
      const ips = z.array(z.string().refine(ip => isIP(ip) !== 0, 'Use an exact IPv4/IPv6 address.')).max(50).parse(rawIps);
      await this.db.query('UPDATE api_keys SET allowed_ips=$1 WHERE tenant_id=$2 AND user_id=$3 AND revoked_at IS NULL', [ips, actor.tenant_id, userId]);
      return result({ user_id: userId, allowed_ips: ips });
    }
    const assignments: Record<string,string> = { 'dlt-templates-assign-to-users': 'dlt_template', 'assign-sender-id': 'sender_id', 'administration/assign-route-to-user': 'primary_route' };
    if (assignments[path]) {
      post(); authorize(actor, 'users:write');
      const input = z.object({ resource_ids: z.array(idSchema).min(1).max(100), user_ids: z.array(idSchema).min(1).max(100) }).parse(body);
      for (const id of input.user_ids) await assertUserScope(this.db, actor, id);
      for (const id of input.resource_ids) await this.resources.get(actor, assignments[path], id);
      await this.db.transaction(async c => {
        for (const resourceId of input.resource_ids) for (const userId of input.user_ids) await c.query('INSERT INTO resource_assignments(resource_id,tenant_id,user_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING', [resourceId, actor.tenant_id, userId]);
      });
      return result({ assigned: input.resource_ids.length * input.user_ids.length });
    }
    if (path === 'administration/get-user-route-info') {
      authorize(actor, 'users:write'); const id = idSchema.parse(body.user_id ?? query.user_id);
      await assertUserScope(this.db, actor, id);
      return result((await this.db.query("SELECT r.id,r.data-'credentials_encrypted' AS data FROM resource_assignments a JOIN resources r ON r.id=a.resource_id WHERE a.tenant_id=$1 AND a.user_id=$2 AND r.kind='primary_route'", [actor.tenant_id, id])).rows);
    }
    if (path === 'dlt-templates-assign-to-group') {
      post(); authorize(actor, 'resources:write');
      const input = z.object({ group_id: idSchema, template_ids: z.array(idSchema).min(1).max(100) }).parse(body);
      await this.resources.get(actor, 'template_group', input.group_id);
      for (const id of input.template_ids) await this.resources.get(actor, 'dlt_template', id);
      await this.db.query("UPDATE resources SET data=data||jsonb_build_object('group_id',$1::bigint) WHERE tenant_id=$2 AND kind='dlt_template' AND id=ANY($3::bigint[])", [input.group_id, actor.tenant_id, input.template_ids]);
      return result({ assigned: input.template_ids.length });
    }
    if (path === 'administration/change-dlt-template-priority') {
      post(); authorize(actor, 'admin:write');
      const input = z.object({ id: idSchema, priority: z.number().int().min(0).max(1000) }).parse(body);
      await this.resources.get(actor, 'dlt_template', input.id);
      await this.db.query("UPDATE resources SET data=data||jsonb_build_object('priority',$1::int) WHERE id=$2 AND tenant_id=$3", [input.priority, input.id, actor.tenant_id]);
      return result(input);
    }
    if (path === 'administration/change-user-priority-for-send-sms') {
      post(); authorize(actor, 'users:write');
      const input = z.object({ user_id: idSchema, priority: z.number().int().min(0).max(1000) }).parse(body);
      await assertUserScope(this.db, actor, input.user_id);
      // Metadata only until a priority scheduler is implemented; do not claim dispatch priority changed.
      throw new ApiError(501, 'Priority dispatch scheduling is not implemented.');
    }
    if (path === 'credit-request-reply') {
      post(); authorize(actor, 'billing:write');
      const input = z.object({ id: idSchema, reply: z.string().min(1).max(1000), status: z.enum(['approved','rejected']) }).parse(body);
      await this.resources.get(actor, 'credit_request', input.id);
      await this.db.query('UPDATE resources SET data=data||$1::jsonb,updated_at=now() WHERE id=$2 AND tenant_id=$3', [{ reply: input.reply, status: input.status }, input.id, actor.tenant_id]);
      return result({ ...input, notice: 'Reply recorded. Transfer credits separately with a unique reference.' });
    }
    if (path.startsWith('notification-read/')) {
      const id = idSchema.parse(path.split('/')[1]); await this.resources.get(actor, 'notification', id);
      await this.db.query('INSERT INTO notification_reads(resource_id,user_id) VALUES($1,$2) ON CONFLICT DO NOTHING', [id, actor.id]);
      return result({ id, read: true });
    }
    if (path === 'user-notification-read-all') {
      await this.db.query("INSERT INTO notification_reads(resource_id,user_id) SELECT id,$1 FROM resources WHERE tenant_id=$2 AND kind='notification' ON CONFLICT DO NOTHING", [actor.id, actor.tenant_id]);
      return result({ read: true });
    }
    if (path === 'unread-notification-count') return result({ count: Number((await this.db.query("SELECT count(*) FROM resources r WHERE r.tenant_id=$1 AND r.kind='notification' AND NOT EXISTS(SELECT 1 FROM notification_reads n WHERE n.resource_id=r.id AND n.user_id=$2)", [actor.tenant_id, actor.id])).rows[0].count) });
    if (path === 'user-notification-delete') {
      // Legacy GET endpoint returns archive information; mutation requires an explicit POST.
      throw new ApiError(501, 'Per-user notification archival is not implemented.');
    }
    if (path === 'user-documents') {
      const p = pagination(query);
      const total = Number((await this.db.query('SELECT count(*) FROM files WHERE tenant_id=$1', [actor.tenant_id])).rows[0].count);
      return result(pageResult((await this.db.query('SELECT id,name,mime,size,created_at FROM files WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2 OFFSET $3', [actor.tenant_id, p.perPage, p.offset])).rows, total, p.page, p.perPage));
    }
    if (path.startsWith('user-document/') && method === 'DELETE') {
      authorize(actor, 'resources:write'); const id = z.uuid().parse(path.split('/')[1]);
      const changed = await this.db.query('DELETE FROM files WHERE id=$1 AND tenant_id=$2', [id, actor.tenant_id]);
      if (!changed.rowCount) throw new ApiError(404, 'Document not found.');
      return result({ id, deleted: true, notice: 'Metadata removed; storage object cleanup is a separate retention task.' });
    }
    if (path === 'document-code-lang') return result({ language: 'curl', example: 'POST /api/send-sms with Bearer token, Idempotency-Key, message, and recipients. See README.md.' });
    if (path.startsWith('get-dlr-explanation/')) return result(await this.resources.get(actor, 'dlr_code', path.split('/')[1]));
    if (path === 'administration/informing-user-about-server') {
      post(); authorize(actor, 'admin:write');
      return result(await this.resources.create(actor, 'notification', z.object({ title: z.string().min(1).max(200), message: z.string().min(1).max(4000) }).parse(body)));
    }
    if (path === 'wa-chatbots-self-webhook') {
      const { page, perPage, offset } = pagination(query, body);
      const countRes = await this.db.query('SELECT COUNT(*) FROM automation_runs WHERE tenant_id=$1', [actor.tenant_id]);
      const total = parseInt(countRes.rows[0]?.count || '0', 10);
      const rows = (await this.db.query(
        `SELECT r.id, COALESCE(f.name, 'Automation Flow') as name,
                COALESCE(c.customer_phone, 'WhatsApp User') as display_phone_number,
                r.reply, r.status, r.created_at,
                json_build_object(
                  'reply', r.reply,
                  'status', r.status,
                  'flow_id', r.flow_id,
                  'wa_user_profile_name', COALESCE(c.customer_name, 'Customer'),
                  'patient_name', COALESCE(c.customer_name, 'Patient')
                ) as request_payload
         FROM automation_runs r
         LEFT JOIN automation_flows f ON f.id = r.flow_id
         LEFT JOIN conversations c ON c.id = r.conversation_id
         WHERE r.tenant_id = $1
         ORDER BY r.created_at DESC
         LIMIT $2 OFFSET $3`,
        [actor.tenant_id, perPage, offset]
      )).rows;
      return result(pageResult(rows, total, page, perPage));
    }
    if (path === 'administration/wa-rate-card' || path === 'wa-rate-card') {
      const { page, perPage, offset } = pagination(query, body);
      const search = String(body.search ?? query.search ?? '').trim().toLowerCase();

      // Meta Cloud API Official Standard Rates + Configured Platform Markup (+₹0.05 INR for India, proportional markup for other markets)
      const allRateCards = [
        {
          id: 1,
          country_name: 'India',
          country_code: '+91',
          currency: 'INR',
          meta_marketing_charge: '0.7846',
          meta_utility_charge: '0.1150',
          meta_authentication_charge: '0.1150',
          meta_service_charge: '0.2900',
          platform_markup: '0.0500',
          marketing_charge: '0.8346',
          utility_charge: '0.1650',
          authentication_charge: '0.1650',
          authentication_international_charge: '2.3500',
          service_charge: '0.3400'
        },
        {
          id: 2,
          country_name: 'United States',
          country_code: '+1',
          currency: 'USD',
          meta_marketing_charge: '0.0250',
          meta_utility_charge: '0.0150',
          meta_authentication_charge: '0.0135',
          meta_service_charge: '0.0088',
          platform_markup: '0.0010',
          marketing_charge: '0.0260',
          utility_charge: '0.0160',
          authentication_charge: '0.0145',
          authentication_international_charge: '0.0400',
          service_charge: '0.0098'
        },
        {
          id: 3,
          country_name: 'United Arab Emirates',
          country_code: '+971',
          currency: 'AED',
          meta_marketing_charge: '0.1250',
          meta_utility_charge: '0.0750',
          meta_authentication_charge: '0.0700',
          meta_service_charge: '0.0550',
          platform_markup: '0.0050',
          marketing_charge: '0.1300',
          utility_charge: '0.0800',
          authentication_charge: '0.0750',
          authentication_international_charge: '0.2500',
          service_charge: '0.0600'
        },
        {
          id: 4,
          country_name: 'Saudi Arabia',
          country_code: '+966',
          currency: 'SAR',
          meta_marketing_charge: '0.1350',
          meta_utility_charge: '0.0800',
          meta_authentication_charge: '0.0750',
          meta_service_charge: '0.0600',
          platform_markup: '0.0050',
          marketing_charge: '0.1400',
          utility_charge: '0.0850',
          authentication_charge: '0.0800',
          authentication_international_charge: '0.2800',
          service_charge: '0.0650'
        },
        {
          id: 5,
          country_name: 'United Kingdom',
          country_code: '+44',
          currency: 'GBP',
          meta_marketing_charge: '0.0380',
          meta_utility_charge: '0.0190',
          meta_authentication_charge: '0.0180',
          meta_service_charge: '0.0140',
          platform_markup: '0.0015',
          marketing_charge: '0.0395',
          utility_charge: '0.0205',
          authentication_charge: '0.0195',
          authentication_international_charge: '0.0550',
          service_charge: '0.0155'
        },
        {
          id: 6,
          country_name: 'Germany',
          country_code: '+49',
          currency: 'EUR',
          meta_marketing_charge: '0.0580',
          meta_utility_charge: '0.0290',
          meta_authentication_charge: '0.0280',
          meta_service_charge: '0.0210',
          platform_markup: '0.0020',
          marketing_charge: '0.0600',
          utility_charge: '0.0310',
          authentication_charge: '0.0300',
          authentication_international_charge: '0.0750',
          service_charge: '0.0230'
        },
        {
          id: 7,
          country_name: 'France',
          country_code: '+33',
          currency: 'EUR',
          meta_marketing_charge: '0.0600',
          meta_utility_charge: '0.0300',
          meta_authentication_charge: '0.0290',
          meta_service_charge: '0.0220',
          platform_markup: '0.0020',
          marketing_charge: '0.0620',
          utility_charge: '0.0320',
          authentication_charge: '0.0310',
          authentication_international_charge: '0.0780',
          service_charge: '0.0240'
        },
        {
          id: 8,
          country_name: 'Singapore',
          country_code: '+65',
          currency: 'SGD',
          meta_marketing_charge: '0.0450',
          meta_utility_charge: '0.0220',
          meta_authentication_charge: '0.0210',
          meta_service_charge: '0.0160',
          platform_markup: '0.0020',
          marketing_charge: '0.0470',
          utility_charge: '0.0240',
          authentication_charge: '0.0230',
          authentication_international_charge: '0.0650',
          service_charge: '0.0180'
        },
        {
          id: 9,
          country_name: 'Australia',
          country_code: '+61',
          currency: 'AUD',
          meta_marketing_charge: '0.0520',
          meta_utility_charge: '0.0260',
          meta_authentication_charge: '0.0240',
          meta_service_charge: '0.0190',
          platform_markup: '0.0020',
          marketing_charge: '0.0540',
          utility_charge: '0.0280',
          authentication_charge: '0.0260',
          authentication_international_charge: '0.0720',
          service_charge: '0.0210'
        },
        {
          id: 10,
          country_name: 'Canada',
          country_code: '+1',
          currency: 'CAD',
          meta_marketing_charge: '0.0350',
          meta_utility_charge: '0.0180',
          meta_authentication_charge: '0.0170',
          meta_service_charge: '0.0130',
          platform_markup: '0.0020',
          marketing_charge: '0.0370',
          utility_charge: '0.0200',
          authentication_charge: '0.0190',
          authentication_international_charge: '0.0520',
          service_charge: '0.0150'
        },
        {
          id: 11,
          country_name: 'Brazil',
          country_code: '+55',
          currency: 'BRL',
          meta_marketing_charge: '0.3250',
          meta_utility_charge: '0.1800',
          meta_authentication_charge: '0.1700',
          meta_service_charge: '0.1200',
          platform_markup: '0.0100',
          marketing_charge: '0.3350',
          utility_charge: '0.1900',
          authentication_charge: '0.1800',
          authentication_international_charge: '0.4500',
          service_charge: '0.1300'
        },
        {
          id: 12,
          country_name: 'Indonesia',
          country_code: '+62',
          currency: 'IDR',
          meta_marketing_charge: '480',
          meta_utility_charge: '260',
          meta_authentication_charge: '250',
          meta_service_charge: '190',
          platform_markup: '15',
          marketing_charge: '495',
          utility_charge: '275',
          authentication_charge: '265',
          authentication_international_charge: '650',
          service_charge: '205'
        },
        {
          id: 13,
          country_name: 'Mexico',
          country_code: '+52',
          currency: 'MXN',
          meta_marketing_charge: '0.4500',
          meta_utility_charge: '0.2400',
          meta_authentication_charge: '0.2200',
          meta_service_charge: '0.1800',
          platform_markup: '0.0150',
          marketing_charge: '0.4650',
          utility_charge: '0.2550',
          authentication_charge: '0.2350',
          authentication_international_charge: '0.5800',
          service_charge: '0.1950'
        },
        {
          id: 14,
          country_name: 'South Africa',
          country_code: '+27',
          currency: 'ZAR',
          meta_marketing_charge: '0.4200',
          meta_utility_charge: '0.2200',
          meta_authentication_charge: '0.2000',
          meta_service_charge: '0.1600',
          platform_markup: '0.0150',
          marketing_charge: '0.4350',
          utility_charge: '0.2350',
          authentication_charge: '0.2150',
          authentication_international_charge: '0.5500',
          service_charge: '0.1750'
        },
        {
          id: 15,
          country_name: 'Rest of World (Global)',
          country_code: '+0',
          currency: 'USD',
          meta_marketing_charge: '0.0450',
          meta_utility_charge: '0.0250',
          meta_authentication_charge: '0.0220',
          meta_service_charge: '0.0180',
          platform_markup: '0.0010',
          marketing_charge: '0.0460',
          utility_charge: '0.0260',
          authentication_charge: '0.0230',
          authentication_international_charge: '0.0600',
          service_charge: '0.0190'
        }
      ];

      const filtered = search
        ? allRateCards.filter(r => r.country_name.toLowerCase().includes(search) || r.country_code.includes(search) || r.currency.toLowerCase().includes(search))
        : allRateCards;
      const total = filtered.length;
      const paged = filtered.slice(offset, offset + perPage);
      return result(pageResult(paged, total, page, perPage));
    }
    if (path === 'server-info') {
      authorize(actor, 'admin:write'); return result({ process_uptime_seconds: process.uptime(), memory: process.memoryUsage(), node: process.version, provider_mode: this.cfg.PROVIDER_MODE });
    }
    if (path.startsWith('wa-generate-payload/')) {
      const template = await this.resources.get(actor, 'wa_template', path.split('/')[1]);
      return result({ template: { name: template.template_name || template.name, language: { code: template.language || 'en_US' }, components: template.components || [] } });
    }
    return { handled: false };
  }
}
