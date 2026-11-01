import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHmac } from 'node:crypto';
import { database, testConfig } from './helpers';
import { Webhooks } from '../src/webhooks';
import { Campaigns } from '../src/campaigns';
import { Chat } from '../src/chat';
import { Billing } from '../src/billing';
import { Providers } from '../src/providers';
import { normalizeProviderTimestamp, sha256, verifyHmac } from '../src/common';

test('Webhook Reliability & WhatsApp Cloud API Suite (Phase 4)', async (t) => {
  const { db, actor, close } = await database();

  try {
    const notifyEvents: any[] = [];
    const notify = (tenant: number, event: any) => notifyEvents.push({ tenant, event });
    const providers = new Providers(testConfig, db);
    const billing = new Billing(db, testConfig, notify, providers);
    const campaigns = new Campaigns(db, testConfig, providers, notify);
    const chat = new Chat(db, testConfig, providers, notify, campaigns);
    const webhooks = new Webhooks(testConfig, campaigns, chat, billing, db, providers);

    const appSecret = 'test-meta-app-secret-12345';
    process.env.META_APP_SECRET = appSecret;
    process.env.META_VERIFY_TOKEN = 'test-meta-verify-token-xyz';
    process.env.META_GRAPH_VERSION = 'v22.0';

    await t.test('1. Meta Webhook Verification Handshake accepts valid verify_token and returns challenge', () => {
      const challenge = 'random_challenge_string_9876';
      const validQuery = {
        'hub.mode': 'subscribe',
        'hub.verify_token': 'test-meta-verify-token-xyz',
        'hub.challenge': challenge
      };
      const result = webhooks.verifyMeta(validQuery);
      assert.equal(result, challenge, 'Handshake must return challenge for matching verify_token');

      // Invalid token must throw 403
      assert.throws(() => {
        webhooks.verifyMeta({
          'hub.mode': 'subscribe',
          'hub.verify_token': 'wrong-token',
          'hub.challenge': challenge
        });
      }, /Webhook verification failed/);
    });

    await t.test('2. Meta Webhook HMAC-SHA256 signature verification rejects invalid or tampered signatures', async () => {
      const rawBody = Buffer.from(JSON.stringify({ entry: [] }));
      const validSig = createHmac('sha256', appSecret).update(rawBody).digest('hex');

      // Valid signature succeeds
      const validRes = await webhooks.handle('meta', { entry: [] }, rawBody, { 'x-hub-signature-256': `sha256=${validSig}` }, {});
      assert.deepEqual(validRes, { received: true, queued: true });

      // Invalid signature rejects with 403
      await assert.rejects(
        async () => webhooks.handle('meta', { entry: [] }, rawBody, { 'x-hub-signature-256': 'sha256=invalid_tampered_signature' }, {}),
        /Invalid Meta signature/
      );

      // Missing signature rejects with 403
      await assert.rejects(
        async () => webhooks.handle('meta', { entry: [] }, rawBody, {}, {}),
        /Invalid Meta signature/
      );
    });

    await t.test('3. Webhook batch deduplication via event_hash ignores duplicate payloads', async () => {
      const phoneId = 'phone-test-waba-123';
      const entryId = 'waba-test-999';

      // Insert connection for actor's tenant
      await db.query(
        "INSERT INTO meta_connections(tenant_id, name, waba_id, phone_number_id, token_encrypted, status, created_by) VALUES($1, 'Test Connection', $2, $3, 'dummy-enc-token', 'connected', $4)",
        [actor.tenant_id, entryId, phoneId, actor.id]
      );

      const payload = {
        entry: [{
          id: entryId,
          changes: [{
            field: 'messages',
            value: {
              metadata: { phone_number_id: phoneId },
              messages: [{ from: '919876543210', id: 'wamid.HBgL12345', text: { body: 'Hello' }, timestamp: '1700000000' }]
            }
          }]
        }]
      };

      const raw = Buffer.from(JSON.stringify(payload));
      const sig = createHmac('sha256', appSecret).update(raw).digest('hex');

      // First delivery
      await webhooks.handle('meta', payload, raw, { 'x-hub-signature-256': `sha256=${sig}` }, {});

      // Count queued events
      const count1 = Number((await db.query("SELECT count(*) FROM meta_webhook_events WHERE phone_number_id = $1", [phoneId])).rows[0].count);
      assert.equal(count1, 1, 'First delivery must persist one queued event');

      // Duplicate delivery
      await webhooks.handle('meta', payload, raw, { 'x-hub-signature-256': `sha256=${sig}` }, {});
      const count2 = Number((await db.query("SELECT count(*) FROM meta_webhook_events WHERE phone_number_id = $1", [phoneId])).rows[0].count);
      assert.equal(count2, 1, 'Duplicate delivery with identical event_hash must not insert duplicate row');
    });

    await t.test('4. Webhook events for unmapped phone numbers are quarantined with fail-closed status', async () => {
      const unmappedPhone = 'phone-unknown-99999';
      const payload = {
        entry: [{
          id: 'waba-unknown',
          changes: [{
            field: 'messages',
            value: {
              metadata: { phone_number_id: unmappedPhone },
              messages: [{ from: '919876543210', id: 'wamid.HBgLQuarantine', text: { body: 'Unmapped' }, timestamp: '1700000000' }]
            }
          }]
        }]
      };

      const raw = Buffer.from(JSON.stringify(payload));
      const sig = createHmac('sha256', appSecret).update(raw).digest('hex');

      await webhooks.handle('meta', payload, raw, { 'x-hub-signature-256': `sha256=${sig}` }, {});

      const quarantined = (await db.query("SELECT * FROM meta_webhook_events WHERE phone_number_id = $1", [unmappedPhone])).rows[0];
      assert.ok(quarantined, 'Quarantined record must exist');
      assert.equal(quarantined.status, 'quarantined');
      assert.equal(quarantined.tenant_id, null, 'Unmapped event must have null tenant_id');
      assert.match(quarantined.error, /No unique account mapping/);
    });

    await t.test('5. normalizeProviderTimestamp handles missing, malformed, negative, and future timestamps safely', () => {
      const now = Date.now();

      // Missing
      const missing = normalizeProviderTimestamp(undefined);
      assert.equal(missing.isSkewed, true);
      assert.ok(Math.abs(missing.timestamp.getTime() - now) < 2000);

      // Malformed string
      const malformed = normalizeProviderTimestamp('not-a-number');
      assert.equal(malformed.isSkewed, true);
      assert.ok(Math.abs(malformed.timestamp.getTime() - now) < 2000);

      // Negative timestamp
      const negative = normalizeProviderTimestamp(-500);
      assert.equal(negative.isSkewed, true);
      assert.ok(Math.abs(negative.timestamp.getTime() - now) < 2000);

      // Future timestamp (skewed > 5 minutes)
      const futureEpochSec = Math.floor(now / 1000) + 7200; // 2 hours in future
      const future = normalizeProviderTimestamp(futureEpochSec);
      assert.equal(future.isSkewed, true);
      assert.ok(Math.abs(future.timestamp.getTime() - now) < 2000, 'Future timestamp must be bounded to server now');

      // Valid recent timestamp (10 minutes ago)
      const validEpochSec = Math.floor((now - 600000) / 1000);
      const valid = normalizeProviderTimestamp(validEpochSec);
      assert.equal(valid.isSkewed, false);
      assert.equal(valid.timestamp.getTime(), validEpochSec * 1000);
    });

    await t.test('6. Inbound message with skewed timestamp logs audit event and bounds created_at', async () => {
      const customerPhone = '+919999888877';
      const skewedFutureSec = Math.floor(Date.now() / 1000) + 3600; // 1 hour in future

      const incoming = await chat.incoming(actor.tenant_id, customerPhone, 'Test skewed time', 'wamid.skew_test_1', 'phone-test-waba-123', skewedFutureSec);
      assert.ok(incoming, 'Incoming message created');

      // Audit log must record timestamp skew
      const audit = (await db.query("SELECT * FROM audit_logs WHERE tenant_id = $1 AND action = 'chat.timestamp_skew'", [actor.tenant_id])).rows[0];
      assert.ok(audit, 'Audit record for timestamp skew must be persisted');
      assert.match(audit.target, new RegExp(String(incoming.id)));
    });

    await t.test('7. Delivery events handle duplicate and out-of-order statuses safely', async () => {
      // Create campaign and outbound message
      const campaign = await campaigns.create(actor, 'whatsapp', {
        name: 'Delivery Order Test',
        recipients: ['+919876543210'],
        payload: { text: 'Test Out of Order' }
      }, 'delivery-order-idemp-1', true);

      const msg = (await db.query("SELECT * FROM messages WHERE campaign_id = $1", [campaign.id])).rows[0];
      assert.ok(msg);

      // Simulate provider submission
      await db.query("UPDATE messages SET status = 'submitted', provider = 'meta', provider_id = 'wamid.order_test_1' WHERE id = $1", [msg.id]);

      // 1. Deliver event
      await campaigns.delivery('meta', 'wamid.order_test_1', 'delivered', 'evt-del-1', { status: 'delivered' });
      const afterDelivered = (await db.query("SELECT status FROM messages WHERE id = $1", [msg.id])).rows[0];
      assert.equal(afterDelivered.status, 'delivered');

      // 2. Out-of-order 'submitted' arrives AFTER 'delivered' -> must NOT regress status
      await campaigns.delivery('meta', 'wamid.order_test_1', 'submitted', 'evt-sub-late', { status: 'submitted' });
      const afterLateSubmitted = (await db.query("SELECT status FROM messages WHERE id = $1", [msg.id])).rows[0];
      assert.equal(afterLateSubmitted.status, 'delivered', 'Out-of-order submitted must not regress delivered status');

      // 3. 'read' status progresses status
      await campaigns.delivery('meta', 'wamid.order_test_1', 'read', 'evt-read-1', { status: 'read' });
      const afterRead = (await db.query("SELECT status FROM messages WHERE id = $1", [msg.id])).rows[0];
      assert.equal(afterRead.status, 'read');

      // 4. Duplicate 'delivered' event again -> remains read
      await campaigns.delivery('meta', 'wamid.order_test_1', 'delivered', 'evt-del-dup', { status: 'delivered' });
      const afterDupDelivered = (await db.query("SELECT status FROM messages WHERE id = $1", [msg.id])).rows[0];
      assert.equal(afterDupDelivered.status, 'read', 'Lower status delivered must not overwrite read');
    });

    await t.test('8. Meta Graph API version validation rejects unapproved versions', async () => {
      process.env.META_GRAPH_VERSION = 'invalid_version_string';
      await assert.rejects(
        async () => providers.meta('me'),
        /META_GRAPH_VERSION must be explicit/
      );

      // Restore approved v22.0
      process.env.META_GRAPH_VERSION = 'v22.0';
    });

  } finally {
    await close();
  }
});
