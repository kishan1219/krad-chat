import test from 'node:test';
import assert from 'node:assert/strict';
import { database,testConfig } from './helpers';
import { Providers } from '../src/providers';
import { Invitations } from '../src/invitations';

test('invitation token is private, one-time and creates only the invited role with zero balance',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig), service=new Invitations(db,providers,testConfig);
  const result=await service.create(actor,{email:'employee@example.com',name:'Employee',role:'operator'});
  assert.equal('token_hash' in result,false);
  const secret=providers.mailbox[0].text.match(/#([a-f0-9]+)/)![1];
  await service.accept({token:secret,password:'a-long-test-password'});
  await assert.rejects(service.accept({token:secret,password:'a-long-test-password'}));
  const user=(await db.query("SELECT * FROM users WHERE email='employee@example.com'")).rows[0];
  assert.equal(user.role,'operator');assert.equal(Number(user.tenant_id),actor.tenant_id);
  assert.deepEqual(user.permissions,['chat:reply']);
  assert.equal(Number((await db.query('SELECT balance FROM wallets WHERE user_id=$1',[user.id])).rows[0].balance),0);
 }finally{await close();}
});

test('revoked invitations cannot be accepted and viewer cannot invite',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig), service=new Invitations(db,providers,testConfig);
  await assert.rejects(service.create({...actor,role:'viewer'},{email:'employee@example.com',name:'Employee',role:'operator'}));
  const result=await service.create(actor,{email:'viewer@example.com',name:'Viewer',role:'viewer'});
  const secret=providers.mailbox[0].text.match(/#([a-f0-9]+)/)![1];
  await service.revoke(actor,result.id);
  await assert.rejects(service.accept({token:secret,password:'a-long-test-password'}));
 }finally{await close();}
});
