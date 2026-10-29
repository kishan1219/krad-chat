import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Operations } from '../src/operations';
import { Resources } from '../src/resources';
import { Providers } from '../src/providers';
import { Auth } from '../src/auth';
import { Users } from '../src/users';

test('API keys are scoped, IP-restricted, hashed, and revoked on rotation', async () => {
  const { db, actor, close } = await database();
  try {
    const resources = new Resources(db, testConfig); const ops = new Operations(db, testConfig, resources); const auth = new Auth(db, testConfig, new Providers(testConfig));
    const first = (await ops.handle(actor, 'POST', 'user-change-api-key', { scopes: ['campaign:create'] }, {})).data;
    const authenticated = await auth.authenticate(`Bearer ${first.api_key}`, '127.0.0.1');
    assert.equal(authenticated.role, 'operator'); assert.deepEqual(authenticated.permissions, ['campaign:create']);
    assert.notEqual((await db.query('SELECT key_hash FROM api_keys')).rows[0].key_hash, first.api_key);
    await ops.handle(actor, 'POST', 'enable-additional-security', { allowed_ips: ['127.0.0.1'] }, {});
    await assert.rejects(auth.authenticate(`Bearer ${first.api_key}`, '192.0.2.1'), /IP restriction/);
    await ops.handle(actor, 'POST', 'user-change-api-key', { scopes: ['campaign:create'] }, {});
    await assert.rejects(auth.authenticate(`Bearer ${first.api_key}`, '127.0.0.1'), /Invalid API key/);
    await assert.rejects(ops.handle(authenticated, 'POST', 'user-change-api-key', { scopes: ['admin:write'] }, {}), /broader|administrators/);
  } finally { await close(); }
});
test('notification reads are per-user and cannot mutate another business notification', async () => {
  const { db, actor, close } = await database();
  try {
    const resources = new Resources(db, testConfig); const ops = new Operations(db, testConfig, resources);
    const notification = await resources.create(actor, 'notification', { title: 'Test', message: 'hello' });
    const child = await new Users(db).create(actor, { email: 'reader@test.com', name: 'Reader', password: 'long-test-password' });
    assert.equal((await ops.handle(actor, 'GET', 'unread-notification-count', {}, {})).data.count, 1);
    await ops.handle(actor, 'GET', `notification-read/${notification.id}`, {}, {});
    assert.equal((await ops.handle(actor, 'GET', 'unread-notification-count', {}, {})).data.count, 0);
    assert.equal((await ops.handle({ ...actor, id: child.id }, 'GET', 'unread-notification-count', {}, {})).data.count, 1);
    await assert.rejects(ops.handle({ ...actor, tenant_id: actor.tenant_id + 1 }, 'GET', `notification-read/${notification.id}`, {}, {}), /not found/);
  } finally { await close(); }
});
