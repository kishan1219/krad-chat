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
  constructor(
    private cfg: Config,
    private campaigns: Campaigns,
    private chat: Chat,
    private billing: Billing,
    private db: Db,
    private providers = new Providers(cfg, db),
    private notify?: (tenant: number, event: any) => void
  ) {
    this.inbox = new WebhookInbox(db, body => this.processMeta(body));
  }
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
          const targetPhone = String(value.phone_number_id || value.metadata?.phone_number_id || '');
          const connections = (await this.db.query(
            "SELECT * FROM meta_connections WHERE status='connected' AND (($1 <> '' AND phone_number_id = $1) OR ($1 = '' AND waba_id = $2))",
            [targetPhone, String(entry.id)]
          )).rows;

          for(const connection of connections){
            let quality = connection.quality_rating || 'UNKNOWN';
            let tier = connection.messaging_limit_tier || 'TIER_1K';
            let verifiedName = connection.verified_name;

            if (value.current_limit) {
              tier = String(value.current_limit);
            }

            if (!connection.simulated) {
              try {
                const phone = await this.providers.meta(
                  `${connection.phone_number_id}?fields=id,quality_rating,messaging_limit_tier,verified_name,code_verification_status,display_phone_number`,
                  'GET',
                  undefined,
                  decrypt(connection.token_encrypted, this.cfg.ENCRYPTION_KEY)
                );
                if (phone.quality_rating) quality = phone.quality_rating;
                if (phone.messaging_limit_tier) tier = phone.messaging_limit_tier;
                if (phone.verified_name) verifiedName = phone.verified_name;
              } catch {
                // Keep direct webhook values if provider query fails
              }
            } else if (value.current_limit) {
              tier = String(value.current_limit);
            }

            const previousTier = connection.messaging_limit_tier || 'TIER_1K';
            const isUpgraded = value.event === 'UPGRADED' || (previousTier !== tier && tier !== 'TIER_50');

            await this.db.transaction(async c => {
              await c.query(
                `UPDATE meta_connections 
                 SET quality_rating=$2, messaging_limit_tier=$3, verified_name=COALESCE($4, verified_name), last_sync_at=now(), updated_at=now() 
                 WHERE id=$1`,
                [connection.id, quality, tier, verifiedName || null]
              );

              if (isUpgraded || previousTier !== tier) {
                const tierDesc = tier === 'TIER_UNLIMITED' ? 'Unlimited' : tier.replace('TIER_', '') + ' messages / 24h';
                const owners = (await c.query(
                  "SELECT id, email, name FROM users WHERE tenant_id=$1 AND role='admin' AND active=true",
                  [connection.tenant_id]
                )).rows;

                const notifData = {
                  title: `🚀 WhatsApp Messaging Tier Boosted to ${tier}!`,
                  message: `Meta has officially upgraded your WhatsApp Business messaging limit for ${connection.display_phone_number || connection.phone_number_id} to ${tier} (${tierDesc}). Your business can now initiate more conversations per rolling 24-hour window!`,
                  phone_number_id: connection.phone_number_id,
                  phone_number: connection.display_phone_number,
                  previous_tier: previousTier,
                  current_tier: tier,
                  tier,
                  event: value.event || 'UPGRADED',
                  type: 'meta_tier_upgrade',
                  is_owner_alert: true,
                  upgraded_at: new Date().toISOString()
                };

                await c.query(
                  `INSERT INTO resources(tenant_id, kind, data, created_by)
                   VALUES($1, 'notification', $2, $3)`,
                  [
                    connection.tenant_id,
                    JSON.stringify(notifData),
                    connection.created_by || 1
                  ]
                );
                await c.query(
                  "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'meta.tier.upgrade.owner_notified', $3)",
                  [connection.tenant_id, connection.created_by || 1, `${connection.phone_number_id}:${tier}:owners=${owners.length}`]
                );

                if (this.notify) {
                  this.notify(connection.tenant_id, {
                    command: 'notification',
                    type: 'meta_tier_upgrade',
                    data: notifData
                  });
                }
              }
            });
          }
          continue;
        }
        if(change.field==='phone_number_name_update'){
          const targetPhone = String(value.phone_number_id || value.metadata?.phone_number_id || '');
          const verifiedName = String(value.verified_name || '');
          if(verifiedName){
            await this.db.query(
              `UPDATE meta_connections SET verified_name=$2, code_verification_status='VERIFIED', updated_at=now() 
               WHERE status='connected' AND (($1 <> '' AND phone_number_id=$1) OR ($1 = '' AND waba_id=$3))`,
              [targetPhone, verifiedName, String(entry.id)]
            );
          }
          continue;
        }
        if (change.field !== 'messages') throw new ApiError(422, 'This event type requires a dedicated handler.');
        if (value.messages?.length) {
          const tenant = await this.chat.tenantForMeta(String(value.metadata?.phone_number_id));
          for (const message of value.messages) {
            const text = customerMessageText(message);
            await this.chat.incoming(tenant, message.from, text, message.id, String(value.metadata.phone_number_id), message.timestamp);
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
