import { config as loadDotenv } from 'dotenv';
import { existsSync } from 'node:fs';
import { z } from 'zod';

loadDotenv();
if (existsSync('.env.local')) {
  loadDotenv({ path: '.env.local', override: false });
}

const boolean = z.enum(['true', 'false']).transform(v => v === 'true');
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().min(1),
  DATABASE_SSL: boolean.default(false),
  JWT_SECRET: z.string().min(32),
  ENCRYPTION_KEY: z.string().regex(/^[a-fA-F0-9]{64}$/),
  PROVIDER_MODE: z.enum(['mock', 'live']).default('mock'),
  CORS_ORIGINS: z.string().default('http://localhost:3000,http://127.0.0.1:3000,http://localhost:4000,http://127.0.0.1:4000'),
  PUBLIC_API_URL: z.url().default('http://localhost:4000'),
  ALLOW_SIGNUP: boolean.default(false),
  WORKER_ENABLED: boolean.default(true),
  MOCK_DELIVERY: boolean.default(true),
  SMS_UNIT_PRICE_PAISE: z.coerce.number().int().positive().default(25),
  WHATSAPP_UNIT_PRICE_PAISE: z.coerce.number().int().positive().default(100),
  VOICE_UNIT_PRICE_PAISE: z.coerce.number().int().positive().default(200),
});
export type Config = z.infer<typeof schema>;
export function loadConfig(): Config {
  const result = schema.safeParse(process.env);
  if (!result.success) throw new Error(`Invalid environment: ${result.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ')}`);
  const cfg = result.data;
  if (cfg.NODE_ENV === 'production' && (cfg.PROVIDER_MODE === 'mock' || cfg.JWT_SECRET.includes('replace-with') || cfg.JWT_SECRET.length < 48)) {
    throw new Error('Production requires live providers and a random JWT_SECRET of at least 48 characters.');
  }
  if (cfg.NODE_ENV === 'production' && (!cfg.PUBLIC_API_URL.startsWith('https://') || cfg.CORS_ORIGINS.includes('*'))) {
    throw new Error('Production requires HTTPS and explicit CORS origins.');
  }
  return cfg;
}
export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Service not configured: ${name}`);
  return value;
}
