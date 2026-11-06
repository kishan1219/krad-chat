import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { PGlite } from '@electric-sql/pglite';

async function main() {
  console.log('--- Database Migration Integrity Verification ---');
  const dir = resolve(__dirname, '../migrations');
  if (!existsSync(dir)) {
    throw new Error(`Migrations directory not found at ${dir}`);
  }

  const files = (await readdir(dir)).filter(f => f.endsWith('.sql')).sort();
  console.log(`Found ${files.length} migration files in ${dir}`);

  const db = new PGlite();
  try {
    await db.exec('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
    
    for (const file of files) {
      const sql = await readFile(resolve(dir, file), 'utf8');
      console.log(`Verifying migration syntax: ${file}...`);
      await db.exec(sql);
      await db.exec(`INSERT INTO schema_migrations(name) VALUES('${file}')`);
      console.log(`✓ Migration ${file} successfully applied in verification container.`);
    }

    const { rows } = await db.query('SELECT count(*)::int as count FROM schema_migrations');
    console.log(`All ${(rows[0] as any).count} database migrations parsed, executed and verified successfully.`);
  } finally {
    await db.close();
  }
}

main().catch(err => {
  console.error('Migration verification failed:', err);
  process.exit(1);
});
