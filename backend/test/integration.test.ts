import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Campaigns } from '../src/campaigns';
import { Providers, ProviderFailure } from '../src/providers';
import { Billing } from '../src/billing';
import { Resources } from '../src/resources';
import { Auth } from '../src/auth';
import { Chat } from '../src/chat';

test('campaign reserves then charges once, and idempotency conflicts roll back', async () => {
  const { db, actor, close } = await database();
  try {
    const c = new Campaigns(db, testConfig, new Providers(testConfig));
    const input = { message: 'hello', recipients: ['9876543210','9876543210','9876543211'] };
    const first = await c.create(actor, 'sms', input, 'campaign-test-001');
    assert.equal(first.total, 2);
    assert.equal(Number((await db.query('SELECT reserved FROM wallets')).rows[0].reserved), 50);
    assert.equal((await c.create(actor, 'sms', input, 'campaign-test-001')).id, first.id);
    await assert.rejects(c.create(actor, 'sms', { ...input, message: 'different' }, 'campaign-test-001'), /different request/);
    await c.tick(); await c.tick();
    const wallet = (await db.query('SELECT * FROM wallets')).rows[0];
    assert.equal(Number(wallet.balance), 9950); assert.equal(Number(wallet.reserved), 0);
    assert.equal((await c.get(actor, first.id)).counts.delivered, 2);
    assert.equal(Number((await db.query("SELECT count(*) FROM ledger WHERE type='charge'")).rows[0].count), 2);
  } finally { await close(); }
});
test('insufficient funds and blacklist validation leave no partial campaign', async () => {
  const { db, actor, close } = await database();
  try {
    const c = new Campaigns(db, testConfig, new Providers(testConfig));
    await db.query('UPDATE wallets SET balance=10');
    await assert.rejects(c.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'no-credit-001'), /Insufficient/);
    assert.equal(Number((await db.query('SELECT count(*) FROM campaigns')).rows[0].count), 0);
    await db.query('UPDATE wallets SET balance=10000');
    await new Resources(db, testConfig).create(actor, 'blacklist', { phone: '9876543210' });
    await assert.rejects(c.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'blocked-001'), /blacklisted/);
  } finally { await close(); }
});
test('tenant isolation blocks resource and conversation reads', async () => {
  const { db, actor, close } = await database();
  try {
    const resources = new Resources(db, testConfig);
    const r = await resources.create(actor, 'contact', { phone: '9876543210', name: 'Private' });
    const foreign = { ...actor, tenant_id: actor.tenant_id + 1 };
    await assert.rejects(resources.get(foreign, 'contact', r.id), /not found/);
    assert.deepEqual((await resources.list(foreign, 'contact', {})).data, []);
    const chat = new Chat(db, testConfig, new Providers(testConfig), () => {});
    const msg = await chat.incoming(actor.tenant_id, '9876543210', 'private', 'in-001');
    await assert.rejects(chat.messages(foreign, { conversation_id: msg.conversation_id }), /not found/);
    await assert.rejects(chat.reply({ ...actor, role: 'viewer' }, { conversation_id: msg.conversation_id, message: 'hello' }), /Permission/);
  } finally { await close(); }
});
test('cancel releases only unsent reservations', async () => {
  const { db, actor, close } = await database();
  try {
    const c = new Campaigns(db, testConfig, new Providers(testConfig));
    const campaign = await c.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'cancel-test-001');
    await c.cancel(actor, campaign.id); await c.cancel(actor, campaign.id); await c.tick();
    const wallet = (await db.query('SELECT * FROM wallets')).rows[0];
    assert.equal(Number(wallet.balance), 10000); assert.equal(Number(wallet.reserved), 0);
    assert.equal((await c.get(actor, campaign.id)).status, 'cancelled');
  } finally { await close(); }
});
test('ambiguous provider timeout holds credits for manual reconciliation', async () => {
  const { db, actor, close } = await database();
  try {
    class TimeoutProvider extends Providers { override async send(): Promise<never> { throw new ProviderFailure('timeout', true); } }
    const c = new Campaigns(db, testConfig, new TimeoutProvider(testConfig));
    await c.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'timeout-test-001');
    await c.tick(); await c.tick();
    const msg = (await db.query('SELECT * FROM messages')).rows[0];
    assert.equal(msg.status, 'uncertain'); assert.equal(msg.attempts, 1);
    assert.equal(Number((await db.query('SELECT reserved FROM wallets')).rows[0].reserved), 25);
    await c.reconcile(actor, msg.id, { outcome: 'not_accepted', reason: 'Confirmed absent in provider logs' });
    assert.equal(Number((await db.query('SELECT reserved FROM wallets')).rows[0].reserved), 0);
  } finally { await close(); }
});
test('duplicate and out-of-order delivery events do not regress delivery or double charge', async () => {
  const { db, actor, close } = await database();
  try {
    const c = new Campaigns(db, { ...testConfig, MOCK_DELIVERY: false }, new Providers(testConfig));
    await c.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'delivery-test-001'); await c.tick();
    const m = (await db.query('SELECT * FROM messages')).rows[0];
    await c.delivery('mock', m.provider_id, 'delivered', 'evt-1', {});
    await c.delivery('mock', m.provider_id, 'delivered', 'evt-1', {});
    await c.delivery('mock', m.provider_id, 'submitted', 'evt-2', {});
    assert.equal((await db.query('SELECT status FROM messages')).rows[0].status, 'delivered');
    assert.equal(Number((await db.query('SELECT count(*) FROM delivery_events')).rows[0].count), 2);
    assert.equal(Number((await db.query('SELECT balance FROM wallets')).rows[0].balance), 9975);
  } finally { await close(); }
});
test('credit and payment callbacks are idempotent and amount-checked', async () => {
  const { db, actor, close } = await database();
  try {
    const b = new Billing(db, new Providers(testConfig));
    await b.credit(actor, { amount_paise: 100, reference: 'manual-ref-001' }); await b.credit(actor, { amount_paise: 100, reference: 'manual-ref-001' });
    await assert.rejects(b.credit(actor, { amount_paise: 200, reference: 'manual-ref-001' }), /different amount/);
    const order = await b.order(actor, { amount_paise: 500 });
    const event = { event: 'payment.captured', payload: { payment: { entity: { id: 'pay-001', order_id: order.id, amount: 500, currency: 'INR', status: 'captured' } } } };
    await b.captured(event); await b.captured(event);
    assert.equal(Number((await b.wallet(actor)).balance), 10600);
  } finally { await close(); }
});
test('login sessions are revocable and OTP attempts persist', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig); const auth = new Auth(db, testConfig, providers);
    const login = await auth.login({ email: 'admin@test.com', password: 'long-test-password' });
    const session = await auth.authenticate(`Bearer ${login.access_token}`);
    await auth.logout(session); await assert.rejects(auth.authenticate(`Bearer ${login.access_token}`), /revoked/);
    await db.query('UPDATE users SET otp_enabled=true');
    const challenge = await auth.login({ email: 'admin@test.com', password: 'long-test-password' });
    for (let i = 0; i < 5; i++) await assert.rejects(auth.verifyOtp({ challenge_id: challenge.challenge_id, otp: '000000' }), /invalid/);
    const code = providers.mailbox[0].text.match(/\b\d{6}\b/)![0];
    await assert.rejects(auth.verifyOtp({ challenge_id: challenge.challenge_id, otp: code }), /locked/);
    assert.equal((await db.query("SELECT attempts FROM auth_tokens WHERE kind='otp'")).rows[0].attempts, 5);
  } finally { await close(); }
});
