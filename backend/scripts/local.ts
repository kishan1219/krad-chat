import { PGlite } from '@electric-sql/pglite';
import { randomBytes } from 'node:crypto';
import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { config as dotenv } from 'dotenv';
import { hash } from 'bcryptjs';
import { Db } from '../src/db';
import { loadConfig } from '../src/config';
import { migrate } from '../src/migrate';
import { createApplication } from '../src/main';

async function start(){
  if(process.env.NODE_ENV==='production')throw new Error('The embedded local database must not run in production.');
  if(!existsSync('.env.local'))await writeFile('.env.local',`NODE_ENV=development\nPROVIDER_MODE=mock\nDATABASE_URL=local-embedded\nJWT_SECRET=${randomBytes(48).toString('hex')}\nENCRYPTION_KEY=${randomBytes(32).toString('hex')}\nADMIN_EMAIL=admin@local.test\nADMIN_PASSWORD=${randomBytes(18).toString('base64url')}\nWORKER_ENABLED=true\nPORT=4000\n`,{flag:'wx'});
  dotenv({path:'.env.local',override:true});
  const cfg=loadConfig();if(cfg.NODE_ENV!=='development'||cfg.PROVIDER_MODE!=='mock')throw new Error('Local mode requires development and mock providers.');
  const pg=new PGlite('.local-data');
  const normalize=(r:any)=>({rows:r.rows||[],rowCount:r.affectedRows||r.rows?.length||0});
  const execute=async(target:any,text:string,values:unknown[]=[])=>{
    if(text.includes('pg_advisory_xact_lock'))return {rows:[],rowCount:1};
    if(!values.length&&text.trim().split(';').filter(Boolean).length>1){await target.exec(text);return {rows:[],rowCount:0};}
    return normalize(await target.query(text,values));
  };
  const db={query:(text:string,values:unknown[]=[])=>execute(pg,text,values),transaction:(fn:any)=>pg.transaction(tx=>fn({query:(text:string,values:unknown[]=[])=>execute(tx,text,values)})),pool:{end:()=>pg.close()}} as unknown as Db;
  await migrate(db);
  const existing=(await db.query('SELECT id FROM users WHERE email=$1',[process.env.ADMIN_EMAIL])).rows[0];
  if(!existing){await db.transaction(async c=>{const tenant=(await c.query("INSERT INTO tenants(name) VALUES('Local demo business') RETURNING id")).rows[0];const user=(await c.query("INSERT INTO users(tenant_id,email,name,password_hash,role) VALUES($1,$2,'Local Administrator',$3,'admin') RETURNING id",[tenant.id,process.env.ADMIN_EMAIL,await hash(process.env.ADMIN_PASSWORD!,12)])).rows[0];await c.query('INSERT INTO wallets(tenant_id,user_id,balance) VALUES($1,$2,100000)',[tenant.id,user.id]);await c.query("INSERT INTO ledger(tenant_id,user_id,type,amount,reference,created_by) VALUES($1,$2,'credit',100000,'local-demo-opening',$2)",[tenant.id,user.id]);await c.query("INSERT INTO products(tenant_id,sku,name,category,price_paise,stock) VALUES($1,'DEMO-TEA','Assam Tea','Groceries',29900,20)",[tenant.id]);});}
  const {app,shutdown}=await createApplication({config:cfg,db,staticDir:existsSync('../frontend/build/index.html')?'../frontend/build':undefined});await app.listen(cfg.PORT,'127.0.0.1');
  console.log(`Local verification backend: http://127.0.0.1:${cfg.PORT}/api\nLogin email: ${process.env.ADMIN_EMAIL}\nPassword: stored in backend/.env.local\nMock messaging and payments only. Persistent local data: backend/.local-data`);
  for(const signal of ['SIGINT','SIGTERM'] as const)process.once(signal,()=>{void shutdown().then(()=>process.exit(0));});
}
start().catch(e=>{console.error(e.message);process.exitCode=1;});
