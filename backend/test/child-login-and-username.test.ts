import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createApplication } from '../src/main';
import { database, testConfig } from './helpers';

test('User Profile, Username Login, and Child Account Masquerade Flow (HTTP)', async () => {
  const { db, close } = await database();
  const instance = await createApplication({ config: testConfig, db });
  await instance.app.listen(0, '127.0.0.1');
  const port = (instance.app.getHttpServer().address() as any).port;
  const base = `http://127.0.0.1:${port}/api`;

  async function post(path: string, body: any, token?: string, headers: any = {}) {
    const response = await fetch(`${base}/${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers
      },
      body: JSON.stringify(body)
    });
    return { status: response.status, body: await response.json() as any };
  }

  try {
    // 1. Initial Admin login using email
    const adminLogin = await post('login', { email: 'admin@test.com', password: 'long-test-password' });
    assert.equal(adminLogin.status, 200);
    assert.equal(adminLogin.body.data.email, 'admin@test.com');
    const adminToken = adminLogin.body.data.access_token;
    const adminId = adminLogin.body.data.id;
    assert.ok(adminToken);

    // 2. Admin creates a child user with rich profile fields and a custom username
    const createRes = await post('user', {
      name: 'Kishan Client',
      email: 'client@company.test',
      user_name: 'kishan_client',
      password: 'client-secure-password',
      userType: 2, // Client
      mobile: '+919876543210',
      address: '101 Business Hub, Tech Park',
      city: 'Mumbai',
      zipcode: '400051',
      company_name: 'Kishan Enterprises',
      website_url: 'https://kishan.example.com',
      designation: 'Managing Director',
      authority_type: 1,
      locktimeout: 45,
      allow_to_add_webhook: 1,
      allow_detail_report: 1,
      is_visible_dlt_template_group: 1,
      permissions: ['chat:reply', 'contacts:read', 'contacts:write', 'templates:read']
    }, adminToken);

    assert.equal(createRes.status, 200);
    const childUser = createRes.body.data;
    assert.equal(childUser.name, 'Kishan Client');
    assert.equal(childUser.email, 'client@company.test');
    assert.equal(childUser.username, 'kishan_client');
    assert.equal(childUser.mobile, '+919876543210');
    assert.equal(childUser.address, '101 Business Hub, Tech Park');
    assert.equal(childUser.city, 'Mumbai');
    assert.equal(childUser.zipcode, '400051');
    assert.equal(childUser.companyName, 'Kishan Enterprises');
    assert.equal(childUser.locktimeout, 45);

    // 3. Child user can login using USERNAME instead of email
    const loginByUsername = await post('login', {
      username: 'kishan_client',
      password: 'client-secure-password'
    });
    assert.equal(loginByUsername.status, 200);
    assert.equal(loginByUsername.body.data.email, 'client@company.test');
    assert.equal(loginByUsername.body.data.username, 'kishan_client');
    assert.ok(loginByUsername.body.data.access_token);

    // 4. Child user can also login using EMAIL
    const loginByEmail = await post('login', {
      email: 'client@company.test',
      password: 'client-secure-password'
    });
    assert.equal(loginByEmail.status, 200);
    assert.equal(loginByEmail.body.data.email, 'client@company.test');
    assert.ok(loginByEmail.body.data.access_token);

    // 5. Admin switches into Child Account (Child Login / Masquerade)
    const encodedChildId = Buffer.from(String(childUser.id)).toString('base64');
    const masqueradeRes = await post('child-login', {
      account_uuid: encodedChildId,
      user_id: childUser.id
    }, adminToken);

    assert.equal(masqueradeRes.status, 200);
    assert.equal(masqueradeRes.body.data.id, childUser.id);
    assert.equal(masqueradeRes.body.data.email, 'client@company.test');
    assert.ok(masqueradeRes.body.data.access_token);
    assert.ok(masqueradeRes.body.data.parent_key); // parent_key points to admin
    const childToken = masqueradeRes.body.data.access_token;

    // 6. Child user cannot masquerade into other accounts (403 Forbidden)
    const forbiddenRes = await post('child-login', { user_id: adminId }, childToken);
    assert.equal(forbiddenRes.status, 403);

    // 7. Child returns back to Admin account ("Back to Super Admin")
    const returnToAdminRes = await post('child-login', {
      account_uuid: masqueradeRes.body.data.parent_key,
      is_back_to_self_account: 1
    }, childToken);

    assert.equal(returnToAdminRes.status, 200);
    assert.equal(returnToAdminRes.body.data.id, adminId);
    assert.equal(returnToAdminRes.body.data.email, 'admin@test.com');
    assert.equal(returnToAdminRes.body.data.parent_key, null);
  } finally {
    await instance.shutdown();
    await close();
  }
});
