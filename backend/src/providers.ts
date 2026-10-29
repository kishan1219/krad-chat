import { randomUUID } from 'node:crypto';
import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';
import { Config, requiredEnv } from './config';
import { Db } from './db';
import { decrypt } from './common';

export type Channel = 'sms' | 'whatsapp' | 'voice';
export class ProviderFailure extends Error {
  constructor(message: string, public uncertain = false, public retryable = false) { super(message); }
}
export type SendInput = { id: string; tenant_id?: number; recipient: string; channel: Channel; payload: Record<string, any> };
export type SendResult = { provider: string; id: string; simulated: boolean };
export class Providers {
  // Development mailbox is available only through an authenticated admin endpoint.
  readonly mailbox: { to: string; subject: string; text: string; at: string }[] = [];
  constructor(private cfg: Config,private db?:Db) {}
  async send(input: SendInput): Promise<SendResult> {
    if (this.cfg.PROVIDER_MODE === 'mock') return { provider: 'mock', id: `mock-${input.id}`, simulated: true };
    if (input.channel === 'sms') return this.sms(input);
    if (input.channel === 'whatsapp') return this.whatsapp(input);
    return this.voice(input);
  }
  private async request(url: string, init: RequestInit, retries = 2): Promise<any> {
    let lastError: any;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, { ...init, signal: AbortSignal.timeout(20000) });
        const body = await response.json().catch(() => null);
        if (response.status === 429 && attempt < retries) {
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)));
          continue;
        }
        if (!response.ok) {
          throw new ProviderFailure(`Provider returned HTTP ${response.status}`, response.status >= 500, response.status === 429);
        }
        if (!body) throw new ProviderFailure('Provider response could not be decoded.', true);
        return body;
      } catch (err: any) {
        lastError = err;
        if (err instanceof ProviderFailure && !err.retryable) throw err;
        if (attempt < retries && (err?.name === 'TimeoutError' || err?.code === 'ECONNRESET')) {
          await new Promise(r => setTimeout(r, 500 * (attempt + 1)));
          continue;
        }
        break;
      }
    }
    if (lastError instanceof ProviderFailure) throw lastError;
    throw new ProviderFailure('Provider timeout/network failure; reconcile before retrying.', true, true);
  }
  async checkHealth(): Promise<{ status: 'ok' | 'degraded'; mode: string; providers: Record<string, string> }> {
    const details: Record<string, string> = {
      mode: this.cfg.PROVIDER_MODE,
      sms: this.cfg.PROVIDER_MODE === 'mock' ? 'mocked' : (process.env.MSG91_AUTH_KEY ? 'configured' : 'missing_credentials'),
      meta: this.cfg.PROVIDER_MODE === 'mock' ? 'mocked' : (process.env.META_ACCESS_TOKEN ? 'configured' : 'missing_credentials'),
      email: this.cfg.PROVIDER_MODE === 'mock' ? 'mocked' : (process.env.AWS_REGION && process.env.EMAIL_FROM ? 'configured' : 'missing_credentials'),
      payment: this.cfg.PROVIDER_MODE === 'mock' ? 'mocked' : (process.env.RAZORPAY_KEY_ID ? 'configured' : 'missing_credentials')
    };
    const degraded = Object.values(details).some(v => v === 'missing_credentials');
    return {
      status: degraded ? 'degraded' : 'ok',
      mode: this.cfg.PROVIDER_MODE,
      providers: details
    };
  }
  private async sms(input: SendInput): Promise<SendResult> {
    const key = requiredEnv('MSG91_AUTH_KEY');
    const flow = input.payload.flow_id || requiredEnv('MSG91_FLOW_ID');
    // Flow variables must match the approved MSG91 flow; arbitrary body text is not a template.
    if (!input.payload.variables || typeof input.payload.variables !== 'object') throw new ProviderFailure('SMS campaign requires variables matching the approved MSG91 flow.');
    const response = await this.request('https://control.msg91.com/api/v5/flow/', {
      method: 'POST', headers: { authkey: key, 'Content-Type': 'application/json' },
      body: JSON.stringify({ flow_id: flow, recipients: [{ ...input.payload.variables, mobiles: input.recipient.replace('+', '') }] })
    });
    if (response.type !== 'success') throw new ProviderFailure('MSG91 rejected the submission.');
    if (!response.message) throw new ProviderFailure('MSG91 did not return a request ID.', true);
    return { provider: 'msg91', id: String(response.message), simulated: false };
  }
  async meta(path: string, method = 'GET', body?: unknown,accessToken?:string) {
    const version = requiredEnv('META_GRAPH_VERSION');
    if (!/^v\d+\.\d+$/.test(version)) throw new Error('META_GRAPH_VERSION must be explicit, e.g. vXX.0.');
    return this.request(`https://graph.facebook.com/${version}/${path}`, { method, headers: { Authorization: `Bearer ${accessToken||requiredEnv('META_ACCESS_TOKEN')}`, 'Content-Type': 'application/json' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  }
  async exchangeMetaCode(code:string):Promise<string>{
    if(this.cfg.PROVIDER_MODE==='mock')return 'local-simulation-no-live-token';
    const version=requiredEnv('META_GRAPH_VERSION');if(!/^v\d+\.\d+$/.test(version))throw new ProviderFailure('Invalid Meta Graph version.');
    const params=new URLSearchParams({client_id:requiredEnv('META_APP_ID'),client_secret:requiredEnv('META_APP_SECRET'),code});
    const result=await this.request(`https://graph.facebook.com/${version}/oauth/access_token?${params}`,{method:'GET'});
    if(typeof result.access_token!=='string'||!result.access_token)throw new ProviderFailure('Meta did not return an access token.');
    return result.access_token;
  }
  private async whatsapp(input: SendInput): Promise<SendResult> {
    if (!input.payload.template && !input.payload.text) throw new ProviderFailure('WhatsApp requires a template or validated service-window text.');
    const connection=this.db&&(await this.db.query("SELECT * FROM meta_connections WHERE tenant_id=$1 AND phone_number_id=$2 AND status='connected' AND simulated=false",[input.tenant_id,input.payload.phone_number_id])).rows[0];
    if(!connection)throw new ProviderFailure('No verified WhatsApp connection is available for this business.');
    const response = await this.meta(`${connection.phone_number_id}/messages`, 'POST', {
      messaging_product: 'whatsapp', recipient_type: 'individual', to: input.recipient.replace('+', ''),
      ...(input.payload.text ? { type: 'text', text: { body: input.payload.text } } : { type: 'template', template: input.payload.template }), biz_opaque_callback_data: input.id
    },decrypt(connection.token_encrypted,this.cfg.ENCRYPTION_KEY));
    if (!response.messages?.[0]?.id) throw new ProviderFailure('Meta did not return a message ID.', true);
    return { provider: 'meta', id: response.messages[0].id, simulated: false };
  }
  private async voice(input: SendInput): Promise<SendResult> {
    const host = process.env.EXOTEL_HOST || 'api.in.exotel.com';
    if (!['api.in.exotel.com', 'api.exotel.com'].includes(host)) throw new Error('Unsupported EXOTEL_HOST.');
    const auth = Buffer.from(`${requiredEnv('EXOTEL_API_KEY')}:${requiredEnv('EXOTEL_API_TOKEN')}`).toString('base64');
    const form = new URLSearchParams({ From: input.recipient, CallerId: requiredEnv('EXOTEL_CALLER_ID'), Url: requiredEnv('EXOTEL_FLOW_URL'),
      StatusCallback: `${this.cfg.PUBLIC_API_URL}/api/webhooks/voice?secret=${encodeURIComponent(requiredEnv('VOICE_WEBHOOK_SECRET'))}`, StatusCallbackEvents: 'terminal' });
    const response = await this.request(`https://${host}/v1/Accounts/${encodeURIComponent(requiredEnv('EXOTEL_ACCOUNT_SID'))}/Calls/connect.json`, {
      method: 'POST', headers: { Authorization: `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' }, body: form
    });
    if (!response.Call?.Sid) throw new ProviderFailure('Exotel did not return a call ID.', true);
    return { provider: 'exotel', id: response.Call.Sid, simulated: false };
  }
  async email(to: string, subject: string, text: string) {
    if (this.cfg.PROVIDER_MODE === 'mock') {
      this.mailbox.push({ to, subject, text, at: new Date().toISOString() });
      if (this.mailbox.length > 100) this.mailbox.shift();
      return;
    }
    const client = new SESClient({ region: requiredEnv('AWS_REGION') });
    await client.send(new SendEmailCommand({ Source: requiredEnv('EMAIL_FROM'), Destination: { ToAddresses: [to] }, Message: { Subject: { Data: subject }, Body: { Text: { Data: text } } } }));
  }
  async paymentOrder(amount: number, receipt: string) {
    if (this.cfg.PROVIDER_MODE === 'mock') return { id: `order_mock_${randomUUID()}`, amount, currency: 'INR', simulated: true };
    return this.request('https://api.razorpay.com/v1/orders', { method: 'POST',
      headers: { Authorization: `Basic ${Buffer.from(`${requiredEnv('RAZORPAY_KEY_ID')}:${requiredEnv('RAZORPAY_KEY_SECRET')}`).toString('base64')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, currency: 'INR', receipt }) });
  }
}
