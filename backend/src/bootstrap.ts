import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Db } from './db';
import { loadConfig, requiredEnv } from './config';
import { passwordSchema } from './common';

async function bootstrap() {
  const db = new Db(loadConfig());
  try {
    const email = z.email().parse(requiredEnv('ADMIN_EMAIL')).toLowerCase();
    const password = passwordSchema.parse(requiredEnv('ADMIN_PASSWORD'));
    if (password.startsWith('replace-with')) throw new Error('Set a unique ADMIN_PASSWORD first.');
    await db.transaction(async c => {
      if ((await c.query('SELECT 1 FROM users WHERE email=$1', [email])).rowCount) throw new Error('User already exists; bootstrap will not overwrite credentials.');
      const tenant = (await c.query("INSERT INTO tenants(name) VALUES('Initial business') RETURNING id")).rows[0];
      const user = (await c.query("INSERT INTO users(tenant_id,email,name,password_hash,role) VALUES($1,$2,'Administrator',$3,'admin') RETURNING id", [tenant.id, email, await hash(password, 12)])).rows[0];
      await c.query('INSERT INTO wallets(tenant_id,user_id) VALUES($1,$2)', [tenant.id, user.id]);
    });
    console.log('Created administrator with zero credits. Allocate test credits through the authenticated API.');
  } finally { await db.pool.end(); }
}
bootstrap().catch(e => { console.error(e.message); process.exitCode = 1; });
