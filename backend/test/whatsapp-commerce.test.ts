import test from 'node:test';
import assert from 'node:assert/strict';
import { database,testConfig } from './helpers';
import { Commerce } from '../src/commerce';
import { Automation } from '../src/automation';
import { Campaigns } from '../src/campaigns';
import { Chat } from '../src/chat';
import { Providers } from '../src/providers';

test('checkout reserves stock once, rejects changed quotes and separates order payments from wallets',async()=>{
 const {db,actor,close}=await database();try{
  const commerce=new Commerce(db,testConfig);const p=await commerce.saveProduct(actor,{sku:'TEA',name:'Tea',price_paise:29900,stock:2});
  const input={customer_phone:'9876543210',customer_name:'Customer',address:{line1:'12 Main Street',city:'Delhi',postcode:'110001'},payment_method:'online',items:[{product_id:Number(p.id),quantity:1,expected_price_paise:29900}]};
  const row=await commerce.checkout(actor,input,'order-test-0001');assert.equal((await commerce.checkout(actor,input,'order-test-0001')).id,row.id);assert.equal(Number((await commerce.products(actor))[0].reserved),1);
  await assert.rejects(commerce.checkout(actor,{...input,customer_name:'Changed'},'order-test-0001'),/different details/);
  await assert.rejects(commerce.checkout(actor,{...input,items:[{...input.items[0],expected_price_paise:100}]},'order-test-0002'),/Price changed/);
  await assert.rejects(commerce.checkout(actor,{...input,items:[{...input.items[0],quantity:2}]},'order-test-0003'),/Insufficient stock/);
  const balance=(await db.query('SELECT balance FROM wallets WHERE user_id=$1',[actor.id])).rows[0].balance;
  const paid=await commerce.mockPay(actor,row.id);assert.equal(paid.payment_status,'paid');assert.equal((await commerce.mockPay(actor,row.id)).id,row.id);
  assert.equal((await db.query('SELECT balance FROM wallets WHERE user_id=$1',[actor.id])).rows[0].balance,balance);
  assert.equal(Number((await db.query("SELECT count(*) AS n FROM order_events WHERE action='payment.captured'")).rows[0].n),1);
  await assert.rejects(commerce.transition(actor,row.id,{status:'packing',version:1}),/changed/);
  const packing=await commerce.transition(actor,row.id,{status:'packing',version:paid.version});const shipped=await commerce.transition(actor,row.id,{status:'shipped',version:packing.version});assert.equal(shipped.status,'shipped');
  const after=(await commerce.products(actor))[0];assert.equal(Number(after.stock),1);assert.equal(Number(after.reserved),0);
  await assert.rejects(commerce.checkout({...actor,role:'viewer'},input,'viewer-order-01'),/Permission/);
  await assert.rejects(commerce.saveProduct({...actor,tenant_id:999}, {...p,stock:8,price_paise:Number(p.price_paise),version:Number(after.version)},String(p.id)),/changed/);
 }finally{await close();}
});

test('cancelled and expired orders release stock; paid cancellation requires refund reconciliation',async()=>{
 const {db,actor,close}=await database();try{const commerce=new Commerce(db,testConfig);const p=await commerce.saveProduct(actor,{sku:'ONE',name:'Only item',price_paise:1000,stock:1});const input={customer_phone:'9876543210',customer_name:'Customer',address:{line1:'Street 1',city:'Delhi',postcode:'110001'},payment_method:'online',items:[{product_id:Number(p.id),quantity:1,expected_price_paise:1000}]};
 const first=await commerce.checkout(actor,input,'expiry-order-01');await db.query("UPDATE commerce_orders SET expires_at=now()-interval '1 minute' WHERE id=$1",[first.id]);await commerce.expire();assert.equal((await commerce.orders(actor))[0].status,'expired');assert.equal(Number((await commerce.products(actor))[0].reserved),0);await assert.rejects(commerce.mockPay(actor,first.id),/expired/);
 const second=await commerce.checkout(actor,input,'expiry-order-02');const paid=await commerce.mockPay(actor,second.id);const cancelled=await commerce.transition(actor,second.id,{status:'cancelled',version:paid.version});assert.equal(cancelled.payment_status,'refund_required');assert.equal(Number((await commerce.products(actor))[0].reserved),0);
 }finally{await close();}
});

test('published automation deduplicates inbound events, bills once and respects handoff and opt-out',async()=>{
 const {db,actor,close}=await database();try{
 const providers=new Providers(testConfig);const campaigns=new Campaigns(db,testConfig,providers);const automation=new Automation(db,campaigns);const chat=new Chat(db,testConfig,providers,()=>{},campaigns,automation);
 const flow=await automation.create(actor,{name:'Welcome',trigger_kind:'keyword',keyword:'hi',reply:'Welcome. Type Agent for help.'});await automation.publish(actor,flow.id,true);
 await chat.incoming(actor.tenant_id,'9876543210','hi','incoming-unique-1');await chat.incoming(actor.tenant_id,'9876543210','hi','incoming-unique-1');assert.equal((await automation.runs(actor)).length,1);await automation.tick();await automation.tick();assert.equal((await automation.runs(actor))[0].status,'completed');assert.equal(Number((await db.query('SELECT count(*) AS n FROM campaigns')).rows[0].n),1);
 await chat.incoming(actor.tenant_id,'9876543210','hi','incoming-unique-2');await chat.incoming(actor.tenant_id,'9876543210','Agent','incoming-unique-3');await automation.tick();assert.equal((await automation.runs(actor))[0].status,'skipped');
 const conversation=(await chat.conversations(actor)).data[0];await assert.rejects(chat.manage(actor,conversation.id,{version:1,bot_paused:false}),/changed/);const current=await chat.manage(actor,conversation.id,{version:conversation.version,bot_paused:false});assert.equal(current.bot_paused,false);
 await chat.incoming(actor.tenant_id,'9876543210','STOP','incoming-unique-4');await chat.incoming(actor.tenant_id,'9876543210','hi','incoming-unique-5');assert.equal((await automation.runs(actor)).length,2);
 const note=await chat.notes(actor,conversation.id,{body:'Customer requested help.'});assert.equal(note.body,'Customer requested help.');await assert.rejects(chat.notes({...actor,tenant_id:999},conversation.id),/not found/);
 }finally{await close();}
});

test('shopping chatbot completes a cash-on-delivery order and duplicate confirmations cannot order twice',async()=>{
 const {db,actor,close}=await database();try{
 const providers=new Providers(testConfig),campaigns=new Campaigns(db,testConfig,providers),commerce=new Commerce(db,testConfig),automation=new Automation(db,campaigns,commerce),chat=new Chat(db,testConfig,providers,()=>{},campaigns,automation);
 await commerce.saveProduct(actor,{sku:'TEA',name:'Tea',price_paise:20000,stock:3});const flow=await automation.create(actor,{name:'Shop',trigger_kind:'any',reply:'Shop',flow_kind:'shop'});await automation.publish(actor,flow.id,true);
 let sequence=0;const send=async(text:string)=>{await chat.incoming(actor.tenant_id,'9876543210',text,`shop-inbound-${++sequence}`);await automation.tick();const run=(await automation.runs(actor))[0];assert.equal(run.status,'completed',run.error);return run.reply as string;};
 assert.match(await send('SHOP'),/TEA/);assert.match(await send('ADD TEA 2'),/400.00/);assert.match(await send('CHECKOUT'),/full name/);assert.match(await send('Local Customer'),/delivery address/);assert.match(await send('Street 12 | Delhi | 110001'),/CONFIRM/);assert.match(await send('CONFIRM'),/Order confirmed/);assert.match(await send('CONFIRM'),/Type SHOP/);
 const orders=await commerce.orders(actor);assert.equal(orders.length,1);assert.equal(orders[0].payment_method,'cod');assert.equal(Number(orders[0].total_paise),40000);assert.equal(Number((await commerce.products(actor))[0].reserved),2);
 await chat.incoming(actor.tenant_id,'9876543210','CONFIRM','shop-inbound-6');assert.equal((await commerce.orders(actor)).length,1);
 }finally{await close();}
});
