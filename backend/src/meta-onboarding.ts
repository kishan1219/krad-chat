import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {Actor,authorize} from './auth';
import {ApiError,equalSecret,sha256,token} from './common';
import {Config,requiredEnv} from './config';
import {Db} from './db';
import {Providers} from './providers';
import {MetaConnections} from './meta-connections';

function authorizeAdminOrChannel(actor: Actor) {
  if (actor.role === 'admin' || actor.role === 'reseller' || actor.permissions.includes('admin:write') || actor.permissions.includes('campaign:create')) return;
  authorize(actor, 'admin:write');
}

export class MetaOnboarding {
 constructor(private db:Db,private cfg:Config,private providers:Providers,private connections:MetaConnections){}
 private signature(id:string){return createHmac('sha256',this.cfg.JWT_SECRET).update(`meta-onboarding:${id}`).digest('hex');}

 async getConfig(actor:Actor){
  authorizeAdminOrChannel(actor);
  const envConfigured=Boolean(process.env.META_APP_ID && process.env.META_CONFIG_ID && process.env.META_GRAPH_VERSION && process.env.META_APP_SECRET);
  return {
   configured: envConfigured,
   app_id: process.env.META_APP_ID || null,
   config_id: process.env.META_CONFIG_ID || null,
   graph_version: process.env.META_GRAPH_VERSION || 'v22.0',
   simulated: this.cfg.PROVIDER_MODE==='mock'
  };
 }

 async saveConfig(actor:Actor,body:any){
  authorize(actor,'admin:write');
  const input=z.object({
   app_id:z.string().trim().min(1).max(100),
   config_id:z.string().trim().min(1).max(100),
   graph_version:z.string().trim().min(1).max(20).default('v22.0'),
   app_secret:z.string().trim().min(1).max(200)
  }).parse(body);
  process.env.META_APP_ID=input.app_id;
  process.env.META_CONFIG_ID=input.config_id;
  process.env.META_GRAPH_VERSION=input.graph_version;
  process.env.META_APP_SECRET=input.app_secret;
  return {success:true,configured:true,app_id:input.app_id,config_id:input.config_id,graph_version:input.graph_version};
 }

 async begin(actor:Actor,body?:any){
  authorizeAdminOrChannel(actor);if(actor.session_id.startsWith('api:'))throw new ApiError(403,'Sign in to connect a business.');
  const requestedMode=body?.mode;
  const envConfigured=Boolean(process.env.META_APP_ID && process.env.META_CONFIG_ID && process.env.META_GRAPH_VERSION && process.env.META_APP_SECRET);
  const simulated=this.cfg.PROVIDER_MODE==='mock' || requestedMode==='sandbox' || (!envConfigured && requestedMode!=='live');
  if(!simulated && !envConfigured)throw new ApiError(503,'Meta Embedded Signup is not configured on this server yet. Enter credentials or select Sandbox mode.');
  const config=simulated
   ? {app_id:process.env.META_APP_ID||'123456789012345',config_id:process.env.META_CONFIG_ID||'sandbox_config',graph_version:process.env.META_GRAPH_VERSION||'v22.0'}
   : {app_id:requiredEnv('META_APP_ID'),config_id:requiredEnv('META_CONFIG_ID'),graph_version:requiredEnv('META_GRAPH_VERSION')};
  const id=token();
  await this.db.query("INSERT INTO meta_onboarding_sessions(id,tenant_id,user_id,session_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  return {...config,state:`${id}.${this.signature(id)}`,simulated,expires_in:600,configured:envConfigured};
 }
 async history(actor:Actor){authorizeAdminOrChannel(actor);return (await this.db.query('SELECT id,status,connection_id,error,created_at,completed_at,expires_at FROM meta_onboarding_sessions WHERE tenant_id=$1 AND user_id=$2 ORDER BY created_at DESC LIMIT 50',[actor.tenant_id,actor.id])).rows;}
 async complete(actor:Actor,body:any){
  authorizeAdminOrChannel(actor);
  const input=z.object({state:z.string().regex(/^[a-f0-9]{64}\.[a-f0-9]{64}$/),code:z.string().min(1).max(4096),name:z.string().trim().min(1).max(150),waba_id:z.string().regex(/^\d{1,40}$/),phone_number_id:z.string().regex(/^\d{1,40}$/)}).parse(body);
  const [id,signature]=input.state.split('.');
  if(!equalSecret(signature,this.signature(id)))throw new ApiError(403,'Invalid onboarding state.');
  const claimed=await this.db.query("UPDATE meta_onboarding_sessions SET status='exchanging' WHERE id=$1 AND tenant_id=$2 AND user_id=$3 AND session_hash=$4 AND status='issued' AND expires_at>now() RETURNING id",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  if(!claimed.rowCount)throw new ApiError(409,'Onboarding expired, was already used, or belongs to another login. Start again.');
  try{
   const accessToken=await this.providers.exchangeMetaCode(input.code);
   const connection=await this.connections.connect(actor,{name:input.name,waba_id:input.waba_id,phone_number_id:input.phone_number_id,access_token:accessToken});
   await this.db.query("UPDATE meta_onboarding_sessions SET status='completed',connection_id=$2,completed_at=now() WHERE id=$1",[id,connection.id]);
   await this.db.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'meta.onboarding.completed',$3)",[actor.tenant_id,actor.id,String(connection.id)]);
   return connection;
  }catch{
   await this.db.query("UPDATE meta_onboarding_sessions SET status='failed',error='Connection could not be verified. Start signup again or reconnect an existing number.',completed_at=now() WHERE id=$1",[id]);
   throw new ApiError(422,'Meta onboarding failed. Start again or check the connection recovery screen.');
  }
 }
}
