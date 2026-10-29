import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, pagination, pageResult } from './common';
import { Db } from './db';
import { Providers } from './providers';
import { randomUUID } from 'node:crypto';
import { assertUserScope, scopeArgs, scopeCte } from './scope';

export class Billing {
  constructor(private db: Db, private providers: Providers) {}
  async wallet(actor: Actor, userId = actor.id) {
    await assertUserScope(this.db, actor, userId);
    const row = (await this.db.query('SELECT * FROM wallets WHERE tenant_id=$1 AND user_id=$2', [actor.tenant_id, userId])).rows[0];
    return { ...row, available: Number(row.balance) - Number(row.reserved), currency: 'INR', unit: 'paise' };
  }
  async credit(actor: Actor, body: any) {
    authorize(actor, 'billing:write');
    if (actor.role !== 'admin') throw new ApiError(403, 'Only administrators can allocate external credits. Resellers must transfer funded credits.');
    const input = z.object({ amount_paise: z.number().int().positive().max(100000000), reference: z.string().min(8).max(200), user_id: z.coerce.number().int().positive().default(actor.id) }).parse(body);
    await assertUserScope(this.db, actor, input.user_id);
    await this.db.transaction(async c => {
      await c.query('SELECT 1 FROM wallets WHERE tenant_id=$1 AND user_id=$2 FOR UPDATE', [actor.tenant_id, input.user_id]);
      const existing = (await c.query("SELECT amount FROM ledger WHERE user_id=$1 AND type='credit' AND reference=$2", [input.user_id, input.reference])).rows[0];
      if (existing) {
        if (Number(existing.amount) !== input.amount_paise) throw new ApiError(409, 'Credit reference reused with a different amount.');
        return;
      }
      await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,'credit',$3,$4,$5)", [actor.tenant_id, input.user_id, input.amount_paise, input.reference, actor.id]);
      await c.query('UPDATE wallets SET balance=balance+$1 WHERE tenant_id=$2 AND user_id=$3', [input.amount_paise, actor.tenant_id, input.user_id]);
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'credit.allocate',$3)", [actor.tenant_id, actor.id, input.reference]);
    });
    return this.wallet(actor, input.user_id);
  }
  async ledger(actor: Actor, query: any) {
    const p = pagination(query);
    const type = query.type ? String(query.type) : null;
    const where = `user_id IN (SELECT id FROM scoped_users) AND ($4::text IS NULL OR type=$4)`;
    const total = Number((await this.db.query(`${scopeCte} SELECT count(*) FROM ledger WHERE ${where}`, [...scopeArgs(actor), type])).rows[0].count);
    return pageResult((await this.db.query(`${scopeCte} SELECT * FROM ledger WHERE ${where} ORDER BY id DESC LIMIT $5 OFFSET $6`, [...scopeArgs(actor), type, p.perPage, p.offset])).rows, total, p.page, p.perPage);
  }
  async order(actor: Actor, body: any) {
    const amount = z.number().int().min(100).max(10000000).parse(body.amount_paise);
    const order = await this.providers.paymentOrder(amount, `tenant-${actor.tenant_id}-${Date.now()}`);
    await this.db.query('INSERT INTO payment_orders(id,tenant_id,user_id,amount) VALUES($1,$2,$3,$4)', [order.id, actor.tenant_id, actor.id, amount]);
    return order;
  }
  async captured(body: any) {
    if (body.event !== 'payment.captured') return;
    const payment = body.payload?.payment?.entity;
    if (!payment?.order_id || payment.currency !== 'INR' || payment.status !== 'captured') throw new ApiError(422, 'Invalid captured payment.');
    await this.db.transaction(async c => {
      const order = (await c.query('SELECT * FROM payment_orders WHERE id=$1 FOR UPDATE', [payment.order_id])).rows[0];
      if (!order) throw new ApiError(404, 'Payment order not found.');
      if (Number(order.amount) !== payment.amount) throw new ApiError(422, 'Payment amount mismatch.');
      if (order.status === 'paid') return;
      await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference) VALUES($1,$2,'credit',$3,$4)", [order.tenant_id, order.user_id, order.amount, `payment:${payment.id}`]);
      await c.query('UPDATE wallets SET balance=balance+$1 WHERE tenant_id=$2 AND user_id=$3', [order.amount, order.tenant_id, order.user_id]);
      await c.query("UPDATE payment_orders SET status='paid' WHERE id=$1", [order.id]);
    });
  }
  async transfer(actor: Actor, body: any) {
    authorize(actor, 'billing:transfer');
    const input = z.object({ to_user_id: z.coerce.number().int().positive(), amount_paise: z.number().int().positive().max(100000000), reference: z.string().min(8).max(200) }).parse(body);
    if (input.to_user_id === actor.id) throw new ApiError(422, 'Cannot transfer to yourself.');
    await assertUserScope(this.db, actor, input.to_user_id);
    return this.db.transaction(async c => {
      const rows = (await c.query('SELECT * FROM wallets WHERE tenant_id=$1 AND user_id=ANY($2::bigint[]) ORDER BY user_id FOR UPDATE', [actor.tenant_id, [actor.id, input.to_user_id]])).rows;
      if (rows.length !== 2) throw new ApiError(404, 'Wallet not found.');
      const existing = (await c.query('SELECT * FROM credit_transfers WHERE from_user_id=$1 AND reference=$2', [actor.id, input.reference])).rows[0];
      if (existing) {
        if (Number(existing.amount) !== input.amount_paise || Number(existing.to_user_id) !== input.to_user_id) throw new ApiError(409, 'Transfer reference reused for a different request.');
        return existing;
      }
      const source = rows.find(r => Number(r.user_id) === actor.id)!;
      if (Number(source.balance) - Number(source.reserved) < input.amount_paise) throw new ApiError(422, 'Insufficient unreserved credits.');
      await c.query('UPDATE wallets SET balance=balance-$1 WHERE user_id=$2', [input.amount_paise, actor.id]);
      await c.query('UPDATE wallets SET balance=balance+$1 WHERE user_id=$2', [input.amount_paise, input.to_user_id]);
      const id = randomUUID();
      const transfer = (await c.query('INSERT INTO credit_transfers(id,tenant_id,from_user_id,to_user_id,amount,reference) VALUES($1,$2,$3,$4,$5,$6) RETURNING *', [id, actor.tenant_id, actor.id, input.to_user_id, input.amount_paise, input.reference])).rows[0];
      for (const [userId, type] of [[actor.id, 'transfer_out'], [input.to_user_id, 'transfer_in']]) await c.query('INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,$3,$4,$5,$6)', [actor.tenant_id, userId, type, input.amount_paise, `transfer:${id}`, actor.id]);
      return transfer;
    });
  }
}
