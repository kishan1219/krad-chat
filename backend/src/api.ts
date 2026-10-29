import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Actor, Auth, authorize } from './auth';
import { ApiError, idSchema, pagination, pageResult } from './common';
import { Config } from './config';
import { Db } from './db';
import { Providers } from './providers';
import { Resources, permissions } from './resources';
import { Users } from './users';
import { Billing } from './billing';
import { Campaigns } from './campaigns';
import { Files } from './files';
import { Reports } from './reports';
import { Chat } from './chat';
import { Webhooks } from './webhooks';
import { Operations } from './operations';
import { frontendPermissions } from './frontend-permissions';
import { Commerce } from './commerce';
import { Automation } from './automation';
import { Invitations } from './invitations';
import { Workflows } from './workflows';
import { MetaConnections } from './meta-connections';
import { MetaOnboarding } from './meta-onboarding';
import { Broadcasts } from './broadcasts';
import { Features } from './features';
import { Logger } from './logger';
import { Organizations } from './organizations';
import { Plans } from './plans';
import { WhiteLabel } from './white-label';
import { ResellerService } from './reseller';
import { platformCache } from './cache';

export const campaignLists: Record<string, 'sms' | 'whatsapp' | 'voice'> = { 'campaign-list': 'sms', 'wa-campaigns': 'whatsapp', 'voice-campaign-list': 'voice', 'scheduled-campaign-report': 'sms' };
export const campaignCreates: Record<string, 'sms' | 'whatsapp' | 'voice'> = { 'send-sms': 'sms', 'wa-send-message': 'whatsapp', 'voice-sms': 'voice' };
export const bulkRoutes: Record<string, string> = { 'blacklist-action': 'blacklist', 'sender-id-action': 'sender_id', 'administration/dlrcode-action': 'dlr_code', 'administration/primary-route-action': 'primary_route', 'administration/secondary-route-action': 'secondary_route', 'administration/bulk-voice-file-action': 'voice_file' };
export const reportRoutes = ['delivery-report','detailed-report','report-by-mobile','get-report-by-time-frame','two-way-capture-record-log','two-way-link-click-log','twoway-report-log-export-by-camapign','twoway-report-response-export-by-camapign'];
export const summaryRoutes = ['msg-consumption-report','month-wise-submission-report','get-wa-summery','get-analytics','get-conversation-analytics','get-template-analytics','summary-report-by-template-group','overview-report-by-user','consumption-report-by-view','administration/get-daily-report','administration/user-wise-credit-info'];
export const exportRoutes = ['exports','report-export-by-id','report-export-by-sender-id','report-export-by-mobile','export-detailed-report','export-sms-report','export-wa-report','export-wa-conversation','get-wa-summery-download','report-export-by-voice-sms-id'];
export const uploadRoutes = ['file-upload','wa-campaign-file-upload','wa-file-upload','upload-wa-file','user-document'];

export class Api {
  private operations: Operations;
  private invitations: Invitations;
  private metaConnections: MetaConnections;
  private features: Features;
  private organizations: Organizations;
  private plans: Plans;
  private whiteLabel: WhiteLabel;
  private resellerService: ResellerService;
  constructor(private cfg: Config, private db: Db, private auth: Auth, private providers: Providers,
    private resources: Resources, private users: Users, private billing: Billing, private campaigns: Campaigns,
    private files: Files, private reports: Reports, private chat: Chat, private webhooks: Webhooks, private commerce:Commerce,private automation:Automation,private workflows:Workflows, features?: Features) {
    this.operations = new Operations(db, cfg, resources);
    this.invitations = new Invitations(db, providers, cfg);
    this.metaConnections = new MetaConnections(db, cfg, providers);
    this.features = features || new Features(db);
    this.organizations = new Organizations(db);
    this.plans = new Plans(db);
    this.whiteLabel = new WhiteLabel(db);
    this.resellerService = new ResellerService(db);
  }
  async handle(req: Request, res: Response) {
    const path = req.path.replace(/^\/+|\/+$/g, '');
    const body = req.body || {}; const method = req.method; const query = req.query;
    const unsafe = method !== 'GET';
    let data: any;
    if (path === 'health' || path === 'health/ready' || path === 'health/live' || path === 'healthz') {
      const start = performance.now();
      await this.db.query('SELECT 1');
      const latencyMs = Math.round((performance.now() - start) * 100) / 100;
      const mem = process.memoryUsage();
      const providerHealth = await this.providers.checkHealth();
      data = {
        status: providerHealth.status === 'degraded' ? 'degraded' : 'ok',
        healthy: true,
        timestamp: new Date().toISOString(),
        database: { status: 'connected', latency_ms: latencyMs },
        providers: providerHealth,
        cache: platformCache.getStats(),
        memory: {
          heap_used_mb: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100,
          heap_total_mb: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100,
          rss_mb: Math.round(mem.rss / 1024 / 1024 * 100) / 100
        },
        uptime_seconds: Math.floor(process.uptime()),
        provider_mode: this.cfg.PROVIDER_MODE
      };
    } else if (path === 'auth/refresh') {
      this.requirePost(method);
      data = await this.auth.rotateSession(body.refresh_token);
    } else if (path === 'invitations/accept') {
      this.requirePost(method); data = await this.invitations.accept(body);
    } else if (path === 'public-app-setting') {
      data = { name: 'Messaging', signup_enabled: this.cfg.ALLOW_SIGNUP };
    } else if (path === 'public/branding') {
      const domain = String(query.domain || req.headers.host || '');
      data = await platformCache.wrap(`branding:${domain}`, () => this.whiteLabel.resolvePublic(domain), 60000);
    } else if (path === 'plans' && method === 'GET') {
      data = await platformCache.wrap('plans:public', () => this.plans.list(), 60000);
    } else if (['login','sign-up','forgot-password','update-password','verify-otp','resent-otp'].includes(path)) {
      if (method !== 'POST') throw new ApiError(405, 'Use POST.');
      data = path === 'login' ? await this.auth.login(body) : path === 'sign-up' ? await this.auth.signup(body)
        : path === 'forgot-password' ? await this.auth.forgot(body) : path === 'update-password' ? await this.auth.reset(body)
          : path === 'verify-otp' ? await this.auth.verifyOtp(body) : await this.auth.resendOtp(body);
    } else if (path.startsWith('webhooks/')) {
      const provider = path.slice('webhooks/'.length);
      if (method === 'GET' && provider === 'meta') { res.type('text/plain').send(this.webhooks.verifyMeta(query)); return; }
      if (method !== 'POST') throw new ApiError(405, 'Use POST.');
      data = await this.webhooks.handle(provider, body, (req as any).rawBody || Buffer.alloc(0), req.headers, query);
    } else {
      const actor = await this.auth.authenticate(req.headers.authorization || '', req.ip);
      Logger.setTenantAndUser(actor.tenant_id, actor.id);
      data = await this.authenticated(actor, method, path, query, body, req, res);
      if (res.headersSent) return;
    }
    res.status(200).json({ error: false, code: 200, message: 'Success', data, outtime: new Date().toISOString() });
  }
  private requirePost(method: string) { if (method !== 'POST') throw new ApiError(405, 'Use POST.'); }
  private async authenticated(actor: Actor, method: string, path: string, query: any, body: any, req: Request, res: Response): Promise<any> {
    const broadcasts=new Broadcasts(this.db,this.campaigns);
    if(path==='auth/revoke-all'){
      this.requirePost(method);return this.auth.revokeAll(actor);
    }
    if(path==='auth/mfa/issue-step-up'){
      this.requirePost(method);return this.auth.issueMfaStepUp(actor);
    }
    if(path==='auth/mfa/verify-step-up'){
      this.requirePost(method);return this.auth.verifyMfaStepUp(actor,body);
    }
    if(path==='features'||path==='feature-flags'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.features.getAllFlags(actor.tenant_id);}
    if(path==='feature-flags/toggle'){
      authorize(actor,'admin');this.requirePost(method);
      const targetTenant = body.tenantId !== undefined ? Number(body.tenantId) : actor.tenant_id;
      await this.features.setFlag(targetTenant, String(body.featureKey), Boolean(body.enabled), body.metadata);
      platformCache.del(`features:${targetTenant}`);
      return { updated: true, featureKey: body.featureKey, enabled: Boolean(body.enabled) };
    }
    if(path==='organization'){
      if(method==='GET')return this.organizations.get(actor);
      if(method==='PATCH'||method==='POST')return this.organizations.update(actor,body);
      throw new ApiError(405,'Method not allowed.');
    }
    if(path==='administration/organizations'){
      if(method!=='GET')throw new ApiError(405,'Use GET.');
      return this.organizations.list(actor,query);
    }
    if(path==='administration/organization-status'){
      this.requirePost(method);
      const tenantId=Number(body.tenant_id??body.tenantId??actor.tenant_id);
      return this.organizations.updateStatus(actor,tenantId,body.status,body.reason);
    }
    if(path==='administration/plans'){
      if(method==='GET')return this.plans.list(actor);
      if(method==='POST'){
        const created = await this.plans.create(actor,body);
        platformCache.del('plans:public');
        return created;
      }
      throw new ApiError(405,'Method not allowed.');
    }
    const adminPlanDetail=/^administration\/plans\/(\d+)$/.exec(path);
    if(adminPlanDetail){
      if(method==='GET')return this.plans.get(adminPlanDetail[1]);
      if(['PATCH','PUT'].includes(method)){
        const updated = await this.plans.update(actor,adminPlanDetail[1],body);
        platformCache.del('plans:public');
        return updated;
      }
      throw new ApiError(405,'Method not allowed.');
    }
    if(path==='administration/assign-plan'){
      this.requirePost(method);return this.plans.assign(actor,body);
    }
    if(path==='subscription'){
      if(method!=='GET')throw new ApiError(405,'Use GET.');
      return this.plans.subscription(actor);
    }
    if(path==='white-label'){
      if(method==='GET')return this.whiteLabel.get(actor);
      if(['POST','PUT','PATCH'].includes(method)){
        const updated = await this.whiteLabel.update(actor,body);
        platformCache.invalidatePrefix('branding:');
        return updated;
      }
      throw new ApiError(405,'Method not allowed.');
    }
    if(path==='reseller/markup'){
      if(method==='GET')return this.resellerService.getMarkup(actor);
      if(['POST','PUT','PATCH'].includes(method))return this.resellerService.setMarkup(actor,body);
      throw new ApiError(405,'Method not allowed.');
    }
    if(path==='reseller/clients'){
      if(method!=='GET')throw new ApiError(405,'Use GET.');
      return this.resellerService.getClients(actor,query);
    }
    if(path==='reseller/reconciliation'){
      if(method!=='GET')throw new ApiError(405,'Use GET.');
      return this.resellerService.reconciliation(actor,query);
    }
    if(path==='client/usage-summary'){
      if(method!=='GET')throw new ApiError(405,'Use GET.');
      return this.resellerService.clientUsageSummary(actor,query.user_id?Number(query.user_id):undefined);
    }
    if(path==='whatsapp/senders'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.metaConnections.senders(actor);}
    if(path==='whatsapp/segments'){if(method!=='GET')throw new ApiError(405,'Use GET.');return broadcasts.segment(actor,query);}
    if(path==='whatsapp/broadcast-policy'){if(method==='GET')return broadcasts.policy(actor);this.requirePost(method);return broadcasts.policy(actor,body);}
    if(path==='whatsapp/consents'){if(method==='GET')return broadcasts.consent(actor);this.requirePost(method);return broadcasts.consent(actor,body);}
    const approval=/^whatsapp\/broadcasts\/(\d+)\/approve$/.exec(path);
    if(approval){this.requirePost(method);return broadcasts.approve(actor,approval[1]);}
    if(path==='whatsapp/connections'){if(method==='GET')return this.metaConnections.list(actor);this.requirePost(method);return this.metaConnections.connect(actor,body);}
    const templateAction=/^whatsapp\/connections\/(\d+)\/templates(?:\/(delete))?$/.exec(path);
    if(templateAction){this.requirePost(method);return templateAction[2]?this.metaConnections.deleteTemplate(actor,templateAction[1],body):this.metaConnections.createTemplate(actor,templateAction[1],body);}
    if(path.startsWith('whatsapp/onboarding/')){
      const onboarding=new MetaOnboarding(this.db,this.cfg,this.providers,this.metaConnections);
      if(path==='whatsapp/onboarding/history'){if(method!=='GET')throw new ApiError(405,'Use GET.');return onboarding.history(actor);}
      this.requirePost(method);
      if(path==='whatsapp/onboarding/begin')return onboarding.begin(actor);
      if(path==='whatsapp/onboarding/complete')return onboarding.complete(actor,body);
      throw new ApiError(404,'Unknown onboarding action.');
    }
    const connection=/^whatsapp\/connections\/(\d+)\/(subscribe|register|sync|disconnect)$/.exec(path);
    if(connection){this.requirePost(method);return this.metaConnections.action(actor,connection[1],connection[2],body);}
    if(path==='whatsapp/webhook-events'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.webhooks.inbox.list(actor);}
    const webhookRetry=/^whatsapp\/webhook-events\/(\d+)\/retry$/.exec(path);
    if(webhookRetry){this.requirePost(method);return this.webhooks.inbox.retry(actor,webhookRetry[1]);}
    if(path==='workflows'){if(method==='GET')return this.workflows.list(actor);this.requirePost(method);return this.workflows.save(actor,body);}
    if(path==='workflows/dry-run'){this.requirePost(method);return this.workflows.dryRun(actor,body);}
    if(path==='workflows/runs'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.workflows.runs(actor);}
    const workflowRun=/^workflows\/runs\/(\d+)(\/retry)?$/.exec(path);
    if(workflowRun){if(workflowRun[2]){this.requirePost(method);return this.workflows.retry(actor,workflowRun[1]);}if(method!=='GET')throw new ApiError(405,'Use GET.');return this.workflows.inspect(actor,workflowRun[1]);}
    const workflowDraft=/^workflows\/(\d+)$/.exec(path);
    if(workflowDraft){if(method!=='PATCH')throw new ApiError(405,'Use PATCH.');return this.workflows.save(actor,body,workflowDraft[1]);}
    const workflowPublish=/^workflows\/(\d+)\/publish$/.exec(path);
    if(workflowPublish){this.requirePost(method);return this.workflows.publish(actor,workflowPublish[1],body.enabled);}
    if(path==='invitations'){if(method==='GET')return this.invitations.list(actor);this.requirePost(method);return this.invitations.create(actor,body);}
    const invitation = /^invitations\/(\d+)\/revoke$/.exec(path);
    if(invitation){this.requirePost(method);return this.invitations.revoke(actor,invitation[1]);}
    if(path==='commerce/products'){
      if(method==='GET')return this.commerce.products(actor);
      this.requirePost(method);return this.commerce.saveProduct(actor,body);
    }
    if(path==='commerce/settings'){if(method==='GET')return this.commerce.settings(actor);this.requirePost(method);return this.commerce.settings(actor,body);}
    const product=/^commerce\/products\/(\d+)$/.exec(path);
    if(product){if(method!=='PATCH')throw new ApiError(405,'Use PATCH.');return this.commerce.saveProduct(actor,body,product[1]);}
    if(path==='commerce/orders'){
      if(method==='GET')return this.commerce.orders(actor);
      this.requirePost(method);return this.commerce.checkout(actor,body,String(req.headers['idempotency-key']||''));
    }
    const order=/^commerce\/orders\/([\w-]+)\/(status|mock-pay)$/.exec(path);
    if(order){this.requirePost(method);return order[2]==='status'?this.commerce.transition(actor,order[1],body):this.commerce.mockPay(actor,order[1]);}
    if(path==='automation/flows'){
      if(method==='GET')return this.automation.flows(actor);
      this.requirePost(method);return this.automation.create(actor,body);
    }
    const flow=/^automation\/flows\/(\d+)\/publish$/.exec(path);
    if(flow){this.requirePost(method);return this.automation.publish(actor,flow[1],body.enabled);}
    if(path==='automation/runs'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.automation.runs(actor);}
    const run=/^automation\/runs\/(\d+)\/retry$/.exec(path);
    if(run){this.requirePost(method);return this.automation.retry(actor,run[1]);}
    const readConversation=/^inbox\/conversations\/(\d+)\/read$/.exec(path);
    if(path==='inbox/agents'){if(method!=='GET')throw new ApiError(405,'Use GET.');return this.chat.agents(actor);}
    const inboxDetail=/^inbox\/conversations\/(\d+)(\/templates)?$/.exec(path);
    if(inboxDetail){if(method!=='GET')throw new ApiError(405,'Use GET.');return inboxDetail[2]?this.chat.templates(actor,inboxDetail[1]):this.chat.get(actor,inboxDetail[1]);}
    if(readConversation){this.requirePost(method);return this.chat.read(actor,readConversation[1],body);}
    const conversation=/^inbox\/conversations\/(\d+)\/(manage|notes)$/.exec(path);
    if(conversation){if(conversation[2]==='manage'){this.requirePost(method);return this.chat.manage(actor,conversation[1],body);}if(method==='GET')return this.chat.notes(actor,conversation[1]);this.requirePost(method);return this.chat.notes(actor,conversation[1],body);}
    if (path === 'logout') { this.requirePost(method); return this.auth.logout(actor); }
    if (['change-password','update-self-password'].includes(path)) { this.requirePost(method); return this.auth.changePassword(actor, body); }
    if (path === 'me' || path === 'get-app-setting') return { user: await this.users.get(actor), wallet: await this.billing.wallet(actor), provider_mode: this.cfg.PROVIDER_MODE };
    if (path === 'update-profile') { this.requirePost(method); return this.users.update(actor, actor.id, body, true); }
    if (['users','users-for-ddl'].includes(path)) return this.users.list(actor, query, body);
    if (path === 'user' && method === 'POST') return this.users.create(actor, body);
    const userId = /^user\/(\d+)$/.exec(path)?.[1];
    if (userId) {
      if (method === 'GET') return this.users.get(actor, userId);
      if (['PUT','PATCH'].includes(method)) return this.users.update(actor, userId, body);
      if (method === 'DELETE') return this.users.update(actor, userId, { active: false });
    }
    if (path === 'get-permissions' || path === 'get-all-permissions') return [...permissions, ...frontendPermissions].map(name => ({ name }));
    if (path === 'wallet') return this.billing.wallet(actor);
    if (path === 'user-credit') { this.requirePost(method); return this.billing.credit(actor, body); }
    if (path === 'user-credits') return this.billing.ledger(actor, query);
    if (path === 'credits/transfer') { this.requirePost(method); return this.billing.transfer(actor, body); }
    if (path === 'repush-campaign') {
      this.requirePost(method); return this.campaigns.resend(actor, body.campaign_id ?? body.send_sms_id, String(req.headers['idempotency-key'] || body.idempotency_key || ''));
    }
    if (path === 'resend-this-sms' || path === 'resend-this-voice-sms') {
      this.requirePost(method); return this.campaigns.resend(actor, body.campaign_id, String(req.headers['idempotency-key'] || body.idempotency_key || ''), body.message_id);
    }
    if (/^administration\/change-campaign-status-to-complete\/\d+$/.test(path)) return this.campaigns.finish(actor, path.split('/')[2]);
    if (path === 'payments/orders') { this.requirePost(method); return this.billing.order(actor, body); }
    if (campaignCreates[path] && method === 'POST') return this.campaigns.create(actor, campaignCreates[path], body, String(req.headers['idempotency-key'] || body.idempotency_key || ''));
    if (campaignLists[path]) return this.campaigns.list(actor, query, body, campaignLists[path]);
    const detail = /^(?:send-sms|wa-send-message|voice-sms|get-campaign-info|get-campaign-current-status|wa-get-campaign-info|wa-get-campaign-current-status|get-voice-campaign-info|get-voice-campaign-current-status)\/(\d+)$/.exec(path);
    if (detail) return this.campaigns.get(actor, detail[1]);
    if (['change-campaign-status-to-stop','change-voice-campaign-status-to-stop','administration/manage-campaign','administration/manage-voice-campaign'].includes(path)) {
      this.requirePost(method); return this.campaigns.cancel(actor, body.campaign_id ?? body.send_sms_id ?? body.voice_sms_id);
    }
    if (/^messages\/\d+\/reconcile$/.test(path)) { this.requirePost(method); return this.campaigns.reconcile(actor, path.split('/')[1], body); }
    if (path === 'dashboard') return this.reports.dashboard(actor);
    if (reportRoutes.includes(path)) return this.reports.messages(actor, query, body);
    if (summaryRoutes.includes(path)) return this.reports.summary(actor, body);
    if (exportRoutes.includes(path)) { this.requirePost(method); return this.reports.requestExport(actor, body); }
    if (path.startsWith('export-status/')) return this.reports.getExport(actor, z.uuid().parse(path.split('/')[1]));
    if (path.startsWith('download-export/')) {
      const job = await this.reports.getExport(actor, z.uuid().parse(path.split('/')[1]));
      if (job.status !== 'completed') throw new ApiError(409, 'Export not ready.');
      return this.sendFile(actor, job.file_id, res);
    }
    if (uploadRoutes.includes(path)) {
      this.requirePost(method); authorize(actor, 'resources:write');
      if (!req.file) throw new ApiError(422, 'Upload a file in the multipart field file.');
      return this.files.save(actor, req.file.originalname, req.file.mimetype, req.file.buffer);
    }
    if (path.startsWith('files/')) return this.sendFile(actor, z.uuid().parse(path.split('/')[1]), res);
    if (['contact-numbers-import','blacklists-import'].includes(path)) {
      this.requirePost(method);
      if (!req.file) throw new ApiError(422, 'Upload a CSV in the multipart field file.');
      return this.files.importContacts(actor, req.file.buffer, path === 'blacklists-import' ? 'blacklist' : 'contact', body.group_id ? idSchema.parse(body.group_id) : undefined);
    }
    if (['group-sample-file','black-list-sample-file','normal-sms-campaign-file','custom-sms-campaign-file','dlt-sample-file','vandor-dlr-sample-file'].includes(path)) {
      const csv = path === 'dlt-sample-file' ? 'name,template_id,message\r\nExample,approved-id,Hello\r\n' : path === 'vandor-dlr-sample-file' ? 'name,code,description\r\nDelivered,1,Delivered to recipient\r\n' : 'phone,name\r\n+919876543210,Example\r\n';
      res.type('text/csv').attachment('sample.csv').send(csv); return;
    }
    if (path === 'dlt-templates-import' || path === 'administration/dlrcode-vender-import') {
      this.requirePost(method); if (!req.file) throw new ApiError(422, 'Upload a CSV in the multipart field file.');
      return this.files.importMetadata(actor, req.file.buffer, path === 'dlt-templates-import' ? 'dlt_template' : 'dlr_code');
    }
    if (path === 'wa-reply-thread-users') return this.chat.conversations(actor, query);
    if (path === 'wa-reply-threads-case-wise') return this.chat.messages(actor, body, query);
    if (path === 'wa-send-reply-message') { this.requirePost(method); return this.chat.reply(actor, body); }
    if (path === 'wa-download-reply-file') return this.files.download(actor, z.uuid().parse(body.file_id));
    if (bulkRoutes[path]) { this.requirePost(method); if (path.startsWith('administration/')) authorize(actor, 'admin:write'); return this.resources.bulk(actor, bulkRoutes[path], body); }
    if (path === 'countries') return this.resources.list(actor, 'country', query, body);
    if (path === 'get-all-timezones') return Intl.supportedValuesOf('timeZone');
    if (path === 'wa-template-languages') return [{ code: 'en', name: 'English' }, { code: 'en_US', name: 'English (US)' }, { code: 'hi', name: 'Hindi' }];
    if (path === 'wa-pull-template' || path === 'wa-pull-all-template') {
      this.requirePost(method); authorize(actor, 'admin:write');
      return this.metaConnections.action(actor,body.connection_id,'sync');
    }
    if (path === 'wa-subscribe-apps' || /^wa-subscribed-apps\/\d+$/.test(path)) {
      this.requirePost(method); authorize(actor, 'admin:write');
      return this.metaConnections.action(actor,body.connection_id??path.split('/')[1],'subscribe');
    }
    if (path === 'view-login-log' || path === 'audit-logs') {
      authorize(actor, 'admin:write'); const p = pagination(query);
      const total = Number((await this.db.query('SELECT count(*) FROM audit_logs WHERE tenant_id=$1', [actor.tenant_id])).rows[0].count);
      return pageResult((await this.db.query('SELECT * FROM audit_logs WHERE tenant_id=$1 ORDER BY id DESC LIMIT $2 OFFSET $3', [actor.tenant_id, p.perPage, p.offset])).rows, total, p.page, p.perPage);
    }
    if (path === 'dev/mailbox' || path === 'dev/incoming-message' || path === 'dev/payment-captured') {
      authorize(actor, 'admin:write');
      if (this.cfg.PROVIDER_MODE !== 'mock' || this.cfg.NODE_ENV === 'production') throw new ApiError(404, 'Not found.');
      if (path === 'dev/mailbox') {
        const email = z.email().parse(body.email);
        if (!(await this.db.query('SELECT 1 FROM users WHERE tenant_id=$1 AND email=$2', [actor.tenant_id, email])).rowCount) throw new ApiError(404, 'User not found.');
        return this.providers.mailbox.filter(m => m.to === email);
      }
      this.requirePost(method);
      if (path === 'dev/incoming-message') return this.chat.incoming(actor.tenant_id, z.string().parse(body.phone), z.string().max(10000).parse(body.message), `mock-in-${randomUUID()}`);
      const order = (await this.db.query('SELECT * FROM payment_orders WHERE id=$1 AND tenant_id=$2', [body.order_id, actor.tenant_id])).rows[0];
      if (!order || !order.id.startsWith('order_mock_')) throw new ApiError(404, 'Mock payment order not found.');
      await this.billing.captured({ event: 'payment.captured', payload: { payment: { entity: { id: `pay_${order.id}`, order_id: order.id, currency: 'INR', status: 'captured', amount: Number(order.amount) } } } });
      return this.billing.wallet(actor);
    }
    const operation = await this.operations.handle(actor, method, path, body, query);
    if (operation.handled) return operation.data;
    const resource = await this.resources.handle(actor, method, path, query, body);
    if (resource.handled) return resource.data;
    // Legacy features whose actual semantics cannot be inferred from route names are explicit gaps.
    throw new ApiError(501, 'This legacy operation is not implemented. See docs/API_COVERAGE.md for the supported contract.', { path, method });
  }
  private async sendFile(actor: Actor, id: string, res: Response) {
    const result = await this.files.download(actor, id);
    if (result.url) return { download_url: result.url, expires_in: 300 };
    res.type(result.file.mime).attachment(result.file.name).send(result.buffer);
  }
}
