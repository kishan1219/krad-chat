import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Chat} from '../src/chat';
import {Providers} from '../src/providers';
import {formatWhatsAppText} from '../../frontend/src/utility/whatsappText';

test('inbox filters and read cursors preserve newly arrived unread messages and tenant boundaries',async()=>{
 const {db,actor,close}=await database();
 try{
  const chat=new Chat(db,testConfig,new Providers(testConfig),()=>{});
  const one=await chat.incoming(actor.tenant_id,'+919876543210','One','cursor-one');
  const two=await chat.incoming(actor.tenant_id,'+919876543210','Two','cursor-two');
  let rows=(await chat.conversations(actor,{unread:'true'})).data as any[];assert.equal(rows[0].unread_count,2);
  await chat.read(actor,one.conversation_id,{through_message_id:one.id});rows=(await chat.conversations(actor,{unread:'true'})).data as any[];assert.equal(rows[0].unread_count,1);
  await chat.read(actor,one.conversation_id,{through_message_id:two.id});await chat.read(actor,one.conversation_id,{through_message_id:one.id});
  assert.equal((await chat.conversations(actor,{unread:'true'})).total,0);
  await assert.rejects(chat.read({...actor,tenant_id:actor.tenant_id+1},one.conversation_id,{through_message_id:two.id}));
  const c=(await chat.conversations(actor)).data[0] as any;
  await chat.manage(actor,c.id,{version:c.version,labels:['lead'],assigned_to:actor.id,custom_fields:{city:'Delhi'}});
  assert.equal((await chat.conversations(actor,{assignment:'mine',label:'lead',search:'9876'})).total,1);
  assert.equal((await chat.conversations(actor,{assignment:'unassigned'})).total,0);
  const page=await chat.messages(actor,{conversation_id:c.id},{per_page:1});
  const older=await chat.messages(actor,{conversation_id:c.id},{per_page:1,before_id:page.next_before_id});
  assert.equal((older.data[0] as any).id,one.id);
 }finally{await close();}
});

test('customer text cannot inject HTML into the original chat renderer',()=>{
 const rendered=formatWhatsAppText('<img src=x onerror="alert(1)"> *hello*\n<script>alert(2)</script>');
 assert.equal(rendered.includes('<img'),false);assert.equal(rendered.includes('<script'),false);assert.match(rendered,/<strong>hello<\/strong>/);
 assert.equal(formatWhatsAppText('&lt;script&gt;'),'&amp;lt;script&amp;gt;');
});
