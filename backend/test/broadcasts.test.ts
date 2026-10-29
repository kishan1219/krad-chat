import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Providers} from '../src/providers';
import {Campaigns} from '../src/campaigns';
import {MetaConnections} from '../src/meta-connections';
import {Broadcasts} from '../src/broadcasts';

test('broadcast approval, opt-in, emergency pause and daily limits gate actual dispatch',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig,db),campaigns=new Campaigns(db,testConfig,providers),connections=new MetaConnections(db,testConfig,providers),broadcasts=new Broadcasts(db,campaigns);
  const sender=await connections.connect(actor,{name:'Sales',waba_id:'1',phone_number_id:'2'});await connections.action(actor,sender.id,'sync');
  const input={name:'Test broadcast',recipients:['+919876543210','+919876543211'],payload:{phone_number_id:'2',template:{name:'hello_world',language:{code:'en_US'}}}};
  await assert.rejects(campaigns.create(actor,'whatsapp',input,'consent-missing'));
  for(const phone of input.recipients)await broadcasts.consent(actor,{phone,opted_in:true,source:'Signup form',evidence:'Test form record'});
  await broadcasts.policy(actor,{daily_limit:1,require_approval:true,paused:false});
  const campaign=await campaigns.create(actor,'whatsapp',input,'broadcast-one');assert.equal(campaign.status,'pending_approval');
  await campaigns.tick();assert.equal(Number((await db.query("SELECT count(*) FROM messages WHERE status='delivered'")).rows[0].count),0);
  await assert.rejects(broadcasts.approve({...actor,role:'operator'},campaign.id));await broadcasts.approve(actor,campaign.id);
  await broadcasts.policy(actor,{daily_limit:1,require_approval:true,paused:true});await campaigns.tick();assert.equal((await broadcasts.policy(actor)).dispatches_today,0);
  await broadcasts.policy(actor,{daily_limit:1,require_approval:true,paused:false});await campaigns.tick();
  assert.equal((await broadcasts.policy(actor)).dispatches_today,1);assert.equal(Number((await db.query("SELECT count(*) FROM messages WHERE status='delivered'")).rows[0].count),1);
  await broadcasts.consent(actor,{phone:input.recipients[1],opted_in:false,source:'Customer request',evidence:'STOP message'});
  await broadcasts.policy(actor,{daily_limit:2,require_approval:true,paused:false});await db.query('UPDATE messages SET next_attempt_at=now()');await campaigns.tick();
  assert.equal(Number((await db.query("SELECT count(*) FROM messages WHERE status='failed'")).rows[0].count),1);
  assert.equal(Number((await db.query('SELECT reserved FROM wallets WHERE user_id=$1',[actor.id])).rows[0].reserved),0);
  await assert.rejects(campaigns.create(actor,'whatsapp',{...input,payload:{...input.payload,internal_chat:true}},'forged-internal'));
 }finally{await close();}
});
