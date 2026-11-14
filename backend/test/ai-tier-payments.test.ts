import test from 'node:test';
import assert from 'node:assert/strict';
import { AIClassifier } from '../src/ai';
import { customerMessageText, extractPaymentInfo } from '../src/whatsapp-message';

test('AIClassifier correctly classifies customer query intents with heuristic fallback', async () => {
  const classifier = new AIClassifier();

  const billingResult = await classifier.classify('I was charged twice on my invoice, please issue a refund');
  assert.equal(billingResult.intent, 'billing_payment');
  assert.ok(billingResult.confidence >= 0.70);
  assert.equal(billingResult.suggested_pod, 'billing_disputes');

  const techResult = await classifier.classify('The webhook API is throwing a 500 internal server error and crash');
  assert.equal(techResult.intent, 'technical_support');
  assert.ok(techResult.confidence >= 0.70);

  const salesResult = await classifier.classify('Can we get a demo and enterprise pricing quote for our team?');
  assert.equal(salesResult.intent, 'sales_inquiry');
  assert.ok(salesResult.confidence >= 0.70);

  const securityResult = await classifier.classify('I did not receive my login OTP and my password needs reset');
  assert.equal(securityResult.intent, 'account_security');
  assert.ok(securityResult.confidence >= 0.70);

  const orderResult = await classifier.classify('Where is my package and delivery tracking status?');
  assert.equal(orderResult.intent, 'order_status');
  assert.ok(orderResult.confidence >= 0.70);
});

test('WhatsApp message parser extracts native Meta Pay & UPI payment webhooks', () => {
  const metaPayMsg = {
    type: 'payment',
    payment: {
      reference_id: 'ORDER-10029',
      transaction_id: 'TXN_UPI_998182',
      payment_type: 'upi',
      status: 'success',
      amount: { value: 249900, offset: 100 },
      currency: 'INR'
    }
  };

  const parsed = extractPaymentInfo(metaPayMsg);
  assert.ok(parsed);
  assert.equal(parsed?.isPayment, true);
  assert.equal(parsed?.status, 'success');
  assert.equal(parsed?.referenceId, 'ORDER-10029');
  assert.equal(parsed?.transactionId, 'TXN_UPI_998182');
  assert.equal(parsed?.amountPaise, 249900);
  assert.equal(parsed?.currency, 'INR');

  const text = customerMessageText(metaPayMsg);
  const textJson = JSON.parse(text);
  assert.equal(textJson.type, 'payment_notification');
  assert.equal(textJson.reference_id, 'ORDER-10029');
  assert.equal(textJson.amount_paise, 249900);
});

test('WhatsApp message parser extracts interactive payment results', () => {
  const interactiveMsg = {
    type: 'interactive',
    interactive: {
      type: 'payment_result',
      payment_result: {
        reference_id: 'REF-77123',
        transaction_id: 'TXN-998877',
        payment_status: 'success',
        amount: { value: 15000, offset: 100 },
        currency: 'INR'
      }
    }
  };

  const parsed = extractPaymentInfo(interactiveMsg);
  assert.ok(parsed);
  assert.equal(parsed?.status, 'success');
  assert.equal(parsed?.amountPaise, 15000);
  assert.equal(parsed?.referenceId, 'REF-77123');
});

test('PaymentProcessor records transactions and issues instant refunds with idempotency', async () => {
  const { database, testConfig } = await import('./helpers');
  const { PaymentProcessor } = await import('../src/payments');
  const { db } = await database();
  const actor = { id: 1, tenant_id: 1, role: 'admin', permissions: ['chat:reply', 'billing:write'] };

  const processor = new PaymentProcessor(db);
  const tx = await processor.recordTransaction(1, {
    customer_phone: '919876543210',
    amount_paise: 50000, // ₹500.00
    currency: 'INR',
    payment_type: 'upi',
    status: 'success',
    reference_id: 'ORDER-TEST-REFUND-1',
    transaction_id: 'TXN-TEST-1234'
  });

  assert.equal(tx.status, 'success');
  assert.equal(Number(tx.amount_paise), 50000);
  assert.equal(Number(tx.refunded_amount_paise), 0);
  assert.equal(tx.refund_status, 'none');

  // Issue partial refund of ₹200.00
  const partialRes = await processor.issueRefund(actor as any, tx.id, {
    amount_paise: 20000,
    reason: 'Customer return item 1'
  });

  assert.equal(partialRes.success, true);
  assert.equal(partialRes.transaction.refund_status, 'partial');
  assert.equal(Number(partialRes.transaction.refunded_amount_paise), 20000);

  // Listing refunds returns the recorded refund
  const refunds = await processor.listRefunds(actor as any, tx.id);
  assert.equal(refunds.length, 1);
  assert.equal(Number(refunds[0].amount_paise), 20000);

  // Attempting to refund more than remaining balance (₹300.01) must throw 422
  await assert.rejects(async () => {
    await processor.issueRefund(actor as any, tx.id, {
      amount_paise: 30001,
      reason: 'Excess refund'
    });
  }, (err: any) => err.status === 422);

  // Issue remaining full refund of ₹300.00
  const fullRes = await processor.issueRefund(actor as any, tx.id, {
    amount_paise: 30000,
    reason: 'Remaining items refunded'
  });

  assert.equal(fullRes.transaction.refund_status, 'full');
  assert.equal(Number(fullRes.transaction.refunded_amount_paise), 50000);
});

test('MetaConnections tierUpgradeForecast projects readiness and countdown accurately', async () => {
  const { database, testConfig } = await import('./helpers');
  const { MetaConnections } = await import('../src/meta-connections');
  const { Providers } = await import('../src/providers');
  const { db } = await database();
  const providers = new Providers(testConfig, db);
  const connections = new MetaConnections(db, testConfig, providers);
  const actor = { id: 1, tenant_id: 1, role: 'admin', permissions: ['admin:write', 'campaign:create'] };

  // Insert mock meta connection on TIER_1K with GREEN quality
  const conn = (await db.query(
    `INSERT INTO meta_connections(tenant_id, name, phone_number_id, waba_id, token_encrypted, status, quality_rating, messaging_limit_tier, green_streak_days, created_by)
     VALUES(1, 'Sales Line', '919876543299', 'waba-123', 'enc', 'connected', 'GREEN', 'TIER_1K', 5, 1) RETURNING id`
  )).rows[0];

  // Insert 7-day usage matching 85% of target
  await db.query(
    "INSERT INTO broadcast_daily_usage(tenant_id, day, dispatches) VALUES(1, (now() AT TIME ZONE 'UTC')::date, 850)"
  );

  const forecast = await connections.tierUpgradeForecast(actor as any, conn.id);
  assert.equal(forecast.current_tier, 'TIER_1K');
  assert.equal(forecast.target_tier, 'TIER_10K');
  assert.equal(forecast.quality_rating, 'GREEN');
  assert.equal(forecast.status, 'on_track');
  assert.ok(forecast.estimated_days_remaining !== null);
  assert.ok(forecast.readiness_score > 0);
});

test('Campaigns analyzeSiblingPoolHeadroom pools multiple lines and calculates balanced distribution', async () => {
  const { database, testConfig } = await import('./helpers');
  const { Campaigns } = await import('../src/campaigns');
  const { Providers } = await import('../src/providers');
  const { db } = await database();
  const providers = new Providers(testConfig, db);
  const campaigns = new Campaigns(db, testConfig, providers);

  // Add 2 connected lines under tenant 1
  await db.query(
    `INSERT INTO meta_connections(tenant_id, name, phone_number_id, waba_id, token_encrypted, status, quality_rating, messaging_limit_tier, created_by)
     VALUES(1, 'Line 1', '919111111111', 'waba-1', 'enc', 'connected', 'GREEN', 'TIER_1K', 1),
           (1, 'Line 2', '919222222222', 'waba-1', 'enc', 'connected', 'GREEN', 'TIER_1K', 1)`
  );

  const pool = await campaigns.analyzeSiblingPoolHeadroom(1, 1600);
  assert.equal(pool.pool_enabled, true);
  assert.ok(pool.line_count >= 2);
  assert.ok(pool.total_pooled_headroom >= 1800);
  assert.equal(pool.allocated_batches.length, pool.line_count);
  assert.equal(pool.allocated_batches.reduce((sum: number, b: any) => sum + b.count, 0), 1600);
});


