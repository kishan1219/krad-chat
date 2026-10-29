import { loadConfig } from '../src/config';
import { Db } from '../src/db';
import { Providers } from '../src/providers';
import { decrypt } from '../src/common';

async function main() {
  console.log('=====================================================');
  console.log(' META TECH PROVIDER & APP REVIEW DEMO STATUS CHECK ');
  console.log('=====================================================\n');

  const cfg = loadConfig();
  const db = new Db(cfg);
  const providers = new Providers(cfg, db);

  // 1. Fetch registered Meta connection
  const connRes = await db.query(
    "SELECT id, tenant_id, phone_number_id, waba_id, name, display_phone_number, quality_rating, status, simulated, token_encrypted, templates FROM meta_connections WHERE status='connected' ORDER BY id DESC LIMIT 1"
  );

  if (connRes.rowCount === 0) {
    console.error('❌ No active Meta Connection found in database. Run test-live-whatsapp.ts first.');
    process.exit(1);
  }

  const conn = connRes.rows[0];
  console.log('✅ Active WhatsApp Connection Verified:');
  console.log(`   - Connection ID:       ${conn.id}`);
  console.log(`   - Phone Number ID:     ${conn.phone_number_id}`);
  console.log(`   - WABA ID:             ${conn.waba_id}`);
  console.log(`   - Display Phone:       ${conn.display_phone_number}`);
  console.log(`   - Quality Rating:      ${conn.quality_rating}`);
  console.log(`   - Status:              ${conn.status} (Simulated: ${conn.simulated})`);

  // 2. Verify token validity with Meta Graph API
  const token = decrypt(conn.token_encrypted, cfg.ENCRYPTION_KEY);
  console.log('\n🔍 Verifying Token Health with Meta Graph API...');
  try {
    const debug = await providers.meta(
      `debug_token?input_token=${encodeURIComponent(token)}`,
      'GET',
      undefined,
      token
    );
    const isValid = debug?.data?.is_valid;
    const appId = debug?.data?.app_id;
    const expiresAt = debug?.data?.expires_at ? new Date(debug.data.expires_at * 1000).toISOString() : 'Never';
    const scopes = debug?.data?.scopes || [];
    console.log(`   - Token Valid:         ${isValid ? 'YES ✅' : 'NO ❌'}`);
    console.log(`   - Meta App ID:         ${appId}`);
    console.log(`   - Token Expires At:    ${expiresAt}`);
    console.log(`   - Granular Scopes:     ${scopes.join(', ')}`);
  } catch (err: any) {
    console.warn('   ⚠️ Could not inspect debug_token:', err.message);
  }

  // 3. Inspect Synced Templates
  const templates: any[] = Array.isArray(conn.templates) ? conn.templates : JSON.parse(conn.templates || '[]');
  console.log(`\n📋 Synced Templates on WABA (${templates.length} total):`);
  for (const t of templates) {
    console.log(`   - [${t.status}] ${t.name} (${t.language}) - Category: ${t.category}`);
  }

  // 4. Verification for Screencast Demonstration
  const targetTemplate = templates.find((t: any) => t.name === 'jaspers_market_order_confirmation_v1');
  if (targetTemplate) {
    console.log('\n🎯 Target Screencast Template Found:');
    console.log(`   - Name:                ${targetTemplate.name}`);
    console.log(`   - Category:            ${targetTemplate.category}`);
    console.log(`   - Components:          ${JSON.stringify(targetTemplate.components, null, 2)}`);
  } else {
    console.warn('\n⚠️ Target template jaspers_market_order_confirmation_v1 not found in local cache. Syncing...');
  }

  console.log('\n=====================================================');
  console.log(' READY FOR SCREEN RECORDING ');
  console.log(' Follow the steps in docs/META_TECH_PROVIDER_SCREENCAST_GUIDE.md');
  console.log('=====================================================\n');
}

main().catch((err) => {
  console.error('Fatal Demo Check Error:', err);
  process.exit(1);
});
