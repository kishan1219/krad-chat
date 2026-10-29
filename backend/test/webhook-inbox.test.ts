import test from 'node:test';
import assert from 'node:assert/strict';
import {database} from './helpers';
import {WebhookInbox} from '../src/webhook-inbox';

test('webhook batches persist once before processing and unknown numbers are quarantined',async()=>{
 const {db,actor,close}=await database();
 try{
  await db.query("INSERT INTO meta_connections(tenant_id,phone_number_id,waba_id,name,token_encrypted,created_by) VALUES($1,'123','456','Test','unused',$2)",[actor.tenant_id,actor.id]);
  let calls=0;const inbox=new WebhookInbox(db,async()=>{calls++;});
  const body={entry:[{id:'waba',changes:[{field:'messages',value:{metadata:{phone_number_id:'123'},messages:[{id:'one',type:'text',text:{body:'Hi'}}]}}]}]};
  await inbox.receive(body);await inbox.receive(body);assert.equal(calls,0);
  assert.equal((await inbox.list(actor)).length,1);
  await inbox.tick();await inbox.tick();assert.equal(calls,1);
  assert.equal((await inbox.list(actor))[0].status,'completed');
  body.entry[0].changes[0].value.metadata.phone_number_id='unknown';await inbox.receive(body);await inbox.tick();assert.equal(calls,1);
  assert.equal((await db.query("SELECT count(*) FROM meta_webhook_events WHERE status='quarantined'")).rows[0].count,1);
  assert.equal((await inbox.list({...actor,tenant_id:actor.tenant_id+1})).length,0);
  await db.query("INSERT INTO meta_connections(tenant_id,phone_number_id,waba_id,name,token_encrypted,created_by) VALUES($1,'unknown','456','Test','unused',$2)",[actor.tenant_id,actor.id]);
  await inbox.tick();assert.equal(calls,2);
 }finally{await close();}
});

test('failed webhook work is persisted for retry without leaking exception content',async()=>{
 const {db,actor,close}=await database();
 try{
  await db.query("INSERT INTO meta_connections(tenant_id,phone_number_id,waba_id,name,token_encrypted,created_by) VALUES($1,'123','456','Test','unused',$2)",[actor.tenant_id,actor.id]);
  const inbox=new WebhookInbox(db,async()=>{throw new Error('secret-value');});
  await inbox.receive({entry:[{changes:[{value:{metadata:{phone_number_id:'123'}}}]}]});
  await inbox.tick();const row=(await inbox.list(actor))[0];
  assert.equal(row.status,'queued');assert.equal(row.attempts,1);assert.equal(row.error.includes('secret-value'),false);
  await assert.rejects(inbox.retry(actor,row.id));
 }finally{await close();}
});
