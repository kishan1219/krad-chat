import 'reflect-metadata';
import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import express, { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { ZodError } from 'zod';
import { ApiError } from './common';
import { loadConfig } from './config';
import { Db } from './db';
import { migrate } from './migrate';
import { Auth } from './auth';
import { Providers } from './providers';
import { Resources } from './resources';
import { Users } from './users';
import { Billing } from './billing';
import { Campaigns } from './campaigns';
import { Files } from './files';
import { Reports } from './reports';
import { Chat } from './chat';
import { Webhooks } from './webhooks';
import { Realtime } from './realtime';
import { Api } from './api';
import { Commerce } from './commerce';
import { Automation } from './automation';
import { Workflows } from './workflows';
import { Features } from './features';
import { correlationMiddleware, logger } from './logger';

@Module({})
class ApplicationModule {}
export async function createApplication(options: { config?: ReturnType<typeof loadConfig>; db?: Db; staticDir?:string } = {}) {
  const cfg = options.config || loadConfig();
  const db = options.db || new Db(cfg);
  if (!options.db && (cfg.DATABASE_URL === 'local-embedded' || process.env.AUTO_MIGRATE === 'true')) {
    await migrate(db);
  }
  const providers = new Providers(cfg,db); const auth = new Auth(db, cfg, providers);
  const realtime = new Realtime(auth, cfg);
  const notify = (tenant: number, event: any) => { void realtime.broadcast(tenant, event).catch(e => logger.error('Realtime delivery failed:', e, 'Realtime')); };
  const files = new Files(db, cfg); const campaigns = new Campaigns(db, cfg, providers, notify);
  const reports = new Reports(db, files); const billing = new Billing(db, providers);const commerce=new Commerce(db,cfg);const workflows=new Workflows(db,campaigns);const automation=new Automation(db,campaigns,commerce,workflows); const chat = new Chat(db, cfg, providers, notify, campaigns,automation);
  const webhooks = new Webhooks(cfg, campaigns, chat, billing, db);
  const features = new Features(db);
  const api = new Api(cfg, db, auth, providers, new Resources(db, cfg), new Users(db), billing, campaigns, files, reports, chat, webhooks, commerce, automation, workflows, features);
  const app = await NestFactory.create(ApplicationModule, { bodyParser: false });
  app.use(correlationMiddleware);
  if (cfg.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const proto = req.headers['x-forwarded-proto'];
      if (proto && proto !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://connect.facebook.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...cfg.CORS_ORIGINS.split(',').map(s=>s.trim()).filter(Boolean), 'https://graph.facebook.com', 'https://www.facebook.com'],
        frameSrc: ["'self'", 'https://www.facebook.com', 'https://web.facebook.com'],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"]
      }
    },
    hsts: cfg.NODE_ENV === 'production' ? { maxAge: 31536000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
    xContentTypeOptions: true,
    xFrameOptions: { action: 'deny' }
  }));
  app.use((_req: Request, res: Response, next: NextFunction) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(self)');
    next();
  });
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = cfg.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
      if (!origin) return callback(null, true);
      if (cfg.NODE_ENV === 'production') {
        if (allowed.includes(origin)) return callback(null, true);
        return callback(new Error('Not allowed by CORS'));
      }
      if (allowed.includes(origin) || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
        return callback(null, true);
      }
      callback(new Error('Not allowed by CORS'));
    },
    methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
    allowedHeaders: ['Content-Type','Authorization','Idempotency-Key','x-correlation-id','x-request-id','Accept','x-mfa-stepup-token'],
    credentials: false
  });
  // Set trust proxy only for a known reverse proxy in deployment. Default prevents spoofed rate-limit IPs.
  app.use('/api', rateLimit({ windowMs: 60000, limit: 300, standardHeaders: true, legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: true, code: 429, message: 'Too many requests.', timestamp: new Date().toISOString() }) }));
  const authLimit = rateLimit({ windowMs: 15 * 60000, limit: 20, standardHeaders: true, legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({ error: true, code: 429, message: 'Too many authentication attempts.', timestamp: new Date().toISOString() }) });
  for (const path of ['invitations/accept','login','forgot-password','verify-otp','resent-otp','sign-up','update-password','auth/refresh']) app.use(`/api/${path}`, authLimit);
  const capture = (req: any, _res: any, buffer: Buffer) => { req.rawBody = Buffer.from(buffer); };
  app.use(express.json({ limit: '1mb', verify: capture }));
  app.use(express.urlencoded({ extended: false, limit: '1mb', verify: capture }));
  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024, files: 1, fields: 50 } }).single('file');
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (!req.is('multipart/form-data')) return next();
    // Authenticate before allocating upload memory.
    void auth.authenticate(req.headers.authorization || '', req.ip).then(() => upload(req, res, next)).catch(next);
  });
  app.use('/api', (req: Request, res: Response, next: NextFunction) => { void api.handle(req, res).catch(next); });
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof ApiError ? err.status : err instanceof ZodError ? 422 : err?.code === '23505' ? 409 : err?.code === '22P02' ? 422 : err?.code === 'LIMIT_FILE_SIZE' ? 413 : err?.type === 'entity.parse.failed' ? 400 : 500;
    const message = err instanceof ApiError ? err.message : err instanceof ZodError ? 'Validation failed.' : status === 409 ? 'Record already exists.' : status === 422 ? 'Invalid input.' : status === 413 ? 'File too large.' : status === 400 ? 'Invalid JSON.' : 'Internal server error.';
    const correlationId = (req as any).correlationId;
    if (status === 500) {
      logger.error('Request failed:', err, 'Http');
    } else if (status >= 400) {
      logger.warn(`Request failed (${status}): ${message}`, { status, message, details: err instanceof ZodError ? err.issues : err?.message }, 'Http');
    }
    if (!res.headersSent) {
      res.status(status).json({
        error: true,
        code: status,
        message,
        ...(err instanceof ZodError ? { details: err.issues.map(i => ({ path: i.path, message: i.message })) } : {}),
        ...(correlationId ? { correlation_id: correlationId } : {}),
        timestamp: new Date().toISOString()
      });
    }
  });
  const staticDir = options.staticDir || (existsSync('../frontend/build/index.html') ? '../frontend/build' : undefined);
  if (staticDir) {
    const resolved = resolve(staticDir);
    app.use(express.static(resolved));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api/') && req.accepts('html')) res.sendFile(resolve(resolved, 'index.html'));
      else next();
    });
  }
  await app.init();
  realtime.attach(app.getHttpServer(), chat);
  let timer: NodeJS.Timeout | undefined;
  if (cfg.WORKER_ENABLED) timer = setInterval(() => { void webhooks.inbox.tick().catch(() => console.error('Webhook worker failed.')); void campaigns.tick().catch(e => console.error('Campaign worker failed:', e.message)); void reports.tick().catch(e => console.error('Export worker failed:', e.message));void workflows.tick().catch(()=>console.error('Workflow worker failed.'));void automation.tick().catch(e=>console.error('Automation worker failed:',e.message));void commerce.expire().catch(e=>console.error('Order expiry failed:',e.message)); }, 2000);
  const shutdown = async () => { if (timer) clearInterval(timer); realtime.close(); await app.close(); await db.pool.end(); };
  return { app, db, shutdown, cfg };
}
if (require.main === module) createApplication().then(async ({ app, shutdown, cfg }) => {
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(cfg.PORT, host);
  console.log(`Backend listening at http://${host}:${cfg.PORT}/api (${cfg.PROVIDER_MODE} providers)`);
}).catch(async e => {
  console.error('Fatal startup error:', e);
  try {
    const { Client } = require('pg');
    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl && dbUrl.startsWith('postgresql://')) {
      const client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } });
      await client.connect();
      await client.query('INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES(1, 1, $1, $2)', [
        'server.startup.fatal',
        String(e?.stack || e?.message || e).slice(0, 4000)
      ]);
      await client.end();
    }
  } catch (logErr) {
    console.error('Failed to write startup error to DB:', logErr);
  }
  process.exit(1);
});
