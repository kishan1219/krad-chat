import { Actor, authorize } from './auth';
import { ApiError, idSchema, sha256 } from './common';
import { Db } from './db';

export class WebhookInbox {
  private running=false;
  constructor(private db:Db,private process:(value:any)=>Promise<void>){}
  async receive(body:any){
    if(!Array.isArray(body.entry))throw new ApiError(422,'Webhook entry must be an array.');
    // Persist the entire accepted batch atomically before acknowledging it.
    await this.db.transaction(async c=>{
      for(const entry of body.entry)for(const change of entry.changes||[]){
        const value=change.value||{},phone=String(value.metadata?.phone_number_id||'');
        const mappings=(await c.query("SELECT DISTINCT tenant_id FROM meta_connections WHERE status='connected' AND (($1<>'' AND phone_number_id=$1) OR ($1='' AND waba_id=$2))",[phone,String(entry.id||'')])).rows;
        const tenant=mappings.length===1?mappings[0].tenant_id:null;
        await c.query('INSERT INTO meta_webhook_events(event_hash,tenant_id,phone_number_id,payload,status,error) VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(event_hash) DO NOTHING',[sha256(JSON.stringify({waba:entry.id,field:change.field,value})),tenant,phone,{entry:[{id:entry.id,changes:[change]}]},tenant?'queued':'quarantined',tenant?null:'No unique account mapping.']);
      }
    });
    return {received:true,queued:true};
  }
  async list(actor:Actor){authorize(actor,'admin:write');return (await this.db.query('SELECT id,phone_number_id,status,attempts,error,created_at,completed_at FROM meta_webhook_events WHERE tenant_id=$1 ORDER BY id DESC LIMIT 200',[actor.tenant_id])).rows;}
  async retry(actor:Actor,id:unknown){
    authorize(actor,'admin:write');
    return this.db.transaction(async c=>{
      const row=(await c.query("UPDATE meta_webhook_events SET status='queued',attempts=0,error=NULL,available_at=now(),lease_until=NULL WHERE tenant_id=$1 AND id=$2 AND status='failed' RETURNING id",[actor.tenant_id,idSchema.parse(id)])).rows[0];
      if(!row)throw new ApiError(409,'Only a failed event belonging to your business can be retried.');
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'webhook.retry',$3)",[actor.tenant_id,actor.id,String(row.id)]);return row;
    });
  }
  async tick(){
    if(this.running)return;this.running=true;
    try{
      // Recover quarantined numbers only when a unique account mapping exists.
      await this.db.query("UPDATE meta_webhook_events e SET tenant_id=m.tenant_id,status='queued',error=NULL FROM meta_connections m WHERE e.status='quarantined' AND e.phone_number_id=m.phone_number_id AND m.status='connected'");
      await this.db.query("UPDATE meta_webhook_events e SET tenant_id=m.tenant_id,status='queued',error=NULL FROM (SELECT waba_id,min(tenant_id) AS tenant_id FROM meta_connections WHERE status='connected' GROUP BY waba_id HAVING count(DISTINCT tenant_id)=1) m WHERE e.status='quarantined' AND e.phone_number_id='' AND e.payload#>>'{entry,0,id}'=m.waba_id");
      await this.db.query("UPDATE meta_webhook_events SET status=CASE WHEN attempts>=5 THEN 'failed' ELSE 'queued' END,lease_until=NULL,error='Worker lease expired.' WHERE status='running' AND lease_until<now()");
      const row=await this.db.transaction(async c=>{
        const row=(await c.query("SELECT * FROM meta_webhook_events WHERE status='queued' AND available_at<=now() ORDER BY id FOR UPDATE SKIP LOCKED LIMIT 1")).rows[0];
        if(row)await c.query("UPDATE meta_webhook_events SET status='running',attempts=attempts+1,lease_until=now()+interval '2 minutes' WHERE id=$1",[row.id]);return row;
      });
      if(!row)return;
      try{
        await this.process(row.payload);
        await this.db.query("UPDATE meta_webhook_events SET status='completed',completed_at=now(),lease_until=NULL,error=NULL WHERE id=$1",[row.id]);
      }catch{
        const attempts=Number(row.attempts)+1;
        // Do not persist provider exceptions, tokens or customer content in the inspector.
        await this.db.query("UPDATE meta_webhook_events SET status=$2,error='Processing failed; check account configuration and retry.',available_at=now()+($3::int * interval '1 second'),lease_until=NULL WHERE id=$1",[row.id,attempts>=5?'failed':'queued',Math.min(300,2**attempts)]);
      }
    }finally{this.running=false;}
  }
}
