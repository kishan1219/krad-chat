import {z} from 'zod';
import {Actor,authorize} from './auth';
import {Db} from './db';
import {ApiError,idSchema,normalizePhone} from './common';
import {Campaigns} from './campaigns';

export class Broadcasts {
 constructor(private db:Db,private campaigns:Campaigns){}
 async segment(actor:Actor,query:any){
  authorize(actor,'campaign:create');const label=z.string().trim().min(1).max(50).parse(query.label);
  return (await this.db.query("SELECT DISTINCT c.phone FROM conversations c JOIN contact_consent s ON s.tenant_id=c.tenant_id AND s.phone=c.phone WHERE c.tenant_id=$1 AND $2=ANY(c.labels) AND s.opted_out=false AND s.opted_in_at IS NOT NULL ORDER BY c.phone LIMIT 10000",[actor.tenant_id,label])).rows.map(r=>r.phone);
 }
 async policy(actor:Actor,body?:any){
  authorize(actor,'campaign:create');
  await this.db.query('INSERT INTO broadcast_policies(tenant_id) VALUES($1) ON CONFLICT DO NOTHING',[actor.tenant_id]);
  if(body){
   authorize(actor,'admin:write');const input=z.object({daily_limit:z.number().int().min(1).max(1000000),require_approval:z.boolean(),paused:z.boolean()}).parse(body);
   await this.db.transaction(async c=>{
    await c.query('UPDATE broadcast_policies SET daily_limit=$2,require_approval=$3,paused=$4 WHERE tenant_id=$1',[actor.tenant_id,input.daily_limit,input.require_approval,input.paused]);
    await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'broadcast.policy',$3)",[actor.tenant_id,actor.id,JSON.stringify(input)]);
   });
  }
  const policy=(await this.db.query('SELECT * FROM broadcast_policies WHERE tenant_id=$1',[actor.tenant_id])).rows[0];
  const usage=(await this.db.query("SELECT dispatches FROM broadcast_daily_usage WHERE tenant_id=$1 AND day=(now() AT TIME ZONE 'UTC')::date",[actor.tenant_id])).rows[0];
  return {...policy,dispatches_today:usage?.dispatches||0,reset_timezone:'UTC'};
 }
 async consent(actor:Actor,body?:any){
  authorize(actor,'contacts:write');
  if(!body)return (await this.db.query('SELECT * FROM contact_consent WHERE tenant_id=$1 ORDER BY updated_at DESC LIMIT 500',[actor.tenant_id])).rows;
  const input=z.object({phone:z.string(),opted_in:z.boolean(),source:z.string().trim().min(3).max(200),evidence:z.string().trim().min(3).max(2000)}).parse(body),phone=normalizePhone(input.phone);
  await this.db.transaction(async c=>{
   await c.query('INSERT INTO contact_consent(tenant_id,phone,opted_out,source,opted_in_at,evidence) VALUES($1,$2,$3,$4,CASE WHEN $5 THEN now() ELSE NULL END,$6) ON CONFLICT(tenant_id,phone) DO UPDATE SET opted_out=EXCLUDED.opted_out,source=EXCLUDED.source,opted_in_at=EXCLUDED.opted_in_at,evidence=EXCLUDED.evidence,updated_at=now()',[actor.tenant_id,phone,!input.opted_in,input.source,input.opted_in,input.evidence]);
   await c.query('INSERT INTO consent_events(tenant_id,phone,opted_in,source,evidence,created_by) VALUES($1,$2,$3,$4,$5,$6)',[actor.tenant_id,phone,input.opted_in,input.source,input.evidence,actor.id]);
  });return {phone,opted_in:input.opted_in};
 }
 async approve(actor:Actor,id:unknown){
  authorize(actor,'admin:write');await this.campaigns.get(actor,id);
  return this.db.transaction(async c=>{
   const result=await c.query("UPDATE campaigns SET status='queued',updated_at=now() WHERE tenant_id=$1 AND id=$2 AND channel='whatsapp' AND status='pending_approval' RETURNING id,status",[actor.tenant_id,idSchema.parse(id)]);
   if(!result.rowCount)throw new ApiError(409,'Campaign is not awaiting approval.');
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'broadcast.approve',$3)",[actor.tenant_id,actor.id,String(id)]);return result.rows[0];
  });
 }
}
