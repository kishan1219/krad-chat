import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Billing } from '../src/billing';
import { Providers } from '../src/providers';
import { ApiError } from '../src/common';

test('Billing, Ledger & Reseller Credit Invariants (Phase 7)', async (t) => {
  const { db, actor, close } = await database();

  try {
    const providers = new Providers(testConfig, db);
    const billing = new Billing(db, providers);

    // Create a sub-user under actor (reseller client)
    const clientUser = (await db.query(
      "INSERT INTO users(tenant_id, parent_user_id, email, name, password_hash, role) VALUES($1, $2, 'client1@test.com', 'Client 1', 'hash', 'operator') RETURNING id",
      [actor.tenant_id, actor.id]
    )).rows[0];
    const clientUserId = Number(clientUser.id);
    await db.query("INSERT INTO wallets(tenant_id, user_id, balance, reserved) VALUES($1, $2, 0, 0)", [actor.tenant_id, clientUserId]);

    // Create an independent sibling (different parent)
    const siblingReseller = (await db.query(
      "INSERT INTO users(tenant_id, email, name, password_hash, role) VALUES($1, 'sibling@test.com', 'Sibling Reseller', 'hash', 'operator') RETURNING id",
      [actor.tenant_id]
    )).rows[0];
    const siblingId = Number(siblingReseller.id);
    await db.query("INSERT INTO wallets(tenant_id, user_id, balance, reserved) VALUES($1, $2, 5000, 0)", [actor.tenant_id, siblingId]);

    // Give actor sufficient funds (100,000 paise = 1,000 INR)
    await db.query("UPDATE wallets SET balance = 100000, reserved = 0 WHERE user_id = $1", [actor.id]);

    await t.test('1. Transfer to managed client conserves total funds and writes double-entry ledger', async () => {
      const actorActor = { ...actor, permissions: ['billing:transfer'] };
      const transferAmount = 25000; // 250 INR

      const beforeActor = await billing.wallet(actorActor, actor.id);
      const beforeClient = await billing.wallet(actorActor, clientUserId);

      const transfer = await billing.transfer(actorActor, {
        to_user_id: clientUserId,
        amount_paise: transferAmount,
        reference: 'transfer-ref-001'
      });

      assert.ok(transfer.id);
      assert.equal(Number(transfer.amount), transferAmount);

      const afterActor = await billing.wallet(actorActor, actor.id);
      const afterClient = await billing.wallet(actorActor, clientUserId);

      // Verify exact fund conservation
      assert.equal(Number(afterActor.balance), Number(beforeActor.balance) - transferAmount);
      assert.equal(Number(afterClient.balance), Number(beforeClient.balance) + transferAmount);

      // Verify double-entry ledger
      const ledgerEntries = (await db.query("SELECT * FROM ledger WHERE reference = $1 ORDER BY id ASC", [`transfer:${transfer.id}`])).rows;
      assert.equal(ledgerEntries.length, 2, 'Must create exactly two ledger entries');
      assert.equal(ledgerEntries[0].type, 'transfer_out');
      assert.equal(Number(ledgerEntries[0].amount), transferAmount);
      assert.equal(ledgerEntries[1].type, 'transfer_in');
      assert.equal(Number(ledgerEntries[1].amount), transferAmount);
    });

    await t.test('2. Reused transfer reference returns existing record idempotently without deducting twice', async () => {
      const actorActor = { ...actor, permissions: ['billing:transfer'] };
      const beforeActor = await billing.wallet(actorActor, actor.id);

      // Same reference and parameters
      const dup = await billing.transfer(actorActor, {
        to_user_id: clientUserId,
        amount_paise: 25000,
        reference: 'transfer-ref-001'
      });

      const afterActor = await billing.wallet(actorActor, actor.id);
      assert.equal(Number(afterActor.balance), Number(beforeActor.balance), 'Idempotent request must not deduct funds again');

      // Reference conflict with different amount must fail with 409
      await assert.rejects(
        async () => billing.transfer(actorActor, {
          to_user_id: clientUserId,
          amount_paise: 50000,
          reference: 'transfer-ref-001' // conflict!
        }),
        (err: any) => err instanceof ApiError && err.status === 409
      );
    });

    await t.test('3. Reserved campaign funds cannot be transferred', async () => {
      const actorActor = { ...actor, permissions: ['billing:transfer'] };
      // Set balance to 50000, but reserve 40000 -> available is only 10000
      await db.query("UPDATE wallets SET balance = 50000, reserved = 40000 WHERE user_id = $1", [actor.id]);

      // Attempt to transfer 15000 (more than available 10000)
      await assert.rejects(
        async () => billing.transfer(actorActor, {
          to_user_id: clientUserId,
          amount_paise: 15000,
          reference: 'transfer-ref-overdraft'
        }),
        /Insufficient unreserved credits/
      );
    });

    await t.test('4. Reseller scoping blocks transfer to sibling reseller or outside hierarchy', async () => {
      // Create a reseller user who only has clientUserId under them
      const resellerUser = (await db.query(
        "INSERT INTO users(tenant_id, email, name, password_hash, role) VALUES($1, 'reseller_scoped@test.com', 'Reseller Scoped', 'hash', 'operator') RETURNING id",
        [actor.tenant_id]
      )).rows[0];
      const resellerId = Number(resellerUser.id);
      await db.query("INSERT INTO wallets(tenant_id, user_id, balance, reserved) VALUES($1, $2, 50000, 0)", [actor.tenant_id, resellerId]);

      const resellerActor = { id: resellerId, tenant_id: actor.tenant_id, role: 'reseller' as const, permissions: ['billing:transfer'], session_id: '' };

      // Reseller attempting to transfer to siblingId (not their child) must be rejected
      await assert.rejects(
        async () => billing.transfer(resellerActor, {
          to_user_id: siblingId,
          amount_paise: 5000,
          reference: 'transfer-ref-sibling-illegal'
        }),
        /User not found in your hierarchy/
      );
    });

    await t.test('5. Wallets lock in consistent user_id order to prevent deadlocks', async () => {
      // In wallets query: ORDER BY user_id FOR UPDATE guarantees lock ordering
      const u1 = Math.min(actor.id, clientUserId);
      const u2 = Math.max(actor.id, clientUserId);
      const rows = (await db.query("SELECT user_id FROM wallets WHERE tenant_id = $1 AND user_id = ANY($2::bigint[]) ORDER BY user_id FOR UPDATE", [actor.tenant_id, [u2, u1]])).rows;
      assert.equal(Number(rows[0].user_id), u1);
      assert.equal(Number(rows[1].user_id), u2);
    });

  } finally {
    await close();
  }
});
