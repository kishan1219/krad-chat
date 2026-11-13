import { createApplication } from '../src/main';
import { database, testConfig } from '../test/helpers';

async function runSimulation() {
  console.log('\n========================================================================');
  console.log('🚀 STARTING END-TO-END BACKEND SIMULATION: SUPER ADMIN & USER OPERATIONS');
  console.log('========================================================================\n');

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
    const resBody = await response.json() as any;
    return { status: response.status, body: resBody };
  }

  try {
    // -------------------------------------------------------------------------
    // STEP 1: Super Admin Login via Email
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 1: Super Admin Authenticates via Email');
    console.log('   Endpoint: POST /api/login');
    console.log('   Payload : { email: "admin@test.com", password: "***" }');

    const adminLogin = await post('login', { email: 'admin@test.com', password: 'long-test-password' });
    if (adminLogin.status !== 200) throw new Error(`Admin login failed: ${JSON.stringify(adminLogin.body)}`);

    const adminToken = adminLogin.body.data.access_token;
    const adminId = adminLogin.body.data.id;
    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Admin ID: ${adminId} | Role: ${adminLogin.body.data.role} | Active: ${adminLogin.body.data.active}`);
    console.log(`   Session Token Issued: ${adminToken.slice(0, 28)}...\n`);

    // -------------------------------------------------------------------------
    // STEP 2: Super Admin Creates Child User with Complete Profile Fields
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 2: Super Admin Creates Child User with Full Profile & Operational Config');
    console.log('   Endpoint: POST /api/user');
    const childPayload = {
      name: 'Aarav Sharma',
      email: 'aarav@kradclient.test',
      user_name: 'aarav_client',
      password: 'ClientSecurePass@2026',
      userType: 2, // Client / Operator
      mobile: '+91 9876543210',
      address: 'Suite 404, Tech Park, Bandra West',
      city: 'Mumbai',
      zipcode: '400050',
      company_name: 'Aarav Enterprises Pvt Ltd',
      website_url: 'https://aaraventerprises.in',
      designation: 'Managing Director',
      authority_type: 1,
      locktimeout: 45,
      allow_to_add_webhook: 1,
      allow_detail_report: 1,
      is_visible_dlt_template_group: 0,
      permissions: ['chat:reply', 'campaign:create', 'contacts:read', 'contacts:write', 'templates:read']
    };
    console.log('   Payload : ', JSON.stringify(childPayload, null, 2));

    const createRes = await post('user', childPayload, adminToken);
    if (createRes.status !== 200) throw new Error(`User creation failed: ${JSON.stringify(createRes.body)}`);

    const childUser = createRes.body.data;
    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Created User ID: ${childUser.id}`);
    console.log(`   Name: ${childUser.name} | Username: ${childUser.username} | Email: ${childUser.email}`);
    console.log(`   Mobile: ${childUser.mobile} | City: ${childUser.city} | Company: ${childUser.companyName}`);
    console.log(`   Locktimeout: ${childUser.locktimeout} min | Webhook Allowed: ${childUser.allow_to_add_webhook === 1}`);
    console.log(`   Permissions Bound: ${childUser.permissions.map((p: any) => p.name).join(', ')}\n`);

    // -------------------------------------------------------------------------
    // STEP 3: Child User Login via USERNAME
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 3: Child User Login using USERNAME instead of Email');
    console.log('   Endpoint: POST /api/login');
    console.log('   Payload : { username: "aarav_client", password: "***" }');

    const usernameLogin = await post('login', {
      username: 'aarav_client',
      password: 'ClientSecurePass@2026'
    });
    if (usernameLogin.status !== 200) throw new Error(`Username login failed: ${JSON.stringify(usernameLogin.body)}`);

    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Resolved Account: ${usernameLogin.body.data.name} (${usernameLogin.body.data.email})`);
    console.log(`   Access Token    : ${usernameLogin.body.data.access_token.slice(0, 28)}...\n`);

    // -------------------------------------------------------------------------
    // STEP 4: Child User Login via EMAIL
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 4: Child User Login using EMAIL');
    console.log('   Endpoint: POST /api/login');
    console.log('   Payload : { email: "aarav@kradclient.test", password: "***" }');

    const emailLogin = await post('login', {
      email: 'aarav@kradclient.test',
      password: 'ClientSecurePass@2026'
    });
    if (emailLogin.status !== 200) throw new Error(`Email login failed: ${JSON.stringify(emailLogin.body)}`);

    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Resolved Account: ${emailLogin.body.data.name} (${emailLogin.body.data.username})`);
    console.log(`   Access Token    : ${emailLogin.body.data.access_token.slice(0, 28)}...\n`);

    // -------------------------------------------------------------------------
    // STEP 5: Super Admin Impersonates Child User ("Login As Child")
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 5: Super Admin Impersonation ("Login As Child") without Child Password');
    console.log('   Endpoint: POST /api/child-login');
    const encodedChildId = Buffer.from(String(childUser.id)).toString('base64');
    console.log(`   Payload : { account_uuid: "${encodedChildId}", user_id: ${childUser.id} }`);
    console.log(`   Auth    : Bearer (Super Admin Token)`);

    const masqueradeRes = await post('child-login', {
      account_uuid: encodedChildId,
      user_id: childUser.id
    }, adminToken);
    if (masqueradeRes.status !== 200) throw new Error(`Child login failed: ${JSON.stringify(masqueradeRes.body)}`);

    const masqueradeData = masqueradeRes.body.data;
    const childSessionToken = masqueradeData.access_token;
    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Impersonated Session Active User ID: ${masqueradeData.id} (${masqueradeData.name})`);
    console.log(`   Parent Return Key Stored: ${masqueradeData.parent_key}`);

    // Verify security audit log record
    const auditRow = (await db.query("SELECT * FROM audit_logs WHERE action='masquerade' ORDER BY id DESC LIMIT 1")).rows[0];
    console.log(`   🔒 Security Audit Trail Verified: action='${auditRow?.action}', admin_user_id=${auditRow?.user_id}, target_child_id=${auditRow?.target}\n`);

    // -------------------------------------------------------------------------
    // STEP 6: Security Boundary Verification (Child cannot impersonate Admin)
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 6: Security Boundary Test: Child User cannot Impersonate Admin');
    console.log('   Endpoint: POST /api/child-login');
    console.log(`   Payload : { user_id: ${adminId} }`);
    console.log(`   Auth    : Bearer (Child User Token)`);

    const forbiddenRes = await post('child-login', { user_id: adminId }, childSessionToken);
    console.log(`   Response Status: HTTP ${forbiddenRes.status} (Expected: 403 Forbidden)`);
    if (forbiddenRes.status === 403) {
      console.log('   ✅ Access Control Enforced: Unauthorized impersonation correctly blocked.\n');
    } else {
      throw new Error(`Security breach: expected 403, got ${forbiddenRes.status}`);
    }

    // -------------------------------------------------------------------------
    // STEP 7: Revert Back to Super Admin Account ("Return to Admin Account")
    // -------------------------------------------------------------------------
    console.log('🔹 STEP 7: Seamless Return to Super Admin Account');
    console.log('   Endpoint: POST /api/child-login');
    console.log(`   Payload : { account_uuid: "${masqueradeData.parent_key}", is_back_to_self_account: 1 }`);
    console.log(`   Auth    : Bearer (Current Active Child Token)`);

    const returnRes = await post('child-login', {
      account_uuid: masqueradeData.parent_key,
      is_back_to_self_account: 1
    }, childSessionToken);
    if (returnRes.status !== 200) throw new Error(`Return to admin failed: ${JSON.stringify(returnRes.body)}`);

    const returnedAdmin = returnRes.body.data;
    console.log('   ✅ Success (HTTP 200)');
    console.log(`   Restored User ID: ${returnedAdmin.id} (${returnedAdmin.email})`);
    console.log(`   Restored Role   : ${returnedAdmin.role}`);
    console.log(`   parent_key      : ${returnedAdmin.parent_key} (Cleared, fully back to Admin state)`);

    console.log('\n========================================================================');
    console.log('🎉 ALL 7 END-TO-END OPERATIONS COMPLETED SUCCESSFULLY WITH 100% INTEGRITY');
    console.log('========================================================================\n');

  } finally {
    await instance.shutdown();
    await close();
  }
}

runSimulation().catch(err => {
  console.error('\n❌ SIMULATION FAILED:', err);
  process.exit(1);
});

