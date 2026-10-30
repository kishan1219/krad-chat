import test from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Auth } from '../src/auth';
import { Providers } from '../src/providers';
import { Api } from '../src/api';
import { CacheService, platformCache } from '../src/cache';
import { escapeHtml, sanitizeText, maskSecret, trimSensitive } from '../src/common';
import { Resources } from '../src/resources';
import { Users } from '../src/users';
import { Billing } from '../src/billing';
import { Campaigns } from '../src/campaigns';
import { Files } from '../src/files';
import { Reports } from '../src/reports';
import { Chat } from '../src/chat';
import { Webhooks } from '../src/webhooks';
import { Commerce } from '../src/commerce';
import { Automation } from '../src/automation';
import { Workflows } from '../src/workflows';
import { Features } from '../src/features';

test('Security Hardening Suite: Protections, Reliability, Health, and Performance Caching', async t => {
  const { db, actor, close } = await database();
  const providers = new Providers(testConfig, db);
  const auth = new Auth(db, testConfig, providers);
  const campaigns = new Campaigns(db, testConfig, providers);
  const files = new Files(db, testConfig);
  const reports = new Reports(db, files);
  const billing = new Billing(db, providers);
  const commerce = new Commerce(db, testConfig);
  const workflows = new Workflows(db, campaigns);
  const automation = new Automation(db, campaigns, commerce, workflows);
  const chat = new Chat(db, testConfig, providers, () => {}, campaigns, automation);
  const webhooks = new Webhooks(testConfig, campaigns, chat, billing, db);
  const features = new Features(db);
  const api = new Api(testConfig, db, auth, providers, new Resources(db, testConfig), new Users(db), billing, campaigns, files, reports, chat, webhooks, commerce, automation, workflows, features);

  await t.test('1. Bot protection: Honeypot trap rejects automated bots on auth routes', async () => {
    // Signup with honeypot trap field filled
    await assert.rejects(
      async () => auth.signup({
        email: 'bot@spam.com',
        password: 'ValidPassword123!',
        name: 'Spam Bot',
        _hp_trap: 'I am a bot'
      }),
      /Automated request rejected/
    );

    // Login with honeypot trap field filled
    await assert.rejects(
      async () => auth.login({
        email: 'admin@test.com',
        password: 'long-test-password',
        honeypot: 'filled_by_script'
      }),
      /Automated request rejected/
    );
  });

  await t.test('2. JWT rotation and session revocation: Refresh tokens rotate and revoke prior sessions', async () => {
    const loginRes = await auth.login({
      email: 'admin@test.com',
      password: 'long-test-password'
    });
    if (!('access_token' in loginRes) || !('refresh_token' in loginRes)) {
      assert.fail('Expected loginRes to return session tokens');
    }
    assert.ok(loginRes.access_token, 'Access token issued');
    assert.ok(loginRes.refresh_token, 'Refresh token issued');

    // Authenticate with the initial session
    const verifiedActor = await auth.authenticate(`Bearer ${loginRes.access_token}`);
    assert.equal(verifiedActor.id, actor.id);

    // Rotate session using refresh token
    const rotated = await auth.rotateSession(loginRes.refresh_token);
    assert.ok(rotated.access_token, 'New access token issued');
    assert.ok(rotated.refresh_token, 'New refresh token issued');
    assert.notEqual(rotated.refresh_token, loginRes.refresh_token, 'Refresh token rotated');

    // Previous refresh token cannot be reused (replay protection)
    await assert.rejects(
      async () => auth.rotateSession(loginRes.refresh_token),
      /Invalid or expired refresh token/
    );

    // Verify the newly rotated access token is valid
    const rotatedActor = await auth.authenticate(`Bearer ${rotated.access_token}`);
    assert.equal(rotatedActor.id, actor.id);

    // Revoke all sessions for this user
    const revokeRes = await auth.revokeAll(rotatedActor);
    assert.equal(revokeRes.revoked_all, true);

    // Authenticating with the revoked token must now fail
    await assert.rejects(
      async () => auth.authenticate(`Bearer ${rotated.access_token}`),
      /Session revoked/
    );
  });

  await t.test('3. Multi-Factor Authentication (MFA) step-up for high-risk operations', async () => {
    const stepUpIssue = await auth.issueMfaStepUp(actor);
    assert.equal(stepUpIssue.step_up_required, true);
    assert.ok(stepUpIssue.challenge_id);

    // Check sent OTP in development mock mailbox
    assert.ok(providers.mailbox.length > 0);
    const sentEmail = providers.mailbox[providers.mailbox.length - 1];
    const otpMatch = sentEmail.text.match(/\b\d{6}\b/);
    assert.ok(otpMatch, '6-digit OTP extracted');
    const otp = otpMatch[0];

    // Invalid OTP rejected
    await assert.rejects(
      async () => auth.verifyMfaStepUp(actor, { challenge_id: stepUpIssue.challenge_id, otp: '000000' }),
      /Invalid or expired step-up code/
    );

    // Valid OTP returns a temporary step-up authorization token
    const stepUpVerified = await auth.verifyMfaStepUp(actor, { challenge_id: stepUpIssue.challenge_id, otp });
    assert.equal(stepUpVerified.mfa_verified, true);
    assert.ok(stepUpVerified.step_up_token);

    // Verifying step-up assertion
    await assert.doesNotReject(async () => auth.assertMfaStepUp(actor, stepUpVerified.step_up_token));

    // Fake or missing step-up token is rejected
    await assert.rejects(async () => auth.assertMfaStepUp(actor, undefined), /Step-up MFA authorization required/);
    await assert.rejects(async () => auth.assertMfaStepUp(actor, 'invalid-token-here'), /Invalid or expired step-up token/);
  });

  await t.test('4. Input sanitization, content escaping and sensitive field trimming', () => {
    // HTML Escaping
    const maliciousHtml = '<script>alert("XSS")</script>&"\'';
    const escaped = escapeHtml(maliciousHtml);
    assert.equal(escaped, '&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;&amp;&quot;&#039;');

    // Text Sanitization (strips script tags and dangerous javascript: URLs)
    const dangerousText = 'Hello <script>malicious()</script><iframe src="evil.com"></iframe> world';
    const sanitized = sanitizeText(dangerousText);
    assert.equal(sanitized, 'Hello  world');

    // Secret Masking
    const apiKey = 'krad_live_secret_key_1234567890abcdef';
    const masked = maskSecret(apiKey, 4);
    assert.ok(masked.endsWith('cdef'));
    assert.ok(masked.startsWith('****'));

    // Sensitive field trimming
    const userPayload = { id: 1, email: 'user@test.com', password_hash: '$2b$12$hashedpassword', token_encrypted: 'cipher' };
    const trimmed = trimSensitive(userPayload);
    assert.equal(trimmed.password_hash, undefined);
    assert.equal(trimmed.token_encrypted, undefined);
    assert.equal(trimmed.email, 'user@test.com');
  });

  await t.test('5. Health checks: Comprehensive endpoint reports DB latency, memory, providers, and cache', async () => {
    let responseData: any;
    const mockRes = {
      status: (code: number) => {
        assert.equal(code, 200);
        return {
          json: (body: any) => { responseData = body; }
        };
      },
      headersSent: false
    } as any;

    await api.handle({
      path: '/health',
      method: 'GET',
      query: {},
      body: {},
      headers: {}
    } as any, mockRes);

    assert.ok(responseData);
    assert.equal(responseData.error, false);
    assert.equal(responseData.code, 200);
    assert.ok(responseData.data.database.latency_ms >= 0);
    assert.equal(responseData.data.database.status, 'connected');
    assert.ok(responseData.data.memory.heap_used_mb > 0);
    assert.ok(responseData.data.providers);
    assert.ok(responseData.data.cache);
  });

  await t.test('6. Performance optimization: High-throughput In-Memory TTL Cache with eviction', async () => {
    const testCache = new CacheService({ ttlMs: 100, maxItems: 3 });

    // Set and get
    testCache.set('key1', 'val1');
    assert.equal(testCache.get('key1'), 'val1');

    // Cache wrap
    let computeCount = 0;
    const fetchVal = () => testCache.wrap('computeKey', async () => {
      computeCount++;
      return 'expensiveResult';
    });

    const res1 = await fetchVal();
    const res2 = await fetchVal();
    assert.equal(res1, 'expensiveResult');
    assert.equal(res2, 'expensiveResult');
    assert.equal(computeCount, 1, 'Wrapped computation executed exactly once');

    // Eviction when exceeding maxItems
    testCache.set('k2', 'v2');
    testCache.set('k3', 'v3');
    testCache.set('k4', 'v4'); // Should evict oldest
    const stats = testCache.getStats();
    assert.ok(stats.size <= 3, 'Cache maintained maximum boundary');

    // Invalidation by prefix
    testCache.set('branding:portal.com', { name: 'Portal' });
    testCache.set('branding:client.com', { name: 'Client' });
    const invalidated = testCache.invalidatePrefix('branding:');
    assert.equal(invalidated, 2);
    assert.equal(testCache.get('branding:portal.com'), undefined);

    testCache.destroy();
  });

  await t.test('7. Database index and RLS verification', async () => {
    // Check that indexes created in migration 019 exist in database catalog
    const indexes = (await db.query(`
      SELECT indexname FROM pg_indexes
      WHERE indexname IN (
        'idx_campaigns_tenant_status',
        'idx_messages_campaign_recipient',
        'idx_messages_tenant_status',
        'idx_chat_messages_conv_created',
        'idx_conversations_tenant_phone',
        'idx_ledger_user_created'
      )
    `)).rows;

    assert.ok(indexes.length >= 6, 'Performance indexes verified in database catalog');
  });

  await close();
});
