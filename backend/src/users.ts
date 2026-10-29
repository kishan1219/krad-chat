import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Actor, authorize, publicUser } from './auth';
import { ApiError, idSchema, pagination, pageResult, passwordSchema } from './common';
import { Db } from './db';
import { permissions } from './resources';
import { assertUserScope, scopeArgs, scopeCte } from './scope';

export class Users {
  constructor(private db: Db) {}
  async list(actor: Actor, query: any, body: any) {
    authorize(actor, 'users:write');
    const p = pagination(query); const search = `%${String(body.search || '').slice(0, 200)}%`;
    const total = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM users WHERE id IN (SELECT id FROM scoped_users) AND (name ILIKE $4 OR email ILIKE $4)`, [...scopeArgs(actor), search])).rows[0].count);
    const rows = (await this.db.query(`${scopeCte} SELECT * FROM users WHERE id IN (SELECT id FROM scoped_users) AND (name ILIKE $4 OR email ILIKE $4) ORDER BY id DESC LIMIT $5 OFFSET $6`, [...scopeArgs(actor), search, p.perPage, p.offset])).rows.map(publicUser);
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
    const input = z.object({ email: z.email(), name: z.string().min(1).max(100), password: passwordSchema,
      role: z.enum(['admin', 'reseller', 'operator', 'viewer']).default('viewer'), permissions: z.array(z.enum(permissions as [string, ...string[]])).default([]) }).parse(body);
    if (actor.role !== 'admin' && (input.role === 'admin' || input.permissions.some(p => !actor.permissions.includes(p)))) throw new ApiError(403, 'Cannot grant elevated privileges.');
    if (!['admin','reseller'].includes(actor.role)) throw new ApiError(403, 'Only administrators and resellers can create child accounts.');
    const row = await this.db.transaction(async c => {
      const row = (await c.query('INSERT INTO users(tenant_id,email,name,password_hash,role,permissions,parent_user_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *', [actor.tenant_id, input.email.toLowerCase(), input.name, await hash(input.password, 12), input.role, input.permissions, actor.id])).rows[0];
      await c.query('INSERT INTO wallets(tenant_id,user_id) VALUES($1,$2)', [actor.tenant_id, row.id]);
      return row;
    });
    return publicUser(row);
  }
  async update(actor: Actor, id: unknown, body: any, self = false) {
    if (!self) authorize(actor, 'users:write');
    await assertUserScope(this.db, actor, idSchema.parse(id));
    const input = z.object({ name: z.string().min(1).max(100).optional(), role: z.enum(['admin','reseller','operator','viewer']).optional(),
      permissions: z.array(z.enum(permissions as [string, ...string[]])).optional(), active: z.boolean().optional(), otp_enabled: z.boolean().optional() }).strict().parse(body);
    if (self && (input.role !== undefined || input.permissions !== undefined || input.active !== undefined)) throw new ApiError(403, 'Cannot change your own role or account status.');
    if (!self && actor.role !== 'admin') throw new ApiError(403, 'Only administrators can change user privileges.');
    if (Number(id) === actor.id && (input.active === false || input.role && input.role !== actor.role)) throw new ApiError(422, 'Cannot disable or demote the current administrator.');
    const row = (await this.db.query(`UPDATE users SET name=COALESCE($1,name),role=COALESCE($2,role),permissions=COALESCE($3,permissions),active=COALESCE($4,active),otp_enabled=COALESCE($5,otp_enabled)
      WHERE tenant_id=$6 AND id=$7 RETURNING *`, [input.name, input.role, input.permissions, input.active, input.otp_enabled, actor.tenant_id, idSchema.parse(id)])).rows[0];
    if (!row) throw new ApiError(404, 'User not found.');
    if (input.active === false) await this.db.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1', [row.id]);
    return publicUser(row);
  }
}
