import test from 'node:test';
import assert from 'node:assert/strict';
import {database,testConfig} from './helpers';
import {Providers} from '../src/providers';
import {MetaConnections} from '../src/meta-connections';
import {Files} from '../src/files';
import {Chat} from '../src/chat';
import {Campaigns} from '../src/campaigns';

test('Meta connections protect credentials and ownership and separate conversations by sender',async()=>{
 const {db,actor,close}=await database();
 try{
  const providers=new Providers(testConfig,db),connections=new MetaConnections(db,testConfig,providers),campaigns=new Campaigns(db,testConfig,providers),chat=new Chat(db,testConfig,providers,()=>{},campaigns);
  const first=await connections.connect(actor,{name:'Sales',waba_id:'100',phone_number_id:'101',access_token:'never-store-this-real-token-in-mock'});
  assert.equal(first.token_encrypted,undefined);assert.equal(first.credentials_configured,true);assert.equal(first.simulated,true);
  assert.equal(JSON.stringify(await connections.list(actor)).includes('never-store'),false);
  const second=await connections.connect(actor,{name:'Support',waba_id:'100',phone_number_id:'102'});
  await assert.rejects(connections.connect({...actor,tenant_id:actor.tenant_id+1},{name:'Stolen',waba_id:'100',phone_number_id:'101'}));
  await assert.rejects(connections.action({...actor,tenant_id:actor.tenant_id+1},first.id,'sync'));
  await connections.action(actor,first.id,'sync');await connections.action(actor,first.id,'subscribe');await connections.action(actor,first.id,'register',{pin:'123456'});
  assert.equal((await connections.list(actor)).find(r=>r.id===first.id).templates[0].status,'APPROVED');
  await chat.incoming(actor.tenant_id,'+919876543210','Hi','in-a','101');await chat.incoming(actor.tenant_id,'+919876543210','Hi','in-b','102');
  const conversations=(await chat.conversations(actor)).data as any[];assert.equal(conversations.length,2);
  const reply=await chat.reply(actor,{conversation_id:conversations.find(c=>c.phone_number_id==='101').id,message:'Sales response'});
  assert.equal((await campaigns.get(actor,reply.campaign_id)).payload.phone_number_id,'101');
  const templateReply=await chat.reply(actor,{conversation_id:conversations.find(c=>c.phone_number_id==='101').id,template:{name:'hello_world',language:{code:'en_US'}}});
  assert.equal((await campaigns.get(actor,templateReply.campaign_id)).payload.template.name,'hello_world');
  await assert.rejects(chat.reply(actor,{conversation_id:conversations.find(c=>c.phone_number_id==='101').id,template:{name:'unapproved',language:{code:'en_US'}}}));
  await assert.rejects(campaigns.create(actor,'whatsapp',{recipients:['+919876543210'],payload:{template:{name:'hello'}}},'ambiguous-sender'));
  await connections.action(actor,second.id,'disconnect');await assert.rejects(chat.tenantForMeta('102'));
  assert.equal((await db.query('SELECT token_encrypted FROM meta_connections WHERE id=$1',[second.id])).rows[0].token_encrypted,'');
 }finally{await close();}
});

test('live connection verifies the number with Meta before persisting encrypted credentials',async()=>{
 const {db,actor,close}=await database();
 try{
  const cfg={...testConfig,PROVIDER_MODE:'live' as const};
  const providers=new Providers(cfg,db);let calls=0;
  providers.meta=async(path,method,body,accessToken)=>{calls++;assert.equal(accessToken,'secret-token');assert.match(path,/^100\/phone_numbers/);return {data:[{id:'101',display_phone_number:'+919876543210',quality_rating:'GREEN'}]};};
  const connections=new MetaConnections(db,cfg,providers);
  await assert.rejects(connections.connect(actor,{name:'Wrong',waba_id:'100',phone_number_id:'999',access_token:'secret-token'}));
  assert.equal((await connections.list(actor)).length,0);
  const result=await connections.connect(actor,{name:'Verified',waba_id:'100',phone_number_id:'101',access_token:'secret-token'});
  assert.equal(result.simulated,false);assert.equal(calls,2);
  const raw=(await db.query('SELECT token_encrypted FROM meta_connections WHERE id=$1',[result.id])).rows[0].token_encrypted;
  assert.notEqual(raw,'secret-token');assert.equal(JSON.stringify(result).includes('secret-token'),false);
 }finally{await close();}
});

test('Automated WhatsApp Business Profile Media CDN: processes image to 640x640 JPEG and syncs profile', async () => {
  const { db, actor, close } = await database();
  try {
    const sharp = require('sharp');
    const sampleImage = await sharp({
      create: {
        width: 800,
        height: 600,
        channels: 4,
        background: { r: 37, g: 211, b: 102, alpha: 1 }
      }
    }).png().toBuffer();

    const files = new Files(db, testConfig);
    const providers = new Providers(testConfig, db);
    const notified: any[] = [];
    const connections = new MetaConnections(db, testConfig, providers, (tenant, evt) => notified.push(evt), files);

    const conn = await connections.connect(actor, { name: 'CDN Brand', waba_id: '500', phone_number_id: '501' });

    // Upload profile avatar
    const res = await connections.uploadBusinessProfileAvatar(actor, conn.id, {
      image_base64: sampleImage.toString('base64'),
      filename: 'logo.png',
      about: 'KradChat Cloud API'
    });

    assert.equal(res.success, true);
    assert.equal(res.dimensions, '640x640');
    assert.equal(res.format, 'image/jpeg');
    assert.match(res.profile_picture_url, /\/api\/files\//);

    // Verify stored profile
    const profile = await connections.getBusinessProfile(actor, conn.id);
    assert.equal(profile.phone_number_id, '501');
    assert.match(profile.profile_picture_url, /\/api\/files\//);
    assert.equal(profile.about, 'KradChat Cloud API');

    // Delete avatar
    const delRes = await connections.deleteBusinessProfileAvatar(actor, conn.id);
    assert.equal(delRes.success, true);
    const profileAfter = await connections.getBusinessProfile(actor, conn.id);
    assert.equal(profileAfter.profile_picture_url, null);
  } finally {
    await close();
  }
});
