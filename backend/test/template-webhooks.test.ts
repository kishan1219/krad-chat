import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Providers} from '../src/providers';
import {MetaConnections} from '../src/meta-connections';
import {Campaigns} from '../src/campaigns';
import {Chat} from '../src/chat';
import {Billing} from '../src/billing';
import {Webhooks} from '../src/webhooks';

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
