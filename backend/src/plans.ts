import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError } from './common';
import { Db } from './db';

const planInputSchema = z.object({
  name: z.string().min(1).max(100),
  slug: z.string().min(1).max(100).regex(/^[a-z0-9-]+$/, 'Slug must be alphanumeric with hyphens'),
  description: z.string().max(1000).optional(),
  price_paise: z.number().int().min(0).max(100000000),
  billing_period: z.enum(['monthly', 'annual']).default('monthly'),
  message_limit: z.number().int().min(0).max(10000000),
  features: z.record(z.string(), z.unknown()).default({}),
  active: z.boolean().default(true),
});

export class Plans {
  constructor(private db: Db) {}

  async list(actor?: Actor) {
    if (actor && actor.role === 'admin') {
      const rows = (await this.db.query('SELECT * FROM plans ORDER BY price_paise ASC, id ASC')).rows;
      return rows;
    }
    const rows = (await this.db.query('SELECT * FROM plans WHERE active=true ORDER BY price_paise ASC, id ASC')).rows;
    return rows;
  }

  async get(id: number | string) {
    const row = (await this.db.query('SELECT * FROM plans WHERE id=$1', [id])).rows[0];
    if (!row) throw new ApiError(404, 'Plan not found.');
    return row;
  }

  async create(actor: Actor, body: any) {
    authorize(actor, 'admin');
    const input = planInputSchema.parse(body);
    const existing = (await this.db.query('SELECT 1 FROM plans WHERE slug=$1', [input.slug])).rowCount;
    if (existing) throw new ApiError(409, 'A plan with this slug already exists.');
    const row = (await this.db.query(
      `INSERT INTO plans(name, slug, description, price_paise, billing_period, message_limit, features, active)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [input.name, input.slug, input.description || null, input.price_paise, input.billing_period, input.message_limit, input.features, input.active]
    )).rows[0];
    return row;
  }

  async update(actor: Actor, id: number | string, body: any) {
    authorize(actor, 'admin');
    const input = planInputSchema.partial().parse(body);
    const row = (await this.db.query(
      `UPDATE plans SET
         name=COALESCE($1, name),
         description=COALESCE($2, description),
         price_paise=COALESCE($3, price_paise),
         billing_period=COALESCE($4, billing_period),
         message_limit=COALESCE($5, message_limit),
         features=COALESCE($6, features),
         active=COALESCE($7, active),
         updated_at=now()
       WHERE id=$8 RETURNING *`,
      [input.name, input.description, input.price_paise, input.billing_period, input.message_limit, input.features, input.active, id]
    )).rows[0];
    if (!row) throw new ApiError(404, 'Plan not found.');
    return row;
  }

  async assign(actor: Actor, body: any) {
    authorize(actor, 'admin');
    const input = z.object({
      tenant_id: z.coerce.number().int().positive(),
      plan_id: z.coerce.number().int().positive(),
      status: z.enum(['active', 'cancelled', 'past_due']).default('active'),
    }).parse(body);

    const plan = await this.get(input.plan_id);
    const tenant = (await this.db.query('SELECT id FROM tenants WHERE id=$1', [input.tenant_id])).rows[0];
    if (!tenant) throw new ApiError(404, 'Tenant organization not found.');

    const sub = (await this.db.query(
      `INSERT INTO subscriptions(tenant_id, plan_id, status, renews_at, updated_at)
       VALUES($1, $2, $3, now() + interval '30 days', now())
       ON CONFLICT (tenant_id)
       DO UPDATE SET plan_id=EXCLUDED.plan_id, status=EXCLUDED.status, updated_at=now()
       RETURNING *`,
      [input.tenant_id, input.plan_id, input.status]
    )).rows[0];

    return { subscription: sub, plan };
  }

  async subscription(actor: Actor, tenantId?: number) {
    const targetTenant = tenantId && actor.role === 'admin' ? tenantId : actor.tenant_id;
    const sub = (await this.db.query(
      `SELECT s.*, p.name AS plan_name, p.slug AS plan_slug, p.price_paise, p.message_limit, p.features
       FROM subscriptions s
       JOIN plans p ON p.id = s.plan_id
       WHERE s.tenant_id=$1`,
      [targetTenant]
    )).rows[0];
    if (!sub) {
      return { status: 'no_subscription', plan: null, current_period_messages: 0 };
    }
    return sub;
  }
}
