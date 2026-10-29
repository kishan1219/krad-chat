import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApplication } from '../src/main';
import { database, testConfig } from './helpers';

test('HTTP contracts: auth, campaign billing, permission rejection, malformed input, mock gating', async () => {
  const { db, close } = await database();
  const instance = await createApplication({ config: testConfig, db });
  await instance.app.listen(0, '127.0.0.1');
  const port = instance.app.getHttpServer().address().port;
  const base = `http://127.0.0.1:${port}/api`;
  async function post(path: string, body: any, token?: string, headers: any = {}) {
    const response = await fetch(`${base}/${path}`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...headers }, body: JSON.stringify(body) });
    return { status: response.status, body: await response.json() as any };
  }
  try {
    assert.equal((await post('send-sms', {})).status, 401);
    const login = await post('login', { email: 'admin@test.com', password: 'long-test-password' });
    assert.equal(login.status, 200); const token = login.body.data.access_token;
    const missingKey = await post('send-sms', { message: 'hello', recipients: ['9876543210'] }, token);
    assert.equal(missingKey.status, 422);
    const campaign = await post('send-sms', { message: 'hello', recipients: ['9876543210'] }, token, { 'Idempotency-Key': 'http-campaign-001' });
    assert.equal(campaign.status, 200); assert.equal(campaign.body.data.channel, 'sms');
    const listed = await post('campaign-list', {}, token); assert.equal(listed.body.data.total, 1);
    const wallet = await fetch(`${base}/wallet`, { headers: { Authorization: `Bearer ${token}` } });
    assert.equal(Number((await wallet.json() as any).data.reserved), 25);
    const viewer = await post('user', { email: 'viewer@test.com', name: 'Viewer', password: 'long-test-password', role: 'viewer' }, token);
    assert.equal(viewer.status, 200);
    const viewerLogin = await post('login', { email: 'viewer@test.com', password: 'long-test-password' });
    assert.equal((await post('send-sms', { message: 'hello', recipients: ['9876543211'] }, viewerLogin.body.data.access_token, { 'Idempotency-Key': 'viewer-attempt-001' })).status, 403);
    const invalid = await fetch(`${base}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' });
    assert.equal(invalid.status, 400);
    assert.equal((await post('administration/server-commands', {}, token)).status, 501);
    await post('logout', {}, token);
    assert.equal((await post('campaign-list', {}, token)).status, 401);
  } finally { await instance.shutdown(); await close(); }
});
