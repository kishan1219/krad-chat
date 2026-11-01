import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Chat } from '../src/chat';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { ApiError } from '../src/common';

test('Customer-Support Inbox & 24h Window Suite (Phase 5)', async (t) => {
  const { db, actor, close } = await database();

  try {
    const notifyEvents: any[] = [];
    const notify = (tenant: number, event: any) => notifyEvents.push({ tenant, event });
    const providers = new Providers(testConfig, db);
    const campaigns = new Campaigns(db, testConfig, providers, notify);
    const chat = new Chat(db, testConfig, providers, notify, campaigns);

    const customerPhone = '+919123456789';
    const phoneId = 'phone-inbox-sender-1';
    const wabaId = 'waba-inbox-1';

    // Insert meta connection with approved template
    const templateApproved = {
      id: 'tmpl_101',
      name: 'order_update',
      language: 'en_US',
      status: 'APPROVED',
      category: 'UTILITY',
      components: [{ type: 'BODY', text: 'Hello, your order is ready.' }]
    };

    await db.query(
      `INSERT INTO meta_connections(tenant_id, name, waba_id, phone_number_id, token_encrypted, status, templates, created_by)
       VALUES($1, 'Support Line', $2, $3, 'dummy-token', 'connected', $4, $5)`,
      [actor.tenant_id, wabaId, phoneId, JSON.stringify([templateApproved]), actor.id]
    );

    let conversationId: number;

    await t.test('1. Inbound customer message creates conversation and sets normalized contact', async () => {
      const incoming = await chat.incoming(actor.tenant_id, customerPhone, 'Hello support team', 'wamid.inbox_msg_1', phoneId);
      assert.ok(incoming, 'Incoming message created');
      assert.equal(incoming.direction, 'in');

      const conv = (await db.query("SELECT * FROM conversations WHERE tenant_id = $1 AND phone = $2", [actor.tenant_id, customerPhone])).rows[0];
      assert.ok(conv, 'Conversation must exist');
      conversationId = Number(conv.id);
      assert.equal(conv.state, 'open');
      assert.equal(conv.assigned_to, null);
      assert.equal(Number(conv.version), 1);
    });

    await t.test('2. Conversation tools manage assignment, labels, custom fields with optimistic locking', async () => {
      const conv = await chat.get(actor, conversationId);
      const currentVersion = Number(conv.version);

      // Successfully update with current version
      const updated = await chat.manage(actor, conversationId, {
        version: currentVersion,
        assigned_to: actor.id,
        labels: ['vip', 'urgent'],
        custom_fields: { order_ref: 'ORD-999' }
      });

      assert.equal(Number(updated.assigned_to), actor.id);
      assert.deepEqual(updated.labels, ['vip', 'urgent']);
      assert.equal(updated.custom_fields.order_ref, 'ORD-999');
      assert.equal(Number(updated.version), currentVersion + 1);

      // Stale version update must fail with 409 Conflict
      await assert.rejects(
        async () => chat.manage(actor, conversationId, {
          version: currentVersion, // Stale!
          labels: ['tampered']
        }),
        (err: any) => err instanceof ApiError && err.status === 409
      );
    });

    await t.test('3. Internal notes are recorded and listed per conversation', async () => {
      const note = await chat.notes(actor, conversationId, { body: 'Customer requested callback at 3 PM' });
      assert.ok(note.id);
      assert.equal(note.body, 'Customer requested callback at 3 PM');

      const allNotes = await chat.notes(actor, conversationId);
      assert.equal(allNotes.length, 1);
      assert.equal(allNotes[0].body, 'Customer requested callback at 3 PM');
    });

    await t.test('4. Text reply succeeds within 24h customer service window', async () => {
      const reply = await chat.reply(actor, {
        conversation_id: conversationId,
        message: 'Hello, how can we assist you today?'
      });

      assert.ok(reply);
      assert.equal(reply.status, 'queued');

      const msg = (await db.query("SELECT * FROM chat_messages WHERE id = $1", [reply.id])).rows[0];
      assert.equal(msg.direction, 'out');
      assert.equal(msg.message, 'Hello, how can we assist you today?');
    });

    await t.test('5. 24h window enforcement blocks plain text and requires approved template when expired', async () => {
      // Simulate live mode to test 24h customer care window validation
      const liveConfig = { ...testConfig, PROVIDER_MODE: 'live' };
      const liveChat = new Chat(db, liveConfig, providers, notify, campaigns);

      // Expire customer message created_at to 25 hours ago
      await db.query(
        "UPDATE chat_messages SET created_at = now() - interval '25 hours' WHERE conversation_id = $1 AND direction = 'in'",
        [conversationId]
      );

      // Outbound text reply must now be rejected with 422
      await assert.rejects(
        async () => liveChat.reply(actor, {
          conversation_id: conversationId,
          message: 'Trying to send text outside 24h window'
        }),
        /Use an approved template outside the customer service window/
      );

      // Outbound approved template reply succeeds outside 24h window
      const templateReply = await liveChat.reply(actor, {
        conversation_id: conversationId,
        template: {
          name: 'order_update',
          language: { code: 'en_US' }
        }
      });

      assert.ok(templateReply);
      assert.equal(templateReply.status, 'queued');
    });

    await t.test('6. Conversation reads track read markers and update unread counts', async () => {
      // Send another inbound customer message
      const inMsg = await chat.incoming(actor.tenant_id, customerPhone, 'Follow-up query', 'wamid.inbox_msg_2', phoneId);

      // Query conversations list: unread count must be >= 1
      const convListBefore = await chat.conversations(actor, { search: customerPhone });
      const convBefore = convListBefore.data[0] as any;
      assert.ok(convBefore.unread_count >= 1, 'Unread count must be at least 1 before marking read');

      // Mark conversation read through latest message
      await chat.read(actor, conversationId, { through_message_id: inMsg.id });

      // Query conversations list: unread count must now be 0
      const convListAfter = await chat.conversations(actor, { search: customerPhone });
      const convAfter = convListAfter.data[0] as any;
      assert.equal(convAfter.unread_count, 0, 'Unread count must be 0 after marking read');
    });

  } finally {
    await close();
  }
});
