import test from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Organizations } from '../src/organizations';
import { Auth } from '../src/auth';
import { Providers } from '../src/providers';

test('organization lifecycle: state transitions, session revocation, and auth rejection', async (t) => {
  const { db, actor, close } = await database();
  t.after(async () => { await close(); });

  const orgs = new Organizations(db, String(actor.id));
  const providers = new Providers(testConfig, db);
  const auth = new Auth(db, testConfig, providers);

  // 1. Initial status is 'active'
  const profile = await orgs.get(actor);
  assert.equal(profile.status, 'active');
  assert.equal(profile.name, 'Test');
  assert.equal(profile.active_users, 1);

  // 2. Organization update
  const updated = await orgs.update(actor, { name: 'Acme Global Corp' });
  assert.equal(updated.name, 'Acme Global Corp');

  // 3. User can log in when active
  const loginResult = await auth.login({ email: 'admin@test.com', password: 'long-test-password' });
  if (!('access_token' in loginResult)) {
    assert.fail('Expected loginResult to have access_token');
  }
  assert.ok(loginResult.access_token);
  const authenticatedActor = await auth.authenticate(`Bearer ${loginResult.access_token}`);
  assert.equal(authenticatedActor.tenant_id, actor.tenant_id);

  // 4. Suspend organization
  const suspendedResult = await orgs.updateStatus(actor, actor.tenant_id, 'suspended', 'Non-payment of platform invoice');
  assert.equal(suspendedResult.status, 'suspended');
  assert.equal(suspendedResult.previous_status, 'active');
  assert.equal(suspendedResult.reason, 'Non-payment of platform invoice');

  // 5. Existing session should be revoked / rejected on next authenticate call
  await assert.rejects(
    async () => auth.authenticate(`Bearer ${loginResult.access_token}`),
    { status: 401 } // Session revoked
  );

  // 6. Login attempts should be blocked with 403 while suspended
  await assert.rejects(
    async () => auth.login({ email: 'admin@test.com', password: 'long-test-password' }),
    (err: any) => {
      assert.equal(err.status, 403);
      assert.match(err.message, /Organization is suspended/);
      return true;
    }
  );

  // 7. Reinstate organization: suspended -> active
  const reinstated = await orgs.updateStatus(actor, actor.tenant_id, 'active', 'Invoice settled in full');
  assert.equal(reinstated.status, 'active');
  assert.equal(reinstated.previous_status, 'suspended');

  // 8. Login should now succeed again
  const newLogin = await auth.login({ email: 'admin@test.com', password: 'long-test-password' });
  if (!('access_token' in newLogin)) {
    assert.fail('Expected newLogin to have access_token');
  }
  assert.ok(newLogin.access_token);
  const newActor = await auth.authenticate(`Bearer ${newLogin.access_token}`);
  assert.equal(newActor.id, actor.id);

  // 9. Close organization: active -> closed (terminal state)
  const closed = await orgs.updateStatus(actor, actor.tenant_id, 'closed', 'Voluntary account termination');
  assert.equal(closed.status, 'closed');

  // 10. Cannot transition from closed to active (terminal state rejection)
  await assert.rejects(
    async () => orgs.updateStatus(actor, actor.tenant_id, 'active', 'Attempt to reopen'),
    { status: 422 }
  );

  // 11. Login permanently blocked for closed organization
  await assert.rejects(
    async () => auth.login({ email: 'admin@test.com', password: 'long-test-password' }),
    (err: any) => {
      assert.equal(err.status, 403);
      assert.match(err.message, /Organization is closed/);
      return true;
    }
  );
});

test('new workspace admins can manage their own workspace without platform access', async (t) => {
  const { db, actor, close } = await database();
  t.after(close);
  const auth = new Auth(db, testConfig, new Providers(testConfig, db));
  const orgs = new Organizations(db, String(actor.id));
  const customerA = await auth.signup({
    email: 'customer-a@test.com', password: 'Long-test-password-123!', name: 'Alice', business_name: 'Customer A'
  });
  const customerB = await auth.signup({
    email: 'customer-b@test.com', password: 'Long-test-password-123!', name: 'Bob', business_name: 'Customer B'
  });
  const a = await auth.authenticate(`Bearer ${customerA.access_token}`);
  const b = await auth.authenticate(`Bearer ${customerB.access_token}`);
  assert.equal(a.role, 'admin');
  assert.equal(b.role, 'admin');
  assert.notEqual(a.tenant_id, b.tenant_id);
  assert.equal((await orgs.update(a, { name: 'Customer A updated' })).name, 'Customer A updated');
  await assert.rejects(orgs.list(a, {}), { status: 403 });
  await assert.rejects(orgs.updateStatus(a, b.tenant_id, 'suspended'), { status: 403 });
  await assert.rejects(orgs.list(b, {}), { status: 403 });
  await assert.rejects(orgs.updateStatus(b, a.tenant_id, 'suspended'), { status: 403 });
  assert.equal((await orgs.get(a)).status, 'active');
  assert.equal((await orgs.get(b)).name, 'Customer B');
  assert.equal((await orgs.get(b)).status, 'active');
  const directory = await orgs.list(actor, {});
  assert.ok(directory.data.some(organization => organization.id === b.tenant_id));
  assert.equal((await orgs.updateStatus(actor, b.tenant_id, 'suspended')).status, 'suspended');
});
