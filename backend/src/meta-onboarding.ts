import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {Actor,authorize} from './auth';
import {ApiError,decrypt,encrypt,equalSecret,sha256,token} from './common';
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

 private async resolveConfig(): Promise<{ app_id: string | null; config_id: string | null; graph_version: string; app_secret: string | null; configured: boolean }> {
  let appId = process.env.META_APP_ID || process.env.REACT_APP_META_APP_ID || process.env.WHATSAPP_APP_ID || process.env.FACEBOOK_APP_ID || process.env.META_CLIENT_ID || process.env.APP_ID || null;
  let configId = process.env.META_CONFIG_ID || process.env.REACT_APP_META_CONFIG_ID || process.env.WHATSAPP_CONFIG_ID || process.env.FACEBOOK_CONFIG_ID || process.env.CONFIG_ID || null;
  let graphVersion = process.env.META_GRAPH_VERSION || process.env.REACT_APP_META_GRAPH_VERSION || process.env.WHATSAPP_GRAPH_VERSION || 'v22.0';
  let appSecret = process.env.META_APP_SECRET || process.env.META_SECRET || process.env.REACT_APP_META_APP_SECRET || process.env.WHATSAPP_APP_SECRET || process.env.FACEBOOK_APP_SECRET || process.env.APP_SECRET || process.env.META_CLIENT_SECRET || null;

  if (!appId || !configId || !appSecret) {
   try {
    const rows = (await this.db.query("SELECT key, value_encrypted FROM platform_settings WHERE key IN ('meta_app_id','meta_config_id','meta_graph_version','meta_app_secret')")).rows;
    for (const row of rows) {
     try {
      const val = decrypt(row.value_encrypted, this.cfg.ENCRYPTION_KEY);
      if (row.key === 'meta_app_id' && !appId) appId = val;
      if (row.key === 'meta_config_id' && !configId) configId = val;
      if (row.key === 'meta_graph_version' && (!graphVersion || graphVersion === 'v22.0')) graphVersion = val;
      if (row.key === 'meta_app_secret' && !appSecret) appSecret = val;
     } catch {
      // ignore decryption failure
     }
    }
   } catch {
    // table may not exist yet
   }
  }

  const configured = Boolean(appId && configId && appSecret);
  return { app_id: appId, config_id: configId, graph_version: graphVersion, app_secret: appSecret, configured };
 }

 async getConfig(actor:Actor){
  authorizeAdminOrChannel(actor);
  const resolved = await this.resolveConfig();
  return {
   configured: resolved.configured,
   app_id: resolved.app_id,
   config_id: resolved.config_id,
   graph_version: resolved.graph_version,
   simulated: this.cfg.PROVIDER_MODE==='mock'
  };
 }

 async saveConfig(actor:Actor,body:any){
  authorizeAdminOrChannel(actor);
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

  try {
   const items = [
    ['meta_app_id', input.app_id],
    ['meta_config_id', input.config_id],
    ['meta_graph_version', input.graph_version],
    ['meta_app_secret', input.app_secret]
   ];
   for (const [k, v] of items) {
    const encrypted = encrypt(v, this.cfg.ENCRYPTION_KEY);
    await this.db.query(
     `INSERT INTO platform_settings(key, value_encrypted, updated_at)
      VALUES($1, $2, now())
      ON CONFLICT(key) DO UPDATE SET value_encrypted=EXCLUDED.value_encrypted, updated_at=now()`,
     [k, encrypted]
    );
   }
  } catch {
   // ignore if migration not applied yet
  }

  return {success:true,configured:true,app_id:input.app_id,config_id:input.config_id,graph_version:input.graph_version};
 }

 async begin(actor:Actor,body?:any){
  authorizeAdminOrChannel(actor);if(actor.session_id.startsWith('api:'))throw new ApiError(403,'Sign in to connect a business.');
  const requestedMode=body?.mode;
  const resolved = await this.resolveConfig();
  const simulated=this.cfg.PROVIDER_MODE==='mock' || requestedMode==='sandbox' || (!resolved.configured && requestedMode!=='live');
  if(!simulated && !resolved.configured)throw new ApiError(503,'Meta Embedded Signup is not configured on this server yet. Enter credentials or select Sandbox mode.');
  const config=simulated
   ? {app_id:resolved.app_id||'123456789012345',config_id:resolved.config_id||'sandbox_config',graph_version:resolved.graph_version||'v22.0'}
   : {app_id:resolved.app_id!,config_id:resolved.config_id!,graph_version:resolved.graph_version};
  const id=token();
  await this.db.query("INSERT INTO meta_onboarding_sessions(id,tenant_id,user_id,session_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  return {...config,state:`${id}.${this.signature(id)}`,simulated,expires_in:600,configured:resolved.configured};
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
   const resolved = await this.resolveConfig();
   if (!process.env.META_APP_SECRET && resolved.app_secret) process.env.META_APP_SECRET = resolved.app_secret;
   if (!process.env.META_APP_ID && resolved.app_id) process.env.META_APP_ID = resolved.app_id;
   if (!process.env.META_GRAPH_VERSION && resolved.graph_version) process.env.META_GRAPH_VERSION = resolved.graph_version;
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
