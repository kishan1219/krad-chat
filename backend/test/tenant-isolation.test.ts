import test from 'node:test';
import assert from 'node:assert/strict';
import { hash } from 'bcryptjs';
import { database, testConfig } from './helpers';
import { Actor } from '../src/auth';
import { MetaConnections } from '../src/meta-connections';
import { Commerce } from '../src/commerce';
import { Features } from '../src/features';
import { Providers } from '../src/providers';
import { ApiError } from '../src/common';

async function createSecondTenant(db: any): Promise<Actor> {
  const tenant = (await db.query("INSERT INTO tenants(name) VALUES('Tenant Bob') RETURNING id")).rows[0];
  const user = (await db.query(
    "INSERT INTO users(tenant_id, email, name, password_hash, role) VALUES($1, 'bob@test.com', 'Bob', $2, 'admin') RETURNING id",
    [tenant.id, await hash('bob-test-password', 12)]
  )).rows[0];
  await db.query('INSERT INTO wallets(tenant_id, user_id, balance) VALUES($1, $2, 5000)', [tenant.id, user.id]);
  return { id: Number(user.id), tenant_id: Number(tenant.id), role: 'admin', permissions: [], session_id: '' };
}

test('cross-tenant data isolation preserves complete separation across all modules', async () => {
  const { db, actor: alice, close } = await database();
  try {
    const bob = await createSecondTenant(db);
    const providers = new Providers(testConfig);
    const meta = new MetaConnections(db, testConfig, providers);
    const commerce = new Commerce(db, testConfig);
    const features = new Features(db);

    // 1. Meta Connections Isolation
    const aliceConn = await meta.connect(alice, {
      name: "Alice Store",
      waba_id: "123456789012345",
      phone_number_id: "987654321098765",
      access_token: "EAAB_alice_mock_token_secret"
    });

    const bobConnections = await meta.list(bob);
    assert.equal(bobConnections.length, 0, "Bob must not see Alice's WhatsApp connections");

    const aliceConnections = await meta.list(alice);
    assert.equal(aliceConnections.length, 1);
    assert.equal(aliceConnections[0].name, "Alice Store");

    // Bob cannot mutate or query Alice's connection
    await assert.rejects(
      meta.createTemplate(bob, String(aliceConn.id), {
        name: "malicious_template",
        category: "MARKETING",
        language: "en",
        components: [{ type: "BODY", text: "Hello" }]
      }),
      (err: any) => err instanceof ApiError || err.message.includes('not found') || err.status === 404
    );

    // 2. Commerce Catalog Isolation
    const aliceProduct = await commerce.saveProduct(alice, {
      name: "Alice Kashmiri Tea",
      sku: "TEA-ALICE-01",
      price_paise: 35000,
      stock: 50,
      active: true
    });

    const bobProducts = await commerce.products(bob);
    assert.equal(bobProducts.length, 0, "Bob must not see Alice's products");

    const aliceProducts = await commerce.products(alice);
    assert.equal(aliceProducts.length, 1);
    assert.equal(aliceProducts[0].sku, "TEA-ALICE-01");

    // Bob cannot update Alice's product
    await assert.rejects(
      commerce.saveProduct(bob, {
        name: "Hacked Product",
        sku: "TEA-ALICE-01",
        price_paise: 35000,
        stock: 50,
        active: true,
        version: 1
      }, String(aliceProduct.id)),
      (err: any) => err instanceof ApiError || err.status === 409 || err.status === 404
    );

    // 3. Feature Flags Tenant Scoping & Isolation
    // Global defaults exist (COMMERCE, FLOWS, AI_AGENT)
    assert.equal(await features.isEnabled(alice.tenant_id, 'FLOWS'), true);
    assert.equal(await features.isEnabled(bob.tenant_id, 'FLOWS'), true);

    // Override FLOWS to false only for Alice
    await features.setFlag(alice.tenant_id, 'FLOWS', false);

    assert.equal(await features.isEnabled(alice.tenant_id, 'FLOWS'), false, "Alice FLOWS must be disabled");
    assert.equal(await features.isEnabled(bob.tenant_id, 'FLOWS'), true, "Bob FLOWS must remain enabled");

    // Verify getAllFlags returns scoped override
    const aliceFlags = await features.getAllFlags(alice.tenant_id);
    const bobFlags = await features.getAllFlags(bob.tenant_id);

    assert.equal(aliceFlags['FLOWS'], false);
    assert.equal(bobFlags['FLOWS'], true);

    // 4. Wallet Isolation
    const aliceWallet = (await db.query("SELECT balance FROM wallets WHERE tenant_id = $1", [alice.tenant_id])).rows[0];
    const bobWallet = (await db.query("SELECT balance FROM wallets WHERE tenant_id = $1", [bob.tenant_id])).rows[0];

    assert.equal(Number(aliceWallet.balance), 10000);
    assert.equal(Number(bobWallet.balance), 5000);

    // Ensure scoped queries never leak Bob's wallet to Alice
    const leaked = (await db.query("SELECT * FROM wallets WHERE tenant_id = $1 AND user_id = $2", [alice.tenant_id, bob.id])).rows;
    assert.equal(leaked.length, 0, "Cross-tenant wallet lookup must yield zero records");

  } finally {
    await close();
  }
});
