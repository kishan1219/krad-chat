import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, normalizePhone, normalizeProviderTimestamp, pagination, pageResult } from './common';
import { Config, requiredEnv } from './config';
import { Db } from './db';
import { Providers } from './providers';
import { Campaigns } from './campaigns';
import { Automation } from './automation';
import { templateMessageSchema } from './whatsapp-template';
import { InboundRouter } from './inbound-router';
import { AgentPodsService } from './agent-pods';

export class Chat {
  private inboundRouter: InboundRouter;
  private agentPods: AgentPodsService;

  constructor(
    private db: Db,
    private cfg: Config,
    private providers: Providers,
    private notify: (tenant: number, event: any) => void,
    private campaigns?: Campaigns,
    private automation?: Automation,
    router?: InboundRouter,
    pods?: AgentPodsService
  ) {
    this.inboundRouter = router || new InboundRouter(db);
    this.agentPods = pods || new AgentPodsService(db);
  }

  async get(actor: Actor, id: unknown) {
    const row = (await this.db.query(
      `SELECT c.*, p.name AS pod_name, p.department AS pod_department
       FROM conversations c
       LEFT JOIN agent_pods p ON p.id = c.assigned_pod_id
       WHERE c.tenant_id=$1 AND c.id=$2`,
      [actor.tenant_id, idSchema.parse(id)]
    )).rows[0];
    if (!row) throw new ApiError(404, 'Conversation not found.');
    return row;
  }

  async agents(actor: Actor) {
    authorize(actor, 'chat:reply');
    return (await this.db.query(
      "SELECT id,name FROM users WHERE tenant_id=$1 AND active=true AND (role='admin' OR 'chat:reply'=ANY(permissions)) ORDER BY name",
      [actor.tenant_id]
    )).rows;
  }

  async templates(actor: Actor, id: unknown) {
    authorize(actor, 'chat:reply');
    const c = await this.get(actor, id);
    const rows = (await this.db.query(
      "SELECT templates FROM meta_connections WHERE tenant_id=$1 AND status='connected' AND ($2='' OR phone_number_id=$2)",
      [actor.tenant_id, c.phone_number_id]
    )).rows;
    if (rows.length !== 1) return [];
    return rows[0].templates.filter((t: any) => t.status === 'APPROVED');
  }

  async manage(actor: Actor, id: unknown, body: any) {
    authorize(actor, 'chat:reply');
    const input = z.object({
      version: idSchema,
      state: z.enum(['open', 'closed']).optional(),
      assigned_to: idSchema.nullable().optional(),
      assigned_pod_id: idSchema.nullable().optional(),
      bot_paused: z.boolean().optional(),
      labels: z.array(z.string().trim().min(1).max(50)).max(20).optional(),
      custom_fields: z.record(z.string().regex(/^[a-zA-Z][a-zA-Z0-9_]{0,49}$/), z.string().max(1000)).refine(v => Object.keys(v).length <= 30).optional()
    }).parse(body);

    if (input.assigned_to && !(await this.db.query('SELECT 1 FROM users WHERE tenant_id=$1 AND id=$2 AND active=true', [actor.tenant_id, input.assigned_to])).rowCount) {
      throw new ApiError(422, 'Assignee is unavailable.');
    }

    if (input.assigned_pod_id && !(await this.db.query('SELECT 1 FROM agent_pods WHERE tenant_id=$1 AND id=$2 AND active=true', [actor.tenant_id, input.assigned_pod_id])).rowCount) {
      throw new ApiError(422, 'Agent pod is unavailable.');
    }

    const result = await this.db.query(
      `UPDATE conversations SET
        state = COALESCE($4, state),
        assigned_to = CASE WHEN $5 THEN $6 ELSE assigned_to END,
        assigned_pod_id = CASE WHEN $7 THEN $8 ELSE assigned_pod_id END,
        bot_paused = COALESCE($9, bot_paused),
        labels = COALESCE($10, labels),
        custom_fields = COALESCE($11, custom_fields),
        version = version + 1
       WHERE tenant_id=$1 AND id=$2 AND version=$3 RETURNING *`,
      [
        actor.tenant_id,
        idSchema.parse(id),
        input.version,
        input.state || null,
        input.assigned_to !== undefined,
        input.assigned_to ?? null,
        input.assigned_pod_id !== undefined,
        input.assigned_pod_id ?? null,
        input.bot_paused ?? null,
        input.labels ?? null,
        input.custom_fields ?? null
      ]
    );
    if (!result.rowCount) throw new ApiError(409, 'Conversation changed. Refresh before updating.');
    return result.rows[0];
  }

  async notes(actor: Actor, id: unknown, body?: any) {
    const conversation = idSchema.parse(id);
    if (!(await this.db.query('SELECT 1 FROM conversations WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, conversation])).rowCount) {
      throw new ApiError(404, 'Conversation not found.');
    }
    if (body) {
      authorize(actor, 'chat:reply');
      const text = z.string().trim().min(1).max(4000).parse(body.body);
      return (await this.db.query(
        'INSERT INTO conversation_notes(tenant_id,conversation_id,user_id,body) VALUES($1,$2,$3,$4) RETURNING *',
        [actor.tenant_id, conversation, actor.id, text]
      )).rows[0];
    }
    return (await this.db.query(
      'SELECT * FROM conversation_notes WHERE tenant_id=$1 AND conversation_id=$2 ORDER BY id DESC LIMIT 100',
      [actor.tenant_id, conversation]
    )).rows;
  }

  async conversations(actor: Actor, query: any = {}) {
    const p = pagination(query);
    const filter = z.object({
      search: z.string().max(200).default(''),
      state: z.enum(['open', 'closed']).optional(),
      assignment: z.enum(['mine', 'unassigned', 'pod', 'all']).default('all'),
      pod_id: z.string().optional(),
      label: z.string().max(50).optional(),
      unread: z.enum(['true', 'false']).default('false')
    }).parse(query);

    const podFilterId = filter.pod_id ? idSchema.parse(filter.pod_id) : null;
    const unread = "(SELECT count(*)::int FROM chat_messages m WHERE m.conversation_id=c.id AND m.direction='in' AND m.id>COALESCE(r.last_message_id,0))";
    const from = `FROM conversations c
      LEFT JOIN conversation_reads r ON r.conversation_id=c.id AND r.user_id=$2
      LEFT JOIN agent_pods p ON p.id = c.assigned_pod_id
      WHERE c.tenant_id=$1
      AND (c.phone ILIKE $3 OR COALESCE(c.name,'') ILIKE $3)
      AND ($4::text IS NULL OR c.state=$4)
      AND (
        $5='all'
        OR ($5='mine' AND c.assigned_to=$2)
        OR ($5='unassigned' AND c.assigned_to IS NULL)
        OR ($5='pod' AND c.assigned_pod_id IS NOT NULL)
      )
      AND ($6::bigint IS NULL OR c.assigned_pod_id=$6)
      AND ($7::text IS NULL OR $7=ANY(c.labels))
      AND ($8=false OR ${unread}>0)`;

    const args = [
      actor.tenant_id,
      actor.id,
      `%${filter.search}%`,
      filter.state || null,
      filter.assignment,
      podFilterId,
      filter.label || null,
      filter.unread === 'true'
    ];

    const total = Number((await this.db.query(`SELECT count(*) ${from}`, args)).rows[0].count);
    const rows = (await this.db.query(
      `SELECT c.*, p.name AS pod_name, ${unread} AS unread_count ${from} ORDER BY c.updated_at DESC, c.id DESC LIMIT $9 OFFSET $10`,
      [...args, p.perPage, p.offset]
    )).rows;

    return pageResult(rows, total, p.page, p.perPage);
  }

  async read(actor: Actor, id: unknown, body: any) {
    const conversation = idSchema.parse(id);
    const through = idSchema.parse(body.through_message_id);
    if (!(await this.db.query('SELECT 1 FROM chat_messages WHERE id=$1 AND tenant_id=$2 AND conversation_id=$3', [through, actor.tenant_id, conversation])).rowCount) {
      throw new ApiError(404, 'Message not found.');
    }
    await this.db.query(
      'INSERT INTO conversation_reads(tenant_id,user_id,conversation_id,last_message_id) VALUES($1,$2,$3,$4) ON CONFLICT(user_id,conversation_id) DO UPDATE SET last_message_id=GREATEST(conversation_reads.last_message_id,EXCLUDED.last_message_id),updated_at=now()',
      [actor.tenant_id, actor.id, conversation, through]
    );
    return { read: true };
  }

  async messages(actor: Actor, body: any, query: any = {}) {
    const id = idSchema.parse(body.conversation_id ?? body.to ?? body.id);
    const p = pagination(query);
    if (!(await this.db.query('SELECT 1 FROM conversations WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, id])).rowCount) {
      throw new ApiError(404, 'Conversation not found.');
    }
    const total = Number((await this.db.query('SELECT count(*) FROM chat_messages WHERE tenant_id=$1 AND conversation_id=$2', [actor.tenant_id, id])).rows[0].count);
    const before = query.before_id === undefined ? null : idSchema.parse(query.before_id);
    const rows = (await this.db.query(
      'SELECT * FROM chat_messages WHERE tenant_id=$1 AND conversation_id=$2 AND ($5::bigint IS NULL OR id<$5) ORDER BY id DESC LIMIT $3 OFFSET $4',
      [actor.tenant_id, id, p.perPage, before ? 0 : p.offset, before]
    )).rows;
    return { ...pageResult(rows, total, p.page, p.perPage), next_before_id: rows.length === p.perPage ? rows[rows.length - 1].id : null };
  }

  async reply(actor: Actor, body: any) {
    authorize(actor, 'chat:reply');
    const input = z.object({
      conversation_id: idSchema,
      message: z.string().min(1).max(4000).optional(),
      template: templateMessageSchema.optional()
    }).refine(v => Boolean(v.message) !== Boolean(v.template), { message: 'Choose a text reply or an approved template.' }).parse({ ...body, conversation_id: body.conversation_id ?? body.to });

    const conversation = (await this.db.query('SELECT * FROM conversations WHERE id=$1 AND tenant_id=$2', [input.conversation_id, actor.tenant_id])).rows[0];
    if (!conversation) throw new ApiError(404, 'Conversation not found.');

    if (this.cfg.PROVIDER_MODE === 'live' && !input.template) {
      const recent = await this.db.query("SELECT 1 FROM chat_messages WHERE tenant_id=$1 AND conversation_id=$2 AND direction='in' AND created_at>now()-interval '24 hours' LIMIT 1", [actor.tenant_id, conversation.id]);
      if (!recent.rowCount) throw new ApiError(422, 'Use an approved template outside the customer service window.');
    }

    if (input.template && !(await this.templates(actor, conversation.id)).some((t: any) => t.name === input.template!.name && t.language === input.template!.language.code)) {
      throw new ApiError(422, 'Select an approved template synchronized for this sender.');
    }

    const displayed = input.message || `Template: ${input.template!.name}\n${input.template!.components?.flatMap(c => ('parameters' in c && Array.isArray((c as any).parameters)) ? (c as any).parameters.map((p: any) => p.text || p.image?.link || p.document?.link || '').filter(Boolean) : []).join('\n') || ''}`;
    const row = (await this.db.query("INSERT INTO chat_messages(tenant_id,conversation_id,direction,message,status) VALUES($1,$2,'out',$3,'sending') RETURNING *", [actor.tenant_id, conversation.id, displayed])).rows[0];

    try {
      if (!this.campaigns) throw new ApiError(503, 'Campaign worker not configured for chat billing.');
      const chatActor = { ...actor, permissions: [...actor.permissions, 'campaign:create'] };
      const campaign = await this.campaigns.create(chatActor, 'whatsapp', { name: `Chat reply ${row.id}`, recipients: [conversation.phone], payload: { ...(input.template ? { template: input.template } : { text: input.message }), chat_id: row.id } }, `chat-reply-${row.id}`, true);
      await this.db.query("UPDATE chat_messages SET status='queued' WHERE id=$1", [row.id]);
      await this.db.query('UPDATE conversations SET updated_at=now() WHERE id=$1', [conversation.id]);
      this.notify(actor.tenant_id, { command: 'message', data: { ...row, status: 'queued', campaign_id: campaign.id } });
      return { ...row, status: 'queued', campaign_id: campaign.id };
    } catch (e) {
      await this.db.query("UPDATE chat_messages SET status='needs_attention' WHERE id=$1", [row.id]);
      throw e;
    }
  }

  async incoming(tenant: number, phone: string, text: string, providerId: string, phoneNumberId = '', rawTimestamp?: unknown) {
    phone = normalizePhone(phone);
    const { timestamp, isSkewed } = normalizeProviderTimestamp(rawTimestamp);

    let effectivePhoneId = phoneNumberId;
    let routingTag: string | null = null;
    let targetPodId: number | null = null;
    let detectedIntent: string | null = null;
    let intentConfidence: number | null = null;

    try {
      const routeRes = await this.inboundRouter.resolveRoute(tenant, phone, text, phoneNumberId);
      if (routeRes.routed) {
        if (routeRes.target_phone_number_id) effectivePhoneId = routeRes.target_phone_number_id;
        routingTag = routeRes.department !== 'general' ? `department:${routeRes.department}` : `routed:${routeRes.rule_name}`;
        if (routeRes.target_pod_id) targetPodId = Number(routeRes.target_pod_id);
        if (routeRes.detected_intent) {
          detectedIntent = routeRes.detected_intent;
          intentConfidence = routeRes.intent_confidence;
        }
      }
    } catch {
      // Fallback gracefully
    }

    const row = await this.db.transaction(async c => {
      await c.query('SELECT pg_advisory_xact_lock(hashtextextended($1,0))', [`contact:${tenant}:${phone}`]);

      // Check existing conversation
      const existing = (await c.query(
        'SELECT * FROM conversations WHERE tenant_id=$1 AND phone=$2 AND phone_number_id=$3',
        [tenant, phone, effectivePhoneId]
      )).rows[0];

      let assignedTo = existing?.assigned_to || null;
      let podId = existing?.assigned_pod_id || targetPodId;

      // If assigning to a pod and no agent is assigned yet, pick least-loaded agent
      if (targetPodId && !assignedTo) {
        podId = targetPodId;
        assignedTo = await this.agentPods.assignNextAgentInPod(tenant, targetPodId);
      }

      const primaryTag: string | null = routingTag || (detectedIntent ? `intent:${detectedIntent}` : null);

      const conversation = (await c.query(
        `INSERT INTO conversations(
          tenant_id, phone, phone_number_id, labels, assigned_pod_id, assigned_to, detected_intent, intent_confidence
        )
         VALUES($1, $2, $3, CASE WHEN $4::text IS NOT NULL THEN ARRAY[$4::text] ELSE '{}'::text[] END, $5, $6, $7, $8)
         ON CONFLICT(tenant_id, phone, phone_number_id)
         DO UPDATE SET
           updated_at = now(),
           assigned_pod_id = COALESCE($5, conversations.assigned_pod_id),
           assigned_to = COALESCE(conversations.assigned_to, $6),
           detected_intent = COALESCE($7, conversations.detected_intent),
           intent_confidence = COALESCE($8, conversations.intent_confidence),
           labels = CASE
             WHEN $4::text IS NOT NULL AND NOT ($4::text = ANY(conversations.labels)) THEN array_append(conversations.labels, $4::text)
             ELSE conversations.labels
           END
         RETURNING *`,
        [
          tenant,
          phone,
          effectivePhoneId,
          primaryTag,
          podId,
          assignedTo,
          detectedIntent,
          intentConfidence
        ]
      )).rows[0];

      const incoming = (await c.query(
        "INSERT INTO chat_messages(tenant_id,conversation_id,direction,message,provider_id,created_at) VALUES($1,$2,'in',$3,$4,$5) ON CONFLICT(provider_id) DO NOTHING RETURNING *",
        [tenant, conversation.id, text.slice(0, 10000), providerId, timestamp]
      )).rows[0];

      if (incoming && isSkewed && rawTimestamp !== undefined && rawTimestamp !== null) {
        await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,NULL,'chat.timestamp_skew',$2)", [tenant, JSON.stringify({ message_id: incoming.id, raw_timestamp: String(rawTimestamp) })]);
      }
      if (incoming && routingTag) {
        await c.query("INSERT INTO audit_logs(tenant_id,user_id,action,target) VALUES($1,NULL,'chat.inbound_router.dispatched',$2)", [tenant, JSON.stringify({ phone, routed_to: effectivePhoneId, tag: routingTag, pod_id: podId, intent: detectedIntent })]);
      }
      if (incoming && this.automation) await this.automation.enqueue(c, tenant, conversation, incoming);
      return incoming;
    });

    if (row) this.notify(tenant, { command: 'message', data: row });
    return row;
  }

  async tenantForMeta(phoneId: string) {
    const rows = (await this.db.query("SELECT tenant_id FROM meta_connections WHERE phone_number_id=$1 AND status='connected'", [phoneId])).rows;
    if (rows.length !== 1) throw new ApiError(422, 'Configure exactly one tenant mapping for this WhatsApp phone number.');
    return Number(rows[0].tenant_id);
  }
}
