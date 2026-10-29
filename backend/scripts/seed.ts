import { PGlite } from '@electric-sql/pglite';
import { hash } from 'bcryptjs';
import { randomBytes, randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { config as dotenv } from 'dotenv';
import { Db } from '../src/db';
import { loadConfig } from '../src/config';
import { migrate } from '../src/migrate';
import { permissions } from '../src/resources';
import { sha256 } from '../src/common';

dotenv({ path: '.env.local', quiet: true });

export async function runSeed(externalDb?: Db) {
  let db: Db;
  let closeAfter = false;

  if (externalDb) {
    db = externalDb;
  } else {
    const pg = new PGlite('.local-data');
    const normalize = (r: any) => ({ rows: r.rows || [], rowCount: r.affectedRows || r.rows?.length || 0 });
    const execute = async (target: any, text: string, values: unknown[] = []) => {
      if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
      if (!values.length && text.trim().split(';').filter(Boolean).length > 1) {
        await target.exec(text);
        return { rows: [], rowCount: 0 };
      }
      return normalize(await target.query(text, values));
    };
    db = {
      query: (text: string, values: unknown[] = []) => execute(pg, text, values),
      transaction: (fn: any) => pg.transaction(tx => fn({ query: (text: string, values: unknown[] = []) => execute(tx, text, values) })),
      pool: { end: () => pg.close() },
    } as unknown as Db;
    closeAfter = true;
  }

  await migrate(db);

  const defaultPassword = 'Password123!';
  const passwordHash = await hash(defaultPassword, 10);

  const seedResult = await db.transaction(async c => {
    // 1. Super Admin Tenant & User
    let platformTenant = (await c.query("SELECT id FROM tenants WHERE name='Talkrad Global Platform'")).rows[0];
    if (!platformTenant) {
      platformTenant = (await c.query("INSERT INTO tenants(name, status) VALUES('Talkrad Global Platform', 'active') RETURNING id")).rows[0];
    }

    const superAdmin = (await c.query(
      `INSERT INTO users(tenant_id, email, name, password_hash, role, permissions)
       VALUES($1, 'admin@platform.test', 'Global Super Administrator', $2, 'admin', $3)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash
       RETURNING id, email, name, role`,
      [platformTenant.id, passwordHash, permissions]
    )).rows[0];

    await c.query('INSERT INTO wallets(tenant_id, user_id, balance) VALUES($1, $2, 10000000) ON CONFLICT (user_id) DO NOTHING', [platformTenant.id, superAdmin.id]);
    await c.query("INSERT INTO ledger(tenant_id, user_id, type, amount, reference, created_by) VALUES($1, $2, 'credit', 10000000, 'seed:opening_super_admin', $2) ON CONFLICT (user_id, type, reference) DO NOTHING", [platformTenant.id, superAdmin.id]);

    // 2. Subscription Plans
    const plansData = [
      { name: 'Starter Plan', slug: 'starter', description: 'Entry level for SMBs', price_paise: 199900, period: 'monthly', limit: 1000, features: { custom_domain: false, api_access: true, team_seats: 2 } },
      { name: 'Growth Plan', slug: 'growth', description: 'Scale-up tier for growing brands', price_paise: 499900, period: 'monthly', limit: 10000, features: { custom_domain: true, api_access: true, team_seats: 10, bot_workflows: true } },
      { name: 'Enterprise Plan', slug: 'enterprise', description: 'Unlimited scale and dedicated throughput', price_paise: 1499900, period: 'monthly', limit: 50000, features: { custom_domain: true, api_access: true, team_seats: 50, bot_workflows: true, white_label: true } },
    ];

    const seededPlans = [];
    for (const p of plansData) {
      const row = (await c.query(
        `INSERT INTO plans(name, slug, description, price_paise, billing_period, message_limit, features, active)
         VALUES($1, $2, $3, $4, $5, $6, $7, true)
         ON CONFLICT (slug) DO UPDATE SET price_paise=EXCLUDED.price_paise RETURNING *`,
        [p.name, p.slug, p.description, p.price_paise, p.period, p.limit, p.features]
      )).rows[0];
      seededPlans.push(row);
    }

    // 3. Reseller Account (under same tenant hierarchy or child tenant)
    const reseller = (await c.query(
      `INSERT INTO users(tenant_id, email, name, password_hash, role, permissions, parent_user_id)
       VALUES($1, 'reseller@agency.test', 'Apex Agency Owner', $2, 'reseller', $3, $4)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash
       RETURNING id, email, name, role`,
      [platformTenant.id, passwordHash, ['users:write', 'billing:transfer', 'campaign:create', 'resources:write'], superAdmin.id]
    )).rows[0];

    await c.query('INSERT INTO wallets(tenant_id, user_id, balance) VALUES($1, $2, 500000) ON CONFLICT (user_id) DO NOTHING', [platformTenant.id, reseller.id]);
    await c.query("INSERT INTO ledger(tenant_id, user_id, type, amount, reference, created_by) VALUES($1, $2, 'credit', 500000, 'seed:opening_reseller', $3) ON CONFLICT (user_id, type, reference) DO NOTHING", [platformTenant.id, reseller.id, superAdmin.id]);

    // Reseller Markup Configuration (15 paise markup on WhatsApp messages, 10 paise on SMS)
    await c.query(
      `INSERT INTO reseller_markups(tenant_id, reseller_id, channel, markup_paise, markup_percent, active)
       VALUES($1, $2, 'whatsapp', 15, 0.0, true),
             ($1, $2, 'sms', 10, 0.0, true)
       ON CONFLICT (reseller_id, channel) DO UPDATE SET markup_paise=EXCLUDED.markup_paise`,
      [platformTenant.id, reseller.id]
    );

    // Reseller White-Label Configuration
    const whiteLabel = (await c.query(
      `INSERT INTO white_label_configs(tenant_id, reseller_id, domain, company_name, logo_url, favicon_url, primary_color, accent_color, email_sender_name, support_email, email_footer)
       VALUES($1, $2, 'portal.apexagency.test', 'Apex Messaging Hub', 'https://apexagency.test/logo.svg', 'https://apexagency.test/favicon.ico', '#4F46E5', '#06B6D4', 'Apex Support Team', 'support@apexagency.test', '© 2026 Apex Messaging Hub. Powered by Talkrad Tech Provider.')
       ON CONFLICT (tenant_id) DO UPDATE SET company_name=EXCLUDED.company_name RETURNING *`,
      [platformTenant.id, reseller.id]
    )).rows[0];

    // Assign Growth Plan to Tenant
    await c.query(
      `INSERT INTO subscriptions(tenant_id, plan_id, status, renews_at)
       VALUES($1, $2, 'active', now() + interval '30 days')
       ON CONFLICT (tenant_id) DO UPDATE SET plan_id=EXCLUDED.plan_id`,
      [platformTenant.id, seededPlans[1].id]
    );

    // 4. Client Account (under Reseller)
    const client = (await c.query(
      `INSERT INTO users(tenant_id, email, name, password_hash, role, permissions, parent_user_id)
       VALUES($1, 'client@retailer.test', 'Apex Retail Store', $2, 'operator', $3, $4)
       ON CONFLICT (email) DO UPDATE SET name=EXCLUDED.name, password_hash=EXCLUDED.password_hash
       RETURNING id, email, name, role`,
      [platformTenant.id, passwordHash, ['campaign:create'], reseller.id]
    )).rows[0];

    await c.query('INSERT INTO wallets(tenant_id, user_id, balance) VALUES($1, $2, 100000) ON CONFLICT (user_id) DO NOTHING', [platformTenant.id, client.id]);
    await c.query("INSERT INTO ledger(tenant_id, user_id, type, amount, reference, created_by) VALUES($1, $2, 'credit', 100000, 'seed:opening_client', $3) ON CONFLICT (user_id, type, reference) DO NOTHING", [platformTenant.id, client.id, reseller.id]);

    // Client API Key
    const apiKeyRaw = 'krad_live_seed_retailer_api_key_7788';
    await c.query(
      `INSERT INTO api_keys(id, tenant_id, user_id, key_hash, scopes)
       VALUES($1, $2, $3, $4, $5)
       ON CONFLICT (key_hash) DO NOTHING`,
      [randomUUID(), platformTenant.id, client.id, sha256(apiKeyRaw), ['campaign:create']]
    );

    // 5. Official WhatsApp Meta Connection for Client
    let metaConnection = (await c.query("SELECT id, waba_id, phone_number_id, display_phone_number, name, status FROM meta_connections WHERE tenant_id=$1 AND phone_number_id='phone_apex_retail_001'", [platformTenant.id])).rows[0];
    if (!metaConnection) {
      metaConnection = (await c.query(
        `INSERT INTO meta_connections(
           tenant_id, waba_id, phone_number_id, display_phone_number, name,
           quality_rating, status, token_encrypted, templates, created_by, simulated
         ) VALUES(
           $1, 'waba_apex_retail_001', 'phone_apex_retail_001', '+919876543210', 'Apex Retail Store',
           'GREEN', 'connected', 'encrypted_mock_system_token', $2, $3, true
         ) RETURNING id, waba_id, phone_number_id, display_phone_number, name, status`,
        [
          platformTenant.id,
          JSON.stringify([
            { name: 'welcome_promo', language: 'en_US', category: 'MARKETING', status: 'APPROVED', components: [{ type: 'BODY', text: 'Welcome to Apex Retail! Use code APEX10 for 10% off.' }] },
            { name: 'order_update', language: 'en_US', category: 'UTILITY', status: 'APPROVED', components: [{ type: 'BODY', text: 'Your order {{1}} has been confirmed.' }] },
          ]),
          client.id
        ]
      )).rows[0];
    }

    // Contact Consent for testing
    await c.query(
      `INSERT INTO contact_consent(tenant_id, phone, opted_out, source, opted_in_at, evidence)
       VALUES($1, '+919876543210', false, 'web_checkout', now(), 'Web checkout consent checkbox')
       ON CONFLICT (tenant_id, phone) DO NOTHING`,
      [platformTenant.id]
    );

    // Inbound Customer Conversation in Team Inbox
    let conversation = (await c.query("SELECT id, phone, name, state FROM conversations WHERE tenant_id=$1 AND phone='+919876543210'", [platformTenant.id])).rows[0];
    if (!conversation) {
      conversation = (await c.query(
        `INSERT INTO conversations(tenant_id, phone, name, state, phone_number_id)
         VALUES($1, '+919876543210', 'Test Customer', 'open', 'phone_apex_retail_001')
         RETURNING id, phone, name, state`,
        [platformTenant.id]
      )).rows[0];

      await c.query(
        `INSERT INTO chat_messages(tenant_id, conversation_id, direction, message, status)
         VALUES($1, $2, 'in', 'Hello, can I check order status?', 'received')`,
        [platformTenant.id, conversation.id]
      );
    }

    return {
      superAdmin: { ...superAdmin, password: defaultPassword },
      reseller: { ...reseller, password: defaultPassword, markup: { whatsapp: 15, sms: 10 } },
      client: { ...client, password: defaultPassword, apiKey: apiKeyRaw },
      plans: seededPlans,
      whiteLabel,
      metaConnection,
      conversation,
    };
  });

  if (closeAfter) await db.pool.end();
  return seedResult;
}

if (require.main === module) {
  runSeed().then(result => {
    console.log('\n======================================================');
    console.log(' SEED COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    console.log(` Super Admin: ${result.superAdmin.email} | Pass: ${result.superAdmin.password}`);
    console.log(` Reseller:    ${result.reseller.email}   | Pass: ${result.reseller.password}`);
    console.log(` Client:      ${result.client.email}     | Pass: ${result.client.password}`);
    console.log(` Client API Key: ${result.client.apiKey}`);
    console.log(` White-Label: ${result.whiteLabel.company_name} (${result.whiteLabel.domain})`);
    console.log(` WhatsApp:    ${result.metaConnection.name} (${result.metaConnection.display_phone_number})`);
    console.log(` Plans:       ${result.plans.map(p => p.name).join(', ')}`);
    console.log('======================================================\n');
  }).catch(err => {
    console.error('Seed failed:', err);
    process.exitCode = 1;
  });
}
