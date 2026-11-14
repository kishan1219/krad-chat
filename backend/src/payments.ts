import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, pagination, pageResult, sha256 } from './common';
import { Db } from './db';

export const paymentTransactionSchema = z.object({
  conversation_id: idSchema.optional().nullable(),
  provider: z.string().default('meta_pay'),
  payment_type: z.enum(['upi', 'meta_pay', 'card', 'netbanking']).default('upi'),
  status: z.enum(['success', 'pending', 'failed', 'canceled']),
  reference_id: z.string().min(1).max(100),
  transaction_id: z.string().min(1).max(100),
  amount_paise: z.number().int().min(0),
  currency: z.string().min(3).max(10).default('INR'),
  customer_phone: z.string().min(3).max(50),
  raw_payload: z.record(z.string(), z.unknown()).default({})
});

export type PaymentTransactionInput = z.infer<typeof paymentTransactionSchema>;

export const refundInputSchema = z.object({
  amount_paise: z.number().int().positive(),
  reason: z.string().trim().min(3).max(500).default('Customer requested refund')
});

export class PaymentProcessor {
  constructor(
    private db: Db,
    private notify?: (tenant: number, event: any) => void
  ) {}

  async recordTransaction(tenantId: number, input: PaymentTransactionInput) {
    const validated = paymentTransactionSchema.parse(input);

    const row = (await this.db.query(
      `INSERT INTO payment_transactions(
        tenant_id, conversation_id, provider, payment_type, status,
        reference_id, transaction_id, amount_paise, currency, customer_phone, raw_payload
      )
      VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT(tenant_id, reference_id, transaction_id)
      DO UPDATE SET status=EXCLUDED.status, updated_at=now(), raw_payload=EXCLUDED.raw_payload
      RETURNING *`,
      [
        tenantId,
        validated.conversation_id || null,
        validated.provider,
        validated.payment_type,
        validated.status,
        validated.reference_id,
        validated.transaction_id,
        validated.amount_paise,
        validated.currency,
        validated.customer_phone,
        JSON.stringify(validated.raw_payload)
      ]
    )).rows[0];

    return row;
  }

  async listTransactions(actor: Actor, query: any = {}) {
    authorize(actor, 'chat:reply');
    const p = pagination(query);
    const filter = z.object({
      conversation_id: z.string().optional(),
      status: z.enum(['success', 'pending', 'failed', 'canceled']).optional(),
      payment_type: z.string().optional()
    }).parse(query);

    const convId = filter.conversation_id ? idSchema.parse(filter.conversation_id) : null;
    const where = `WHERE tenant_id = $1
      AND ($2::bigint IS NULL OR conversation_id = $2)
      AND ($3::text IS NULL OR status = $3)
      AND ($4::text IS NULL OR payment_type = $4)`;

    const args = [actor.tenant_id, convId, filter.status || null, filter.payment_type || null];

    const total = Number(
      (await this.db.query(`SELECT count(*) FROM payment_transactions ${where}`, args)).rows[0].count
    );

    const rows = (await this.db.query(
      `SELECT * FROM payment_transactions ${where} ORDER BY id DESC LIMIT $5 OFFSET $6`,
      [...args, p.perPage, p.offset]
    )).rows;

    return pageResult(rows, total, p.page, p.perPage);
  }

  async getTransaction(actor: Actor, id: unknown) {
    authorize(actor, 'chat:reply');
    const isNum = typeof id === 'number' || (typeof id === 'string' && /^\d+$/.test(id));
    const row = isNum
      ? (await this.db.query(
          'SELECT * FROM payment_transactions WHERE (id = $1 OR transaction_id = $2) AND tenant_id = $3',
          [Number(id), String(id), actor.tenant_id]
        )).rows[0]
      : (await this.db.query(
          'SELECT * FROM payment_transactions WHERE transaction_id = $1 AND tenant_id = $2',
          [String(id), actor.tenant_id]
        )).rows[0];
    if (!row) throw new ApiError(404, 'Payment transaction not found.');
    return row;
  }

  async issueRefund(actor: Actor, transactionId: unknown, body: unknown) {
    authorize(actor, 'chat:reply');
    const input = refundInputSchema.parse(body);
    const isNum = typeof transactionId === 'number' || (typeof transactionId === 'string' && /^\d+$/.test(transactionId));

    return this.db.transaction(async c => {
      const tx = isNum
        ? (await c.query(
            'SELECT * FROM payment_transactions WHERE (id = $1 OR transaction_id = $2) AND tenant_id = $3 FOR UPDATE',
            [Number(transactionId), String(transactionId), actor.tenant_id]
          )).rows[0]
        : (await c.query(
            'SELECT * FROM payment_transactions WHERE transaction_id = $1 AND tenant_id = $2 FOR UPDATE',
            [String(transactionId), actor.tenant_id]
          )).rows[0];
      if (!tx) throw new ApiError(404, 'Payment transaction not found.');
      if (tx.status !== 'success') {
        throw new ApiError(422, 'Only successful payments can be refunded.');
      }

      const totalAmount = Number(tx.amount_paise);
      const currentRefunded = Number(tx.refunded_amount_paise || 0);
      const remainingBalance = totalAmount - currentRefunded;

      if (input.amount_paise > remainingBalance) {
        throw new ApiError(
          422,
          `Requested refund of ${(input.amount_paise / 100).toFixed(2)} exceeds remaining balance of ${(remainingBalance / 100).toFixed(2)} ${tx.currency}.`
        );
      }

      const refundId = `ref_${sha256(`${tx.id}:${Date.now()}:${input.amount_paise}`).slice(0, 16)}`;
      const newRefundedTotal = currentRefunded + input.amount_paise;
      const newRefundStatus = newRefundedTotal >= totalAmount ? 'full' : 'partial';

      const refundRow = (await c.query(
        `INSERT INTO payment_refunds(
          tenant_id, payment_transaction_id, refund_id, amount_paise, currency, reason, status, initiated_by
        )
        VALUES($1, $2, $3, $4, $5, $6, 'completed', $7)
        RETURNING *`,
        [actor.tenant_id, tx.id, refundId, input.amount_paise, tx.currency, input.reason, actor.id]
      )).rows[0];

      const updatedTx = (await c.query(
        `UPDATE payment_transactions SET
          refunded_amount_paise = $1,
          refund_status = $2,
          updated_at = now()
         WHERE id = $3 AND tenant_id = $4
         RETURNING *`,
        [newRefundedTotal, newRefundStatus, tx.id, actor.tenant_id]
      )).rows[0];

      await c.query(
        "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'payment.refund.created', $3)",
        [actor.tenant_id, actor.id, JSON.stringify({ tx_id: tx.id, refund_id: refundId, amount_paise: input.amount_paise })]
      );

      // Record refund notice in chat conversation if linked
      if (tx.conversation_id) {
        const refundMsg = JSON.stringify({
          type: 'refund_notification',
          status: 'completed',
          amount_paise: input.amount_paise,
          currency: tx.currency,
          refund_id: refundId,
          reference_id: tx.reference_id,
          transaction_id: tx.transaction_id,
          reason: input.reason
        });

        const chatMsg = (await c.query(
          "INSERT INTO chat_messages(tenant_id, conversation_id, direction, message, status) VALUES($1, $2, 'out', $3, 'delivered') RETURNING *",
          [actor.tenant_id, tx.conversation_id, refundMsg]
        )).rows[0];

        if (this.notify) {
          this.notify(actor.tenant_id, {
            command: 'message',
            data: chatMsg
          });
        }
      }

      if (this.notify) {
        this.notify(actor.tenant_id, {
          command: 'refund_processed',
          data: {
            refund: refundRow,
            transaction: updatedTx
          }
        });
      }

      return {
        success: true,
        refund: refundRow,
        transaction: updatedTx
      };
    });
  }

  async listRefunds(actor: Actor, transactionId: unknown) {
    authorize(actor, 'chat:reply');
    const tx = await this.getTransaction(actor, transactionId);
    const rows = (await this.db.query(
      `SELECT r.*, u.name AS initiated_by_name
       FROM payment_refunds r
       LEFT JOIN users u ON u.id = r.initiated_by
       WHERE r.payment_transaction_id = $1 AND r.tenant_id = $2
       ORDER BY r.id DESC`,
      [tx.id, actor.tenant_id]
    )).rows;
    return rows;
  }
}
