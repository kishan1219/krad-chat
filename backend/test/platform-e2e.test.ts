import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Users } from '../src/users';
import { Billing } from '../src/billing';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { Actor } from '../src/auth';
import { Plans } from '../src/plans';
import { WhiteLabel } from '../src/white-label';
import { ResellerService } from '../src/reseller';
import { MetaConnections } from '../src/meta-connections';
import { MetaOnboarding } from '../src/meta-onboarding';
import { Webhooks } from '../src/webhooks';
import { WebhookInbox } from '../src/webhook-inbox';
import { Chat } from '../src/chat';
import { Operations } from '../src/operations';
import { Resources } from '../src/resources';

test('1. Super Admin: Manage all resellers, clients, plans and pricing', async () => {
  const { db, actor: superAdmin, close } = await database();
  try {
    const users = new Users(db);
    const plans = new Plans(db);

    // Super Admin creates a reseller
    const resellerUser = await users.create(superAdmin, {
      name: 'Reseller Agency',
      email: 'reseller@agency.com',
      password: 'long-password-123',
      role: 'reseller',
      permissions: ['users:write', 'billing:transfer', 'campaign:create'],
    });
    assert.equal(resellerUser.role, 'reseller');

    // Super Admin creates plans
    const starterPlan = await plans.create(superAdmin, {
      name: 'Starter Tier',
      slug: 'starter-tier',
      description: 'Starter tier description',
      price_paise: 199900,
      billing_period: 'monthly',
      message_limit: 1000,
      features: { api_access: true },
    });
    assert.equal(starterPlan.slug, 'starter-tier');
    assert.equal(starterPlan.price_paise, 199900);

    const growthPlan = await plans.create(superAdmin, {
      name: 'Growth Tier',
      slug: 'growth-tier',
      description: 'Growth tier description',
      price_paise: 499900,
      billing_period: 'monthly',
      message_limit: 10000,
      features: { custom_domain: true, white_label: true },
    });
    assert.equal(growthPlan.price_paise, 499900);

    // Update plan
    const updatedGrowth = await plans.update(superAdmin, growthPlan.id, {
      price_paise: 450000,
    });
    assert.equal(updatedGrowth.price_paise, 450000);

    // Super Admin assigns plan to tenant
    const assignment = await plans.assign(superAdmin, {
      tenant_id: superAdmin.tenant_id,
      plan_id: growthPlan.id,
    });
    assert.equal(assignment.plan.id, growthPlan.id);

    // Check subscription
    const sub = await plans.subscription(superAdmin);
    assert.equal(sub.plan_name, 'Growth Tier');
  } finally {
    await close();
  }
});

test('2 & 6. Reseller panel & Hierarchical billing: markup, balance management, client deduction and reseller reconciliation', async () => {
  const { db, actor: superAdmin, close } = await database();
  try {
    const providers = new Providers(testConfig);
    const users = new Users(db);
    const billing = new Billing(db, providers);
    const campaigns = new Campaigns(db, testConfig, providers);
    const resellerService = new ResellerService(db);

    // 1. Create Reseller
    const resellerUser = await users.create(superAdmin, {
      name: 'Apex Reseller',
      email: 'reseller@apex.com',
      password: 'long-password-123',
      role: 'reseller',
      permissions: ['users:write', 'billing:transfer', 'campaign:create'],
    });
    const resellerActor: Actor = {
      ...superAdmin,
      id: resellerUser.id,
      role: 'reseller',
      permissions: ['users:write', 'billing:transfer', 'campaign:create'],
    };

    // 2. Fund Reseller wallet from Super Admin
    await billing.transfer(superAdmin, {
      to_user_id: resellerUser.id,
      amount_paise: 5000,
      reference: 'fund-reseller-001',
    });
    assert.equal(Number((await billing.wallet(resellerActor)).balance), 5000);

    // 3. Reseller creates Client
    const clientUser = await users.create(resellerActor, {
      name: 'Retail Store Client',
      email: 'client@retail.com',
      password: 'long-password-123',
      role: 'operator',
      permissions: ['campaign:create'],
    });
    const clientActor: Actor = {
      ...superAdmin,
      id: clientUser.id,
      role: 'operator',
      permissions: ['campaign:create'],
    };

    // 4. Reseller sets markup (15 paise on WhatsApp messages)
    const markup = await resellerService.setMarkup(resellerActor, {
      channel: 'whatsapp',
      markup_paise: 15,
      markup_percent: 0,
      active: true,
    });
    assert.equal(markup.markup_paise, 15);

    // 5. Reseller transfers credits to Client
    await billing.transfer(resellerActor, {
      to_user_id: clientUser.id,
      amount_paise: 1000,
      reference: 'fund-client-001',
    });
    assert.equal(Number((await billing.wallet(resellerActor)).balance), 4000);
    assert.equal(Number((await billing.wallet(clientActor)).balance), 1000);

    // Reseller checks client balances
    const clientList = await resellerService.getClients(resellerActor, {});
    assert.equal(clientList.total, 1);
    assert.equal(Number(clientList.data[0].balance), 1000);

    // 6. Set up WhatsApp consent and connection for test phone number
    await db.query(
      `INSERT INTO contact_consent(tenant_id, phone, opted_out, source, opted_in_at, evidence)
       VALUES($1, '+919876543210', false, 'web_checkout', now(), 'Opt-in verified')`,
      [superAdmin.tenant_id]
    );
    await db.query(
      `INSERT INTO broadcast_policies(tenant_id, require_approval)
       VALUES($1, false)
       ON CONFLICT (tenant_id) DO UPDATE SET require_approval=false`,
      [superAdmin.tenant_id]
    );

    // 7. Client creates a WhatsApp campaign
    // Base WhatsApp price = 100 paise (from testConfig). Reseller markup = 15 paise.
    // Total unit price for client = 115 paise.
    const campaign = await campaigns.create(
      clientActor,
      'whatsapp',
      { name: 'Promo 1', message: 'Hello from client', recipients: ['+919876543210'] },
      'client-campaign-key-001'
    );
    assert.equal(Number(campaign.cost), 115); // 100 base + 15 markup!

    // Verify client wallet reserved 115 paise
    const clientWalletBefore = await billing.wallet(clientActor);
    assert.equal(Number(clientWalletBefore.reserved), 115);

    // 8. Worker tick() processes the message
    await campaigns.tick();

    // 9. Verify client wallet deducted 115 paise
    const clientWalletAfter = await billing.wallet(clientActor);
    assert.equal(Number(clientWalletAfter.balance), 885);
    assert.equal(Number(clientWalletAfter.reserved), 0);

    // 10. HIERARCHICAL RECONCILIATION VERIFICATION:
    // Reseller balance should have received the 15 paise markup rebate!
    // 4000 + 15 = 4015 paise!
    const resellerWalletAfter = await billing.wallet(resellerActor);
    assert.equal(Number(resellerWalletAfter.balance), 4015);

    // Verify Reseller reconciliation ledger
    const recon = await resellerService.reconciliation(resellerActor, {});
    assert.equal(recon.total_markup_earned_paise, 15);
    assert.equal(recon.data.length, 1);
    assert.equal(recon.data[0].markup_paise, 15);
  } finally {
    await close();
  }
});

test('3 & 4. Client panel & White-label: branding configuration, public resolution, and client usage summary', async () => {
  const { db, actor: superAdmin, close } = await database();
  try {
    const whiteLabel = new WhiteLabel(db);
    const resellerService = new ResellerService(db);

    // 1. Configure white-label branding
    const saved = await whiteLabel.update(superAdmin, {
      domain: 'portal.myagency.com',
      company_name: 'My Custom Agency Portal',
      logo_url: 'https://myagency.com/logo.png',
      favicon_url: 'https://myagency.com/favicon.ico',
      primary_color: '#4F46E5',
      accent_color: '#06B6D4',
      email_sender_name: 'MyAgency Support',
      support_email: 'support@myagency.com',
      email_footer: 'Powered by MyAgency',
    });
    assert.equal(saved.company_name, 'My Custom Agency Portal');
    assert.equal(saved.domain, 'portal.myagency.com');

    // 2. Public resolution by domain
    const resolved = await whiteLabel.resolvePublic('portal.myagency.com:443');
    assert.equal(resolved.company_name, 'My Custom Agency Portal');
    assert.equal(resolved.primary_color, '#4F46E5');

    // Default fallback for unknown domain
    const fallback = await whiteLabel.resolvePublic('unknown.domain.com');
    assert.equal(fallback.company_name, 'Messaging Platform');

    // 3. Client Usage Summary
    const usage = await resellerService.clientUsageSummary(superAdmin);
    assert.equal(typeof usage.balance_paise, 'number');
    assert.equal(typeof usage.total_campaigns, 'number');
    assert.equal(typeof usage.messages, 'object');
  } finally {
    await close();
  }
});

test('5. Credit system: recharge, transfer, usage deduction, and double-entry ledger verification', async () => {
  const { db, actor: superAdmin, close } = await database();
  try {
    const providers = new Providers(testConfig);
    const users = new Users(db);
    const billing = new Billing(db, providers);

    // 1. Create child user
    const child = await users.create(superAdmin, {
      name: 'Client User',
      email: 'client_credit@test.com',
      password: 'long-password-123',
    });

    // 2. Recharge order
    const order = await billing.order(superAdmin, { amount_paise: 50000 });
    assert.ok(order.id);

    // 3. Payment captured webhook simulation
    await billing.captured({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${order.id}`,
            order_id: order.id,
            currency: 'INR',
            status: 'captured',
            amount: 50000,
          },
        },
      },
    });

    // Verify balance increased by 50,000 paise
    const walletAfterRecharge = await billing.wallet(superAdmin);
    assert.equal(Number(walletAfterRecharge.balance), 60000); // 10,000 initial + 50,000

    // 4. Transfer credits
    await billing.transfer(superAdmin, {
      to_user_id: child.id,
      amount_paise: 10000,
      reference: 'transfer-ref-e2e-001',
    });

    // 5. Verify ledger has immutable double-entry records
    const superAdminLedger = await billing.ledger(superAdmin, { type: 'transfer_out' });
    assert.equal(superAdminLedger.data.length, 1);
    assert.equal(Number(superAdminLedger.data[0].amount), 10000);

    const childActor: Actor = { ...superAdmin, id: child.id, role: 'viewer', permissions: [] };
    const childLedger = await billing.ledger(childActor, { type: 'transfer_in' });
    assert.equal(childLedger.data.length, 1);
    assert.equal(Number(childLedger.data[0].amount), 10000);
  } finally {
    await close();
  }
});

test('7. Official WhatsApp API: Meta Cloud API, webhooks verification & Embedded Signup handshake', async () => {
  const { db, actor: superAdmin, close } = await database();
  try {
    const providers = new Providers(testConfig);
    const metaConnections = new MetaConnections(db, testConfig, providers);
    const onboarding = new MetaOnboarding(db, testConfig, providers, metaConnections);
    const chat = new Chat(db, testConfig, providers);
    const billing = new Billing(db, providers);
    const campaigns = new Campaigns(db, testConfig, providers);
    const webhooks = new Webhooks(testConfig, campaigns, chat, billing, db, providers);

    // 1. Meta Embedded Signup: Begin
    const sessionActor: Actor = { ...superAdmin, session_id: 'session-super-admin' };
    const begin = await onboarding.begin(sessionActor);
    assert.ok(begin.state);
    assert.ok(begin.expires_in);

    // 2. Meta Embedded Signup: Complete
    const completed = await onboarding.complete(sessionActor, {
      state: begin.state,
      code: 'mock-auth-code-12345',
      name: 'Apex Retail Store',
      waba_id: '1001',
      phone_number_id: '1002',
    });
    assert.equal(completed.status, 'connected');
    assert.equal(completed.phone_number_id, '1002');

    // 3. Webhook Hub Challenge Verification (GET)
    process.env.META_VERIFY_TOKEN = 'test-meta-verify-token';
    const challenge = webhooks.verifyMeta({
      'hub.mode': 'subscribe',
      'hub.verify_token': 'test-meta-verify-token',
      'hub.challenge': 'test_hub_challenge_123',
    });
    assert.equal(challenge, 'test_hub_challenge_123');

    // 4. Inbound Message Webhook Processing (POST)
    const inboundPayload = {
      entry: [
        {
          id: '1001',
          changes: [
            {
              field: 'messages',
              value: {
                messaging_product: 'whatsapp',
                metadata: {
                  display_phone_number: '+919876543210',
                  phone_number_id: completed.phone_number_id,
                },
                contacts: [{ profile: { name: 'Customer One' }, wa_id: '919123456789' }],
                messages: [
                  {
                    from: '919123456789',
                    id: 'wamid.HBgLM...mock',
                    timestamp: String(Math.floor(Date.now() / 1000)),
                    text: { body: 'Inbound message from WhatsApp' },
                    type: 'text',
                  },
                ],
              },
            },
          ],
        },
      ],
    };

    const webhookResult = await webhooks.inbox.receive(inboundPayload);
    assert.equal(webhookResult.received, true);

    // Process webhook queue
    await webhooks.inbox.tick();
    assert.equal((await webhooks.inbox.list(superAdmin)).length, 1);
    const conversations = (await db.query(
      'SELECT * FROM conversations WHERE tenant_id=$1',
      [superAdmin.tenant_id]
    )).rows;
    assert.ok(conversations.length >= 1);
  } finally {
    await close();
  }
});
