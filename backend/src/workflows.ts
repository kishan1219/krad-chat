import { z } from 'zod';
import { PoolClient } from 'pg';
import { Actor,authorize } from './auth';
import { ApiError,idSchema } from './common';
import { Db } from './db';
import { Campaigns } from './campaigns';
import {templateMessageSchema} from './whatsapp-template';

const stepSchema=z.discriminatedUnion('kind',[
 z.object({kind:z.literal('text'),text:z.string().trim().min(1).max(4000)}),
 z.object({kind:z.literal('template'),template:templateMessageSchema}),
 z.object({kind:z.literal('contact_update'),field:z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/),value:z.string().max(1000)}),
 z.object({kind:z.literal('label'),label:z.string().trim().min(1).max(50)}),
 z.object({kind:z.literal('assign'),user_id:idSchema}),
 z.object({kind:z.literal('wait'),seconds:z.number().int().min(1).max(86400)}),
 z.object({kind:z.literal('handoff')}),
 z.object({kind:z.literal('note'),text:z.string().trim().min(1).max(4000)}),
 z.object({kind:z.literal('notify'),title:z.string().trim().min(1).max(200),text:z.string().trim().min(1).max(4000)}),
 z.object({kind:z.literal('condition'),field:z.enum(['message','label','state','custom_field']),key:z.string().max(50).optional(),equals:z.string().max(200)}),
 z.object({kind:z.literal('business_hours'),timezone:z.string().refine(v=>{try{new Intl.DateTimeFormat('en',{timeZone:v});return true;}catch{return false;}}),days:z.array(z.number().int().min(0).max(6)).min(1).max(7),start:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),end:z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/)})
]);
export const workflowSchema=z.object({steps:z.array(stepSchema).min(1).max(30)});
export function matchesCondition(step:any,conversation:any,message:string){
 if(step.field==='message')return message.trim().toLowerCase()===step.equals.trim().toLowerCase();
 if(step.field==='label')return conversation.labels.includes(step.equals);
 if(step.field==='custom_field')return conversation.custom_fields?.[step.key]===step.equals;
 return conversation.state===step.equals;
}
export function withinBusinessHours(step:any,at=new Date()){
 const parts=new Intl.DateTimeFormat('en-US',{timeZone:step.timezone,weekday:'short',hour:'2-digit',minute:'2-digit',hourCycle:'h23'}).formatToParts(at);
 const value=(type:string)=>parts.find(p=>p.type===type)!.value;
 const day=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].indexOf(value('weekday')),time=`${value('hour')}:${value('minute')}`;
 if(step.start<=step.end)return step.days.includes(day)&&time>=step.start&&time<step.end;
 return (time>=step.start&&step.days.includes(day))||(time<step.end&&step.days.includes((day+6)%7));
}
export class Workflows{
 private running=false;
 constructor(private db:Db,private campaigns:Campaigns){}
 async list(actor:Actor){authorize(actor,'chat:reply');return (await this.db.query('SELECT * FROM workflows WHERE tenant_id=$1 ORDER BY id DESC',[actor.tenant_id])).rows;}
 async save(actor:Actor,body:any,id?:unknown){
  authorize(actor,'resources:write');authorize(actor,'chat:reply');
  const input=z.object({name:z.string().trim().min(1).max(150),trigger_kind:z.enum(['keyword','incoming','new_contact']),keyword:z.string().trim().max(100).default(''),definition:workflowSchema}).parse(body);
  if(input.trigger_kind==='keyword'&&!input.keyword)throw new ApiError(422,'Keyword required.');
  for(const step of input.definition.steps)if(step.kind==='assign'&&!(await this.db.query('SELECT 1 FROM users WHERE tenant_id=$1 AND id=$2 AND active=true',[actor.tenant_id,step.user_id])).rowCount)throw new ApiError(422,'Assignee is not in this business.');
  if(id!==undefined){
   const result=await this.db.query('UPDATE workflows SET name=$3,draft=$4 WHERE tenant_id=$1 AND id=$2 RETURNING *',[actor.tenant_id,idSchema.parse(id),input.name,input.definition]);
   if(!result.rowCount)throw new ApiError(404,'Workflow not found.');
   return result.rows[0];
  }
  return (await this.db.query('INSERT INTO workflows(tenant_id,name,trigger_kind,keyword,draft,created_by) VALUES($1,$2,$3,$4,$5,$6) RETURNING *',[actor.tenant_id,input.name,input.trigger_kind,input.keyword.toLowerCase(),input.definition,actor.id])).rows[0];
 }
 async publish(actor:Actor,id:unknown,enabled:unknown){
  authorize(actor,'resources:write');z.boolean().parse(enabled);
  return this.db.transaction(async c=>{
   const flow=(await c.query('SELECT * FROM workflows WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[actor.tenant_id,idSchema.parse(id)])).rows[0];
   if(!flow)throw new ApiError(404,'Workflow not found.');
   const definition=workflowSchema.parse(flow.draft),version=flow.version+1;
   await c.query('INSERT INTO workflow_versions(workflow_id,tenant_id,version,definition) VALUES($1,$2,$3,$4)',[flow.id,actor.tenant_id,version,definition]);
   await c.query('UPDATE workflows SET version=$3,published=$4,enabled=$5 WHERE tenant_id=$1 AND id=$2',[actor.tenant_id,flow.id,version,definition,enabled]);
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'workflow.publish',$3)",[actor.tenant_id,actor.id,String(flow.id)]);
   return {id:flow.id,version,enabled};
  });
 }
 async dryRun(actor:Actor,body:any){
  authorize(actor,'chat:reply');const definition=workflowSchema.parse(body.definition);
  const conversation={labels:z.array(z.string()).default([]).parse(body.labels),state:z.enum(['open','closed']).default('open').parse(body.state),custom_fields:z.record(z.string(),z.string()).default({}).parse(body.custom_fields)};
  const message=z.string().max(4000).default('').parse(body.message),steps=[];
  for(const [index,step] of definition.steps.entries()){
   const result=step.kind==='condition'?matchesCondition(step,conversation,message):step.kind==='business_hours'?withinBusinessHours(step,body.at?new Date(z.iso.datetime().parse(body.at)):new Date()):true;
   steps.push({step:index+1,kind:step.kind,result:result?'would execute':'condition false; stop'});
   if(!result)break;if(step.kind==='label')conversation.labels.push(step.label);if(step.kind==='contact_update')conversation.custom_fields[step.field]=step.value;if(step.kind==='handoff')break;
  }return {simulated:true,steps};
 }
 async runs(actor:Actor){authorize(actor,'chat:reply');return (await this.db.query('SELECT r.*,w.name FROM workflow_runs r JOIN workflows w ON w.id=r.workflow_id WHERE r.tenant_id=$1 ORDER BY r.id DESC LIMIT 200',[actor.tenant_id])).rows;}
 async inspect(actor:Actor,id:unknown){
  authorize(actor,'chat:reply');
  const run=(await this.db.query('SELECT * FROM workflow_runs WHERE tenant_id=$1 AND id=$2',[actor.tenant_id,idSchema.parse(id)])).rows[0];
  if(!run)throw new ApiError(404,'Workflow run not found.');
  return {...run,steps:(await this.db.query('SELECT s.*,m.status AS delivery_status FROM workflow_steps s LEFT JOIN chat_messages m ON m.id=s.outbound_id WHERE run_id=$1 ORDER BY step',[run.id])).rows};
 }
 async retry(actor:Actor,id:unknown){
  authorize(actor,'resources:write');
  return this.db.transaction(async c=>{
   const run=(await c.query('SELECT * FROM workflow_runs WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[actor.tenant_id,idSchema.parse(id)])).rows[0];
   if(!run)throw new ApiError(404,'Workflow run not found.');
   if(run.status!=='failed')throw new ApiError(409,'Only failed runs can be retried.');
   const outgoing=(await c.query('SELECT m.status FROM messages m JOIN campaigns c ON c.id=m.campaign_id WHERE c.tenant_id=$1 AND c.idempotency_key=$2',[actor.tenant_id,`workflow-${run.id}-step-${run.step}`])).rows[0];
   if(outgoing&&['failed','uncertain','cancelled'].includes(outgoing.status))throw new ApiError(409,'Resolve the outbound message in campaign recovery before continuing this run.');
   await c.query("UPDATE workflow_runs SET status='queued',attempts=0,error=NULL,lease_until=NULL,available_at=now() WHERE id=$1",[run.id]);
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'workflow.retry',$3)",[actor.tenant_id,actor.id,String(run.id)]);
   return {id:run.id,status:'queued'};
  });
 }
 async enqueue(c:PoolClient,tenant:number,conversation:any,incoming:any){
  const firstContact=!(await c.query("SELECT 1 FROM chat_messages m JOIN conversations c ON c.id=m.conversation_id AND c.tenant_id=m.tenant_id WHERE m.tenant_id=$1 AND c.phone=$2 AND m.direction='in' AND m.id<$3 LIMIT 1",[tenant,conversation.phone,incoming.id])).rowCount;
  const flow=(await c.query("SELECT * FROM workflows WHERE tenant_id=$1 AND enabled=true AND published IS NOT NULL AND (trigger_kind='incoming' OR (trigger_kind='keyword' AND keyword=$2) OR (trigger_kind='new_contact' AND $3)) ORDER BY CASE trigger_kind WHEN 'keyword' THEN 0 WHEN 'new_contact' THEN 1 ELSE 2 END,id LIMIT 1",[tenant,incoming.message.trim().toLowerCase(),firstContact])).rows[0];
  if(!flow)return false;
  if((await c.query("SELECT 1 FROM workflow_runs WHERE tenant_id=$1 AND conversation_id=$2 AND created_at>now()-interval '1 minute' HAVING count(*)>=10",[tenant,conversation.id])).rowCount)return true;
  await c.query('INSERT INTO workflow_runs(tenant_id,workflow_id,version,conversation_id,incoming_id,definition) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(workflow_id,incoming_id) DO NOTHING',[tenant,flow.id,flow.version,conversation.id,incoming.id,flow.published]);return true;
 }
 async tick(){
  if(this.running)return;this.running=true;
  try{
   await this.db.query("UPDATE workflow_runs SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,lease_until=NULL,error='Worker lease expired.' WHERE status='running' AND lease_until<now()");
   const run=await this.db.transaction(async c=>{
    const row=(await c.query("SELECT r.* FROM workflow_runs r WHERE status='queued' AND available_at<=now() AND NOT EXISTS(SELECT 1 FROM workflow_runs a WHERE a.conversation_id=r.conversation_id AND a.status='running') ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0];
    if(!row)return null;
    if(!(await c.query('SELECT id FROM conversations WHERE id=$1 FOR UPDATE SKIP LOCKED',[row.conversation_id])).rowCount)return null;
    if((await c.query("SELECT 1 FROM workflow_runs WHERE conversation_id=$1 AND status='running'",[row.conversation_id])).rowCount)return null;
    await c.query("UPDATE workflow_runs SET status='running',attempts=attempts+1,lease_until=now()+interval '2 minutes' WHERE id=$1",[row.id]);return row;
   });
   if(!run)return;
   try{await this.execute(run);}catch(e){await this.db.query("UPDATE workflow_runs SET status='failed',lease_until=NULL,error=$2 WHERE id=$1",[run.id,e instanceof ApiError?e.message:'Step failed. Review the workflow configuration.']);}
  }finally{this.running=false;}
 }
 private async execute(run:any){
  const conversation=(await this.db.query('SELECT * FROM conversations WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id])).rows[0];
  const user=(await this.db.query('SELECT u.* FROM workflows w JOIN users u ON u.id=w.created_by AND u.tenant_id=w.tenant_id WHERE w.id=$1 AND u.active=true',[run.workflow_id])).rows[0];
  if(!user)throw new ApiError(403,'Workflow owner is inactive.');
  const actor:Actor={id:Number(user.id),tenant_id:Number(user.tenant_id),role:user.role,permissions:user.permissions,session_id:''};authorize(actor,'chat:reply');
  const optedOut=(await this.db.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=$2 AND opted_out=true',[run.tenant_id,conversation.phone])).rowCount;
  if(conversation.bot_paused||conversation.state==='closed'||optedOut){await this.db.query("UPDATE workflow_runs SET status='skipped',error='Conversation paused, closed or opted out.',lease_until=NULL WHERE id=$1",[run.id]);return;}
  const definition=workflowSchema.parse(run.definition),step=definition.steps[run.step];
  if(!step){await this.db.query("UPDATE workflow_runs SET status='completed',lease_until=NULL WHERE id=$1",[run.id]);return;}
  let stop=false,result='completed';
  if(step.kind==='condition'){
   const inbound=(await this.db.query('SELECT message FROM chat_messages WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.incoming_id])).rows[0];
   stop=!matchesCondition(step,conversation,inbound.message);result=stop?'condition false':'condition true';
  }
  if(step.kind==='business_hours'){stop=!withinBusinessHours(step);result=stop?'outside business hours':'within business hours';}
  if(step.kind==='text'||step.kind==='template'){
   if(step.kind==='text'&&!(await this.db.query("SELECT 1 FROM chat_messages WHERE tenant_id=$1 AND conversation_id=$2 AND direction='in' AND created_at>now()-interval '24 hours' LIMIT 1",[run.tenant_id,run.conversation_id])).rowCount)throw new ApiError(422,'Customer service window expired.');
   const display=step.kind==='text'?step.text:`Template: ${step.template.name}`;
   const outbound=await this.db.transaction(async c=>{
    await c.query('SELECT id FROM workflow_runs WHERE id=$1 FOR UPDATE',[run.id]);
    const existing=(await c.query('SELECT outbound_id FROM workflow_steps WHERE run_id=$1 AND step=$2',[run.id,run.step])).rows[0];if(existing)return existing.outbound_id;
    const message=(await c.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message,status) VALUES($1,$2,'out',$3,'queued') RETURNING id",[run.tenant_id,run.conversation_id,display])).rows[0];
    await c.query("INSERT INTO workflow_steps(run_id,step,kind,result,outbound_id) VALUES($1,$2,$4,'prepared',$3)",[run.id,run.step,message.id,step.kind]);return message.id;
   });
   await this.campaigns.create({...actor,permissions:[...actor.permissions,'campaign:create']},'whatsapp',{name:`Workflow ${run.id} step ${run.step+1}`,recipients:[conversation.phone],payload:{...(step.kind==='text'?{text:step.text}:{template:step.template}),chat_id:outbound,workflow_run_id:run.id}},`workflow-${run.id}-step-${run.step}`,true);
   const delivery=(await this.db.query('SELECT status FROM chat_messages WHERE id=$1 AND tenant_id=$2',[outbound,run.tenant_id])).rows[0];
   const message=(await this.db.query('SELECT m.status FROM messages m JOIN campaigns c ON c.id=m.campaign_id WHERE c.tenant_id=$1 AND c.idempotency_key=$2',[run.tenant_id,`workflow-${run.id}-step-${run.step}`])).rows[0];
   if(message&&['failed','uncertain','cancelled'].includes(message.status))throw new ApiError(409,'Outbound message needs campaign recovery.');
   if(!['submitted','sent','delivered','read'].includes(delivery.status)){
    await this.db.query("UPDATE workflow_runs SET status='queued',available_at=now()+interval '2 seconds',lease_until=NULL,attempts=0 WHERE id=$1",[run.id]);return;
   }
   result='outbound accepted';
  }
  await this.db.transaction(async c=>{
   const locked=(await c.query('SELECT * FROM workflow_runs WHERE id=$1 FOR UPDATE',[run.id])).rows[0];if(locked.step!==run.step)return;
   if(step.kind==='label')await c.query('UPDATE conversations SET labels=ARRAY(SELECT DISTINCT unnest(labels||$3::text[])),version=version+1 WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id,[step.label]]);
   if(step.kind==='contact_update'){
    if(Object.keys(conversation.custom_fields||{}).length>=30&&conversation.custom_fields?.[step.field]===undefined)throw new ApiError(422,'Contact custom field limit reached.');
    await c.query('UPDATE conversations SET custom_fields=custom_fields||jsonb_build_object($3::text,$4::text),version=version+1 WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id,step.field,step.value]);
   }
   if(step.kind==='assign'){
    if(!(await c.query('SELECT 1 FROM users WHERE tenant_id=$1 AND id=$2 AND active=true',[run.tenant_id,step.user_id])).rowCount)throw new ApiError(422,'Assignee is unavailable.');
    await c.query('UPDATE conversations SET assigned_to=$3,version=version+1 WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id,step.user_id]);
   }
   if(step.kind==='note')await c.query('INSERT INTO conversation_notes(tenant_id,conversation_id,user_id,body) VALUES($1,$2,$3,$4)',[run.tenant_id,run.conversation_id,actor.id,step.text]);
   if(step.kind==='notify')await c.query("INSERT INTO resources(tenant_id,kind,data,created_by) VALUES($1,'notification',$2,$3)",[run.tenant_id,{title:step.title,message:step.text,conversation_id:run.conversation_id,workflow_run_id:run.id},actor.id]);
   if(step.kind==='handoff'){await c.query('UPDATE conversations SET bot_paused=true,version=version+1 WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id]);stop=true;}
   await c.query('INSERT INTO workflow_steps(run_id,step,kind,result) VALUES($1,$2,$3,$4) ON CONFLICT(run_id,step) DO UPDATE SET result=EXCLUDED.result',[run.id,run.step,step.kind,result]);
   await c.query("UPDATE workflow_runs SET step=step+1,status=$2,available_at=now()+($3::int * interval '1 second'),lease_until=NULL,attempts=0,error=NULL WHERE id=$1",[run.id,stop||run.step+1>=definition.steps.length?'completed':'queued',step.kind==='wait'?step.seconds:0]);
  });
 }
}
