import { z } from 'zod';
import { Actor, authorize } from './auth';
import { ApiError, idSchema } from './common';
import { Db } from './db';

export const agentPodSchema = z.object({
  name: z.string().trim().min(1).max(100),
  department: z.string().trim().min(1).max(50).default('general'),
  skills: z.array(z.string().trim().min(1).max(50)).default([]),
  lead_user_id: z.number().int().positive().nullable().optional(),
  member_user_ids: z.array(z.number().int().positive()).default([]),
  max_active_chats: z.number().int().min(1).max(500).default(25),
  active: z.boolean().default(true)
});

export class AgentPodsService {
  constructor(private db: Db) {}

  async listPods(actor: Actor) {
    const rows = (await this.db.query(
      `SELECT p.*,
        u.name AS lead_name,
        u.email AS lead_email,
        (SELECT count(*)::int FROM conversations c WHERE c.tenant_id=p.tenant_id AND c.assigned_pod_id=p.id AND c.state='open') AS open_chats_count
       FROM agent_pods p
       LEFT JOIN users u ON u.id = p.lead_user_id
       WHERE p.tenant_id = $1
       ORDER BY p.name ASC`,
      [actor.tenant_id]
    )).rows;
    return rows;
  }

  async getPod(actor: Actor, id: unknown) {
    const podId = idSchema.parse(id);
    const row = (await this.db.query(
      `SELECT p.*, u.name AS lead_name, u.email AS lead_email
       FROM agent_pods p
       LEFT JOIN users u ON u.id = p.lead_user_id
       WHERE p.id = $1 AND p.tenant_id = $2`,
      [podId, actor.tenant_id]
    )).rows[0];
    if (!row) throw new ApiError(404, 'Agent pod not found.');
    return row;
  }

  async createPod(actor: Actor, body: unknown) {
    authorize(actor, 'users:write');
    const input = agentPodSchema.parse(body);

    const row = (await this.db.query(
      `INSERT INTO agent_pods(tenant_id, name, department, skills, lead_user_id, member_user_ids, max_active_chats, active)
       VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
      [
        actor.tenant_id,
        input.name,
        input.department,
        input.skills,
        input.lead_user_id || null,
        input.member_user_ids,
        input.max_active_chats,
        input.active
      ]
    )).rows[0];

    await this.db.query(
      "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'agent_pod.create', $3)",
      [actor.tenant_id, actor.id, String(row.id)]
    );
    return row;
  }

  async updatePod(actor: Actor, id: unknown, body: unknown) {
    authorize(actor, 'users:write');
    const podId = idSchema.parse(id);
    const input = agentPodSchema.partial().parse(body);

    const existing = await this.getPod(actor, podId);
    const row = (await this.db.query(
      `UPDATE agent_pods SET
        name = COALESCE($3, name),
        department = COALESCE($4, department),
        skills = COALESCE($5, skills),
        lead_user_id = CASE WHEN $6 THEN $7 ELSE lead_user_id END,
        member_user_ids = COALESCE($8, member_user_ids),
        max_active_chats = COALESCE($9, max_active_chats),
        active = COALESCE($10, active),
        updated_at = now()
       WHERE id = $1 AND tenant_id = $2 RETURNING *`,
      [
        podId,
        actor.tenant_id,
        input.name,
        input.department,
        input.skills,
        input.lead_user_id !== undefined,
        input.lead_user_id ?? null,
        input.member_user_ids,
        input.max_active_chats,
        input.active
      ]
    )).rows[0];

    return row;
  }

  async deletePod(actor: Actor, id: unknown) {
    authorize(actor, 'users:write');
    const podId = idSchema.parse(id);

    // Unassign conversations assigned to this pod
    await this.db.query(
      'UPDATE conversations SET assigned_pod_id = NULL WHERE tenant_id = $1 AND assigned_pod_id = $2',
      [actor.tenant_id, podId]
    );

    const res = await this.db.query(
      'DELETE FROM agent_pods WHERE id = $1 AND tenant_id = $2 RETURNING id',
      [podId, actor.tenant_id]
    );
    if (!res.rowCount) throw new ApiError(404, 'Agent pod not found.');

    await this.db.query(
      "INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES($1, $2, 'agent_pod.delete', $3)",
      [actor.tenant_id, actor.id, String(podId)]
    );
    return { deleted: true };
  }

  async assignNextAgentInPod(tenantId: number, podId: number): Promise<number | null> {
    const pod = (await this.db.query(
      'SELECT * FROM agent_pods WHERE id = $1 AND tenant_id = $2 AND active = true',
      [podId, tenantId]
    )).rows[0];
    if (!pod) return null;

    const candidateIds: number[] = Array.isArray(pod.member_user_ids) ? pod.member_user_ids : [];
    if (pod.lead_user_id && !candidateIds.includes(Number(pod.lead_user_id))) {
      candidateIds.push(Number(pod.lead_user_id));
    }
    if (candidateIds.length === 0) return null;

    // Pick least loaded active agent
    const rows = (await this.db.query(
      `SELECT u.id, count(c.id)::int AS load
       FROM users u
       LEFT JOIN conversations c ON c.assigned_to = u.id AND c.tenant_id = $1 AND c.state = 'open'
       WHERE u.tenant_id = $1 AND u.id = ANY($2::bigint[]) AND u.active = true
       GROUP BY u.id
       ORDER BY load ASC, u.id ASC
       LIMIT 1`,
      [tenantId, candidateIds]
    )).rows;

    return rows.length > 0 ? Number(rows[0].id) : null;
  }
}

