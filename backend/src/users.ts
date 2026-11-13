import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Actor, authorize, publicUser } from './auth';
import { ApiError, idSchema, pagination, pageResult, passwordSchema } from './common';
import { Db } from './db';
import { frontendPermissions } from './frontend-permissions';
import { permissions } from './resources';
import { assertUserScope, scopeArgs, scopeCte } from './scope';

const allKnownPermissions = new Set([...permissions, ...frontendPermissions]);

export class Users {
  constructor(private db: Db) {}
  async list(actor: Actor, query: any, body: any) {
    authorize(actor, 'users:write');
    const p = pagination(query); const search = `%${String(body.search || '').slice(0, 200)}%`;
    const total = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM users WHERE id IN (SELECT id FROM scoped_users) AND (name ILIKE $4 OR email ILIKE $4 OR COALESCE(user_name,'') ILIKE $4)`, [...scopeArgs(actor), search])).rows[0].count);
    const rows = (await this.db.query(`${scopeCte} SELECT * FROM users WHERE id IN (SELECT id FROM scoped_users) AND (name ILIKE $4 OR email ILIKE $4 OR COALESCE(user_name,'') ILIKE $4) ORDER BY id DESC LIMIT $5 OFFSET $6`, [...scopeArgs(actor), search, p.perPage, p.offset])).rows.map(publicUser);
    return pageResult(rows, total, p.page, p.perPage);
  }
  async get(actor: Actor, id: unknown = actor.id) {
    if (Number(id) !== actor.id) authorize(actor, 'users:write');
    await assertUserScope(this.db, actor, idSchema.parse(id));
    const row = (await this.db.query('SELECT * FROM users WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, idSchema.parse(id)])).rows[0];
    if (!row) throw new ApiError(404, 'User not found.');
    return publicUser(row);
  }
  async create(actor: Actor, body: any) {
    authorize(actor, 'users:write');
    let mappedRole: 'admin' | 'reseller' | 'operator' | 'viewer' = 'viewer';
    if (body.role === 'admin' || body.userType === 0 || body.userType === '0') mappedRole = 'admin';
    else if (body.role === 'reseller' || body.userType === 1 || body.userType === '1') mappedRole = 'reseller';
    else if (body.role === 'operator' || body.role === 'client' || body.userType === 2 || body.userType === '2') mappedRole = 'operator';
    else if (body.role === 'viewer' || body.role === 'employee' || body.userType === 3 || body.userType === '3') mappedRole = 'viewer';
    else if (['admin', 'reseller', 'operator', 'viewer'].includes(body.role)) mappedRole = body.role;

    let permissionsList: string[] = Array.isArray(body.permissions) ? body.permissions : [];
    if (!permissionsList.length) {
      if (mappedRole === 'admin') permissionsList = ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'templates:write', 'users:read', 'users:write', 'billing:transfer', 'admin:write'];
      else if (mappedRole === 'reseller') permissionsList = ['campaign:create', 'campaign:cancel', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read', 'users:read', 'users:write', 'billing:transfer'];
      else if (mappedRole === 'operator') permissionsList = ['campaign:create', 'chat:reply', 'contacts:read', 'contacts:write', 'templates:read'];
      else permissionsList = ['contacts:read', 'templates:read'];
    }

    const input = z.object({
      email: z.string().email(),
      name: z.string().min(1).max(100),
      user_name: z.string().min(1).max(100).optional().nullable(),
      password: passwordSchema,
      role: z.enum(['admin', 'reseller', 'operator', 'viewer']).default('viewer'),
      permissions: z.array(z.string()).default([]),
      mobile: z.string().max(30).optional().nullable(),
      address: z.string().max(500).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      zipcode: z.string().max(20).optional().nullable(),
      company_name: z.string().max(200).optional().nullable(),
      website_url: z.string().max(300).optional().nullable(),
      designation: z.string().max(100).optional().nullable(),
      authority_type: z.number().int().default(1),
      locktimeout: z.number().int().min(5).max(1440).default(30),
      is_add_webhook: z.boolean().default(false),
      is_detail_report: z.boolean().default(false),
      is_visible_dlt_template_group: z.boolean().default(false),
      company_logo: z.string().max(500).optional().nullable()
    }).parse({
      email: body.email,
      name: body.name || body.username || 'User',
      user_name: body.user_name || body.username || (body.email ? body.email.split('@')[0] : null),
      password: body.password,
      role: mappedRole,
      permissions: permissionsList.filter(p => allKnownPermissions.has(p)),
      mobile: body.mobile || null,
      address: body.address || null,
      city: body.city || null,
      zipcode: body.zipcode || body.zipCode || null,
      company_name: body.company_name || body.companyName || null,
      website_url: body.website_url || body.websiteUrl || null,
      designation: body.designation || null,
      authority_type: Number(body.authority_type ?? body.authorityType ?? 1),
      locktimeout: Number(body.locktimeout || 30),
      is_add_webhook: Boolean(body.is_add_webhook || body.allow_to_add_webhook === 1 || body.allow_to_add_webhook === true),
      is_detail_report: Boolean(body.is_detail_report || body.allow_detail_report === 1 || body.allow_detail_report === true),
      is_visible_dlt_template_group: Boolean(body.is_visible_dlt_template_group || body.is_visible_dlt === 1 || body.is_visible_dlt === true),
      company_logo: body.company_logo || body.companyLogo || null
    });

    if (actor.role !== 'admin' && (input.role === 'admin' || input.permissions.some(p => !actor.permissions.includes(p)))) throw new ApiError(403, 'Cannot grant elevated privileges.');
    if (!['admin','reseller'].includes(actor.role)) throw new ApiError(403, 'Only administrators and resellers can create child accounts.');
    const row = await this.db.transaction(async c => {
      const row = (await c.query(`
        INSERT INTO users(
          tenant_id, email, name, user_name, password_hash, role, permissions, parent_user_id,
          mobile, address, city, zipcode, company_name, website_url, designation,
          authority_type, locktimeout, is_add_webhook, is_detail_report, is_visible_dlt_template_group, company_logo
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19, $20, $21
        ) RETURNING *`, [
          actor.tenant_id, input.email.toLowerCase(), input.name, input.user_name, await hash(input.password, 12),
          input.role, input.permissions, actor.id, input.mobile, input.address, input.city, input.zipcode,
          input.company_name, input.website_url, input.designation, input.authority_type, input.locktimeout,
          input.is_add_webhook, input.is_detail_report, input.is_visible_dlt_template_group, input.company_logo
        ])).rows[0];
      await c.query('INSERT INTO wallets(tenant_id,user_id) VALUES($1,$2) ON CONFLICT(user_id) DO NOTHING', [actor.tenant_id, row.id]);
      return row;
    });
    return publicUser(row);
  }
  async update(actor: Actor, id: unknown, body: any, self = false) {
    if (!self) authorize(actor, 'users:write');
    await assertUserScope(this.db, actor, idSchema.parse(id));
    const input = z.object({
      name: z.string().min(1).max(100).optional(),
      user_name: z.string().min(1).max(100).optional().nullable(),
      role: z.enum(['admin','reseller','operator','viewer']).optional(),
      permissions: z.array(z.string()).optional(),
      active: z.boolean().optional(),
      otp_enabled: z.boolean().optional(),
      mobile: z.string().max(30).optional().nullable(),
      address: z.string().max(500).optional().nullable(),
      city: z.string().max(100).optional().nullable(),
      zipcode: z.string().max(20).optional().nullable(),
      company_name: z.string().max(200).optional().nullable(),
      website_url: z.string().max(300).optional().nullable(),
      designation: z.string().max(100).optional().nullable(),
      authority_type: z.number().int().optional(),
      locktimeout: z.number().int().min(5).max(1440).optional(),
      is_add_webhook: z.boolean().optional(),
      is_detail_report: z.boolean().optional(),
      is_visible_dlt_template_group: z.boolean().optional(),
      company_logo: z.string().max(500).optional().nullable()
    }).parse({
      ...body,
      user_name: body.user_name ?? body.username,
      company_name: body.company_name ?? body.companyName,
      website_url: body.website_url ?? body.websiteUrl,
      zipcode: body.zipcode ?? body.zipCode,
      authority_type: body.authority_type !== undefined ? Number(body.authority_type) : (body.authorityType !== undefined ? Number(body.authorityType) : undefined),
      locktimeout: body.locktimeout !== undefined ? Number(body.locktimeout) : undefined,
      is_add_webhook: body.is_add_webhook !== undefined ? Boolean(body.is_add_webhook) : (body.allow_to_add_webhook !== undefined ? (body.allow_to_add_webhook === 1 || body.allow_to_add_webhook === true) : undefined),
      is_detail_report: body.is_detail_report !== undefined ? Boolean(body.is_detail_report) : (body.allow_detail_report !== undefined ? (body.allow_detail_report === 1 || body.allow_detail_report === true) : undefined),
      is_visible_dlt_template_group: body.is_visible_dlt_template_group !== undefined ? Boolean(body.is_visible_dlt_template_group) : undefined,
      company_logo: body.company_logo ?? body.companyLogo
    });

    if (self && (input.role !== undefined || input.permissions !== undefined || input.active !== undefined)) throw new ApiError(403, 'Cannot change your own role or account status.');
    if (!self && actor.role !== 'admin') throw new ApiError(403, 'Only administrators can change user privileges.');
    if (Number(id) === actor.id && (input.active === false || input.role && input.role !== actor.role)) throw new ApiError(422, 'Cannot disable or demote the current administrator.');
    const row = (await this.db.query(`
      UPDATE users SET
        name = COALESCE($1, name),
        role = COALESCE($2, role),
        permissions = COALESCE($3, permissions),
        active = COALESCE($4, active),
        otp_enabled = COALESCE($5, otp_enabled),
        user_name = COALESCE($6, user_name),
        mobile = COALESCE($7, mobile),
        address = COALESCE($8, address),
        city = COALESCE($9, city),
        zipcode = COALESCE($10, zipcode),
        company_name = COALESCE($11, company_name),
        website_url = COALESCE($12, website_url),
        designation = COALESCE($13, designation),
        authority_type = COALESCE($14, authority_type),
        locktimeout = COALESCE($15, locktimeout),
        is_add_webhook = COALESCE($16, is_add_webhook),
        is_detail_report = COALESCE($17, is_detail_report),
        is_visible_dlt_template_group = COALESCE($18, is_visible_dlt_template_group),
        company_logo = COALESCE($19, company_logo)
      WHERE tenant_id = $20 AND id = $21 RETURNING *`, [
        input.name, input.role, input.permissions, input.active, input.otp_enabled,
        input.user_name, input.mobile, input.address, input.city, input.zipcode,
        input.company_name, input.website_url, input.designation, input.authority_type,
        input.locktimeout, input.is_add_webhook, input.is_detail_report,
        input.is_visible_dlt_template_group, input.company_logo, actor.tenant_id, idSchema.parse(id)
      ])).rows[0];
    if (!row) throw new ApiError(404, 'User not found.');
    if (input.active === false) await this.db.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1', [row.id]);
    return publicUser(row);
  }
}
