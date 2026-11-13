import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema, normalizePhone } from './common';
import { Db } from './db';

export const routingRuleSchema = z.object({
  name: z.string().trim().min(1).max(100),
  rule_type: z.enum(['geo', 'department', 'keyword', 'fallback']),
  match_pattern: z.string().trim().min(1).max(500),
  target_phone_number_id: z.string().trim().min(1).max(50),
  target_waba_id: z.string().trim().min(1).max(50),
  department: z.string().trim().min(1).max(50).default('general'),
  priority: z.number().int().min(1).max(100).default(10),
  active: z.boolean().default(true)
});

export class InboundRouter {
  constructor(private db: Db) {}

  async listRules(actor: Actor) {
    const rows = (await this.db.query(
      'SELECT * FROM waba_routing_rules WHERE tenant_id=$1 ORDER BY priority ASC, id ASC',
      [actor.tenant_id]
    )).rows;
    return rows;
  }

  async createRule(actor: Actor, body: unknown) {
    authorize(actor, 'templates:write');
    const input = routingRuleSchema.parse(body);
    const row = (await this.db.query(
      `INSERT INTO waba_routing_rules(tenant_id, name, rule_type, match_pattern, target_phone_number_id, target_waba_id, department, priority, active)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [actor.tenant_id, input.name, input.rule_type, input.match_pattern, input.target_phone_number_id, input.target_waba_id, input.department, input.priority, input.active]
    )).rows[0];
    await this.db.query(
      "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'waba.routing_rule.create', $3)",
      [actor.tenant_id, actor.id, String(row.id)]
    );
    return row;
  }

  async updateRule(actor: Actor, id: unknown, body: unknown) {
    authorize(actor, 'templates:write');
    const ruleId = idSchema.parse(id);
    const input = routingRuleSchema.partial().parse(body);
    const existing = (await this.db.query(
      'SELECT * FROM waba_routing_rules WHERE id=$1 AND tenant_id=$2',
      [ruleId, actor.tenant_id]
    )).rows[0];
    if (!existing) throw new ApiError(404, 'Routing rule not found.');

    const row = (await this.db.query(
      `UPDATE waba_routing_rules SET
        name=COALESCE($3, name),
        rule_type=COALESCE($4, rule_type),
        match_pattern=COALESCE($5, match_pattern),
        target_phone_number_id=COALESCE($6, target_phone_number_id),
        target_waba_id=COALESCE($7, target_waba_id),
        department=COALESCE($8, department),
        priority=COALESCE($9, priority),
        active=COALESCE($10, active),
        updated_at=now()
       WHERE id=$1 AND tenant_id=$2 RETURNING *`,
      [ruleId, actor.tenant_id, input.name, input.rule_type, input.match_pattern, input.target_phone_number_id, input.target_waba_id, input.department, input.priority, input.active]
    )).rows[0];
    return row;
  }

  async deleteRule(actor: Actor, id: unknown) {
    authorize(actor, 'templates:write');
    const ruleId = idSchema.parse(id);
    const result = await this.db.query(
      'DELETE FROM waba_routing_rules WHERE id=$1 AND tenant_id=$2 RETURNING id',
      [ruleId, actor.tenant_id]
    );
    if (!result.rowCount) throw new ApiError(404, 'Routing rule not found.');
    await this.db.query(
      "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'waba.routing_rule.delete', $3)",
      [actor.tenant_id, actor.id, String(ruleId)]
    );
    return { deleted: true };
  }

  async resolveRoute(tenantId: number, customerPhone: string, text: string, defaultPhoneId: string) {
    const rules = (await this.db.query(
      'SELECT * FROM waba_routing_rules WHERE tenant_id=$1 AND active=true ORDER BY priority ASC, id ASC',
      [tenantId]
    )).rows;

    const normPhone = normalizePhone(customerPhone);
    const lowerText = text.toLowerCase();

    for (const rule of rules) {
      if (rule.rule_type === 'geo') {
        const prefixes = rule.match_pattern.split(',').map((p: string) => p.trim());
        const match = prefixes.some((p: string) => {
          const cleanP = p.replace(/[^0-9+]/g, '');
          return normPhone.startsWith(cleanP) || normPhone.startsWith(`+${cleanP}`);
        });
        if (match) {
          return {
            routed: true,
            rule_id: rule.id,
            rule_name: rule.name,
            target_phone_number_id: rule.target_phone_number_id,
            target_waba_id: rule.target_waba_id,
            department: rule.department,
            reason: `Matched Geographic Dialing Prefix: ${rule.match_pattern}`
          };
        }
      } else if (rule.rule_type === 'department' || rule.rule_type === 'keyword') {
        const keywords = rule.match_pattern.split(',').map((k: string) => k.trim().toLowerCase());
        const match = keywords.some((k: string) => lowerText.includes(k));
        if (match) {
          return {
            routed: true,
            rule_id: rule.id,
            rule_name: rule.name,
            target_phone_number_id: rule.target_phone_number_id,
            target_waba_id: rule.target_waba_id,
            department: rule.department,
            reason: `Matched Inbound Keyword/Department: ${rule.match_pattern}`
          };
        }
      }
    }

    const fallbackRule = rules.find((r: any) => r.rule_type === 'fallback');
    if (fallbackRule) {
      return {
        routed: true,
        rule_id: fallbackRule.id,
        rule_name: fallbackRule.name,
        target_phone_number_id: fallbackRule.target_phone_number_id,
        target_waba_id: fallbackRule.target_waba_id,
        department: fallbackRule.department,
        reason: 'Matched Default Fallback Rule'
      };
    }

    return {
      routed: false,
      rule_id: null,
      rule_name: 'Direct Line',
      target_phone_number_id: defaultPhoneId,
      target_waba_id: '',
      department: 'general',
      reason: 'No Custom Inbound Routing Rule Matched'
    };
  }

  async simulate(actor: Actor, body: unknown) {
    const input = z.object({
      phone: z.string().min(3).max(30),
      text: z.string().max(2000).default('')
    }).parse(body);

    const defaultLine = (await this.db.query(
      "SELECT phone_number_id FROM meta_connections WHERE tenant_id=$1 AND status='connected' LIMIT 1",
      [actor.tenant_id]
    )).rows[0]?.phone_number_id || '';

    return this.resolveRoute(actor.tenant_id, input.phone, input.text, defaultLine);
  }
}
