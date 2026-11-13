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
  const webhooks=new Webhooks(testConfig,campaigns,chat,new Billing(db,providers),db,providers);
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
  const webhooks=new Webhooks(testConfig,campaigns,chat,new Billing(db,providers),db,providers);

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
  assert.match(notifications[0].data.title, /Tier Upgraded/);
  assert.equal(notifications[0].data.current_tier, 'TIER_10K');
 } finally { await close(); }
});
