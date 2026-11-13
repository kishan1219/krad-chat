import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Providers} from '../src/providers';
import {MetaConnections} from '../src/meta-connections';
import {Campaigns} from '../src/campaigns';
import {Chat} from '../src/chat';
import {Billing} from '../src/billing';
import {Webhooks} from '../src/webhooks';
import {Resources} from '../src/resources';
import {Actor} from '../src/auth';
import {InboundRouter} from '../src/inbound-router';

test('durable WABA template webhooks update all sibling numbers without changing other templates',async()=>{
 const {db,actor,close}=await database();
 try {
  const providers=new Providers(testConfig,db),connections=new MetaConnections(db,testConfig,providers);
  const first=await connections.connect(actor,{name:'Sales',waba_id:'100',phone_number_id:'101'});
  await connections.connect(actor,{name:'Support',waba_id:'100',phone_number_id:'102'});
  const one=await connections.createTemplate(actor,first.id,{name:'one',language:'en_US',category:'UTILITY',text:'Order ready'});
  const two=await connections.createTemplate(actor,first.id,{name:'two',language:'en_US',category:'UTILITY',text:'Order shipped'});
  const campaigns=new Campaigns(db,testConfig,providers),chat=new Chat(db,testConfig,providers,()=>{},campaigns);
  const realtimeEvents: any[] = [];
  const notify = (tenantId: number, event: any) => {
    realtimeEvents.push({ tenantId, event });
  };
  const webhooks=new Webhooks(testConfig,campaigns,chat,new Billing(db,providers),db,providers,notify);
  const body={entry:[{id:'100',changes:[{field:'message_template_status_update',value:{message_template_id:one.id,event:'PAUSED'}}]}]};
  await webhooks.inbox.receive(body);await webhooks.inbox.receive(body);await webhooks.inbox.tick();
  assert.equal((await webhooks.inbox.list(actor))[0].status,'completed');
  for(const row of await connections.list(actor)){
   assert.equal(row.templates.find((t:any)=>t.id===one.id).status,'PAUSED');
   assert.equal(row.templates.find((t:any)=>t.id===two.id).status,'APPROVED');
  }
  assert.ok((await connections.senders(actor)).every(r=>r.templates.length===1));
 } finally {await close();}
});

test('phone_number_quality_update webhook upgrades messaging tier and creates admin notification', async () => {
 const {db,actor,close}=await database();
 try {
  const providers=new Providers(testConfig,db),connections=new MetaConnections(db,testConfig,providers);
  const conn=await connections.connect(actor,{name:'Sales Main',waba_id:'200',phone_number_id:'201'});
  
  const campaigns=new Campaigns(db,testConfig,providers),chat=new Chat(db,testConfig,providers,()=>{},campaigns);
  const realtimeEvents: any[] = [];
  const notify = (tenantId: number, event: any) => {
    realtimeEvents.push({ tenantId, event });
  };
  const webhooks=new Webhooks(testConfig,campaigns,chat,new Billing(db,providers),db,providers,notify);

  const body={
    entry:[{
      id:'200',
      changes:[{
        field:'phone_number_quality_update',
        value:{
          phone_number_id:'201',
          event:'UPGRADED',
          current_limit:'TIER_10K'
        }
      }]
    }]
  };

  await webhooks.inbox.receive(body);
  await webhooks.inbox.tick();

  const updated=(await connections.list(actor)).find(c=>c.id===conn.id);
  assert.equal(updated.messaging_limit_tier, 'TIER_10K');

  const notifications=(await db.query("SELECT * FROM resources WHERE tenant_id=$1 AND kind='notification' ORDER BY id DESC",[actor.tenant_id])).rows;
  assert.ok(notifications.length > 0);
  assert.match(notifications[0].data.title, /Tier (?:Upgraded|Boosted)/i);
  assert.equal(notifications[0].data.current_tier, 'TIER_10K');
  assert.equal(notifications[0].data.is_owner_alert, true);

  assert.equal(realtimeEvents.length, 1);
  assert.equal(realtimeEvents[0].tenantId, actor.tenant_id);
  assert.equal(realtimeEvents[0].event.command, 'notification');
  assert.equal(realtimeEvents[0].event.type, 'meta_tier_upgrade');
  assert.equal(realtimeEvents[0].event.data.tier, 'TIER_10K');
 } finally { await close(); }
});

test('templateMessageSchema validates media header attachments (image, document, audio)', () => {
  const { templateMessageSchema } = require('../src/whatsapp-template');

  const validImage = templateMessageSchema.parse({
    name: 'summer_promo',
    language: { code: 'en_US' },
    components: [
      {
        type: 'header',
        parameters: [
          { type: 'image', image: { link: 'https://images.example.com/banner.png' } }
        ]
      },
      {
        type: 'body',
        parameters: [
          { type: 'text', text: 'Alice' }
        ]
      }
    ]
  });
  assert.equal(validImage.components[0].type, 'header');
  assert.equal(validImage.components[0].parameters[0].image.link, 'https://images.example.com/banner.png');

  const validDoc = templateMessageSchema.parse({
    name: 'invoice_delivery',
    language: { code: 'en_US' },
    components: [
      {
        type: 'header',
        parameters: [
          { type: 'document', document: { link: 'https://files.example.com/inv-101.pdf', filename: 'Invoice-101.pdf' } }
        ]
      }
    ]
  });
  assert.equal(validDoc.components[0].parameters[0].document.filename, 'Invoice-101.pdf');

  assert.throws(() => {
    templateMessageSchema.parse({
      name: 'broken',
      language: { code: 'en_US' },
      components: [
        {
          type: 'header',
          parameters: [
            { type: 'image', image: {} }
          ]
        }
      ]
    });
  });
});

test('templateMessageSchema validates multi-card carousel message templates', () => {
  const { templateMessageSchema } = require('../src/whatsapp-template');

  const validCarousel = templateMessageSchema.parse({
    name: 'product_catalog_carousel',
    language: { code: 'en_US' },
    components: [
      {
        type: 'body',
        parameters: [{ type: 'text', text: 'Exclusive Weekend Catalog' }]
      },
      {
        type: 'carousel',
        cards: [
          {
            card_index: 0,
            components: [
              {
                type: 'header',
                parameters: [{ type: 'image', image: { link: 'https://images.example.com/item1.png' } }]
              },
              {
                type: 'body',
                parameters: [{ type: 'text', text: 'Running Shoes' }, { type: 'text', text: '$79.99' }]
              },
              {
                type: 'button',
                sub_type: 'quick_reply',
                index: 0,
                parameters: [{ type: 'payload', payload: 'SELECT_ITEM_1' }]
              }
            ]
          },
          {
            card_index: 1,
            components: [
              {
                type: 'header',
                parameters: [{ type: 'image', image: { link: 'https://images.example.com/item2.png' } }]
              },
              {
                type: 'body',
                parameters: [{ type: 'text', text: 'Leather Backpack' }, { type: 'text', text: '$129.00' }]
              }
            ]
          }
        ]
      }
    ]
  });

  assert.equal(validCarousel.name, 'product_catalog_carousel');
  assert.equal(validCarousel.components.length, 2);
  assert.equal(validCarousel.components[1].type, 'carousel');
  assert.equal(validCarousel.components[1].cards.length, 2);
  assert.equal(validCarousel.components[1].cards[0].card_index, 0);
  assert.equal(validCarousel.components[1].cards[0].components[0].parameters[0].image.link, 'https://images.example.com/item1.png');
});

test('phone_number_quality_update webhook degrades quality rating from GREEN to YELLOW and alerts admin', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);
    const conn = await connections.connect(actor, { name: 'Support Line', waba_id: '300', phone_number_id: '301' });

    // Set connection initial quality to GREEN
    await db.query("UPDATE meta_connections SET quality_rating='GREEN' WHERE id=$1", [conn.id]);

    const campaigns = new Campaigns(db, testConfig, providers);
    const chat = new Chat(db, testConfig, providers, () => {}, campaigns);
    const realtimeEvents: any[] = [];
    const notify = (tenantId: number, event: any) => {
      realtimeEvents.push({ tenantId, event });
    };
    const webhooks = new Webhooks(testConfig, campaigns, chat, new Billing(db, providers), db, providers, notify);

    // Incoming degradation webhook
    const body = {
      entry: [{
        id: '300',
        changes: [{
          field: 'phone_number_quality_update',
          value: {
            phone_number_id: '301',
            event: 'DEGRADED',
            quality_rating: 'YELLOW'
          }
        }]
      }]
    };

    await webhooks.inbox.receive(body);
    await webhooks.inbox.tick();

    const updated = (await connections.list(actor)).find(c => c.id === conn.id);
    assert.equal(updated.quality_rating, 'YELLOW');

    const notifs = (await db.query("SELECT * FROM resources WHERE tenant_id=$1 AND kind='notification' ORDER BY id DESC", [actor.tenant_id])).rows;
    assert.ok(notifs.length > 0);
    assert.match(notifs[0].data.title, /Quality Rating Dropped to YELLOW/i);
    assert.equal(notifs[0].data.type, 'meta_quality_degradation');
    assert.equal(notifs[0].data.severity, 'warning');

    const degradationEvent = realtimeEvents.find(e => e.event.type === 'meta_quality_degradation');
    assert.ok(degradationEvent);
    assert.equal(degradationEvent.event.data.quality, 'YELLOW');
  } finally {
    await close();
  }
});

test('WABA Multi-Number Selector & Batch Connect API registers multiple phone numbers simultaneously', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);

    // 1. Query WABA phone numbers
    const wabaResult = await connections.wabaNumbers(actor, { waba_id: '400' });
    assert.equal(wabaResult.waba_id, '400');
    assert.ok(wabaResult.numbers.length >= 2);

    // 2. Batch connect selected numbers
    const batchResult = await connections.batchConnect(actor, {
      waba_id: '400',
      numbers: [
        { phone_number_id: '401', name: 'Support Hotline' },
        { phone_number_id: '402', name: 'Sales Concierge' }
      ]
    });
    assert.equal(batchResult.count, 2);
    assert.equal(batchResult.connected.length, 2);

    // 3. Verify in database
    const connList = await connections.list(actor);
    const p1 = connList.find(c => c.phone_number_id === '401');
    const p2 = connList.find(c => c.phone_number_id === '402');
    assert.ok(p1 && p2);
    assert.equal(p1.name, 'Support Hotline');
    assert.equal(p2.name, 'Sales Concierge');
  } finally {
    await close();
  }
});

test('Embedded Co-existence OTP Request-Code verifies SMS and Voice methods', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);
    const conn = await connections.connect(actor, { name: 'SMB Migrated Number', waba_id: '500', phone_number_id: '501' });

    const reqResult = await connections.action(actor, conn.id, 'request-code', { code_method: 'SMS', language: 'en_US' });
    assert.equal(reqResult.success, true);
    assert.equal(reqResult.method, 'SMS');

    const voiceResult = await connections.action(actor, conn.id, 'request-code', { code_method: 'VOICE', language: 'en_US' });
    assert.equal(voiceResult.success, true);
    assert.equal(voiceResult.method, 'VOICE');
  } finally {
    await close();
  }
});

test('Automated Co-Existence WhatsApp History Sync parses transcript and ingests messages', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);
    const conn = await connections.connect(actor, { name: 'SMB Migrated Number', waba_id: '600', phone_number_id: '601' });

    const rawTranscript = `
12/05/2026, 10:14 - Messages and calls are end-to-end encrypted. No one outside of this chat, not even WhatsApp, can read or listen to them.
12/05/2026, 10:15 - Alice Customer: Hello, I would like to inquire about my delivery status.
12/05/2026, 10:16 - You: Hello Alice! Your package #48291 has been dispatched today.
12/05/2026, 10:17 - Alice Customer: Perfect, thank you so much for the quick update!
12/05/2026, 10:20 - Bob Smith: Hi there, do you offer weekend delivery?
12/05/2026, 10:21 - You: Yes Bob, express weekend delivery is available.
`;

    const res = await connections.chatHistorySync(actor, conn.id, { raw_text: rawTranscript });
    assert.equal(res.success, true);
    assert.equal(res.imported_count, 5);
    assert.equal(res.conversations_count, 2);
    assert.ok(res.contacts.includes('Alice Customer') || res.contacts.includes('Bob Smith'));

    const msgs = (await db.query("SELECT * FROM chat_messages WHERE tenant_id=$1 ORDER BY id ASC", [actor.tenant_id])).rows;
    assert.equal(msgs.length, 5);
    assert.equal(msgs[0].message, 'Hello, I would like to inquire about my delivery status.');
    assert.equal(msgs[0].direction, 'in');
    assert.equal(msgs[1].message, 'Hello Alice! Your package #48291 has been dispatched today.');
    assert.equal(msgs[1].direction, 'out');
  } finally {
    await close();
  }
});

test('Proactive Quality Health Forecasting predicts Meta degradation on elevated block rate', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const notified: any[] = [];
    const notify = (tenantId: number, event: any) => notified.push({ tenantId, event });
    const connections = new MetaConnections(db, testConfig, providers, notify);
    const conn = await connections.connect(actor, { name: 'Health Check Line', waba_id: '700', phone_number_id: '701' });

    // When quality is YELLOW, baseline block rate is 3.4% (> 3.0% threshold)
    await db.query("UPDATE meta_connections SET quality_rating='YELLOW' WHERE id=$1", [conn.id]);

    const forecast = await connections.qualityForecast(actor, conn.id);
    assert.equal(forecast.threshold_percentage, 3.0);
    assert.equal(forecast.threshold_exceeded, true);
    assert.equal(forecast.risk_level, 'HIGH');
    assert.equal(forecast.predicted_quality, 'YELLOW');
    assert.ok(forecast.recommendations.length > 0);
    assert.ok(notified.some(n => n.event.type === 'meta_quality_forecast_warning'));
  } finally {
    await close();
  }
});

test('Multi-WABA Aggregated Dashboard returns enterprise volume metrics across multiple accounts', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);
    await connections.connect(actor, { name: 'Brand A Line 1', waba_id: '901001', phone_number_id: '801' });
    await connections.connect(actor, { name: 'Brand A Line 2', waba_id: '901001', phone_number_id: '802' });
    await connections.connect(actor, { name: 'Brand B Hotline', waba_id: '902002', phone_number_id: '803' });

    const dashboard = await connections.multiWabaDashboard(actor);
    assert.equal(dashboard.total_wabas, 2);
    assert.equal(dashboard.total_phone_numbers, 3);
    assert.ok(dashboard.total_messages_7d > 0);
    assert.equal(dashboard.wabas.length, 2);
    assert.equal(dashboard.time_series.length, 7);
  } finally {
    await close();
  }
});

test('wa-account-configurations endpoint accessible to non-admin actors without 403 Forbidden', async () => {
  const { db, actor, close } = await database();
  try {
    const resources = new Resources(db, testConfig);
    // Create an operator actor without admin:write permission
    const operatorActor: Actor = {
      id: actor.id,
      tenant_id: actor.tenant_id,
      role: 'operator',
      permissions: ['resources:write', 'templates:read'],
      session_id: 'test_operator_session'
    };

    // Listing wa-account-configurations via POST (used by DataTable)
    const listRes = await resources.handle(operatorActor, 'POST', 'wa-account-configurations', { page: 1, per_page_record: 25 }, {});
    assert.equal(listRes.handled, true);
    assert.ok(Array.isArray(listRes.data.data));
  } finally {
    await close();
  }
});

test('Multi-WABA Inbound Router resolves geo dialing prefixes and department keywords', async () => {
  const { db, actor, close } = await database();
  try {
    const router = new InboundRouter(db);
    // Create geo rule for US numbers (+1) to WABA US
    await router.createRule(actor, {
      name: 'North America Line',
      rule_type: 'geo',
      match_pattern: '+1,1',
      target_phone_number_id: '1001',
      target_waba_id: 'WABA_US',
      department: 'americas',
      priority: 10,
      active: true
    });
    // Create department rule for Support
    await router.createRule(actor, {
      name: 'Global Support Queue',
      rule_type: 'department',
      match_pattern: 'help,support,broken,issue',
      target_phone_number_id: '1002',
      target_waba_id: 'WABA_GLOBAL',
      department: 'support',
      priority: 5,
      active: true
    });

    // 1. Keyword match takes priority due to priority=5
    const route1 = await router.resolveRoute(actor.tenant_id, '+14155552671', 'Hello I need help with an issue', '999');
    assert.equal(route1.routed, true);
    assert.equal(route1.target_phone_number_id, '1002');
    assert.equal(route1.department, 'support');

    // 2. Geo match for general message from US number
    const route2 = await router.resolveRoute(actor.tenant_id, '+14155552671', 'Good morning!', '999');
    assert.equal(route2.routed, true);
    assert.equal(route2.target_phone_number_id, '1001');
    assert.equal(route2.department, 'americas');

    // 3. Fallback when neither matches
    const route3 = await router.resolveRoute(actor.tenant_id, '+919876543210', 'Good morning!', '999');
    assert.equal(route3.routed, false);
    assert.equal(route3.target_phone_number_id, '999');
  } finally {
    await close();
  }
});

test('Automated WhatsApp Disconnect Safeguard auto-pauses broadcasting at 5% critical block rate and allows admin override', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const realtimeEvents: any[] = [];
    const notify = (tenantId: number, event: any) => realtimeEvents.push(event);
    const connections = new MetaConnections(db, testConfig, providers, notify);
    const conn = await connections.connect(actor, { name: 'Main Line', waba_id: '888001', phone_number_id: '888002' });

    // Insert 100 messages in last 24h, 6 of which are blocked (6% block rate >= 5% critical threshold)
    for (let i = 0; i < 94; i++) {
      await db.query("INSERT INTO resources(tenant_id, kind, data, created_by, created_at) VALUES($1, 'campaign_message', '{\"status\":\"delivered\"}', $2, now())", [actor.tenant_id, actor.id]);
    }
    for (let i = 0; i < 6; i++) {
      await db.query("INSERT INTO resources(tenant_id, kind, data, created_by, created_at) VALUES($1, 'campaign_message', '{\"status\":\"failed\",\"event\":\"blocked\"}', $2, now())", [actor.tenant_id, actor.id]);
    }

    // Evaluate safeguard
    const evalRes = await connections.evaluateSafeguard(actor.tenant_id, conn.phone_number_id);
    assert.equal(evalRes.triggered, true);
    assert.ok(evalRes.block_rate >= 5.0);

    const status = await connections.getSafeguardStatus(actor);
    assert.equal(status.safeguard_active, true);
    assert.equal(status.broadcasts_paused, true);

    // Verify WebSocket emergency pause event was dispatched
    const pauseEvt = realtimeEvents.find(e => e.type === 'meta_safeguard_emergency_pause');
    assert.ok(pauseEvt);

    // Admin override clears safeguard and resumes broadcasting
    const overrideRes = await connections.overrideSafeguard(actor);
    assert.equal(overrideRes.success, true);

    const statusAfter = await connections.getSafeguardStatus(actor);
    assert.equal(statusAfter.broadcasts_paused, false);
  } finally {
    await close();
  }
});

test('Co-Existence Incremental Sync advances watermark and skips previously ingested messages', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const connections = new MetaConnections(db, testConfig, providers);
    const conn = await connections.connect(actor, { name: 'CoExistence Line', waba_id: '777001', phone_number_id: '777002' });

    const batch1 = `
10/11/2026, 09:00 - Messages and calls are end-to-end encrypted.
10/11/2026, 09:01 - Customer Dave: Hi, first inquiry.
10/11/2026, 09:02 - You: Hello Dave!
`;
    const res1 = await connections.incrementalChatSync(actor, conn.id, { raw_text: batch1 });
    assert.equal(res1.imported_count, 2);
    assert.equal(res1.skipped_count, 0);

    // Second sync with both old messages and 1 new message
    const batch2 = `
10/11/2026, 09:01 - Customer Dave: Hi, first inquiry.
10/11/2026, 09:02 - You: Hello Dave!
10/11/2026, 09:30 - Customer Dave: One more question about pricing.
`;
    const res2 = await connections.incrementalChatSync(actor, conn.id, { raw_text: batch2 });
    assert.equal(res2.imported_count, 1);
    assert.equal(res2.skipped_count, 2);

    // Verify sync schedule config
    await connections.updateSyncSchedule(actor, conn.id, { poll_enabled: true, poll_interval_hours: 12 });
    const sched = await connections.getSyncSchedule(actor, conn.id);
    assert.equal(sched.sync_schedule.poll_enabled, true);
    assert.equal(sched.sync_schedule.poll_interval_hours, 12);
    assert.equal(sched.incremental_sync_count, 2);
  } finally {
    await close();
  }
});
