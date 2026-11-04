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
import {
  DEFAULT_CACHE_TTL_MS,
  PRESIGNED_URL_EXPIRES_SECONDS,
  MAX_INCOMING_MESSAGE_LENGTH
} from './constants';
import {
  organizationStatusUpdateSchema,
  featureFlagToggleSchema,
  repushCampaignSchema,
  resendMessageSchema,
  stopCampaignSchema,
  devIncomingMessageSchema
} from './api-schemas';

export const campaignLists: Record<string, 'sms' | 'whatsapp' | 'voice'> = {
  'campaign-list': 'sms',
  'wa-campaigns': 'whatsapp',
  'voice-campaign-list': 'voice',
  'scheduled-campaign-report': 'sms'
};

export const campaignCreates: Record<string, 'sms' | 'whatsapp' | 'voice'> = {
  'send-sms': 'sms',
  'wa-send-message': 'whatsapp',
  'voice-sms': 'voice'
};

export const bulkRoutes: Record<string, string> = {
  'blacklist-action': 'blacklist',
  'sender-id-action': 'sender_id',
  'administration/dlrcode-action': 'dlr_code',
  'administration/primary-route-action': 'primary_route',
  'administration/secondary-route-action': 'secondary_route',
  'administration/bulk-voice-file-action': 'voice_file'
};

export const reportRoutes = [
  'delivery-report',
  'detailed-report',
  'report-by-mobile',
  'get-report-by-time-frame',
  'two-way-capture-record-log',
  'two-way-link-click-log',
  'twoway-report-log-export-by-camapign',
  'twoway-report-response-export-by-camapign'
];

export const summaryRoutes = [
  'msg-consumption-report',
  'month-wise-submission-report',
  'get-wa-summery',
  'get-analytics',
  'get-conversation-analytics',
  'get-template-analytics',
  'summary-report-by-template-group',
  'overview-report-by-user',
  'consumption-report-by-view',
  'administration/get-daily-report',
  'administration/user-wise-credit-info'
];

export const exportRoutes = [
  'exports',
  'report-export-by-id',
  'report-export-by-sender-id',
  'report-export-by-mobile',
  'export-detailed-report',
  'export-sms-report',
  'export-wa-report',
  'export-wa-conversation',
  'get-wa-summery-download',
  'report-export-by-voice-sms-id'
];

export const uploadRoutes = [
  'file-upload',
  'wa-campaign-file-upload',
  'wa-file-upload',
  'upload-wa-file',
  'user-document'
];

/**
 * Main API Dispatcher & Controller Layer
 * Handles routing, parameter validation, role checks, and delegates business logic to specialized services.
 */
export class Api {
  private operations: Operations;
  private invitations: Invitations;
  private metaConnections: MetaConnections;
  private metaOnboarding: MetaOnboarding;
  private broadcasts: Broadcasts;
  private features: Features;
  private organizations: Organizations;
  private plans: Plans;
  private whiteLabel: WhiteLabel;
  private resellerService: ResellerService;

  constructor(
    private cfg: Config,
    private db: Db,
    private auth: Auth,
    private providers: Providers,
    private resources: Resources,
    private users: Users,
    private billing: Billing,
    private campaigns: Campaigns,
    private files: Files,
    private reports: Reports,
    private chat: Chat,
    private webhooks: Webhooks,
    private commerce: Commerce,
    private automation: Automation,
    private workflows: Workflows,
    features?: Features
  ) {
    this.operations = new Operations(db, cfg, resources);
    this.invitations = new Invitations(db, providers, cfg);
    this.metaConnections = new MetaConnections(db, cfg, providers);
    this.metaOnboarding = new MetaOnboarding(db, cfg, providers, this.metaConnections);
    this.broadcasts = new Broadcasts(db, campaigns);
    this.features = features || new Features(db);
    this.organizations = new Organizations(db);
    this.plans = new Plans(db);
    this.whiteLabel = new WhiteLabel(db);
    this.resellerService = new ResellerService(db);
  }

  /**
   * Primary entrypoint for /api requests.
   */
  async handle(req: Request, res: Response): Promise<void> {
    const path = req.path.replace(/^\/+|\/+$/g, '');
    const body = req.body || {};
    const method = req.method;
    const query = req.query;

    let data: any;

    // 1. Health & Readiness Probes
    if (path === 'health' || path === 'health/ready' || path === 'health/live' || path === 'healthz') {
      data = await this.checkHealth();
    }
    // 2. Public Auth & Onboarding Handlers
    else if (path === 'auth/refresh') {
      this.requireMethod(method, ['POST'], res);
      data = await this.auth.rotateSession(body.refresh_token);
    } else if (path === 'invitations/accept') {
      this.requireMethod(method, ['POST'], res);
      data = await this.invitations.accept(body);
    } else if (path === 'public-app-setting') {
      data = { name: 'Messaging', signup_enabled: this.cfg.ALLOW_SIGNUP };
    } else if (path === 'public/branding') {
      const domain = String(query.domain || req.headers.host || '');
      data = await platformCache.wrap(`branding:${domain}`, () => this.whiteLabel.resolvePublic(domain), DEFAULT_CACHE_TTL_MS);
    } else if (path === 'plans' && method === 'GET') {
      data = await platformCache.wrap('plans:public', () => this.plans.list(), DEFAULT_CACHE_TTL_MS);
    } else if (['login', 'sign-up', 'forgot-password', 'update-password', 'verify-otp', 'resent-otp'].includes(path)) {
      this.requireMethod(method, ['POST'], res);
      data = path === 'login' ? await this.auth.login(body)
        : path === 'sign-up' ? await this.auth.signup(body)
        : path === 'forgot-password' ? await this.auth.forgot(body)
        : path === 'update-password' ? await this.auth.reset(body)
        : path === 'verify-otp' ? await this.auth.verifyOtp(body)
        : await this.auth.resendOtp(body);
    }
    // 3. Webhook Ingestion Handlers
    else if (path.startsWith('webhooks/')) {
      const provider = path.slice('webhooks/'.length);
      if (method === 'GET' && provider === 'meta') {
        res.type('text/plain').send(this.webhooks.verifyMeta(query));
        return;
      }
      this.requireMethod(method, ['POST'], res);
      data = await this.webhooks.handle(provider, body, (req as any).rawBody || Buffer.alloc(0), req.headers, query);
    }
    // 4. Authenticated API Pipeline
    else {
      const actor = await this.auth.authenticate(req.headers.authorization || '', req.ip);
      Logger.setTenantAndUser(actor.tenant_id, actor.id);
      data = await this.authenticated(actor, method, path, query, body, req, res);
      if (res.headersSent) return;
    }

    // Standardized response payload ensuring both legacy and modern contract compatibility
    const timestamp = new Date().toISOString();
    res.status(200).json({
      error: false,
      success: true,
      code: 200,
      message: 'Success',
      data,
      timestamp,
      outtime: timestamp
    });
  }

  /**
   * Health check diagnostic collector.
   */
  private async checkHealth(): Promise<Record<string, any>> {
    const start = performance.now();
    await this.db.query('SELECT 1');
    const latencyMs = Math.round((performance.now() - start) * 100) / 100;
    const mem = process.memoryUsage();
    const providerHealth = await this.providers.checkHealth();

    return {
      status: providerHealth.status === 'degraded' ? 'degraded' : 'ok',
      healthy: true,
      timestamp: new Date().toISOString(),
      database: { status: 'connected', latency_ms: latencyMs },
      providers: providerHealth,
      cache: platformCache.getStats(),
      memory: {
        heap_used_mb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
        heap_total_mb: Math.round((mem.heapTotal / 1024 / 1024) * 100) / 100,
        rss_mb: Math.round((mem.rss / 1024 / 1024) * 100) / 100
      },
      uptime_seconds: Math.floor(process.uptime()),
      provider_mode: this.cfg.PROVIDER_MODE
    };
  }

  /**
   * HTTP Method Validator conforming to RFC 7231 (sets Allow header on 405).
   */
  private requireMethod(current: string, allowed: string[], res: Response): void {
    if (!allowed.includes(current)) {
      res.setHeader('Allow', allowed.join(', '));
      throw new ApiError(405, `Use ${allowed.join(' or ')}.`);
    }
  }

  /**
   * Dispatches authenticated endpoints to modular domain sub-handlers.
   */
  private async authenticated(
    actor: Actor,
    method: string,
    path: string,
    query: any,
    body: any,
    req: Request,
    res: Response
  ): Promise<any> {
    // 1. Auth & MFA Controls
    if (path === 'auth/revoke-all') {
      this.requireMethod(method, ['POST'], res);
      return this.auth.revokeAll(actor);
    }
    if (path === 'auth/mfa/issue-step-up') {
      this.requireMethod(method, ['POST'], res);
      return this.auth.issueMfaStepUp(actor);
    }
    if (path === 'auth/mfa/verify-step-up') {
      this.requireMethod(method, ['POST'], res);
      return this.auth.verifyMfaStepUp(actor, body);
    }

    // 2. Feature Flags
    if (path === 'features' || path === 'feature-flags') {
      this.requireMethod(method, ['GET'], res);
      return this.features.getAllFlags(actor.tenant_id);
    }
    if (path === 'feature-flags/toggle') {
      authorize(actor, 'admin');
      this.requireMethod(method, ['POST'], res);
      const input = featureFlagToggleSchema.parse(body);
      const targetTenant = input.tenantId ?? actor.tenant_id;
      await this.features.setFlag(targetTenant, input.featureKey, input.enabled, input.metadata);
      platformCache.del(`features:${targetTenant}`);
      return { updated: true, featureKey: input.featureKey, enabled: input.enabled };
    }

    // 3. Organization Lifecycle & Administration
    if (path === 'organization') {
      if (method === 'GET') return this.organizations.get(actor);
      if (method === 'PATCH' || method === 'POST') return this.organizations.update(actor, body);
      this.requireMethod(method, ['GET', 'PATCH', 'POST'], res);
    }
    if (path === 'administration/organizations') {
      this.requireMethod(method, ['GET'], res);
      return this.organizations.list(actor, query);
    }
    if (path === 'administration/organization-status') {
      this.requireMethod(method, ['POST'], res);
      const input = organizationStatusUpdateSchema.parse({
        ...body,
        tenant_id: body.tenant_id ?? body.tenantId ?? actor.tenant_id
      });
      return this.organizations.updateStatus(actor, input.tenant_id!, input.status, input.reason);
    }

    // 4. Plans & Subscriptions
    if (path === 'administration/plans') {
      if (method === 'GET') return this.plans.list(actor);
      if (method === 'POST') {
        const created = await this.plans.create(actor, body);
        platformCache.del('plans:public');
        return created;
      }
      this.requireMethod(method, ['GET', 'POST'], res);
    }
    const adminPlanDetail = /^administration\/plans\/(\d+)$/.exec(path);
    if (adminPlanDetail) {
      if (method === 'GET') return this.plans.get(adminPlanDetail[1]);
      if (['PATCH', 'PUT'].includes(method)) {
        const updated = await this.plans.update(actor, adminPlanDetail[1], body);
        platformCache.del('plans:public');
        return updated;
      }
      this.requireMethod(method, ['GET', 'PATCH', 'PUT'], res);
    }
    if (path === 'administration/assign-plan') {
      this.requireMethod(method, ['POST'], res);
      return this.plans.assign(actor, body);
    }
    if (path === 'subscription') {
      this.requireMethod(method, ['GET'], res);
      return this.plans.subscription(actor);
    }

    // 5. White-label & Reseller Operations
    if (path === 'white-label') {
      if (method === 'GET') return this.whiteLabel.get(actor);
      if (['POST', 'PUT', 'PATCH'].includes(method)) {
        const updated = await this.whiteLabel.update(actor, body);
        platformCache.invalidatePrefix('branding:');
        return updated;
      }
      this.requireMethod(method, ['GET', 'POST', 'PUT', 'PATCH'], res);
    }
    if (path === 'reseller/markup') {
      if (method === 'GET') return this.resellerService.getMarkup(actor);
      if (['POST', 'PUT', 'PATCH'].includes(method)) return this.resellerService.setMarkup(actor, body);
      this.requireMethod(method, ['GET', 'POST', 'PUT', 'PATCH'], res);
    }
    if (path === 'reseller/clients') {
      this.requireMethod(method, ['GET'], res);
      return this.resellerService.getClients(actor, query);
    }
    if (path === 'reseller/reconciliation') {
      this.requireMethod(method, ['GET'], res);
      return this.resellerService.reconciliation(actor, query);
    }
    if (path === 'client/usage-summary') {
      this.requireMethod(method, ['GET'], res);
      return this.resellerService.clientUsageSummary(actor, query.user_id ? Number(query.user_id) : undefined);
    }

    // 6. WhatsApp Connections, Broadcasts & Meta Onboarding
    if (path === 'whatsapp/senders') {
      this.requireMethod(method, ['GET'], res);
      return this.metaConnections.senders(actor);
    }
    if (path === 'whatsapp/segments') {
      this.requireMethod(method, ['GET'], res);
      return this.broadcasts.segment(actor, query);
    }
    if (path === 'whatsapp/broadcast-policy') {
      if (method === 'GET') return this.broadcasts.policy(actor);
      this.requireMethod(method, ['POST'], res);
      return this.broadcasts.policy(actor, body);
    }
    if (path === 'whatsapp/consents') {
      if (method === 'GET') return this.broadcasts.consent(actor);
      this.requireMethod(method, ['POST'], res);
      return this.broadcasts.consent(actor, body);
    }
    const approval = /^whatsapp\/broadcasts\/(\d+)\/approve$/.exec(path);
    if (approval) {
      this.requireMethod(method, ['POST'], res);
      return this.broadcasts.approve(actor, approval[1]);
    }
    if (path === 'whatsapp/connections') {
      if (method === 'GET') return this.metaConnections.list(actor);
      this.requireMethod(method, ['POST'], res);
      return this.metaConnections.connect(actor, body);
    }
    const templateAction = /^whatsapp\/connections\/(\d+)\/templates(?:\/(delete))?$/.exec(path);
    if (templateAction) {
      this.requireMethod(method, ['POST'], res);
      return templateAction[2]
        ? this.metaConnections.deleteTemplate(actor, templateAction[1], body)
        : this.metaConnections.createTemplate(actor, templateAction[1], body);
    }
    if (path.startsWith('whatsapp/onboarding/')) {
      if (path === 'whatsapp/onboarding/history') {
        this.requireMethod(method, ['GET'], res);
        return this.metaOnboarding.history(actor);
      }
      this.requireMethod(method, ['POST'], res);
      if (path === 'whatsapp/onboarding/begin') return this.metaOnboarding.begin(actor);
      if (path === 'whatsapp/onboarding/complete') return this.metaOnboarding.complete(actor, body);
      throw new ApiError(404, 'Unknown onboarding action.');
    }
    const connection = /^whatsapp\/connections\/(\d+)\/(subscribe|register|sync|disconnect)$/.exec(path);
    if (connection) {
      this.requireMethod(method, ['POST'], res);
      return this.metaConnections.action(actor, connection[1], connection[2], body);
    }
    if (path === 'whatsapp/webhook-events') {
      this.requireMethod(method, ['GET'], res);
      return this.webhooks.inbox.list(actor);
    }
    const webhookRetry = /^whatsapp\/webhook-events\/(\d+)\/retry$/.exec(path);
    if (webhookRetry) {
      this.requireMethod(method, ['POST'], res);
      return this.webhooks.inbox.retry(actor, webhookRetry[1]);
    }

    // 7. Workflows
    if (path === 'workflows') {
      if (method === 'GET') return this.workflows.list(actor);
      this.requireMethod(method, ['POST'], res);
      return this.workflows.save(actor, body);
    }
    if (path === 'workflows/dry-run') {
      this.requireMethod(method, ['POST'], res);
      return this.workflows.dryRun(actor, body);
    }
    if (path === 'workflows/runs') {
      this.requireMethod(method, ['GET'], res);
      return this.workflows.runs(actor);
    }
    const workflowRun = /^workflows\/runs\/(\d+)(\/retry)?$/.exec(path);
    if (workflowRun) {
      if (workflowRun[2]) {
        this.requireMethod(method, ['POST'], res);
        return this.workflows.retry(actor, workflowRun[1]);
      }
      this.requireMethod(method, ['GET'], res);
      return this.workflows.inspect(actor, workflowRun[1]);
    }
    const workflowDraft = /^workflows\/(\d+)$/.exec(path);
    if (workflowDraft) {
      this.requireMethod(method, ['PATCH'], res);
      return this.workflows.save(actor, body, workflowDraft[1]);
    }
    const workflowPublish = /^workflows\/(\d+)\/publish$/.exec(path);
    if (workflowPublish) {
      this.requireMethod(method, ['POST'], res);
      return this.workflows.publish(actor, workflowPublish[1], body.enabled);
    }

    // 8. Invitations
    if (path === 'invitations') {
      if (method === 'GET') return this.invitations.list(actor);
      this.requireMethod(method, ['POST'], res);
      return this.invitations.create(actor, body);
    }
    const invitation = /^invitations\/(\d+)\/revoke$/.exec(path);
    if (invitation) {
      this.requireMethod(method, ['POST'], res);
      return this.invitations.revoke(actor, invitation[1]);
    }

    // 9. Commerce
    if (path === 'commerce/products') {
      if (method === 'GET') return this.commerce.products(actor);
      this.requireMethod(method, ['POST'], res);
      return this.commerce.saveProduct(actor, body);
    }
    if (path === 'commerce/settings') {
      if (method === 'GET') return this.commerce.settings(actor);
      this.requireMethod(method, ['POST'], res);
      return this.commerce.settings(actor, body);
    }
    const product = /^commerce\/products\/(\d+)$/.exec(path);
    if (product) {
      this.requireMethod(method, ['PATCH'], res);
      return this.commerce.saveProduct(actor, body, product[1]);
    }
    if (path === 'commerce/orders') {
      if (method === 'GET') return this.commerce.orders(actor);
      this.requireMethod(method, ['POST'], res);
      return this.commerce.checkout(actor, body, String(req.headers['idempotency-key'] || ''));
    }
    const order = /^commerce\/orders\/([\w-]+)\/(status|mock-pay)$/.exec(path);
    if (order) {
      this.requireMethod(method, ['POST'], res);
      return order[2] === 'status'
        ? this.commerce.transition(actor, order[1], body)
        : this.commerce.mockPay(actor, order[1]);
    }

    // 10. Automation
    if (path === 'automation/flows') {
      if (method === 'GET') return this.automation.flows(actor);
      this.requireMethod(method, ['POST'], res);
      return this.automation.create(actor, body);
    }
    const flow = /^automation\/flows\/(\d+)\/publish$/.exec(path);
    if (flow) {
      this.requireMethod(method, ['POST'], res);
      return this.automation.publish(actor, flow[1], body.enabled);
    }
    if (path === 'automation/runs') {
      this.requireMethod(method, ['GET'], res);
      return this.automation.runs(actor);
    }
    const run = /^automation\/runs\/(\d+)\/retry$/.exec(path);
    if (run) {
      this.requireMethod(method, ['POST'], res);
      return this.automation.retry(actor, run[1]);
    }

    // 11. Inbox & Conversations
    const readConversation = /^inbox\/conversations\/(\d+)\/read$/.exec(path);
    if (path === 'inbox/agents') {
      this.requireMethod(method, ['GET'], res);
      return this.chat.agents(actor);
    }
    const inboxDetail = /^inbox\/conversations\/(\d+)(\/templates)?$/.exec(path);
    if (inboxDetail) {
      this.requireMethod(method, ['GET'], res);
      return inboxDetail[2]
        ? this.chat.templates(actor, inboxDetail[1])
        : this.chat.get(actor, inboxDetail[1]);
    }
    if (readConversation) {
      this.requireMethod(method, ['POST'], res);
      return this.chat.read(actor, readConversation[1], body);
    }
    const conversation = /^inbox\/conversations\/(\d+)\/(manage|notes)$/.exec(path);
    if (conversation) {
      if (conversation[2] === 'manage') {
        this.requireMethod(method, ['POST'], res);
        return this.chat.manage(actor, conversation[1], body);
      }
      if (method === 'GET') return this.chat.notes(actor, conversation[1]);
      this.requireMethod(method, ['POST'], res);
      return this.chat.notes(actor, conversation[1], body);
    }

    // 12. User Management & Profile
    if (path === 'logout') {
      this.requireMethod(method, ['POST'], res);
      return this.auth.logout(actor);
    }
    if (['change-password', 'update-self-password'].includes(path)) {
      this.requireMethod(method, ['POST'], res);
      return this.auth.changePassword(actor, body);
    }
    if (path === 'me' || path === 'get-app-setting') {
      return {
        user: await this.users.get(actor),
        wallet: await this.billing.wallet(actor),
        provider_mode: this.cfg.PROVIDER_MODE
      };
    }
    if (path === 'update-profile') {
      this.requireMethod(method, ['POST'], res);
      return this.users.update(actor, actor.id, body, true);
    }
    if (['users', 'users-for-ddl'].includes(path)) return this.users.list(actor, query, body);
    if (path === 'user' && method === 'POST') return this.users.create(actor, body);
    const userId = /^user\/(\d+)$/.exec(path)?.[1];
    if (userId) {
      if (method === 'GET') return this.users.get(actor, userId);
      if (['PUT', 'PATCH'].includes(method)) return this.users.update(actor, userId, body);
      if (method === 'DELETE') return this.users.update(actor, userId, { active: false });
      this.requireMethod(method, ['GET', 'PUT', 'PATCH', 'DELETE'], res);
    }
    if (path === 'get-permissions' || path === 'get-all-permissions') {
      return [...permissions, ...frontendPermissions].map(name => ({ name }));
    }

    // 13. Billing & Credits
    if (path === 'wallet') return this.billing.wallet(actor);
    if (path === 'user-credit') {
      this.requireMethod(method, ['POST'], res);
      return this.billing.credit(actor, body);
    }
    if (path === 'user-credits') return this.billing.ledger(actor, query);
    if (path === 'credits/transfer') {
      this.requireMethod(method, ['POST'], res);
      return this.billing.transfer(actor, body);
    }
    if (path === 'repush-campaign') {
      this.requireMethod(method, ['POST'], res);
      const input = repushCampaignSchema.parse(body);
      return this.campaigns.resend(
        actor,
        (input.campaign_id ?? input.send_sms_id)!,
        String(req.headers['idempotency-key'] || input.idempotency_key || '')
      );
    }
    if (path === 'resend-this-sms' || path === 'resend-this-voice-sms') {
      this.requireMethod(method, ['POST'], res);
      const input = resendMessageSchema.parse(body);
      return this.campaigns.resend(
        actor,
        input.campaign_id,
        String(req.headers['idempotency-key'] || input.idempotency_key || ''),
        input.message_id
      );
    }
    if (/^administration\/change-campaign-status-to-complete\/\d+$/.test(path)) {
      return this.campaigns.finish(actor, path.split('/')[2]);
    }
    if (path === 'payments/orders') {
      this.requireMethod(method, ['POST'], res);
      return this.billing.order(actor, body);
    }

    // 14. Campaigns & Message Delivery
    if (campaignCreates[path] && method === 'POST') {
      return this.campaigns.create(
        actor,
        campaignCreates[path],
        body,
        String(req.headers['idempotency-key'] || body.idempotency_key || '')
      );
    }
    if (campaignLists[path]) return this.campaigns.list(actor, query, body, campaignLists[path]);
    const detail = /^(?:send-sms|wa-send-message|voice-sms|get-campaign-info|get-campaign-current-status|wa-get-campaign-info|wa-get-campaign-current-status|get-voice-campaign-info|get-voice-campaign-current-status)\/(\d+)$/.exec(path);
    if (detail) return this.campaigns.get(actor, detail[1]);
    if ([
      'change-campaign-status-to-stop',
      'change-voice-campaign-status-to-stop',
      'administration/manage-campaign',
      'administration/manage-voice-campaign'
    ].includes(path)) {
      this.requireMethod(method, ['POST'], res);
      const input = stopCampaignSchema.parse(body);
      return this.campaigns.cancel(actor, (input.campaign_id ?? input.send_sms_id ?? input.voice_sms_id)!);
    }
    if (/^messages\/\d+\/reconcile$/.test(path)) {
      this.requireMethod(method, ['POST'], res);
      return this.campaigns.reconcile(actor, path.split('/')[1], body);
    }

    // 15. Reports & Exports
    if (path === 'dashboard') return this.reports.dashboard(actor);
    if (reportRoutes.includes(path)) return this.reports.messages(actor, query, body);
    if (summaryRoutes.includes(path)) return this.reports.summary(actor, body);
    if (exportRoutes.includes(path)) {
      this.requireMethod(method, ['POST'], res);
      return this.reports.requestExport(actor, body);
    }
    if (path.startsWith('export-status/')) return this.reports.getExport(actor, z.uuid().parse(path.split('/')[1]));
    if (path.startsWith('download-export/')) {
      const job = await this.reports.getExport(actor, z.uuid().parse(path.split('/')[1]));
      if (job.status !== 'completed') throw new ApiError(409, 'Export not ready.');
      return this.sendFile(actor, job.file_id, res);
    }

    // 16. File Management & Imports
    if (uploadRoutes.includes(path)) {
      this.requireMethod(method, ['POST'], res);
      authorize(actor, 'resources:write');
      if (!req.file) throw new ApiError(422, 'Upload a file in the multipart field file.');
      return this.files.save(actor, req.file.originalname, req.file.mimetype, req.file.buffer);
    }
    if (path.startsWith('files/')) return this.sendFile(actor, z.uuid().parse(path.split('/')[1]), res);
    if (['contact-numbers-import', 'blacklists-import'].includes(path)) {
      this.requireMethod(method, ['POST'], res);
      if (!req.file) throw new ApiError(422, 'Upload a CSV in the multipart field file.');
      return this.files.importContacts(
        actor,
        req.file.buffer,
        path === 'blacklists-import' ? 'blacklist' : 'contact',
        body.group_id ? idSchema.parse(body.group_id) : undefined
      );
    }
    if (['group-sample-file', 'black-list-sample-file', 'normal-sms-campaign-file', 'custom-sms-campaign-file', 'dlt-sample-file', 'vandor-dlr-sample-file'].includes(path)) {
      const csv = path === 'dlt-sample-file' ? 'name,template_id,message\r\nExample,approved-id,Hello\r\n'
        : path === 'vandor-dlr-sample-file' ? 'name,code,description\r\nDelivered,1,Delivered to recipient\r\n'
        : 'phone,name\r\n+919876543210,Example\r\n';
      res.type('text/csv').attachment('sample.csv').send(csv);
      return;
    }
    if (path === 'dlt-templates-import' || path === 'administration/dlrcode-vender-import') {
      this.requireMethod(method, ['POST'], res);
      if (!req.file) throw new ApiError(422, 'Upload a CSV in the multipart field file.');
      return this.files.importMetadata(actor, req.file.buffer, path === 'dlt-templates-import' ? 'dlt_template' : 'dlr_code');
    }

    // 17. WhatsApp Inbox API & Threads
    if (path === 'wa-reply-thread-users') return this.chat.conversations(actor, query);
    if (path === 'wa-reply-threads-case-wise') return this.chat.messages(actor, body, query);
    if (path === 'wa-send-reply-message') {
      this.requireMethod(method, ['POST'], res);
      return this.chat.reply(actor, body);
    }
    if (path === 'wa-download-reply-file') return this.files.download(actor, z.uuid().parse(body.file_id));

    // 18. Bulk & Metadata Routes
    if (bulkRoutes[path]) {
      this.requireMethod(method, ['POST'], res);
      if (path.startsWith('administration/')) authorize(actor, 'admin:write');
      return this.resources.bulk(actor, bulkRoutes[path], body);
    }
    if (path === 'countries') return this.resources.list(actor, 'country', query, body);
    if (path === 'get-all-timezones') return Intl.supportedValuesOf('timeZone');
    if (path === 'wa-template-languages') {
      return [{ code: 'en', name: 'English' }, { code: 'en_US', name: 'English (US)' }, { code: 'hi', name: 'Hindi' }];
    }
    if (path === 'wa-pull-template' || path === 'wa-pull-all-template') {
      this.requireMethod(method, ['POST'], res);
      authorize(actor, 'admin:write');
      return this.metaConnections.action(actor, body.connection_id, 'sync');
    }
    if (path === 'wa-subscribe-apps' || /^wa-subscribed-apps\/\d+$/.test(path)) {
      this.requireMethod(method, ['POST'], res);
      authorize(actor, 'admin:write');
      return this.metaConnections.action(actor, body.connection_id ?? path.split('/')[1], 'subscribe');
    }

    // 19. Audit Logs
    if (path === 'view-login-log' || path === 'audit-logs') {
      return this.getAuditLogs(actor, query);
    }

    // 20. Development Mocks & Sandbox Endpoints
    if (path === 'dev/mailbox' || path === 'dev/incoming-message' || path === 'dev/payment-captured') {
      return this.handleDevMocks(actor, method, path, body, res);
    }

    // 21. Delegated Operations & Generic Resources
    const operation = await this.operations.handle(actor, method, path, body, query);
    if (operation.handled) return operation.data;

    const resource = await this.resources.handle(actor, method, path, query, body);
    if (resource.handled) return resource.data;

    // Fail closed with 501 for unmapped legacy endpoints
    throw new ApiError(501, 'This legacy operation is not implemented. See docs/API_COVERAGE.md for the supported contract.', { path, method });
  }

  /**
   * Helper to retrieve paginated audit logs without inline SQL in the route definition.
   */
  private async getAuditLogs(actor: Actor, query: any) {
    authorize(actor, 'admin:write');
    const p = pagination(query);
    const total = Number((await this.db.query('SELECT count(*) FROM audit_logs WHERE tenant_id=$1', [actor.tenant_id])).rows[0].count);
    const rows = (await this.db.query(
      'SELECT id, tenant_id, user_id, action, target, created_at FROM audit_logs WHERE tenant_id=$1 ORDER BY id DESC LIMIT $2 OFFSET $3',
      [actor.tenant_id, p.perPage, p.offset]
    )).rows;
    return pageResult(rows, total, p.page, p.perPage);
  }

  /**
   * Handles local development mock endpoints safely isolated from production.
   */
  private async handleDevMocks(actor: Actor, method: string, path: string, body: any, res: Response) {
    authorize(actor, 'admin:write');
    if (this.cfg.PROVIDER_MODE !== 'mock' || this.cfg.NODE_ENV === 'production') {
      throw new ApiError(404, 'Not found.');
    }

    if (path === 'dev/mailbox') {
      const email = z.email().parse(body.email);
      if (!(await this.db.query('SELECT 1 FROM users WHERE tenant_id=$1 AND email=$2', [actor.tenant_id, email])).rowCount) {
        throw new ApiError(404, 'User not found.');
      }
      return this.providers.mailbox.filter(m => m.to === email);
    }

    this.requireMethod(method, ['POST'], res);

    if (path === 'dev/incoming-message') {
      const input = devIncomingMessageSchema.parse(body);
      return this.chat.incoming(
        actor.tenant_id,
        input.phone,
        input.message,
        `mock-in-${randomUUID()}`
      );
    }

    const orderId = z.string().parse(body.order_id);
    const order = (await this.db.query('SELECT * FROM payment_orders WHERE id=$1 AND tenant_id=$2', [orderId, actor.tenant_id])).rows[0];
    if (!order || !order.id.startsWith('order_mock_')) {
      throw new ApiError(404, 'Mock payment order not found.');
    }

    await this.billing.captured({
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: `pay_${order.id}`,
            order_id: order.id,
            currency: 'INR',
            status: 'captured',
            amount: Number(order.amount)
          }
        }
      }
    });

    return this.billing.wallet(actor);
  }

  /**
   * Safe file streamer using presigned URLs or sanitized buffers.
   */
  private async sendFile(actor: Actor, id: string, res: Response) {
    const result = await this.files.download(actor, id);
    if (result.url) {
      return { download_url: result.url, expires_in: PRESIGNED_URL_EXPIRES_SECONDS };
    }
    res.type(result.file.mime).attachment(result.file.name).send(result.buffer);
  }
}
