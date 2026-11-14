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

test('Multi-Format Media Resizer & WhatsApp 512x512 Sticker Creator', async () => {
  const { db, actor, close } = await database();
  try {
    const sharp = require('sharp');
    const sampleInput = await sharp({
      create: {
        width: 1200,
        height: 630,
        channels: 4,
        background: { r: 99, g: 102, b: 241, alpha: 1 }
      }
    }).png().toBuffer();

    const files = new Files(db, testConfig);

    // 1. Multi-format broadcast image header resizing
    const resizeRes = await files.processBroadcastImageVariants(actor, {
      image_base64: sampleInput.toString('base64'),
      filename: 'hero_promo.png',
      width: 1200,
      height: 630
    });

    assert.equal(resizeRes.success, true);
    assert.ok(resizeRes.variants.webp);
    assert.ok(resizeRes.variants.png);
    assert.ok(resizeRes.variants.jpeg);
    assert.equal(resizeRes.variants.webp.mime, 'image/webp');
    assert.match(resizeRes.recommended_url, /\/api\/files\//);

    // 2. WhatsApp 512x512 WebP Sticker Creator
    const stickerRes = await files.createWhatsAppSticker(actor, {
      image_base64: sampleInput.toString('base64'),
      filename: 'brand_badge.png',
      pack_name: 'Summer Promo Stickers',
      author: 'Krad Technology'
    });

    assert.equal(stickerRes.success, true);
    assert.equal(stickerRes.dimensions, '512x512');
    assert.equal(stickerRes.mime, 'image/webp');
    assert.equal(stickerRes.whatsapp_guidelines_compliant, true);
    assert.match(stickerRes.cdn_url, /\/api\/files\//);

    // 3. List tenant stickers
    const list = await files.listWhatsAppStickers(actor);
    assert.ok(list.length > 0);
    assert.equal(list[0].dimensions, '512x512');
    assert.equal(list[0].pack_name, 'Summer Promo Stickers');
  } finally {
    await close();
  }
});

test('Automated OBA Re-Application Scheduler evaluates rolling 30-day message volume milestone', async () => {
  const { db, actor, close } = await database();
  try {
    const providers = new Providers(testConfig, db);
    const notified: any[] = [];
    const connections = new MetaConnections(db, testConfig, providers, (tenant, evt) => notified.push(evt));

    const conn = await connections.connect(actor, { name: 'High Volume Brand', waba_id: '600', phone_number_id: '601' });

    // Set initial Tier to 1K so volume milestone must be unlocked by messages
    await db.query("UPDATE meta_connections SET messaging_limit_tier='TIER_1K', oba_status='NOT_ELIGIBLE' WHERE id=$1", [conn.id]);

    // Initially NOT_ELIGIBLE (Tier 1K, 0 messages)
    const initialCheck = await connections.checkAndScheduleObaEligibility(actor, conn.id);
    assert.equal(initialCheck.eligible, false);
    assert.equal(initialCheck.oba_status, 'NOT_ELIGIBLE');

    // Simulate 12,000 sent messages in the past 30 days
    const campRes = await db.query(
      "INSERT INTO campaigns(tenant_id, user_id, channel, name, payload, status, idempotency_key, request_hash, total, cost) VALUES($1, $2, 'whatsapp', 'Mass Broadcast', '{}', 'completed', 'test-milestone-campaign', 'test-hash', 10005, 0) RETURNING id",
      [actor.tenant_id, actor.id]
    );
    const campId = campRes.rows[0].id;

    // Insert dummy messages meeting the 10,000 threshold
    await db.query(
      `INSERT INTO messages(campaign_id, tenant_id, user_id, recipient, channel, status, cost, created_at)
       SELECT $1, $2, $3, '9198765432' || i, 'whatsapp', 'delivered', 0, now() - interval '2 days'
       FROM generate_series(1, 10005) AS s(i)`,
      [campId, actor.tenant_id, actor.id]
    );

    // Re-run OBA milestone check
    const milestoneCheck = await connections.checkAndScheduleObaEligibility(actor, conn.id);
    assert.equal(milestoneCheck.eligible, true);
    assert.equal(milestoneCheck.oba_status, 'ELIGIBLE');
    assert.ok(milestoneCheck.rolling_30d_volume >= 10000);

    // Verify WebSocket notification emitted
    assert.ok(notified.some(n => n.type === 'meta_oba_eligible' && n.oba_status === 'ELIGIBLE'));

    // Verify in-app notification persisted
    const notifs = (await db.query(
      "SELECT data FROM resources WHERE tenant_id=$1 AND kind='notification' ORDER BY id DESC",
      [actor.tenant_id]
    )).rows;
    assert.ok(notifs.some(n => n.data?.type === 'meta_oba_eligible'));
  } finally {
    await close();
  }
});
