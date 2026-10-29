import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Users } from '../src/users';
import { Billing } from '../src/billing';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { Actor } from '../src/auth';

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
