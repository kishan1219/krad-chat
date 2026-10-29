import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, pagination, pageResult } from './common';
import { Db } from './db';
import { assertUserScope } from './scope';

const markupSchema = z.object({
  channel: z.enum(['whatsapp', 'sms', 'voice']),
  markup_paise: z.number().int().min(0).max(1000000), // Surcharge in paise (e.g. 15 paise)
  markup_percent: z.number().min(0).max(500).default(0),
  active: z.boolean().default(true),
});

export class ResellerService {
  constructor(private db: Db) {}

  async getMarkup(actor: Actor) {
    if (!['admin', 'reseller'].includes(actor.role)) {
      throw new ApiError(403, 'Only administrators and resellers can view markups.');
    }
    const rows = (await this.db.query(
      'SELECT * FROM reseller_markups WHERE reseller_id=$1 ORDER BY channel ASC',
      [actor.id]
    )).rows;
    return rows;
  }

  async setMarkup(actor: Actor, body: any) {
    if (!['admin', 'reseller'].includes(actor.role)) {
      throw new ApiError(403, 'Only administrators and resellers can configure markups.');
    }
    const input = markupSchema.parse(body);

    const row = (await this.db.query(
      `INSERT INTO reseller_markups(tenant_id, reseller_id, channel, markup_paise, markup_percent, active, updated_at)
       VALUES($1, $2, $3, $4, $5, $6, now())
       ON CONFLICT (reseller_id, channel)
       DO UPDATE SET
         markup_paise=EXCLUDED.markup_paise,
         markup_percent=EXCLUDED.markup_percent,
         active=EXCLUDED.active,
         updated_at=now()
       RETURNING *`,
      [actor.tenant_id, actor.id, input.channel, input.markup_paise, input.markup_percent, input.active]
    )).rows[0];

    return row;
  }

  async getClients(actor: Actor, query: any) {
    if (!['admin', 'reseller'].includes(actor.role)) {
      throw new ApiError(403, 'Only administrators and resellers can view client balances.');
    }
    const p = pagination(query);
    const where = actor.role === 'admin'
      ? 'u.parent_user_id IS NOT NULL'
      : 'u.parent_user_id = $1';
    const params = actor.role === 'admin' ? [] : [actor.id];

    const total = Number((await this.db.query(
      `SELECT count(*) FROM users u WHERE ${where} AND u.tenant_id = ${actor.tenant_id}`,
      params
    )).rows[0].count);

    const rows = (await this.db.query(
      `SELECT u.id, u.email, u.name, u.role, u.active, u.created_at,
              COALESCE(w.balance, 0)::bigint AS balance,
              COALESCE(w.reserved, 0)::bigint AS reserved,
              (COALESCE(w.balance, 0) - COALESCE(w.reserved, 0))::bigint AS available,
              COUNT(DISTINCT c.id)::int AS campaign_count,
              COUNT(m.id)::int AS message_count
       FROM users u
       LEFT JOIN wallets w ON w.user_id = u.id AND w.tenant_id = u.tenant_id
       LEFT JOIN campaigns c ON c.user_id = u.id AND c.tenant_id = u.tenant_id
       LEFT JOIN messages m ON m.user_id = u.id AND m.tenant_id = u.tenant_id
       WHERE ${where} AND u.tenant_id = ${actor.tenant_id}
       GROUP BY u.id, w.balance, w.reserved
       ORDER BY u.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, p.perPage, p.offset]
    )).rows;

    return pageResult(rows, total, p.page, p.perPage);
  }

  async reconciliation(actor: Actor, query: any) {
    if (!['admin', 'reseller'].includes(actor.role)) {
      throw new ApiError(403, 'Only administrators and resellers can inspect reconciliation ledgers.');
    }
    const p = pagination(query);

    const totalEarnings = Number((await this.db.query(
      `SELECT COALESCE(sum(amount), 0) AS total
       FROM ledger
       WHERE user_id=$1 AND type='markup_rebate' AND tenant_id=$2`,
      [actor.id, actor.tenant_id]
    )).rows[0].total);

    const totalCount = Number((await this.db.query(
      `SELECT count(*) FROM ledger WHERE user_id=$1 AND type='markup_rebate' AND tenant_id=$2`,
      [actor.id, actor.tenant_id]
    )).rows[0].count);

    const entries = (await this.db.query(
      `SELECT l.id, l.amount AS markup_paise, l.reference, l.created_at,
              u.name AS client_name, u.email AS client_email
       FROM ledger l
       LEFT JOIN users u ON u.id = l.created_by
       WHERE l.user_id=$1 AND l.type='markup_rebate' AND l.tenant_id=$2
       ORDER BY l.id DESC
       LIMIT $3 OFFSET $4`,
      [actor.id, actor.tenant_id, p.perPage, p.offset]
    )).rows;

    return {
      total_markup_earned_paise: totalEarnings,
      currency: 'INR',
      ...pageResult(entries, totalCount, p.page, p.perPage),
    };
  }

  async clientUsageSummary(actor: Actor, targetUserId?: number) {
    const userId = targetUserId && ['admin', 'reseller'].includes(actor.role)
      ? targetUserId
      : actor.id;
    if (userId !== actor.id) {
      await assertUserScope(this.db, actor, userId);
    }

    const wallet = (await this.db.query(
      'SELECT balance, reserved FROM wallets WHERE user_id=$1 AND tenant_id=$2',
      [userId, actor.tenant_id]
    )).rows[0] || { balance: 0, reserved: 0 };

    const campaignStats = (await this.db.query(
      `SELECT COUNT(*)::int AS total_campaigns,
              COALESCE(SUM(total), 0)::int AS total_recipients,
              COALESCE(SUM(cost), 0)::bigint AS total_cost_paise
       FROM campaigns
       WHERE user_id=$1 AND tenant_id=$2`,
      [userId, actor.tenant_id]
    )).rows[0];

    const messageStats = (await this.db.query(
      `SELECT status, COUNT(*)::int AS count
       FROM messages
       WHERE user_id=$1 AND tenant_id=$2
       GROUP BY status`,
      [userId, actor.tenant_id]
    )).rows;

    const messagesByStatus = Object.fromEntries(messageStats.map(r => [r.status, r.count]));

    return {
      user_id: userId,
      balance_paise: Number(wallet.balance),
      reserved_paise: Number(wallet.reserved),
      available_paise: Number(wallet.balance) - Number(wallet.reserved),
      total_campaigns: campaignStats.total_campaigns,
      total_recipients: campaignStats.total_recipients,
      total_spent_paise: Number(campaignStats.total_cost_paise),
      messages: {
        total: (Object.values(messagesByStatus) as number[]).reduce((a: number, b: number) => a + b, 0),
        by_status: messagesByStatus,
      },
    };
  }
}
