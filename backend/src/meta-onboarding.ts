import {createHmac} from 'node:crypto';
import {z} from 'zod';
import {Actor,authorize} from './auth';
import {ApiError,equalSecret,sha256,token} from './common';
import {Config,requiredEnv} from './config';
import {Db} from './db';
import {Providers} from './providers';
import {MetaConnections} from './meta-connections';

export class MetaOnboarding {
 constructor(private db:Db,private cfg:Config,private providers:Providers,private connections:MetaConnections){}
 private signature(id:string){return createHmac('sha256',this.cfg.JWT_SECRET).update(`meta-onboarding:${id}`).digest('hex');}
 async begin(actor:Actor){
  authorize(actor,'admin:write');if(actor.session_id.startsWith('api:'))throw new ApiError(403,'Sign in to connect a business.');
  const simulated=this.cfg.PROVIDER_MODE==='mock';
  if(!simulated&&['META_APP_ID','META_CONFIG_ID','META_GRAPH_VERSION','META_APP_SECRET'].some(key=>!process.env[key]))throw new ApiError(503,'Meta Embedded Signup is not configured on this server yet.');
  const config=simulated?{app_id:null,config_id:null,graph_version:null}:{app_id:requiredEnv('META_APP_ID'),config_id:requiredEnv('META_CONFIG_ID'),graph_version:requiredEnv('META_GRAPH_VERSION')};
  const id=token();
  await this.db.query("INSERT INTO meta_onboarding_sessions(id,tenant_id,user_id,session_hash,expires_at) VALUES($1,$2,$3,$4,now()+interval '10 minutes')",[id,actor.tenant_id,actor.id,sha256(actor.session_id)]);
  return {...config,state:`${id}.${this.signature(id)}`,simulated,expires_in:600};
 }
 async history(actor:Actor){authorize(actor,'admin:write');return (await this.db.query('SELECT id,status,connection_id,error,created_at,completed_at,expires_at FROM meta_onboarding_sessions WHERE tenant_id=$1 AND user_id=$2 ORDER BY created_at DESC LIMIT 50',[actor.tenant_id,actor.id])).rows;}
 async complete(actor:Actor,body:any){
  authorize(actor,'admin:write');
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
