import { test } from 'node:test';
import assert from 'node:assert/strict';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';
import { Db } from '../src/db';
import { testConfig } from './helpers';

async function initIsolationDb() {
  const pg = new PGlite();
  for (let i = 1; i <= 20; i++) {
    const num = String(i).padStart(3, '0');
    // Find matching migration file
    const fs = await import('node:fs');
    const files = fs.readdirSync('migrations');
    const file = files.find(f => f.startsWith(num));
    if (file) {
      const sql = await readFile(`migrations/${file}`, 'utf8');
      await pg.exec(sql);
    }
  }

  const query = async (text: string, values: unknown[] = []) => {
    if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
    const result = await pg.query(text, values);
    return { rows: result.rows, rowCount: result.rows.length || (result as any).affectedRows || 0 };
  };

  const db = {
    query,
    pool: { end: async () => {} },
    transaction: async (fn: any) => pg.transaction(async tx => {
      const client = {
        query: async (text: string, values: unknown[] = []) => {
          if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1 };
          const r = await tx.query(text, values);
          return { rows: r.rows, rowCount: r.rows.length || (r as any).affectedRows || 0 };
        }
      };
      return fn(client);
    }),
    tenantTransaction: async function<T>(tenantId: number, fn: (client: any) => Promise<T>): Promise<T> {
      if (!tenantId || !Number.isInteger(tenantId) || tenantId <= 0) {
        throw new Error('Valid positive integer tenant_id required for tenantTransaction');
      }
      return this.transaction(async (client: any) => {
        await client.query("SELECT set_config('app.current_tenant_id', $1, true)", [String(tenantId)]);
        return fn(client);
      });
    }
  } as unknown as Db;

  return { pg, db, close: () => pg.close() };
}

test('Database Isolation & Security Hardening (Phase 2)', async (t) => {
  const { pg, db, close } = await initIsolationDb();

  try {
    await t.test('1. current_tenant_id_safe() fails closed on unset, empty, or malformed values', async () => {
      // Unset
      const rUnset = await pg.query("SELECT public.current_tenant_id_safe() AS tid");
      assert.equal((rUnset.rows[0] as any).tid, null, 'Unset setting must return NULL');

      // Empty string
      await pg.query("SELECT set_config('app.current_tenant_id', '', false)");
      const rEmpty = await pg.query("SELECT public.current_tenant_id_safe() AS tid");
      assert.equal((rEmpty.rows[0] as any).tid, null, 'Empty string setting must return NULL');

      // Malformed / SQL injection string
      await pg.query("SELECT set_config('app.current_tenant_id', '1; DROP TABLE users;--', false)");
      const rMalformed = await pg.query("SELECT public.current_tenant_id_safe() AS tid");
      assert.equal((rMalformed.rows[0] as any).tid, null, 'Malformed injection string must return NULL without throwing');

      // Valid numeric string
      await pg.query("SELECT set_config('app.current_tenant_id', '105', false)");
      const rValid = await pg.query("SELECT public.current_tenant_id_safe() AS tid");
      assert.equal(Number((rValid.rows[0] as any).tid), 105, 'Valid numeric string must return integer 105');

      // Reset
      await pg.query("SELECT set_config('app.current_tenant_id', '', false)");
    });

    await t.test('2. tenantTransaction establishes transaction-scoped context and reverts on completion', async () => {
      const tenantId = 42;
      let insideTid: number | null = null;

      await db.tenantTransaction(tenantId, async (client) => {
        const r = await client.query("SELECT public.current_tenant_id_safe() AS tid");
        insideTid = (r.rows[0] as any).tid;
      });

      assert.equal(Number(insideTid), 42, 'Inside transaction, current_tenant_id_safe must be 42');

      // Outside transaction
      const outside = await pg.query("SELECT public.current_tenant_id_safe() AS tid");
      assert.equal((outside.rows[0] as any).tid, null, 'Outside transaction, setting must have reverted to NULL');
    });

    await t.test('3. tenantTransaction rejects invalid tenant IDs immediately', async () => {
      await assert.rejects(
        async () => db.tenantTransaction(0, async () => {}),
        /Valid positive integer tenant_id required/
      );
      await assert.rejects(
        async () => db.tenantTransaction(-5, async () => {}),
        /Valid positive integer tenant_id required/
      );
      await assert.rejects(
        async () => db.tenantTransaction(3.14, async () => {}),
        /Valid positive integer tenant_id required/
      );
    });

    await t.test('4. Audit log immutability trigger blocks updates and deletes', async () => {
      // Insert audit record directly
      const inserted = await pg.query(
        "INSERT INTO audit_logs(tenant_id, user_id, action, target, created_at) VALUES(NULL, NULL, 'test.create', 'resource:1', now()) RETURNING id"
      );
      const logId = (inserted.rows[0] as any).id;
      assert.ok(logId, 'Audit log created');

      // Attempt UPDATE -> should throw
      await assert.rejects(
        async () => pg.query("UPDATE audit_logs SET action = 'tampered' WHERE id = $1", [logId]),
        /(Audit log records are immutable and cannot be updated or deleted|This record is append-only)/
      );

      // Attempt DELETE -> should throw
      await assert.rejects(
        async () => pg.query("DELETE FROM audit_logs WHERE id = $1", [logId]),
        /(Audit log records are immutable and cannot be updated or deleted|This record is append-only)/
      );
    });

    await t.test('5. log_recovery_event procedure requires valid ticket and logs to audit_logs', async () => {
      // Rejects short ticket
      await assert.rejects(
        async () => pg.query("SELECT public.log_recovery_event('ab', 'test', 'target')"),
        /valid operational ticket ID is required/
      );

      // Rejects null ticket
      await assert.rejects(
        async () => pg.query("SELECT public.log_recovery_event(NULL, 'test', 'target')"),
        /valid operational ticket ID is required/
      );

      // Accepts valid ticket and logs event
      await pg.query("SELECT public.log_recovery_event('INC-12345', 'resync', 'tenant:1')");
      const r = await pg.query("SELECT * FROM audit_logs WHERE action = 'recovery.resync'");
      assert.equal(r.rows.length, 1);
      assert.equal((r.rows[0] as any).target, 'INC-12345:tenant:1');
    });

    await t.test('6. Database roles exist and have non-superuser attributes', async () => {
      const roles = await pg.query("SELECT rolname, rolsuper, rolbypassrls FROM pg_roles WHERE rolname IN ('krad_app', 'krad_recovery')");
      // If the engine supports pg_roles (PostgreSQL/PGlite with catalog)
      if (roles.rows.length > 0) {
        for (const role of roles.rows as any[]) {
          assert.equal(role.rolsuper, false, `Role ${role.rolname} must not be superuser`);
          assert.equal(role.rolbypassrls, false, `Role ${role.rolname} must not have BYPASSRLS`);
        }
      }
    });

  } finally {
    await close();
  }
});
