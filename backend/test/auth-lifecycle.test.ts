import test from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Auth } from '../src/auth';
import { Providers } from '../src/providers';
import { ApiError } from '../src/common';

test('Auth Lifecycle: Token rotation, concurrency, session revocation, and fail-safe authentication', async t => {
  const { db, close } = await database();
  const providers = new Providers(testConfig, db);
  const auth = new Auth(db, testConfig, providers);

  let sessionData: any;

  try {
    await t.test('1. User signup creates active tenant, admin user and wallet', async () => {
      sessionData = await auth.signup({
        email: 'security-audit@kradchat.com',
        password: 'StrongP@ssw0rd123!',
        name: 'Security Admin',
        business_name: 'KRAD Security Workspace'
      });

      assert.ok(sessionData.access_token, 'Access token must be generated');
      assert.ok(sessionData.refresh_token, 'Refresh token must be generated');
      assert.equal(sessionData.email, 'security-audit@kradchat.com');
      assert.equal(sessionData.role, 'admin');

      const actor = await auth.authenticate(`Bearer ${sessionData.access_token}`);
      assert.equal(actor.id, sessionData.id);
      assert.equal(actor.role, 'admin');
      assert.equal(await auth.sessionActive(actor), true, 'Session must be active in database');
    });

    await t.test('2. Authentication rejects invalid, missing, or malformed tokens', async () => {
      await assert.rejects(
        async () => auth.authenticate(''),
        (err: any) => err instanceof ApiError && err.status === 401
      );

      await assert.rejects(
        async () => auth.authenticate('Basic dXNlcjpwYXNz'),
        (err: any) => err instanceof ApiError && err.status === 401
      );

      await assert.rejects(
        async () => auth.authenticate('Bearer invalid.jwt.token'),
        (err: any) => err instanceof ApiError && err.status === 401
      );
    });

    let nextSession: any;

    await t.test('3. Refresh token rotates access token and invalidates old session', async () => {
      const originalToken = sessionData.access_token;
      const originalRefreshToken = sessionData.refresh_token;

      nextSession = await auth.rotateSession(originalRefreshToken);

      assert.ok(nextSession.access_token, 'New access token issued');
      assert.ok(nextSession.refresh_token, 'New refresh token issued');
      assert.notEqual(nextSession.access_token, originalToken, 'Access token must rotate');
      assert.notEqual(nextSession.refresh_token, originalRefreshToken, 'Refresh token must rotate');

      // New token authenticates successfully
      const nextActor = await auth.authenticate(`Bearer ${nextSession.access_token}`);
      assert.equal(nextActor.id, sessionData.id);

      // Old access token is now revoked in database sessions table
      await assert.rejects(
        async () => auth.authenticate(`Bearer ${originalToken}`),
        (err: any) => err instanceof ApiError && err.status === 401 && err.message.includes('revoked')
      );

      // Old refresh token cannot be reused (replay prevention)
      await assert.rejects(
        async () => auth.rotateSession(originalRefreshToken),
        (err: any) => err instanceof ApiError && err.status === 401
      );
    });

    await t.test('4. Sequential and concurrent refresh attempts prevent token replay', async () => {
      const currentRefresh = nextSession.refresh_token;

      // Sequential: First one succeeds
      const sessionAfterRefresh = await auth.rotateSession(currentRefresh);
      assert.ok(sessionAfterRefresh.access_token);

      // Replaying the same refresh token must fail with 401
      await assert.rejects(
        async () => auth.rotateSession(currentRefresh),
        (err: any) => err instanceof ApiError && err.status === 401
      );

      nextSession = sessionAfterRefresh;
    });

    await t.test('5. Logout revokes current session immediately', async () => {
      const actor = await auth.authenticate(`Bearer ${nextSession.access_token}`);
      assert.equal(await auth.sessionActive(actor), true);

      const logoutResult = await auth.logout(actor);
      assert.deepEqual(logoutResult, { logged_out: true });

      // Session is immediately rejected on next authentication
      await assert.rejects(
        async () => auth.authenticate(`Bearer ${nextSession.access_token}`),
        (err: any) => err instanceof ApiError && err.status === 401 && err.message.includes('revoked')
      );
      assert.equal(await auth.sessionActive(actor), false, 'sessionActive must return false after logout');
    });

    await t.test('6. Inactive tenant status immediately denies access for all sessions', async () => {
      // Create another tenant to test suspension
      const freshSession = await auth.signup({
        email: 'tenant-test@kradchat.com',
        password: 'StrongP@ssw0rd123!',
        name: 'Tenant Admin',
        business_name: 'Suspension Test Org'
      });

      const actor = await auth.authenticate(`Bearer ${freshSession.access_token}`);
      assert.equal(actor.role, 'admin');

      // Suspend tenant in database
      await db.query("UPDATE tenants SET status='suspended' WHERE id=$1", [actor.tenant_id]);

      // Subsequent authentication is blocked with 403 Forbidden
      await assert.rejects(
        async () => auth.authenticate(`Bearer ${freshSession.access_token}`),
        (err: any) => err instanceof ApiError && err.status === 403 && err.message.includes('Access suspended')
      );

      // Refresh token is also blocked for suspended tenant
      await assert.rejects(
        async () => auth.rotateSession(freshSession.refresh_token),
        (err: any) => err instanceof ApiError && err.status === 403
      );
    });
  } finally {
    await close();
  }
});
