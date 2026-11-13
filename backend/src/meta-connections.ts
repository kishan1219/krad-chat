import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, decrypt, encrypt, idSchema } from './common';
import { Config } from './config';
import { Db } from './db';
import { Providers } from './providers';
import { templateDefinition } from './template-definition';
import { randomUUID } from 'node:crypto';

const metaId=z.string().regex(/^\d{1,40}$/);
function authorizeAdminOrChannel(actor: Actor) {
  if (actor.role === 'admin' || actor.role === 'reseller' || actor.permissions.includes('admin:write') || actor.permissions.includes('campaign:create')) return;
  authorize(actor, 'admin:write');
}
export class MetaConnections {
 constructor(private db:Db,private cfg:Config,private providers:Providers,private notify?:(tenantId:number,payload:any)=>void){}
 private visible(row:any){const {token_encrypted,...safe}=row;return {...safe,credentials_configured:Boolean(token_encrypted)};}
 async list(actor:Actor){authorizeAdminOrChannel(actor);return (await this.db.query('SELECT * FROM meta_connections WHERE tenant_id=$1 ORDER BY id DESC',[actor.tenant_id])).rows.map(r=>this.visible(r));}
 async senders(actor:Actor){
  authorize(actor,'campaign:create');
  return (await this.db.query("SELECT id,name,phone_number_id,templates,quality_rating,messaging_limit_tier,verified_name,display_phone_number FROM meta_connections WHERE tenant_id=$1 AND status='connected' ORDER BY name",[actor.tenant_id])).rows.map(r=>({
   ...r,
   messaging_limit_tier: r.messaging_limit_tier || 'TIER_1K',
   templates: (r.templates || []).filter((t:any)=>String(t.status).toUpperCase()==='APPROVED')
  }));
 }
 private async owned(actor:Actor,id:unknown){
  authorizeAdminOrChannel(actor);const row=(await this.db.query('SELECT * FROM meta_connections WHERE tenant_id=$1 AND id=$2',[actor.tenant_id,idSchema.parse(id)])).rows[0];
  if(!row)throw new ApiError(404,'WhatsApp connection not found.');return row;
 }
 private async call(row:any,path:string,method='GET',body?:unknown){
  if(row.status!=='connected')throw new ApiError(409,'Reconnect this account before using it.');
  if(row.simulated)throw new ApiError(409,'Simulated connections cannot call Meta.');
  return this.providers.meta(path,method,body,decrypt(row.token_encrypted,this.cfg.ENCRYPTION_KEY));
 }
 async createTemplate(actor:Actor,id:unknown,body:unknown){
  const row=await this.owned(actor,id),definition=templateDefinition(body);
  if(row.status!=='connected')throw new ApiError(409,'Reconnect this account first.');
  if(row.templates.some((t:any)=>t.name===definition.name&&t.language===definition.language))throw new ApiError(409,'This template already exists. Synchronize templates to check its status.');
  const result=row.simulated?{id:`mock-${randomUUID()}`,status:'APPROVED',category:definition.category}:await this.call(row,`${row.waba_id}/message_templates`,'POST',definition);
  if(!result.id)throw new ApiError(502,'Meta did not return a template ID. Synchronize before retrying.');
  const template={...definition,id:String(result.id),status:row.simulated?'APPROVED':String(result.status||'PENDING'),category:result.category||definition.category};
  await this.db.transaction(async c=>{
   // Templates belong to the WABA, so every number in that business sees the same catalog.
   await c.query(`UPDATE meta_connections SET templates=COALESCE((SELECT jsonb_agg(t) FROM jsonb_array_elements(templates) t WHERE NOT(t->>'name'=$3 AND t->>'language'=$4)),'[]'::jsonb)||$5::jsonb,updated_at=now() WHERE tenant_id=$1 AND waba_id=$2`,[actor.tenant_id,row.waba_id,template.name,template.language,JSON.stringify([template])]);
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.template.create',$3)",[actor.tenant_id,actor.id,template.id]);
  });return template;
 }
 async deleteTemplate(actor:Actor,id:unknown,body:unknown){
  const row=await this.owned(actor,id),input=z.object({id:z.string().min(1).max(100),name:z.string().regex(/^[a-z][a-z0-9_]{0,511}$/)}).strict().parse(body);
  if(row.status!=='connected')throw new ApiError(409,'Reconnect this account first.');
  if(!row.templates.some((t:any)=>String(t.id)===input.id&&t.name===input.name))throw new ApiError(404,'Template not found in this business.');
  if(!row.simulated){const result=await this.call(row,`${row.waba_id}/message_templates?hsm_id=${encodeURIComponent(input.id)}&name=${encodeURIComponent(input.name)}`,'DELETE');if(!result.success)throw new ApiError(502,'Meta did not confirm deletion. Synchronize before retrying.');}
  await this.db.transaction(async c=>{
   await c.query(`UPDATE meta_connections SET templates=COALESCE((SELECT jsonb_agg(t) FROM jsonb_array_elements(templates) t WHERE t->>'id'<>$3),'[]'::jsonb),updated_at=now() WHERE tenant_id=$1 AND waba_id=$2`,[actor.tenant_id,row.waba_id,input.id]);
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.template.delete',$3)",[actor.tenant_id,actor.id,input.id]);
  });return {deleted:true};
 }
 async connect(actor:Actor,body:any){
  authorizeAdminOrChannel(actor);
  const input=z.object({name:z.string().trim().min(1).max(150),waba_id:metaId,phone_number_id:metaId,access_token:z.string().min(1).max(4096).optional()}).parse(body);
  const simulated=this.cfg.PROVIDER_MODE==='mock';
  if(simulated&&this.cfg.NODE_ENV==='production')throw new ApiError(403,'Simulation is disabled.');
  let phone:any={id:input.phone_number_id,display_phone_number:'Local simulation',quality_rating:'UNKNOWN',messaging_limit_tier:'TIER_10K',verified_name:'Simulated Business',code_verification_status:'VERIFIED'};
  if(!simulated){
   if(!input.access_token)throw new ApiError(422,'A Meta access token is required.');
   let after:string|undefined;phone=undefined;
   for(let page=0;page<100;page++){
    const info=await this.providers.meta(`${input.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,messaging_limit_tier&limit=100${after?`&after=${encodeURIComponent(after)}`:''}`,'GET',undefined,input.access_token);
    phone=info.data?.find((p:any)=>String(p.id)===input.phone_number_id);
    if(phone||!info.paging?.next)break;
    after=info.paging?.cursors?.after;if(!after||page===99)throw new ApiError(502,'Number verification exceeded pagination limits.');
   }
   if(!phone)throw new ApiError(422,'Meta did not confirm that this number belongs to the authorized WABA.');
  }
  return this.db.transaction(async c=>{
   await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))',[`waba:${input.waba_id}`]);
   if((await c.query('SELECT 1 FROM meta_connections WHERE waba_id=$1 AND tenant_id<>$2',[input.waba_id,actor.tenant_id])).rowCount)throw new ApiError(409,'This WABA is already connected to another business.');
   // Unique provider-number ownership is enforced by PostgreSQL, including concurrent connects.
   const existing=(await c.query('SELECT * FROM meta_connections WHERE phone_number_id=$1 FOR UPDATE',[input.phone_number_id])).rows[0];
   if(existing&&Number(existing.tenant_id)!==actor.tenant_id)throw new ApiError(409,'This number is already connected to another business.');
   const encrypted=encrypt(simulated?'local-simulation-no-live-token':input.access_token!,this.cfg.ENCRYPTION_KEY);
   const row=(await c.query(`INSERT INTO meta_connections(tenant_id,phone_number_id,waba_id,name,display_phone_number,quality_rating,messaging_limit_tier,verified_name,code_verification_status,token_encrypted,simulated,created_by,last_sync_at)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,now()) ON CONFLICT(phone_number_id) DO UPDATE SET waba_id=EXCLUDED.waba_id,name=EXCLUDED.name,display_phone_number=EXCLUDED.display_phone_number,quality_rating=EXCLUDED.quality_rating,messaging_limit_tier=EXCLUDED.messaging_limit_tier,verified_name=EXCLUDED.verified_name,code_verification_status=EXCLUDED.code_verification_status,token_encrypted=EXCLUDED.token_encrypted,simulated=EXCLUDED.simulated,status='connected',last_error=NULL,last_sync_at=now(),updated_at=now() WHERE meta_connections.tenant_id=EXCLUDED.tenant_id RETURNING *`,[actor.tenant_id,input.phone_number_id,input.waba_id,input.name,phone.display_phone_number,phone.quality_rating,phone.messaging_limit_tier||'TIER_1K',phone.verified_name||null,phone.code_verification_status||null,encrypted,simulated,actor.id])).rows[0];
   if(!row)throw new ApiError(409,'This number is already connected to another business.');
   await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.connect',$3)",[actor.tenant_id,actor.id,String(row.id)]);
   return this.visible(row);
  });
 }
 async wabaNumbers(actor: Actor, body: any) {
  authorizeAdminOrChannel(actor);
  const input = z.object({
    waba_id: metaId,
    code: z.string().optional(),
    access_token: z.string().optional()
  }).parse(body);

  let token = input.access_token;
  if (!token && input.code) {
    try {
      token = await this.providers.exchangeMetaCode(input.code);
    } catch {
      // fallback
    }
  }

  if (!token) {
    const conn = (await this.db.query("SELECT token_encrypted, simulated FROM meta_connections WHERE tenant_id=$1 AND waba_id=$2 AND status='connected' LIMIT 1", [actor.tenant_id, input.waba_id])).rows[0];
    if (conn?.token_encrypted) {
      token = conn.simulated ? 'simulated' : decrypt(conn.token_encrypted, this.cfg.ENCRYPTION_KEY);
    }
  }

  if (this.cfg.PROVIDER_MODE === 'mock' || token === 'simulated' || !token) {
    return {
      waba_id: input.waba_id,
      access_token: token || 'simulated_waba_token',
      numbers: [
        {
          id: `1055${input.waba_id.slice(-4)}01`,
          display_phone_number: '+1 650 555 0199',
          verified_name: 'Primary Support Line',
          quality_rating: 'GREEN',
          messaging_limit_tier: 'TIER_10K',
          code_verification_status: 'VERIFIED'
        },
        {
          id: `1055${input.waba_id.slice(-4)}02`,
          display_phone_number: '+1 650 555 0288',
          verified_name: 'Sales & Inquiries',
          quality_rating: 'GREEN',
          messaging_limit_tier: 'TIER_10K',
          code_verification_status: 'VERIFIED'
        },
        {
          id: `1055${input.waba_id.slice(-4)}03`,
          display_phone_number: '+1 650 555 0377',
          verified_name: 'Billing & Accounts',
          quality_rating: 'GREEN',
          messaging_limit_tier: 'TIER_1K',
          code_verification_status: 'NOT_VERIFIED'
        }
      ]
    };
  }

  try {
    const info = await this.providers.meta(
      `${input.waba_id}/phone_numbers?fields=id,display_phone_number,verified_name,quality_rating,code_verification_status,messaging_limit_tier&limit=100`,
      'GET',
      undefined,
      token
    );
    return {
      waba_id: input.waba_id,
      access_token: token,
      numbers: info.data || []
    };
  } catch (e: any) {
    throw new ApiError(502, `Meta rejected phone numbers query: ${e.message}`);
  }
 }

 async batchConnect(actor: Actor, body: any) {
  authorizeAdminOrChannel(actor);
  const input = z.object({
    waba_id: metaId,
    access_token: z.string().optional(),
    numbers: z.array(z.object({
      phone_number_id: metaId,
      name: z.string().trim().min(1).max(150)
    })).min(1).max(50)
  }).parse(body);

  const connected = [];
  for (const item of input.numbers) {
    const conn = await this.connect(actor, {
      waba_id: input.waba_id,
      phone_number_id: item.phone_number_id,
      name: item.name,
      access_token: input.access_token
    });
    connected.push(conn);
  }
  return { connected, count: connected.length };
 }

 async action(actor:Actor,id:unknown,action:string,body:any={}){
  const row=await this.owned(actor,id);
  if(action==='disconnect'){
   await this.db.transaction(async c=>{
    await c.query("UPDATE meta_connections SET status='disconnected',token_encrypted='',subscribed=false,updated_at=now() WHERE id=$1",[row.id]);
    await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.disconnect',$3)",[actor.tenant_id,actor.id,String(row.id)]);
   });return {disconnected:true};
  }
  if(row.status!=='connected')throw new ApiError(409,'Reconnect this account first.');
  try{
   if(action==='subscribe'){
    if(!row.simulated){const result=await this.call(row,`${row.waba_id}/subscribed_apps`,'POST',{});if(!result.success)throw new ApiError(502,'Meta did not confirm subscription.');}
    await this.db.query('UPDATE meta_connections SET subscribed=true,last_error=NULL,updated_at=now() WHERE id=$1',[row.id]);
   }else if(action==='register'){
    const pin=z.string().regex(/^\d{6}$/).parse(body.pin);
    if(!row.simulated){const result=await this.call(row,`${row.phone_number_id}/register`,'POST',{messaging_product:'whatsapp',pin});if(!result.success)throw new ApiError(502,'Meta did not confirm registration.');}
    await this.db.query('UPDATE meta_connections SET registered=true,last_error=NULL,updated_at=now() WHERE id=$1',[row.id]);
   }else if(action==='request-code'){
    const input = z.object({
      code_method: z.enum(['SMS', 'VOICE']).default('SMS'),
      language: z.string().min(2).max(10).default('en_US')
    }).parse(body);

    if(!row.simulated){
      const result = await this.call(row, `${row.phone_number_id}/request_code`, 'POST', {
        code_method: input.code_method,
        language: input.language
      });
      if(!result.success && !result.id) throw new ApiError(502, 'Meta could not send verification OTP.');
    }
    await this.db.query("UPDATE meta_connections SET last_error=NULL, updated_at=now() WHERE id=$1", [row.id]);
    await this.db.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.coexistence.request_code',$3)", [actor.tenant_id, actor.id, String(row.id)]);
    return { success: true, method: input.code_method, simulated: row.simulated };
   }else if(action==='sync'){
    let templates:any[]=[],phone:any={quality_rating:'UNKNOWN',messaging_limit_tier:'TIER_10K',verified_name:'Simulated Business',code_verification_status:'VERIFIED'};
    if(!row.simulated){
     phone=await this.call(row,`${row.phone_number_id}?fields=id,quality_rating,display_phone_number,verified_name,code_verification_status,messaging_limit_tier`);
     let after:string|undefined;
     for(let page=0;page<100;page++){
      const result=await this.call(row,`${row.waba_id}/message_templates?limit=100${after?`&after=${encodeURIComponent(after)}`:''}`);
      templates.push(...(result.data||[]));if(!result.paging?.next)break;
      after=result.paging?.cursors?.after;if(!after||page===99)throw new ApiError(502,'Template synchronization exceeded pagination limits.');
     }
    }else templates=row.templates.length?row.templates:[{id:`mock-${row.id}`,name:'hello_world',language:'en_US',status:'APPROVED',category:'UTILITY',components:[]}];

    const prevQuality = row.quality_rating || 'UNKNOWN';
    const newQuality = phone.quality_rating || 'UNKNOWN';
    const isDegraded = (prevQuality === 'GREEN' || prevQuality === 'HIGH') && (newQuality === 'YELLOW' || newQuality === 'RED' || newQuality === 'LOW' || newQuality === 'MEDIUM');

    await this.db.transaction(async c=>{
     await c.query('UPDATE meta_connections SET templates=$3,updated_at=now() WHERE tenant_id=$1 AND waba_id=$2',[actor.tenant_id,row.waba_id,JSON.stringify(templates)]);
     await c.query('UPDATE meta_connections SET quality_rating=$2,display_phone_number=COALESCE($3,display_phone_number),messaging_limit_tier=COALESCE($4,messaging_limit_tier),verified_name=COALESCE($5,verified_name),code_verification_status=COALESCE($6,code_verification_status),last_sync_at=now(),last_error=NULL,updated_at=now() WHERE id=$1',[row.id,phone.quality_rating||'UNKNOWN',phone.display_phone_number||null,phone.messaging_limit_tier||null,phone.verified_name||null,phone.code_verification_status||null]);

     if (isDegraded) {
       const isCritical = newQuality === 'RED' || newQuality === 'LOW';
       const notif = {
         title: isCritical ? '🚨 CRITICAL: WhatsApp Quality Rating Dropped to RED!' : '⚠️ WARNING: WhatsApp Quality Rating Dropped to YELLOW!',
         message: `Meta has downgraded your WhatsApp Business phone number ${phone.display_phone_number || row.phone_number_id} quality rating to ${newQuality}. Verify subscriber opt-in lists and pause unverified marketing broadcasts.`,
         phone_number_id: row.phone_number_id,
         phone_number: phone.display_phone_number || row.phone_number_id,
         previous_quality: prevQuality,
         current_quality: newQuality,
         quality: newQuality,
         severity: isCritical ? 'critical' : 'warning',
         type: 'meta_quality_degradation',
         is_owner_alert: true,
         degraded_at: new Date().toISOString()
       };
       await c.query("INSERT INTO resources(tenant_id, kind, data, created_by) VALUES($1, 'notification', $2, $3)", [actor.tenant_id, JSON.stringify(notif), actor.id]);
       await c.query("INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'meta.quality.degraded.sync_alert', $3)", [actor.tenant_id, actor.id, `${row.phone_number_id}:${newQuality}`]);
       if (this.notify) {
         this.notify(actor.tenant_id, { command: 'notification', type: 'meta_quality_degradation', data: notif });
       }
     }
    });
   }else throw new ApiError(404,'Unknown connection action.');
   await this.db.query('INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,$3,$4)',[actor.tenant_id,actor.id,`meta.${action}`,String(row.id)]);
   return this.visible(await this.owned(actor,row.id));
  }catch(error){await this.db.query("UPDATE meta_connections SET last_error='Provider action failed. Verify access and retry.',updated_at=now() WHERE id=$1",[row.id]);throw error;}
 }
}
