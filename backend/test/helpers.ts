import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { Db } from '../src/db';
import { Actor } from '../src/auth';
import { Config } from '../src/config';
import { hash } from 'bcryptjs';

export const testConfig: Config = { NODE_ENV: 'test', PORT: 4000, DATABASE_URL: 'unused', DATABASE_SSL: false,
  JWT_SECRET: 'test-only-secret-at-least-48-characters-long-do-not-deploy', ENCRYPTION_KEY: '12'.repeat(32), PROVIDER_MODE: 'mock',
  CORS_ORIGINS: 'http://localhost:3000', PUBLIC_API_URL: 'http://localhost:4000', ALLOW_SIGNUP: true, WORKER_ENABLED: false,
  MOCK_DELIVERY: true, SMS_UNIT_PRICE_PAISE: 25, WHATSAPP_UNIT_PRICE_PAISE: 100, VOICE_UNIT_PRICE_PAISE: 200 };
export async function database() {
  const pg = new PGlite();
  await pg.exec(await readFile('migrations/001_initial.sql', 'utf8'));
  await pg.exec(await readFile('migrations/002_user_wallets.sql', 'utf8'));
  await pg.exec(await readFile('migrations/003_api_keys_and_notifications.sql', 'utf8'));
  await pg.exec(await readFile('migrations/004_whatsapp_commerce.sql', 'utf8'));
  await pg.exec(await readFile('migrations/005_shopping_bot.sql', 'utf8'));
  await pg.exec(await readFile('migrations/006_invitations.sql', 'utf8'));
  await pg.exec(await readFile('migrations/007_immutable_records.sql', 'utf8'));
  await pg.exec(await readFile('migrations/008_webhook_inbox.sql', 'utf8'));
  await pg.exec(await readFile('migrations/009_workflows.sql', 'utf8'));
  await pg.exec(await readFile('migrations/010_meta_connections.sql', 'utf8'));
  await pg.exec(await readFile('migrations/011_inbox_controls.sql', 'utf8'));
  await pg.exec(await readFile('migrations/012_meta_onboarding.sql', 'utf8'));
  await pg.exec(await readFile('migrations/013_broadcast_controls.sql', 'utf8'));
  await pg.exec(await readFile('migrations/014_commerce_options.sql', 'utf8'));
  await pg.exec(await readFile('migrations/015_workflow_contact_trigger.sql', 'utf8'));
  await pg.exec(await readFile('migrations/016_feature_flags.sql', 'utf8'));
  await pg.exec(await readFile('migrations/017_organization_lifecycle.sql', 'utf8'));
  await pg.exec(await readFile('migrations/018_plans_whitelabel_and_hierarchical_billing.sql', 'utf8'));
  await pg.exec(await readFile('migrations/019_security_hardening_rls_and_indexes.sql', 'utf8'));
  const query = async (text: string, values: unknown[] = []) => {
    if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await pg.query(text, values);
    return { rows: result.rows, rowCount: result.rows.length || result.affectedRows || 0 };
  };
  // PGlite executes real PostgreSQL queries. Advisory locking/concurrent connections are not modeled here.
  const db = { query, pool: { end: async () => {} }, transaction: async (fn: any) => pg.transaction(async tx => {
    const client = { query: async (text: string, values: unknown[] = []) => {
      if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
      const r = await tx.query(text, values); return { rows: r.rows, rowCount: r.rows.length || r.affectedRows || 0 };
    } };
    return fn(client);
  }) } as unknown as Db;
  const tenant = (await db.query("INSERT INTO tenants(name) VALUES('Test') RETURNING id")).rows[0];
  const user = (await db.query("INSERT INTO users(tenant_id,email,name,password_hash,role) VALUES($1,'admin@test.com','Admin',$2,'admin') RETURNING id", [tenant.id, await hash('long-test-password', 12)])).rows[0];
  await db.query('INSERT INTO wallets(tenant_id,user_id,balance) VALUES($1,$2,10000)', [tenant.id, user.id]);
  const actor: Actor = { id: Number(user.id), tenant_id: Number(tenant.id), role: 'admin', permissions: [], session_id: '' };
  return { db, actor, close: () => pg.close() };
}
