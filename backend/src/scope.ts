import { Actor } from './auth';
import { Db } from './db';
import { ApiError } from './common';

// Hierarchy changes are only made at user creation; clients cannot reparent users or introduce cycles.
export const scopeCte = `WITH RECURSIVE scoped_users AS (
  SELECT id FROM users WHERE tenant_id=$1 AND (id=$2 OR $3::boolean)
  UNION SELECT u.id FROM users u JOIN scoped_users s ON u.parent_user_id=s.id WHERE u.tenant_id=$1
)`;
export function scopeArgs(actor: Actor): unknown[] { return [actor.tenant_id, actor.id, actor.role === 'admin']; }
export async function assertUserScope(db: Db, actor: Actor, id: number) {
  const result = await db.query(`${scopeCte} SELECT 1 FROM scoped_users WHERE id=$4`, [...scopeArgs(actor), id]);
  if (!result.rowCount) throw new ApiError(404, 'User not found in your hierarchy.');
}
