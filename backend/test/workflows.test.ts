import test from 'node:test';
import assert from 'node:assert/strict';
import { database,testConfig } from './helpers';
import { Providers } from '../src/providers';
import { Campaigns } from '../src/campaigns';
import { Workflows,withinBusinessHours } from '../src/workflows';
import { Chat } from '../src/chat';
import { Automation } from '../src/automation';

test('new-contact workflows notify once across business numbers and duplicate inbound deliveries',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig,db),campaigns=new Campaigns(db,testConfig,providers),workflows=new Workflows(db,campaigns);
  const chat=new Chat(db,testConfig,providers,()=>{},campaigns,new Automation(db,campaigns,undefined,workflows));
  const flow=await workflows.save(actor,{name:'New customer',trigger_kind:'new_contact',definition:{steps:[{kind:'notify',title:'New customer',text:'Please review the inbox.'}]}});
  await workflows.publish(actor,flow.id,true);
  await chat.incoming(actor.tenant_id,'+919876543210','Hello','first','101');
  await chat.incoming(actor.tenant_id,'+919876543210','Hello','first','101');
  await chat.incoming(actor.tenant_id,'+919876543210','Hello again','second','102');
  await workflows.tick();await workflows.tick();
  assert.equal((await workflows.runs(actor)).length,1);
  const notifications=(await db.query("SELECT * FROM resources WHERE kind='notification'")).rows;
  assert.equal(notifications.length,1);assert.equal(Number(notifications[0].tenant_id),actor.tenant_id);
  assert.equal(notifications[0].data.title,'New customer');
  assert.equal((await workflows.runs(actor))[0].status,'completed');
 }finally{await close();}
});

test('published workflow executes persistent steps, creates one outbound record and stops at handoff',async()=>{
 const {db,actor,close}=await database();
 try{
  const campaigns=new Campaigns(db,testConfig,new Providers(testConfig)),workflows=new Workflows(db,campaigns);
  const flow=await workflows.save(actor,{name:'Support',trigger_kind:'keyword',keyword:'HELP',definition:{steps:[{kind:'label',label:'support'},{kind:'condition',field:'label',equals:'support'},{kind:'text',text:'An agent will help.'},{kind:'note',text:'Customer requested help.'},{kind:'handoff'},{kind:'text',text:'Must not run'}]}});
  await workflows.publish(actor,flow.id,true);
  const conversation=(await db.query("INSERT INTO conversations(tenant_id,phone) VALUES($1,'+919876543210') RETURNING *",[actor.tenant_id])).rows[0];
  const incoming=(await db.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message) VALUES($1,$2,'in','help') RETURNING *",[actor.tenant_id,conversation.id])).rows[0];
  await db.transaction(c=>workflows.enqueue(c,actor.tenant_id,conversation,incoming));
  await db.transaction(c=>workflows.enqueue(c,actor.tenant_id,conversation,incoming));
  for(let i=0;i<8;i++){await workflows.tick();await campaigns.tick();await db.query("UPDATE workflow_runs SET available_at=now() WHERE status='queued'");}
  const runs=await workflows.runs(actor);assert.equal(runs.length,1);assert.equal(runs[0].status,'completed');assert.equal(runs[0].step,5);
  const updated=(await db.query('SELECT * FROM conversations WHERE id=$1',[conversation.id])).rows[0];assert.equal(updated.bot_paused,true);assert.deepEqual(updated.labels,['support']);
  assert.equal(Number((await db.query("SELECT count(*) FROM chat_messages WHERE direction='out'")).rows[0].count),1);
  assert.equal((await db.query("SELECT status FROM chat_messages WHERE direction='out'")).rows[0].status,'delivered');
  assert.equal(Number((await db.query('SELECT count(*) FROM conversation_notes')).rows[0].count),1);
  assert.equal((await workflows.runs({...actor,tenant_id:actor.tenant_id+1})).length,0);
 }finally{await close();}
});

test('workflow waits survive worker recreation and failed steps resume without repeating prior actions',async()=>{
 const {db,actor,close}=await database();
 try{
  const campaigns=new Campaigns(db,testConfig,new Providers(testConfig));let workflows=new Workflows(db,campaigns);
  const flow=await workflows.save(actor,{name:'Wait',trigger_kind:'incoming',definition:{steps:[{kind:'note',text:'Only once'},{kind:'wait',seconds:3600},{kind:'text',text:'Follow up'}]}});
  await workflows.publish(actor,flow.id,true);
  const conversation=(await db.query("INSERT INTO conversations(tenant_id,phone) VALUES($1,'+919876543211') RETURNING *",[actor.tenant_id])).rows[0];
  const incoming=(await db.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message,created_at) VALUES($1,$2,'in','hello',now()-interval '25 hours') RETURNING *",[actor.tenant_id,conversation.id])).rows[0];
  await db.transaction(c=>workflows.enqueue(c,actor.tenant_id,conversation,incoming));
  await workflows.tick();await workflows.tick();workflows=new Workflows(db,campaigns);await workflows.tick();
  let run=(await workflows.runs(actor))[0];assert.equal(run.step,2);assert.equal(run.status,'queued');
  await db.query('UPDATE workflow_runs SET available_at=now()');await workflows.tick();
  run=(await workflows.runs(actor))[0];assert.equal(run.status,'failed');assert.match(run.error,/window expired/);
  await assert.rejects(workflows.retry({...actor,tenant_id:actor.tenant_id+1},run.id));
  await db.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message) VALUES($1,$2,'in','continue')",[actor.tenant_id,conversation.id]);
  await workflows.retry(actor,run.id);await workflows.tick();await campaigns.tick();await db.query('UPDATE workflow_runs SET available_at=now()');await workflows.tick();
  assert.equal((await workflows.runs(actor))[0].status,'completed');assert.equal(Number((await db.query('SELECT count(*) FROM conversation_notes')).rows[0].count),1);
  const detail=await workflows.inspect(actor,run.id);assert.equal(detail.steps.length,3);assert.equal(detail.steps[2].delivery_status,'delivered');
 }finally{await close();}
});

test('workflow dry runs do not create side effects and definitions have bounded steps',async()=>{
 const {db,actor,close}=await database();
 try{
  const workflows=new Workflows(db,new Campaigns(db,testConfig,new Providers(testConfig)));
  const result=await workflows.dryRun(actor,{definition:{steps:[{kind:'condition',field:'message',equals:'yes'},{kind:'text',text:'Confirmed'}]},message:'no'});
  assert.equal(result.steps.length,1);assert.equal(Number((await db.query('SELECT count(*) FROM campaigns')).rows[0].count),0);
  await assert.rejects(workflows.save(actor,{name:'Loop',trigger_kind:'incoming',definition:{steps:Array.from({length:31},()=>({kind:'text',text:'Again'}))}}));
  await assert.rejects(workflows.save({...actor,role:'viewer'},{name:'Denied',trigger_kind:'incoming',definition:{steps:[{kind:'handoff'}]}}));
 }finally{await close();}
});

test('business-hour conditions handle overnight schedules in the business timezone',()=>{
 const step={timezone:'Asia/Kolkata',days:[1],start:'22:00',end:'02:00'};
 assert.equal(withinBusinessHours(step,new Date('2026-10-12T18:00:00Z')),true);
 assert.equal(withinBusinessHours(step,new Date('2026-10-12T20:00:00Z')),true);
 assert.equal(withinBusinessHours(step,new Date('2026-10-12T21:00:00Z')),false);
 assert.equal(withinBusinessHours(step,new Date('2026-10-13T18:00:00Z')),false);
});
