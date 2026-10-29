import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto';
import { z } from 'zod';

export class ApiError extends Error {
  constructor(public status: number, message: string, public details?: unknown) { super(message); }
}
export const idSchema = z.coerce.number().int().positive().max(Number.MAX_SAFE_INTEGER);
export const passwordSchema = z.string().min(12).max(128);
export const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');
export const token = () => randomBytes(32).toString('hex');
export function equalSecret(a: string, b: string): boolean {
  const left = Buffer.from(a); const right = Buffer.from(b);
  return left.length === right.length && timingSafeEqual(left, right);
}
export function verifyHmac(raw: Buffer, signature: string, secret: string): boolean {
  return equalSecret(createHmac('sha256', secret).update(raw).digest('hex'), signature);
}
export function encrypt(value: string, key: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', Buffer.from(key, 'hex'), iv);
  const body = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()]);
  return Buffer.concat([iv, cipher.getAuthTag(), body]).toString('base64');
}
export function decrypt(value: string, key: string): string {
  const bytes = Buffer.from(value, 'base64');
  const cipher = createDecipheriv('aes-256-gcm', Buffer.from(key, 'hex'), bytes.subarray(0, 12));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString('utf8');
}
export function pagination(query: Record<string, unknown>) {
  const page = z.coerce.number().int().min(1).default(1).parse(query.page);
  const perPage = z.coerce.number().int().min(1).max(100).default(25).parse(query.per_page_record ?? query.per_page);
  return { page, perPage, offset: (page - 1) * perPage };
}
export function pageResult(rows: unknown[], total: number, page: number, perPage: number) {
  return { data: rows, total, current_page: page, per_page: perPage, last_page: Math.max(1, Math.ceil(total / perPage)), from: total ? (page - 1) * perPage + 1 : null, to: total ? Math.min(page * perPage, total) : null };
}
export function normalizePhone(value: string): string {
  let s = value.replace(/[\s()-]/g, '');
  if (/^\d{10}$/.test(s)) s = `+91${s}`;
  else if (/^\d{11,15}$/.test(s)) s = `+${s}`;
  if (!/^\+[1-9]\d{7,14}$/.test(s)) throw new ApiError(422, 'Invalid phone number; use international format.');
  return s;
}
const gsm = new Set(Array.from('@£$¥èéùìòÇ\nØø\rÅåΔ_ΦΓΛΩΠΨΣΘΞ ÆæßÉ !"#¤%&\'()*+,-./0123456789:;<=>?¡ABCDEFGHIJKLMNOPQRSTUVWXYZÄÖÑÜ§¿abcdefghijklmnopqrstuvwxyzäöñüà'));
const extension = new Set(Array.from('^{}\\[~]|€\f'));
export function smsSegments(text: string): number {
  let units = 0;
  for (const c of text) {
    if (gsm.has(c)) units++;
    else if (extension.has(c)) units += 2;
    else return text.length <= 70 ? 1 : Math.ceil(text.length / 67);
  }
  return units <= 160 ? 1 : Math.ceil(units / 153);
}
export function safeCsv(value: unknown): string {
  let s = String(value ?? '');
  if (/^[\s]*[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}
export function parseSignedRequest(signedRequest: string, secret: string): any {
  const parts = signedRequest.split('.', 2);
  if (parts.length !== 2) throw new ApiError(400, 'Malformed signed_request.');
  const [encodedSig, payload] = parts;
  const sig = Buffer.from(encodedSig.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
  const expectedSig = createHmac('sha256', secret).update(payload).digest();
  if (sig.length !== expectedSig.length || !timingSafeEqual(sig, expectedSig)) {
    throw new ApiError(403, 'Invalid signed_request signature.');
  }
  return JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
}

export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export function sanitizeText(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
    .replace(/javascript:[^"']*/gi, '')
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, '')
    .trim();
}

export function maskSecret(secret: string, visibleSuffix = 4): string {
  if (!secret) return '';
  if (secret.length <= visibleSuffix) return '*'.repeat(secret.length);
  return '*'.repeat(Math.max(4, secret.length - visibleSuffix)) + secret.slice(-visibleSuffix);
}

export function trimSensitive<T extends Record<string, any>>(obj: T, disallowedKeys: string[] = ['password_hash', 'token_encrypted', 'secret', 'key_hash']): Partial<T> {
  if (!obj || typeof obj !== 'object') return obj;
  const copy: Record<string, any> = { ...obj };
  for (const k of disallowedKeys) {
    delete copy[k];
  }
  return copy as Partial<T>;
}

