import test from 'node:test';
import assert from 'node:assert/strict';
import { database,testConfig } from './helpers';
import { MetaConnections } from '../src/meta-connections';
import { Providers } from '../src/providers';
import { templateDefinition } from '../src/template-definition';

test('template definition requires consecutive parameters with examples',()=>{
 assert.throws(()=>templateDefinition({name:'test',language:'en_US',category:'UTILITY',text:'Order {{2}}',examples:['123']}));
 assert.throws(()=>templateDefinition({name:'test',language:'en_US',category:'UTILITY',text:'Order {{1}}'}));
 assert.throws(()=>templateDefinition({name:'test',language:'en_US',category:'UTILITY',text:'Hello {{name}}'}));
 const result=templateDefinition({name:'order_confirmation',language:'en_US',category:'UTILITY',text:'Order {{1}}: {{1}}',examples:['123']});
 assert.deepEqual(result.components[0].example,{body_text:[['123']]});
});

test('template mutations are tenant scoped, shared across WABA numbers and survive mock synchronization',async()=>{
 const {db,actor,close}=await database();
 try {
  const connections=new MetaConnections(db,testConfig,new Providers(testConfig,db));
  const first=await connections.connect(actor,{name:'Sales',waba_id:'100',phone_number_id:'101'});
  await connections.connect(actor,{name:'Support',waba_id:'100',phone_number_id:'102'});
  const input={name:'order_confirmation',language:'en_US',category:'UTILITY',text:'Order {{1}}',examples:['123']};
  await assert.rejects(connections.createTemplate({...actor,tenant_id:actor.tenant_id+1},first.id,input));
  await assert.rejects(connections.createTemplate({...actor,role:'operator'},first.id,input));
  const template=await connections.createTemplate(actor,first.id,input);
  assert.equal(template.status,'APPROVED');
  await connections.action(actor,first.id,'sync');
  assert.ok((await connections.list(actor)).every(c=>c.templates.some((t:any)=>t.id===template.id)));
  await assert.rejects(connections.createTemplate(actor,first.id,input));
  await assert.rejects(connections.deleteTemplate(actor,first.id,{id:template.id,name:'wrong_name'}));
  await connections.deleteTemplate(actor,first.id,{id:template.id,name:template.name});
  assert.ok((await connections.list(actor)).every(c=>c.templates.length===0));
  assert.equal((await db.query("SELECT * FROM audit_logs WHERE action LIKE 'meta.template.%'")).rows.length,2);
 } finally {await close();}
});

test('live template submission preserves pending status and uses verified WABA credentials',async()=>{
 const {db,actor,close}=await database();
 try {
  const cfg={...testConfig,PROVIDER_MODE:'live' as const},provider=new Providers(cfg,db);
  const calls:any[]=[];
  provider.meta=async(path,method,body,token)=>{
   calls.push({path,method,body});assert.equal(token,'private-token');
   if(path.includes('/phone_numbers'))return {data:[{id:'101'}]};
   if(method==='POST')return {id:'501',status:'PENDING',category:'UTILITY'};
   return {success:true};
  };
  const connections=new MetaConnections(db,cfg,provider),row=await connections.connect(actor,{name:'Live',waba_id:'100',phone_number_id:'101',access_token:'private-token'});
  const template=await connections.createTemplate(actor,row.id,{name:'order_ready',language:'en_US',category:'UTILITY',text:'Your order is ready.'});
  assert.equal(template.status,'PENDING');assert.equal((await connections.senders(actor))[0].templates.length,0);
  assert.equal(calls[1].path,'100/message_templates');
  await connections.deleteTemplate(actor,row.id,{id:'501',name:'order_ready'});
  assert.equal(calls[2].method,'DELETE');assert.equal(calls[2].path,'100/message_templates?hsm_id=501&name=order_ready');
 } finally {await close();}
});
