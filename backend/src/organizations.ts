import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, pagination, pageResult } from './common';
import { Db } from './db';
import { logger } from './logger';

export type OrganizationStatus = 'pending' | 'active' | 'suspended' | 'closed';

export const VALID_STATUS_TRANSITIONS: Record<OrganizationStatus, OrganizationStatus[]> = {
  pending: ['active', 'closed'],
  active: ['suspended', 'closed'],
  suspended: ['active', 'closed'],
  closed: [] // Terminal state: cannot be reopened without explicit administrative override
};

export class Organizations {
  constructor(private db: Db) {}

  async get(actor: Actor) {
    const tenant = (await this.db.query(
      `SELECT t.*, 
        (SELECT count(*) FROM users u WHERE u.tenant_id=t.id AND u.active=true)::int AS active_users,
        (SELECT count(*) FROM meta_connections mc WHERE mc.tenant_id=t.id)::int AS connections_count,
        COALESCE(w.balance, 0)::bigint AS wallet_balance,
        COALESCE(w.reserved, 0)::bigint AS wallet_reserved
       FROM tenants t
       LEFT JOIN wallets w ON w.tenant_id=t.id
       WHERE t.id=$1`,
      [actor.tenant_id]
    )).rows[0];

    if (!tenant) throw new ApiError(404, 'Organization not found.');
    return {
      id: Number(tenant.id),
      name: tenant.name,
      status: tenant.status as OrganizationStatus,
      status_reason: tenant.status_reason,
      status_updated_at: tenant.status_updated_at,
      created_at: tenant.created_at,
      active_users: Number(tenant.active_users || 0),
      connections_count: Number(tenant.connections_count || 0),
      wallet_balance: Number(tenant.wallet_balance || 0),
      wallet_reserved: Number(tenant.wallet_reserved || 0)
    };
  }

  async update(actor: Actor, body: any) {
    authorize(actor, 'admin:write');
    const input = z.object({
      name: z.string().min(1).max(200)
    }).parse(body);

    const row = (await this.db.query(
      `UPDATE tenants SET name=$1, updated_at=now() WHERE id=$2 RETURNING *`,
      [input.name, actor.tenant_id]
    )).rows[0];

    if (!row) throw new ApiError(404, 'Organization not found.');
    logger.info(`Organization ${actor.tenant_id} renamed to "${input.name}"`, { tenantId: actor.tenant_id });
    return this.get(actor);
  }

  async updateStatus(actor: Actor, tenantId: number, nextStatus: OrganizationStatus, reason?: string) {
    // Only administrators can mutate organization lifecycle status
    if (actor.role !== 'admin') {
      throw new ApiError(403, 'Administrative privileges required to modify organization lifecycle status.');
    }

    const tenant = (await this.db.query('SELECT * FROM tenants WHERE id=$1', [tenantId])).rows[0];
    if (!tenant) throw new ApiError(404, 'Organization not found.');

    const currentStatus = tenant.status as OrganizationStatus;
    if (currentStatus === nextStatus) {
      return { id: tenantId, status: currentStatus, unchanged: true };
    }

    const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
    if (!allowed || !allowed.includes(nextStatus)) {
      throw new ApiError(422, `Invalid status transition: Cannot move organization from '${currentStatus}' to '${nextStatus}'.`);
    }

    await this.db.transaction(async client => {
      await client.query(
        `UPDATE tenants SET status=$1, status_reason=$2, status_updated_at=now(), updated_at=now() WHERE id=$3`,
        [nextStatus, reason || null, tenantId]
      );

      // If suspended or closed, immediately invalidate all active sessions for this tenant
      if (nextStatus === 'suspended' || nextStatus === 'closed') {
        await client.query(
          `UPDATE sessions SET revoked_at=now() WHERE user_id IN (SELECT id FROM users WHERE tenant_id=$1)`,
          [tenantId]
        );
      }

      await client.query(
        `INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'organization_status_change', $3)`,
        [tenantId, actor.id, JSON.stringify({ from: currentStatus, to: nextStatus, reason })]
      );
    });

    logger.warn(`Organization ${tenantId} transitioned from ${currentStatus} to ${nextStatus}`, {
      tenantId,
      status: nextStatus,
      reason
    });

    return {
      id: tenantId,
      previous_status: currentStatus,
      status: nextStatus,
      reason: reason || null,
      status_updated_at: new Date().toISOString()
    };
  }

  async list(actor: Actor, query: any) {
    if (actor.role !== 'admin') throw new ApiError(403, 'Administrative access required.');
    const p = pagination(query);
    const statusFilter = query.status ? String(query.status) : null;

    let whereClause = '';
    const params: any[] = [];
    if (statusFilter && ['pending', 'active', 'suspended', 'closed'].includes(statusFilter)) {
      params.push(statusFilter);
      whereClause = `WHERE t.status = $${params.length}`;
    }

    const total = Number((await this.db.query(`SELECT count(*) FROM tenants t ${whereClause}`, params)).rows[0].count);
    params.push(p.perPage, p.offset);
    const rows = (await this.db.query(
      `SELECT t.*, 
        (SELECT count(*) FROM users u WHERE u.tenant_id=t.id AND u.active=true)::int AS active_users,
        COALESCE(w.balance, 0)::bigint AS wallet_balance
       FROM tenants t
       LEFT JOIN wallets w ON w.tenant_id=t.id
       ${whereClause}
       ORDER BY t.id DESC
       LIMIT $${params.length - 1} OFFSET $${params.length}`,
      params
    )).rows.map(r => ({
      id: Number(r.id),
      name: r.name,
      status: r.status,
      status_reason: r.status_reason,
      status_updated_at: r.status_updated_at,
      created_at: r.created_at,
      active_users: Number(r.active_users || 0),
      wallet_balance: Number(r.wallet_balance || 0)
    }));

    return pageResult(rows, total, p.page, p.perPage);
  }
}
