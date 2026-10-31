import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Users } from '../src/users';
import { Billing } from '../src/billing';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { Actor } from '../src/auth';
import { ResellerService } from '../src/reseller';

test('reseller transfers conserve credits and cannot reach siblings or mint funds', async () => {
  const { db, actor, close } = await database();
  try {
    const users = new Users(db); const billing = new Billing(db, new Providers(testConfig));
    const child = await users.create(actor, { name: 'Reseller', email: 'reseller@test.com', password: 'long-test-password', role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] });
    const sibling = await users.create(actor, { name: 'Sibling', email: 'sibling@test.com', password: 'long-test-password' });
    const reseller: Actor = { ...actor, id: child.id, role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] };
    const grandchild = await users.create(reseller, { name: 'Customer', email: 'customer@test.com', password: 'long-test-password', role: 'operator', permissions: ['campaign:create'] });
    await billing.transfer(actor, { to_user_id: child.id, amount_paise: 1000, reference: 'admin-transfer-001' });
    await billing.transfer(reseller, { to_user_id: grandchild.id, amount_paise: 400, reference: 'reseller-transfer-001' });
    await billing.transfer(reseller, { to_user_id: grandchild.id, amount_paise: 400, reference: 'reseller-transfer-001' });
    assert.equal(Number((await billing.wallet(reseller)).balance), 600);
    assert.equal(Number((await billing.wallet(reseller, grandchild.id)).balance), 400);
    assert.equal(Number((await db.query('SELECT sum(balance) AS total FROM wallets')).rows[0].total), 10000);
    await assert.rejects(billing.transfer(reseller, { to_user_id: sibling.id, amount_paise: 1, reference: 'sibling-transfer-001' }), /hierarchy/);
    await assert.rejects(billing.credit({ ...reseller, permissions: ['billing:write'] }, { amount_paise: 100, reference: 'mint-attempt-001' }), /Only administrators/);
    await assert.rejects(users.create(reseller, { name: 'Escalated', email: 'escalated@test.com', password: 'long-test-password', role: 'admin' }), /elevated/);
  } finally { await close(); }
});
test('reserved campaign funds cannot be transferred and siblings cannot inspect campaigns', async () => {
  const { db, actor, close } = await database();
  try {
    const users = new Users(db); const billing = new Billing(db, new Providers(testConfig));
    const a = await users.create(actor, { name: 'A', email: 'a@test.com', password: 'long-test-password', role: 'reseller', permissions: ['campaign:create','billing:transfer','users:write'] });
    const b = await users.create(actor, { name: 'B', email: 'b@test.com', password: 'long-test-password', role: 'reseller', permissions: ['campaign:create','users:write'] });
    const childActor: Actor = { ...actor, id: a.id, role: 'reseller', permissions: ['campaign:create','billing:transfer','users:write'] };
    const target = await users.create(childActor, { name: 'Customer', email: 'c@test.com', password: 'long-test-password' });
    await billing.transfer(actor, { to_user_id: a.id, amount_paise: 25, reference: 'reserve-transfer-001' });
    const campaigns = new Campaigns(db, testConfig, new Providers(testConfig));
    const campaign = await campaigns.create(childActor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'reserved-campaign-001');
    await assert.rejects(billing.transfer(childActor, { to_user_id: target.id, amount_paise: 1, reference: 'spend-reserved-001' }), /unreserved/);
    const sibling = { ...childActor, id: b.id };
    await assert.rejects(campaigns.get(sibling, campaign.id), /hierarchy/);
    assert.deepEqual((await campaigns.list(sibling, {})).data, []);
    assert.equal((await campaigns.get(actor, campaign.id)).id, campaign.id);
  } finally { await close(); }
});
test('ResellerService.getClients parameterized queries enforce scoping, authorization, empty results, and pagination', async () => {
  const { db, actor, close } = await database();
  try {
    const users = new Users(db);
    const billing = new Billing(db, new Providers(testConfig));
    const resellerService = new ResellerService(db);

    // 1. Create Reseller A and Reseller B under Admin
    const resellerAUser = await users.create(actor, { name: 'Reseller A', email: 'reseller_a@test.com', password: 'long-test-password', role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] });
    const resellerBUser = await users.create(actor, { name: 'Reseller B', email: 'reseller_b@test.com', password: 'long-test-password', role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] });
    const resellerA: Actor = { ...actor, id: resellerAUser.id, role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] };
    const resellerB: Actor = { ...actor, id: resellerBUser.id, role: 'reseller', permissions: ['users:write','billing:transfer','campaign:create'] };

    // 2. Empty results: Reseller A has 0 clients initially
    const emptyClients = await resellerService.getClients(resellerA, {});
    assert.equal(emptyClients.total, 0);
    assert.deepEqual(emptyClients.data, []);
    assert.equal(emptyClients.current_page, 1);

    // 3. Create clients: Client A1 & A2 under Reseller A, Client B1 under Reseller B
    const clientA1 = await users.create(resellerA, { name: 'Client A1', email: 'a1@test.com', password: 'long-test-password', role: 'operator', permissions: ['campaign:create'] });
    const clientA2 = await users.create(resellerA, { name: 'Client A2', email: 'a2@test.com', password: 'long-test-password', role: 'operator', permissions: ['campaign:create'] });
    const clientB1 = await users.create(resellerB, { name: 'Client B1', email: 'b1@test.com', password: 'long-test-password', role: 'operator', permissions: ['campaign:create'] });

    // Fund Reseller A and transfer to Client A1 (500 paise) and A2 (250 paise)
    await billing.transfer(actor, { to_user_id: resellerAUser.id, amount_paise: 2000, reference: 'admin-fund-reseller-a' });
    await billing.transfer(resellerA, { to_user_id: clientA1.id, amount_paise: 500, reference: 'transfer-to-a1-001' });
    await billing.transfer(resellerA, { to_user_id: clientA2.id, amount_paise: 250, reference: 'transfer-to-a2-001' });

    // 4. Authorized reseller scope: Reseller A sees only A1 and A2, never B1
    const resAClients = await resellerService.getClients(resellerA, {});
    assert.equal(resAClients.total, 2);
    assert.equal(resAClients.data.length, 2);
    const clientIds = resAClients.data.map((c: any) => c.id);
    assert.ok(clientIds.includes(clientA1.id));
    assert.ok(clientIds.includes(clientA2.id));
    assert.ok(!clientIds.includes(clientB1.id)); // Reseller B's client is strictly excluded

    // Verify wallet balances in output
    const rowA1 = resAClients.data.find((c: any) => c.id === clientA1.id);
    const rowA2 = resAClients.data.find((c: any) => c.id === clientA2.id);
    assert.equal(Number(rowA1.balance), 500);
    assert.equal(Number(rowA2.balance), 250);

    // 5. Pagination: perPage = 1
    const page1 = await resellerService.getClients(resellerA, { page: 1, per_page: 1 });
    assert.equal(page1.total, 2);
    assert.equal(page1.last_page, 2);
    assert.equal(page1.data.length, 1);
    assert.equal(page1.data[0].id, clientA2.id); // DESC order: clientA2 was created after clientA1

    const page2 = await resellerService.getClients(resellerA, { page: 2, per_page: 1 });
    assert.equal(page2.total, 2);
    assert.equal(page2.data.length, 1);
    assert.equal(page2.data[0].id, clientA1.id);

    // 6. Authorized admin scope: Admin sees all clients with parent_user_id IS NOT NULL across the tenant
    const adminClients = await resellerService.getClients(actor, {});
    assert.ok(adminClients.total >= 3);
    const adminClientIds = adminClients.data.map((c: any) => c.id);
    assert.ok(adminClientIds.includes(clientA1.id));
    assert.ok(adminClientIds.includes(clientA2.id));
    assert.ok(adminClientIds.includes(clientB1.id));

    // 7. Unauthorized scope: Operator / client role calling getClients gets HTTP 403 ApiError
    const operatorActor: Actor = { ...actor, id: clientA1.id, role: 'operator', permissions: [] };
    await assert.rejects(
      resellerService.getClients(operatorActor, {}),
      /Only administrators and resellers can view client balances/
    );

    // 8. Cross-tenant isolation: An actor with a different tenant_id sees 0 clients
    const crossTenantReseller: Actor = { ...resellerA, tenant_id: 999999 };
    const crossTenantResult = await resellerService.getClients(crossTenantReseller, {});
    assert.equal(crossTenantResult.total, 0);
    assert.equal(crossTenantResult.data.length, 0);

  } finally { await close(); }
});
