import test from 'node:test';
import assert from 'node:assert/strict';
import {database} from './helpers';

test('audit history cannot be changed or erased by an ordinary SQL mutation',async()=>{
 const {db,actor,close}=await database();
 try{
  const row=(await db.query("INSERT INTO audit_logs(tenant_id,user_id,action) VALUES($1,$2,'original') RETURNING id",[actor.tenant_id,actor.id])).rows[0];
  await assert.rejects(db.query("UPDATE audit_logs SET action='replacement' WHERE id=$1",[row.id]),/append-only/);
  await assert.rejects(db.query('DELETE FROM audit_logs WHERE id=$1',[row.id]),/append-only/);
  assert.equal((await db.query('SELECT action FROM audit_logs WHERE id=$1',[row.id])).rows[0].action,'original');
 }finally{await close();}
});
