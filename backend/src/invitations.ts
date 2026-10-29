import { hash } from 'bcryptjs';
import { z } from 'zod';
import { Actor, authorize } from './auth';
import { Db } from './db';
import { Providers } from './providers';
import { Config } from './config';
import { ApiError, idSchema, passwordSchema, sha256, token } from './common';

export class Invitations {
  constructor(private db:Db,private providers:Providers,private cfg:Config){}
  async list(actor:Actor){
    authorize(actor,'users:write');
    return (await this.db.query('SELECT id,email,name,role,expires_at,accepted_at,revoked_at,created_at FROM invitations WHERE tenant_id=$1 AND invited_by=$2 ORDER BY id DESC LIMIT 200',[actor.tenant_id,actor.id])).rows;
  }
  async create(actor:Actor,body:unknown){
    authorize(actor,'users:write');
    if(!['admin','reseller'].includes(actor.role))throw new ApiError(403,'Only administrators and resellers can invite employees.');
    const input=z.object({email:z.email().transform(v=>v.toLowerCase()),name:z.string().trim().min(1).max(100),role:z.enum(['operator','viewer'])}).strict().parse(body);
    const granted=input.role==='viewer'?[]:['chat:reply'];
    if(actor.role!=='admin'&&granted.some(p=>!actor.permissions.includes(p)))throw new ApiError(403,'Cannot grant permissions you do not have.');
    const secret=token();
    const row=await this.db.transaction(async c=>{
      if((await c.query('SELECT 1 FROM users WHERE email=$1',[input.email])).rowCount)throw new ApiError(409,'This email already has an account.');
      await c.query('UPDATE invitations SET revoked_at=now() WHERE tenant_id=$1 AND email=$2 AND invited_by=$3 AND accepted_at IS NULL AND revoked_at IS NULL',[actor.tenant_id,input.email,actor.id]);
      const row=(await c.query("INSERT INTO invitations(tenant_id,email,name,role,permissions,token_hash,invited_by,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,now()+interval '72 hours') RETURNING id,email,role,expires_at",[actor.tenant_id,input.email,input.name,input.role,granted,sha256(secret),actor.id])).rows[0];
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'invitation.created',$3)",[actor.tenant_id,actor.id,String(row.id)]);
      return row;
    });
    try {await this.providers.email(input.email,'Your messaging platform invitation',`You have been invited as ${input.role}. Open ${this.cfg.PUBLIC_API_URL}/accept-invitation#${secret} within 72 hours. If you did not expect this invitation, ignore it.`);}
    catch {await this.db.query('UPDATE invitations SET revoked_at=now() WHERE id=$1',[row.id]);throw new ApiError(503,'Invitation email failed. The invitation was revoked; please try again.');}
    return row;
  }
  async revoke(actor:Actor,id:unknown){
    authorize(actor,'users:write');
    return this.db.transaction(async c=>{
      const row=(await c.query('UPDATE invitations SET revoked_at=now() WHERE id=$1 AND tenant_id=$2 AND invited_by=$3 AND accepted_at IS NULL AND revoked_at IS NULL RETURNING id',[idSchema.parse(id),actor.tenant_id,actor.id])).rows[0];
      if(!row)throw new ApiError(404,'Active invitation not found.');
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'invitation.revoked',$3)",[actor.tenant_id,actor.id,String(row.id)]);return row;
    });
  }
  async accept(body:unknown){
    const input=z.object({token:z.string().min(32).max(200),password:passwordSchema}).strict().parse(body);
    const passwordHash=await hash(input.password,12);
    return this.db.transaction(async c=>{
      const invite=(await c.query('SELECT i.* FROM invitations i JOIN users u ON u.id=i.invited_by AND u.tenant_id=i.tenant_id WHERE i.token_hash=$1 AND i.accepted_at IS NULL AND i.revoked_at IS NULL AND i.expires_at>now() AND u.active=true FOR UPDATE OF i',[sha256(input.token)])).rows[0];
      if(!invite)throw new ApiError(422,'Invitation is expired, revoked or already used.');
      const user=(await c.query('INSERT INTO users(tenant_id,email,name,password_hash,role,permissions,parent_user_id) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id',[invite.tenant_id,invite.email,invite.name,passwordHash,invite.role,invite.permissions,invite.invited_by])).rows[0];
      await c.query('INSERT INTO wallets(tenant_id,user_id) VALUES($1,$2)',[invite.tenant_id,user.id]);
      await c.query('UPDATE invitations SET accepted_at=now() WHERE id=$1',[invite.id]);
      await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,$2,'invitation.accepted',$3)",[invite.tenant_id,user.id,String(invite.id)]);
      return {accepted:true,email:invite.email};
    });
  }
}
