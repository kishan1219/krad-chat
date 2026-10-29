import { loadConfig } from '../src/config';
import { Db } from '../src/db';
import { Providers } from '../src/providers';
import { encrypt } from '../src/common';

async function run() {
  const cfg = loadConfig();
  const db = new Db(cfg);
  const providers = new Providers(cfg, db);

  const phoneId = '1456492210872100';
  const wabaId = '982014231041693';
  const token = 'EAAkwsfQGYhcBSybm6Cp8bjJUi9Xit2eKfj5euVbDzINLKOsZC3d5j7E3FGSpo70FzYKEcbfPgh1SLZCDY4i9QwDgBVjdtNB7V9IO1uXj15ybNOLIyHBhGRWA6AGLq27eDNt5YZBDUPu5Hje5cjOYm9LTjq61UkMyTxxo5ZCgNLCt3xSuneaVEzrwkifOaXt4rnX17OAape0CIfzeZC4yvKawQhCSvDCBZCW0bZA0jEhNI2f80xZCsHWDkt3f1PXKJRvX7ZBgrwKMVYZCWQ3TMYvUpH';
  const recipient = '+919516871900';

  console.log('1. Querying live phone number details from Meta Graph API...');
  const phoneInfo = await providers.meta(`${phoneId}?fields=id,display_phone_number,verified_name,quality_rating,status`, 'GET', undefined, token);
  console.log('Phone Info:', phoneInfo);

  console.log('\n2. Querying live message templates from Meta WABA...');
  const templateList = await providers.meta(`${wabaId}/message_templates?limit=100`, 'GET', undefined, token);
  console.log(`Found ${templateList.data?.length || 0} templates on Meta WABA.`);

  console.log('\n3. Encrypting access token and registering Meta Connection in Platform Database...');
  const encryptedToken = encrypt(token, cfg.ENCRYPTION_KEY);

  let tenant = (await db.query("SELECT id FROM tenants ORDER BY id LIMIT 1")).rows[0];
  if (!tenant) {
    tenant = (await db.query("INSERT INTO tenants(name, status) VALUES('Talkrad Platform', 'active') RETURNING id")).rows[0];
  }

  let adminUser = (await db.query("SELECT id FROM users WHERE tenant_id=$1 ORDER BY id LIMIT 1", [tenant.id])).rows[0];
  if (!adminUser) {
    adminUser = (await db.query("INSERT INTO users(tenant_id, email, name, password_hash, role) VALUES($1, 'admin@platform.test', 'Admin', 'hash', 'admin') RETURNING id", [tenant.id])).rows[0];
  }

  const upsert = await db.query(`
    INSERT INTO meta_connections(
      tenant_id, phone_number_id, waba_id, name, display_phone_number,
      quality_rating, token_encrypted, templates, created_by, status, simulated, last_sync_at
    ) VALUES(
      $1, $2, $3, $4, $5, $6, $7, $8, $9, 'connected', false, now()
    ) ON CONFLICT (phone_number_id) DO UPDATE SET
      waba_id=EXCLUDED.waba_id,
      name=EXCLUDED.name,
      display_phone_number=EXCLUDED.display_phone_number,
      quality_rating=EXCLUDED.quality_rating,
      token_encrypted=EXCLUDED.token_encrypted,
      templates=EXCLUDED.templates,
      status='connected',
      simulated=false,
      last_sync_at=now(),
      updated_at=now()
    RETURNING id, phone_number_id, waba_id, name, display_phone_number, status, simulated
  `, [
    tenant.id,
    phoneId,
    wabaId,
    'Krad Technology Live Number',
    phoneInfo.display_phone_number || '+1 555-668-2099',
    phoneInfo.quality_rating || 'GREEN',
    encryptedToken,
    JSON.stringify(templateList.data || []),
    adminUser.id
  ]);

  console.log('Saved Connection:', upsert.rows[0]);

  console.log('\n4. Dispatching live template message via Providers.send()...');
  const sendResult = await providers.send({
    id: `live_test_${Date.now()}`,
    tenant_id: tenant.id,
    recipient: recipient,
    channel: 'whatsapp',
    payload: {
      phone_number_id: phoneId,
      template: {
        name: 'jaspers_market_order_confirmation_v1',
        language: { code: 'en_US' },
        components: [
          {
            type: 'body',
            parameters: [
              { type: 'text', text: 'John Doe' },
              { type: 'text', text: '123456' },
              { type: 'text', text: 'Oct 30, 2026' }
            ]
          }
        ]
      }
    }
  });

  console.log('\n======================================================');
  console.log(' SUCCESS! LIVE MESSAGE DISPATCHED VIA PLATFORM PROVIDER:');
  console.log(' Provider:', sendResult.provider);
  console.log(' Meta Message ID:', sendResult.id);
  console.log(' Simulated:', sendResult.simulated);
  console.log(' Recipient:', recipient);
  console.log('======================================================');

  await db.pool.end();
}

run().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
