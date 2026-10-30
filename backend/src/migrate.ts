import { existsSync } from 'node:fs';
import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { Db } from './db';
import { loadConfig } from './config';
export async function migrate(db: Db) {
  const dir = [
    resolve('migrations'),
    resolve('backend/migrations'),
    resolve(__dirname, '../migrations'),
    resolve(__dirname, 'migrations'),
    '/app/backend/migrations',
    '/app/migrations'
  ].find(d => existsSync(d)) || resolve('migrations');
  await db.transaction(async client => {
    await client.query('SELECT pg_advisory_xact_lock(89417001)');
    await client.query('CREATE TABLE IF NOT EXISTS schema_migrations (name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ DEFAULT now())');
    for (const name of (await readdir(dir)).filter(n => n.endsWith('.sql')).sort()) {
      if ((await client.query('SELECT 1 FROM schema_migrations WHERE name=$1', [name])).rowCount) continue;
      await client.query(await readFile(resolve(dir, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations(name) VALUES($1)', [name]);
      console.log(`Applied ${name}`);
    }
  });
}
if (require.main === module) {
  const db = new Db(loadConfig());
  migrate(db).then(() => db.pool.end()).catch(async e => { console.error(e.message); await db.pool.end(); process.exitCode = 1; });
}
