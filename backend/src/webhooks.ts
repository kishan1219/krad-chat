import { WebhookInbox } from './webhook-inbox';
import { Db } from './db';
import { ApiError, decrypt, equalSecret, parseSignedRequest, sha256, verifyHmac } from './common';
import { Providers } from './providers';
import { Config, requiredEnv } from './config';
import { Billing } from './billing';
import { Campaigns } from './campaigns';
import { Chat } from './chat';
import { customerMessageText } from './whatsapp-message';

export class Webhooks {
  readonly inbox: WebhookInbox;
  constructor(private cfg: Config, private campaigns: Campaigns, private chat: Chat, private billing: Billing, private db:Db,private providers=new Providers(cfg,db)) { this.inbox=new WebhookInbox(db,body=>this.processMeta(body)); }
  private async processMeta(body:any) {
      for (const entry of body.entry || []) for (const change of entry.changes || []) {
        const value = change.value || {};
        if(change.field==='message_template_status_update'){
          const status=String(value.event||'').toUpperCase();
          if(!['APPROVED','PENDING','REJECTED','PAUSED','DISABLED','IN_APPEAL','DELETED'].includes(status))throw new ApiError(422,'Unknown template status.');
          await this.db.query(`UPDATE meta_connections SET templates=COALESCE((SELECT jsonb_agg(CASE WHEN t->>'id'=$2 THEN t||jsonb_build_object('status',$3::text) ELSE t END) FROM jsonb_array_elements(templates) t),'[]'::jsonb),updated_at=now() WHERE waba_id=$1`,[String(entry.id),String(value.message_template_id),status]);
          continue;
        }
        if(change.field==='phone_number_quality_update'){
          // A health notification is a signal to read current state, not itself a quality rating.
          const connections=(await this.db.query("SELECT * FROM meta_connections WHERE waba_id=$1 AND status='connected'",[String(entry.id)])).rows;
          for(const connection of connections){
            if(connection.simulated)continue;
            const phone=await this.providers.meta(`${connection.phone_number_id}?fields=id,quality_rating`,'GET',undefined,decrypt(connection.token_encrypted,this.cfg.ENCRYPTION_KEY));
            await this.db.query('UPDATE meta_connections SET quality_rating=$2,updated_at=now() WHERE id=$1',[connection.id,phone.quality_rating||'UNKNOWN']);
          }continue;
        }
        if (change.field !== 'messages') throw new ApiError(422, 'This event type requires a dedicated handler.');
        if (value.messages?.length) {
          const tenant = await this.chat.tenantForMeta(String(value.metadata?.phone_number_id));
          for (const message of value.messages) {
            const text = customerMessageText(message);
            await this.chat.incoming(tenant, message.from, text, message.id,String(value.metadata.phone_number_id));
          }
        }
        for (const item of value.statuses || []) {
          await this.campaigns.delivery('meta', item.id, item.status === 'sent' ? 'submitted' : item.status, `${item.id}:${item.status}:${item.timestamp}`, item);
        }
      }
  }
  verifyMeta(query: any) {
    if (query['hub.mode'] !== 'subscribe' || !equalSecret(String(query['hub.verify_token'] || ''), requiredEnv('META_VERIFY_TOKEN'))) throw new ApiError(403, 'Webhook verification failed.');
    return String(query['hub.challenge'] || '');
  }
  async handle(provider: string, body: any, raw: Buffer, headers: Record<string, any>, query: any) {
    if (provider === 'meta') {
      const signature = String(headers['x-hub-signature-256'] || '').replace(/^sha256=/, '');
      if (!verifyHmac(raw, signature, requiredEnv('META_APP_SECRET'))) throw new ApiError(403, 'Invalid Meta signature.');
      return this.inbox.receive(body);
    } else if (provider === 'meta-data-deletion' || provider === 'meta-deauthorize') {
      const signedRequest = body.signed_request || query.signed_request;
      let userId = 'user';
      if (signedRequest) {
        const parsed = parseSignedRequest(String(signedRequest), requiredEnv('META_APP_SECRET'));
        userId = parsed.user_id || 'user';
      }
      const confirmationCode = `del_${sha256(userId + Date.now().toString()).slice(0, 16)}`;
      const host = String(headers['x-forwarded-host'] || headers.host || 'localhost:3000');
      const proto = String(headers['x-forwarded-proto'] || (host.includes('localhost') ? 'http' : 'https'));
      return {
        url: `${proto}://${host}/data-deletion?id=${confirmationCode}`,
        confirmation_code: confirmationCode
      };
    } else if (provider === 'payments') {
      if (!verifyHmac(raw, String(headers['x-razorpay-signature'] || ''), requiredEnv('RAZORPAY_WEBHOOK_SECRET'))) throw new ApiError(403, 'Invalid payment signature.');
      await this.billing.captured(body);
    } else if (provider === 'sms' || provider === 'voice') {
      const expected = requiredEnv(provider === 'sms' ? 'SMS_WEBHOOK_SECRET' : 'VOICE_WEBHOOK_SECRET');
      if (!equalSecret(String(headers['x-webhook-secret'] || query.secret || ''), expected)) throw new ApiError(403, 'Invalid callback secret.');
      if (provider === 'voice') {
        const status = body.Status === 'completed' ? 'delivered' : ['failed','busy','no-answer','canceled'].includes(body.Status) ? 'failed' : 'submitted';
        await this.campaigns.delivery('exotel', String(body.CallSid || body.Sid || ''), status, sha256(raw.toString()), body);
      } else {
        // Normalize the account's MSG91 callback format at this boundary. Canonical format is documented.
        const events = Array.isArray(body) ? body : [body];
        for (const event of events) {
          const providerId = String(event.request_id || event.requestId || '');
          const rawStatus = String(event.status || '').toLowerCase();
          const status = ['delivered','1'].includes(rawStatus) ? 'delivered' : ['failed','2','rejected'].includes(rawStatus) ? 'failed' : rawStatus === 'submitted' ? 'submitted' : null;
          if (!providerId || !status) throw new ApiError(422, 'SMS callback requires request_id and delivered/failed/submitted status.');
          await this.campaigns.delivery('msg91', providerId, status, String(event.event_id || sha256(JSON.stringify(event))), event);
        }
      }
    } else if (provider === 'mock') {
      throw new ApiError(403, 'Mock callbacks must use the authenticated development endpoint.');
    } else throw new ApiError(404, 'Unknown webhook provider.');
    return { received: true };
  }
}
