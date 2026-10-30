import { compare, hash } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomInt, randomUUID } from 'node:crypto';
import { z } from 'zod';
import { Db } from './db';
import { Config } from './config';
import { ApiError, equalSecret, passwordSchema, sha256, token } from './common';
import { Providers } from './providers';
import { assertUserScope } from './scope';
import { frontendPermissions } from './frontend-permissions';

export interface Actor { id: number; tenant_id: number; role: 'admin' | 'reseller' | 'operator' | 'viewer'; permissions: string[]; session_id: string; }
export function authorize(actor: Actor, permission: string) {
  if (actor.role === 'admin' || actor.permissions.includes(permission)) return;
  throw new ApiError(403, `Permission required: ${permission}`);
}
export function publicUser(row: Record<string, any>) {
  const { password_hash, ...user } = row;
  const uiPermissions:string[]=['user-ddl-list','edit-profile'];
  if(row.permissions?.includes('chat:reply'))uiPermissions.push('whatsapp-sms','user-ddl-list','edit-profile');
  if(row.permissions?.includes('admin:write'))uiPermissions.push('whatsapp-configurations');
  return { ...user, id: Number(row.id), tenant_id: Number(row.tenant_id), userType: row.role === 'admin' ? 0 : 3,
    permissions: [...new Set([...(row.permissions || []), ...uiPermissions,...(row.role === 'admin' ? frontendPermissions : [])])].map((name: string) => ({ name })), locktimeout: 30 };
}
export class Auth {
  constructor(private db: Db, private cfg: Config, private providers: Providers) {}
  async sessionActive(actor: Actor): Promise<boolean> {
    if (actor.session_id.startsWith('api:')) return Boolean((await this.db.query('SELECT 1 FROM api_keys k JOIN users u ON u.id=k.user_id JOIN tenants t ON t.id=u.tenant_id WHERE k.id=$1 AND k.revoked_at IS NULL AND u.active=true AND t.status=\'active\'', [actor.session_id.slice(4)])).rowCount);
    return Boolean((await this.db.query(`SELECT 1 FROM sessions s JOIN users u ON u.id=s.user_id JOIN tenants t ON t.id=u.tenant_id WHERE s.id=$1
      AND s.revoked_at IS NULL AND s.expires_at>now() AND u.active=true AND t.status='active'`, [actor.session_id])).rowCount);
  }
  async mayViewUser(actor: Actor, userId: number): Promise<boolean> {
    try { await assertUserScope(this.db, actor, userId); return true; } catch { return false; }
  }
  async authenticate(bearer: string, ip?: string): Promise<Actor> {
    if (!bearer.startsWith('Bearer ')) throw new ApiError(401, 'Authentication required.');
    if (bearer.startsWith('Bearer krad_')) {
      const row = (await this.db.query('SELECT k.*,u.role,u.permissions,t.status AS tenant_status FROM api_keys k JOIN users u ON u.id=k.user_id JOIN tenants t ON t.id=u.tenant_id WHERE k.key_hash=$1 AND k.revoked_at IS NULL AND u.active=true', [sha256(bearer.slice(7))])).rows[0];
      if (!row) throw new ApiError(401, 'Invalid API key.');
      if (row.tenant_status !== 'active') throw new ApiError(403, `Organization is ${row.tenant_status}. Access suspended.`);
      const normalizedIp = ip?.replace(/^::ffff:/, '');
      if (row.allowed_ips.length && (!normalizedIp || !row.allowed_ips.includes(normalizedIp))) throw new ApiError(403, 'API key IP restriction denied.');
      const allowed = row.role === 'admin' ? row.scopes : row.scopes.filter((scope: string) => row.permissions.includes(scope));
      return { id: Number(row.user_id), tenant_id: Number(row.tenant_id), role: 'operator', permissions: allowed, session_id: `api:${row.id}` };
    }
    let payload: jwt.JwtPayload;
    try { payload = jwt.verify(bearer.slice(7), this.cfg.JWT_SECRET, { algorithms: ['HS256'], issuer: 'krad-backend', audience: 'krad-frontend' }) as jwt.JwtPayload; }
    catch { throw new ApiError(401, 'Session expired or invalid.'); }
    const row = (await this.db.query(`SELECT u.*,s.id AS session_id,t.status AS tenant_status FROM sessions s JOIN users u ON u.id=s.user_id JOIN tenants t ON t.id=u.tenant_id
      WHERE s.id=$1 AND u.id=$2 AND s.revoked_at IS NULL AND s.expires_at>now() AND u.active=true`, [payload.sid, payload.sub])).rows[0];
    if (!row) throw new ApiError(401, 'Session revoked.');
    if (row.tenant_status !== 'active') throw new ApiError(403, `Organization is ${row.tenant_status}. Access suspended.`);
    return { id: Number(row.id), tenant_id: Number(row.tenant_id), role: row.role, permissions: row.permissions, session_id: row.session_id };
  }
  private async session(user: Record<string, any>) {
    const sid = randomUUID();
    await this.db.query("INSERT INTO sessions(id,user_id,expires_at) VALUES($1,$2,now()+interval '8 hours')", [sid, user.id]);
    const access_token = jwt.sign({ sid }, this.cfg.JWT_SECRET, { subject: String(user.id), expiresIn: '8h', issuer: 'krad-backend', audience: 'krad-frontend', algorithm: 'HS256' });
    const refreshToken = token();
    await this.db.query("INSERT INTO auth_tokens(user_id,kind,token_hash,challenge,expires_at) VALUES($1,'refresh',$2,$3,now()+interval '7 days')", [user.id, sha256(refreshToken), sid]);
    return { ...publicUser(user), access_token, refresh_token: refreshToken, ask_for_otp: false };
  }
  async login(body: any) {
    if (body._hp_trap || body.honeypot) throw new ApiError(400, 'Automated request rejected.');
    const input = z.object({ email: z.email(), password: z.string().min(1).max(128) }).parse({ ...body, email: body.email ?? body.username });
    const user = (await this.db.query('SELECT u.*, t.status AS tenant_status, t.status_reason FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.email=$1 AND u.active=true', [input.email.toLowerCase()])).rows[0];
    // Constant-cost hash comparison also for an unknown email.
    const valid = await compare(input.password, user?.password_hash || '$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW');
    if (!user || !valid) throw new ApiError(401, 'Invalid credentials.');
    if (user.tenant_status !== 'active') throw new ApiError(403, `Organization is ${user.tenant_status}.${user.status_reason ? ' ' + user.status_reason : ''}`);
    await this.db.query("INSERT INTO audit_logs(tenant_id,user_id,action) VALUES($1,$2,'login')", [user.tenant_id, user.id]);
    if (user.otp_enabled) {
      const challenge = await this.issueOtp(user);
      return { ask_for_otp: true, challenge_id: challenge, token_id: challenge, email: user.email };
    }
    return this.session(user);
  }
  private async issueOtp(user: any) {
    const challenge = token(); const otp = String(randomInt(100000, 1000000));
    await this.db.query("UPDATE auth_tokens SET used_at=now() WHERE user_id=$1 AND kind='otp' AND used_at IS NULL", [user.id]);
    await this.db.query("INSERT INTO auth_tokens(user_id,kind,token_hash,challenge,expires_at) VALUES($1,'otp',$2,$3,now()+interval '5 minutes')", [user.id, sha256(`${challenge}:${otp}`), challenge]);
    await this.providers.email(user.email, 'Your verification code', `Your login code is ${otp}. It expires in five minutes.`);
    return challenge;
  }
  async verifyOtp(body: any) {
    const { challenge_id, otp } = z.object({ challenge_id: z.string().length(64), otp: z.string().regex(/^\d{6}$/) }).parse({ ...body, challenge_id: body.challenge_id ?? body.token_id });
    const user = await this.db.transaction(async c => {
      const item = (await c.query("SELECT * FROM auth_tokens WHERE challenge=$1 AND kind='otp' AND used_at IS NULL AND expires_at>now() FOR UPDATE", [challenge_id])).rows[0];
      if (!item || item.attempts >= 5) return null;
      await c.query('UPDATE auth_tokens SET attempts=attempts+1 WHERE id=$1', [item.id]);
      if (!equalSecret(item.token_hash, sha256(`${challenge_id}:${otp}`))) return null;
      await c.query('UPDATE auth_tokens SET used_at=now() WHERE id=$1', [item.id]);
      return (await c.query('SELECT u.*, t.status AS tenant_status, t.status_reason FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.id=$1 AND u.active=true', [item.user_id])).rows[0];
    });
    if (!user) throw new ApiError(401, 'Code invalid, expired, or locked.');
    if (user.tenant_status !== 'active') throw new ApiError(403, `Organization is ${user.tenant_status}.${user.status_reason ? ' ' + user.status_reason : ''}`);
    return this.session(user);
  }
  async resendOtp(body: any) {
    const challenge = z.string().length(64).parse(body.challenge_id ?? body.token_id);
    const user = (await this.db.query(`SELECT u.* FROM auth_tokens a JOIN users u ON u.id=a.user_id WHERE a.challenge=$1 AND a.kind='otp'
      AND a.used_at IS NULL AND a.expires_at>now() AND a.created_at<now()-interval '60 seconds' AND u.active=true`, [challenge])).rows[0];
    if (!user) throw new ApiError(429, 'Wait before requesting another code, or log in again.');
    const next = await this.issueOtp(user);
    return { challenge_id: next, token_id: next, ask_for_otp: true };
  }
  async forgot(body: any) {
    const email = z.email().parse(body.email).toLowerCase();
    const user = (await this.db.query('SELECT * FROM users WHERE email=$1 AND active=true', [email])).rows[0];
    if (user) {
      const reset = token();
      await this.db.query("UPDATE auth_tokens SET used_at=now() WHERE user_id=$1 AND kind='reset' AND used_at IS NULL", [user.id]);
      await this.db.query("INSERT INTO auth_tokens(user_id,kind,token_hash,expires_at) VALUES($1,'reset',$2,now()+interval '30 minutes')", [user.id, sha256(reset)]);
      await this.providers.email(email, 'Password reset', `Use this one-time reset token within 30 minutes: ${reset}`);
    }
    return { message: 'If the account exists, reset instructions have been sent.' };
  }
  async reset(body: any) {
    const input = z.object({ token: z.string().length(64), password: passwordSchema }).parse(body);
    const password = await hash(input.password, 12);
    await this.db.transaction(async c => {
      const row = (await c.query("SELECT * FROM auth_tokens WHERE token_hash=$1 AND kind='reset' AND used_at IS NULL AND expires_at>now() FOR UPDATE", [sha256(input.token)])).rows[0];
      if (!row) throw new ApiError(422, 'Invalid or expired reset token.');
      await c.query('UPDATE users SET password_hash=$1 WHERE id=$2', [password, row.user_id]);
      await c.query('UPDATE auth_tokens SET used_at=now() WHERE id=$1', [row.id]);
      await c.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1', [row.user_id]);
    });
    return { reset: true };
  }
  async signup(body: any) {
    if (body._hp_trap || body.honeypot) throw new ApiError(400, 'Automated request rejected.');
    if (!this.cfg.ALLOW_SIGNUP) throw new ApiError(403, 'Public registration is disabled.');
    const input = z.object({
      email: z.string().email(),
      password: passwordSchema,
      name: z.string().min(1).max(100),
      business_name: z.string().min(1).max(200).optional(),
      companyName: z.string().min(1).max(200).optional()
    }).transform(val => ({
      email: val.email,
      password: val.password,
      name: val.name,
      business_name: val.business_name || val.companyName || `${val.name}'s Workspace`
    })).parse(body);
    const user = await this.db.transaction(async c => {
      const t = (await c.query('INSERT INTO tenants(name) VALUES($1) RETURNING id', [input.business_name])).rows[0];
      const user = (await c.query("INSERT INTO users(tenant_id,email,name,password_hash,role) VALUES($1,$2,$3,$4,'admin') RETURNING *", [t.id, input.email.toLowerCase(), input.name, await hash(input.password, 12)])).rows[0];
      await c.query('INSERT INTO wallets(tenant_id,user_id) VALUES($1,$2)', [t.id, user.id]);
      return user;
    });
    return this.session(user);
  }
  async logout(actor: Actor) {
    await this.db.query('UPDATE sessions SET revoked_at=now() WHERE id=$1', [actor.session_id]);
    return { logged_out: true };
  }
  async rotateSession(refreshToken: string) {
    if (!refreshToken || typeof refreshToken !== 'string') throw new ApiError(401, 'Refresh token required.');
    const hashVal = sha256(refreshToken);
    const item = (await this.db.query("SELECT * FROM auth_tokens WHERE token_hash=$1 AND kind='refresh' AND used_at IS NULL AND expires_at>now()", [hashVal])).rows[0];
    if (!item) throw new ApiError(401, 'Invalid or expired refresh token.');
    const user = (await this.db.query("SELECT u.*, t.status AS tenant_status FROM users u JOIN tenants t ON t.id=u.tenant_id WHERE u.id=$1 AND u.active=true", [item.user_id])).rows[0];
    if (!user || user.tenant_status !== 'active') throw new ApiError(403, 'Account is not active.');
    await this.db.transaction(async c => {
      await c.query("UPDATE auth_tokens SET used_at=now() WHERE id=$1", [item.id]);
      if (item.challenge) await c.query("UPDATE sessions SET revoked_at=now() WHERE id=$1", [item.challenge]);
    });
    return this.session(user);
  }
  async revokeAll(actor: Actor) {
    await this.db.transaction(async c => {
      await c.query("UPDATE sessions SET revoked_at=now() WHERE user_id=$1", [actor.id]);
      await c.query("UPDATE auth_tokens SET used_at=now() WHERE user_id=$1 AND kind='refresh' AND used_at IS NULL", [actor.id]);
    });
    return { revoked_all: true };
  }
  async issueMfaStepUp(actor: Actor) {
    const user = (await this.db.query("SELECT * FROM users WHERE id=$1", [actor.id])).rows[0];
    if (!user) throw new ApiError(404, 'User not found.');
    const challenge = await this.issueOtp(user);
    return { step_up_required: true, challenge_id: challenge, message: 'Verification code sent to registered email.' };
  }
  async verifyMfaStepUp(actor: Actor, body: any) {
    const { challenge_id, otp } = z.object({ challenge_id: z.string().length(64), otp: z.string().regex(/^\d{6}$/) }).parse(body);
    const item = (await this.db.query("SELECT * FROM auth_tokens WHERE challenge=$1 AND kind='otp' AND user_id=$2 AND used_at IS NULL AND expires_at>now()", [challenge_id, actor.id])).rows[0];
    if (!item || !equalSecret(item.token_hash, sha256(`${challenge_id}:${otp}`))) {
      throw new ApiError(401, 'Invalid or expired step-up code.');
    }
    await this.db.query("UPDATE auth_tokens SET used_at=now() WHERE id=$1", [item.id]);
    const stepUpToken = token();
    await this.db.query("INSERT INTO auth_tokens(user_id,kind,token_hash,challenge,expires_at) VALUES($1,'mfa_stepup',$2,$3,now()+interval '10 minutes')", [actor.id, sha256(stepUpToken), actor.session_id]);
    return { mfa_verified: true, step_up_token: stepUpToken, expires_in_seconds: 600 };
  }
  async assertMfaStepUp(actor: Actor, stepUpToken?: string) {
    if (!stepUpToken) throw new ApiError(403, 'Step-up MFA authorization required for this sensitive operation.');
    const item = (await this.db.query("SELECT * FROM auth_tokens WHERE token_hash=$1 AND kind='mfa_stepup' AND user_id=$2 AND used_at IS NULL AND expires_at>now()", [sha256(stepUpToken), actor.id])).rows[0];
    if (!item) throw new ApiError(403, 'Invalid or expired step-up token.');
  }
  async changePassword(actor: Actor, body: any) {
    const input = z.object({ current_password: z.string(), password: passwordSchema }).parse({ ...body, password: body.password ?? body.new_password });
    const user = (await this.db.query('SELECT * FROM users WHERE id=$1', [actor.id])).rows[0];
    if (!await compare(input.current_password, user.password_hash)) throw new ApiError(403, 'Current password is incorrect.');
    await this.db.transaction(async c => {
      await c.query('UPDATE users SET password_hash=$1 WHERE id=$2', [await hash(input.password, 12), actor.id]);
      await c.query('UPDATE sessions SET revoked_at=now() WHERE user_id=$1', [actor.id]);
    });
    return { changed: true, login_required: true };
  }
}
