import { PoolClient } from 'pg';
import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema } from './common';
import { Db } from './db';
import { Campaigns } from './campaigns';
import { Commerce } from './commerce';
import { Workflows } from './workflows';

export class Automation {
  private running=false;
  constructor(private db:Db,private campaigns:Campaigns,private commerce?:Commerce,private workflows?:Workflows){}
  async flows(actor:Actor){authorize(actor,'chat:reply');return (await this.db.query('SELECT * FROM automation_flows WHERE tenant_id=$1 ORDER BY id DESC',[actor.tenant_id])).rows;}
  async create(actor:Actor,body:any){authorize(actor,'resources:write');authorize(actor,'chat:reply');const input=z.object({name:z.string().trim().min(1).max(200),trigger_kind:z.enum(['keyword','any']),keyword:z.string().trim().max(100).default(''),reply:z.string().trim().min(1).max(4000),flow_kind:z.enum(['reply','shop']).default('reply')}).parse(body);if(input.trigger_kind==='keyword'&&!input.keyword)throw new ApiError(422,'Keyword is required.');if(input.flow_kind==='shop'&&input.trigger_kind!=='any')throw new ApiError(422,'Shopping bot requires any-message trigger.');return (await this.db.query('INSERT INTO automation_flows(tenant_id,name,trigger_kind,keyword,reply,created_by,flow_kind) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[actor.tenant_id,input.name,input.trigger_kind,input.keyword.toLowerCase(),input.reply,actor.id,input.flow_kind])).rows[0];}
  async publish(actor:Actor,id:unknown,enabled:boolean){authorize(actor,'resources:write');z.boolean().parse(enabled);return this.db.transaction(async c=>{const row=(await c.query('SELECT * FROM automation_flows WHERE tenant_id=$1 AND id=$2 FOR UPDATE',[actor.tenant_id,idSchema.parse(id)])).rows[0];if(!row)throw new ApiError(404,'Flow not found.');const version=row.published_version+1;await c.query('INSERT INTO automation_versions(flow_id,tenant_id,version,definition) VALUES($1,$2,$3,$4)',[row.id,actor.tenant_id,version,{trigger_kind:row.trigger_kind,keyword:row.keyword,reply:row.reply,flow_kind:row.flow_kind}]);return (await c.query('UPDATE automation_flows SET enabled=$3,published_version=$4 WHERE tenant_id=$1 AND id=$2 RETURNING *',[actor.tenant_id,row.id,enabled,version])).rows[0];});}
  async runs(actor:Actor){authorize(actor,'chat:reply');return (await this.db.query('SELECT r.*,f.name FROM automation_runs r JOIN automation_flows f ON f.id=r.flow_id WHERE r.tenant_id=$1 ORDER BY r.id DESC LIMIT 200',[actor.tenant_id])).rows;}
  async retry(actor:Actor,id:unknown){authorize(actor,'resources:write');const row=(await this.db.query("UPDATE automation_runs SET status='queued',error=NULL,lease_until=NULL WHERE tenant_id=$1 AND id=$2 AND status='failed' AND attempts<3 RETURNING *",[actor.tenant_id,idSchema.parse(id)])).rows[0];if(!row)throw new ApiError(409,'Run cannot be retried. Maximum three attempts.');return row;}
  async enqueue(c:PoolClient,tenant:number,conversation:any,incoming:any){
    const text=incoming.message.trim().toLowerCase();
    if(['stop','unsubscribe'].includes(text)){await c.query("INSERT INTO contact_consent(tenant_id,phone,opted_out,source) VALUES($1,$2,true,'customer message') ON CONFLICT(tenant_id,phone) DO UPDATE SET opted_out=true,source='customer message',updated_at=now()",[tenant,conversation.phone]);await c.query("INSERT INTO consent_events(tenant_id,phone,opted_in,source,evidence) VALUES($1,$2,false,'customer message',$3)",[tenant,conversation.phone,`message:${incoming.id}`]);return;}
    if(['agent','human'].includes(text)){await c.query('UPDATE conversations SET bot_paused=true,version=version+1 WHERE tenant_id=$1 AND id=$2',[tenant,conversation.id]);return;}
    if(conversation.bot_paused||conversation.state==='closed')return;
    if((await c.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=$2 AND opted_out=true',[tenant,conversation.phone])).rowCount)return;
    if(this.workflows && await this.workflows.enqueue(c,tenant,conversation,incoming))return;
    // Inbound events only; one matching published flow per message prevents competing automatic replies.
    const flow=(await c.query("SELECT * FROM automation_flows WHERE tenant_id=$1 AND enabled=true AND published_version>0 AND (trigger_kind='any' OR keyword=$2) ORDER BY CASE WHEN trigger_kind='keyword' THEN 0 ELSE 1 END,id LIMIT 1",[tenant,text])).rows[0];
    if(!flow)return;
    // Bound burst/loop activity even if another bot sends inbound messages.
    if((await c.query("SELECT 1 FROM automation_runs WHERE tenant_id=$1 AND conversation_id=$2 AND created_at>now()-interval '1 minute' HAVING count(*)>=10",[tenant,conversation.id])).rowCount)return;
    await c.query('INSERT INTO automation_runs(tenant_id,flow_id,flow_version,incoming_id,conversation_id,reply,billing_user_id,flow_kind) VALUES($1,$2,$3,$4,$5,$6,$7,$8) ON CONFLICT(flow_id,incoming_id) DO NOTHING',[tenant,flow.id,flow.published_version,incoming.id,conversation.id,flow.reply,flow.created_by,flow.flow_kind]);
  }
  async tick(){if(this.running)return;this.running=true;try{
    await this.db.query("UPDATE automation_runs SET status=CASE WHEN attempts>=3 THEN 'failed' ELSE 'queued' END,error=CASE WHEN attempts>=3 THEN 'Worker lease expired; retry limit reached.' ELSE error END,lease_until=NULL WHERE status='running' AND lease_until<now()");
    const run=await this.db.transaction(async c=>{
      const row=(await c.query("SELECT r.* FROM automation_runs r JOIN conversations conv ON conv.id=r.conversation_id AND conv.tenant_id=r.tenant_id WHERE r.status='queued' AND r.attempts<3 AND NOT EXISTS(SELECT 1 FROM automation_runs active WHERE active.conversation_id=r.conversation_id AND active.status='running') ORDER BY r.id FOR UPDATE OF r,conv SKIP LOCKED LIMIT 1")).rows[0];if(!row)return null;
      await c.query("UPDATE automation_runs SET status='running',attempts=attempts+1,lease_until=now()+interval '2 minutes' WHERE id=$1",[row.id]);
      return row;
    });if(!run)return;
    try{
      const conversation=(await this.db.query('SELECT * FROM conversations WHERE tenant_id=$1 AND id=$2',[run.tenant_id,run.conversation_id])).rows[0];
      const user=(await this.db.query('SELECT * FROM users WHERE tenant_id=$1 AND id=$2 AND active=true',[run.tenant_id,run.billing_user_id])).rows[0];
      const optedOut=(await this.db.query('SELECT 1 FROM contact_consent WHERE tenant_id=$1 AND phone=$2 AND opted_out=true',[run.tenant_id,conversation.phone])).rowCount;
      if(conversation.bot_paused||conversation.state==='closed'||optedOut){await this.finish(run,'skipped','Bot paused, conversation closed or customer opted out.');return;}
      if(!user)throw new ApiError(403,'Automation owner is inactive.');
      const actor:Actor={id:Number(user.id),tenant_id:Number(user.tenant_id),role:user.role,permissions:user.permissions,session_id:''};authorize(actor,'chat:reply');
      const recent=(await this.db.query("SELECT 1 FROM chat_messages WHERE conversation_id=$1 AND tenant_id=$2 AND direction='in' AND created_at>now()-interval '24 hours' LIMIT 1",[conversation.id,run.tenant_id])).rowCount;if(!recent)throw new ApiError(422,'Service window expired; an approved template is required.');
      if(!run.outbound_id)await this.db.transaction(async c=>{
        const locked=(await c.query('SELECT * FROM automation_runs WHERE id=$1 FOR UPDATE',[run.id])).rows[0];
        if(locked.outbound_id){run.outbound_id=locked.outbound_id;run.reply=locked.reply;return;}
        if(run.flow_kind==='shop'){
          if(!this.commerce)throw new ApiError(503,'Shopping engine is not configured.');
          const inbound=(await c.query('SELECT message FROM chat_messages WHERE id=$1 AND tenant_id=$2',[run.incoming_id,run.tenant_id])).rows[0];
          run.reply=await this.commerce.shoppingReply(c,actor,conversation,inbound.message,Number(run.id));
        }
        const message=(await c.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message,status) VALUES($1,$2,'out',$3,'queued') RETURNING id",[run.tenant_id,run.conversation_id,run.reply])).rows[0];run.outbound_id=message.id;
        await c.query('UPDATE automation_runs SET outbound_id=$2,reply=$3 WHERE id=$1',[run.id,message.id,run.reply]);
      });
      await this.campaigns.create({...actor,permissions:[...actor.permissions,'campaign:create']},'whatsapp',{name:`Automation run ${run.id}`,recipients:[conversation.phone],payload:{text:run.reply,chat_id:run.outbound_id,automation_run_id:run.id}},`automation-run-${run.id}`,true);
      await this.finish(run,'completed');
    }catch(e){await this.finish(run,'failed',e instanceof ApiError?e.message:'Automatic reply failed. Check server diagnostics.');}
  }finally{this.running=false;}}
  private async finish(run:any,status:string,error?:string){await this.db.query('UPDATE automation_runs SET status=$2,error=$3,lease_until=NULL WHERE id=$1',[run.id,status,error||null]);if(status!=='completed')await this.db.query('UPDATE chat_messages SET status=$2 WHERE id=$1',[run.outbound_id,status==='skipped'?'cancelled':'needs_attention']);}
}

