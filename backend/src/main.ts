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
import { ApiError, isOriginAllowed } from './common';
import { loadConfig } from './config';
import { Db } from './db';
import { migrate } from './migrate';
import { Auth } from './auth';
import { Providers } from './providers';
import { Resources, permissions } from './resources';
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
import { handleDocsJson, handleDocsUi } from './swagger';
import {
  BCRYPT_SALT_ROUNDS,
  DEFAULT_ADMIN_EMAIL,
  DEFAULT_HOST,
  INITIAL_WALLET_BALANCE_PAISE,
  RATE_LIMIT_API,
  RATE_LIMIT_AUTH,
  UPLOAD_LIMITS,
  WORKER_TICK_INTERVAL_MS
} from './constants';

@Module({})
class ApplicationModule {}

export async function createApplication(options: { config?: ReturnType<typeof loadConfig>; db?: Db; staticDir?: string } = {}) {
  const cfg = options.config || loadConfig();
  const db = options.db || new Db(cfg);

  // Auto-migration & administrator bootstrapping
  if (!options.db && (cfg.DATABASE_URL === 'local-embedded' || cfg.NODE_ENV === 'production' || process.env.AUTO_MIGRATE === 'true')) {
    await migrate(db);
    try {
      const rawEmails = (process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL)
        .split(',')
        .map(e => e.trim().toLowerCase())
        .filter(Boolean);

      // Validate administrator credential safety in production
      const adminPasswordEnv = process.env.ADMIN_PASSWORD;
      if (cfg.NODE_ENV === 'production' && (!adminPasswordEnv || adminPasswordEnv.startsWith('replace-with') || adminPasswordEnv.length < 12)) {
        throw new Error('Production environment requires a secure, non-default ADMIN_PASSWORD with at least 12 characters.');
      }

      const rawPasswords = (adminPasswordEnv || (cfg.NODE_ENV === 'production' ? '' : 'Password123!'))
        .split(/[\r\n,]+/)
        .map(p => p.trim())
        .filter(Boolean);

      const { hash } = await import('bcryptjs');

      for (let i = 0; i < rawEmails.length; i++) {
        const adminEmail = rawEmails[i];
        const adminPassword = rawPasswords[i] || rawPasswords[0] || 'Password123!';
        const hashedPassword = await hash(adminPassword, BCRYPT_SALT_ROUNDS);
        const existing = await db.query('SELECT id FROM users WHERE email=$1', [adminEmail]);

        if (!existing.rowCount) {
          await db.transaction(async c => {
            let tenant = (await c.query("SELECT id FROM tenants WHERE name='Talkrad Global Platform' LIMIT 1")).rows[0];
            if (!tenant) {
              tenant = (await c.query("INSERT INTO tenants(name, status) VALUES('Talkrad Global Platform', 'active') RETURNING id")).rows[0];
            }
            const user = (await c.query(
              `INSERT INTO users(tenant_id, email, name, password_hash, role, permissions, active)
               VALUES($1, $2, 'Global Super Administrator', $3, 'admin', $4, true) RETURNING id`,
              [tenant.id, adminEmail, hashedPassword, permissions]
            )).rows[0];
            await c.query(
              'INSERT INTO wallets(tenant_id, user_id, balance) VALUES($1, $2, $3) ON CONFLICT (user_id) DO NOTHING',
              [tenant.id, user.id, INITIAL_WALLET_BALANCE_PAISE]
            );
            await c.query(
              "INSERT INTO ledger(tenant_id, user_id, type, amount, reference, created_by) VALUES($1, $2, 'credit', $3, 'bootstrap:opening_balance', $2) ON CONFLICT (user_id, type, reference) DO NOTHING",
              [tenant.id, user.id, INITIAL_WALLET_BALANCE_PAISE]
            );
          });
          logger.info(`Auto-bootstrapped administrator user: ${adminEmail}`, {}, 'App');
        } else if (process.env.ADMIN_PASSWORD) {
          await db.query('UPDATE users SET password_hash=$1, active=true WHERE email=$2', [hashedPassword, adminEmail]);
          logger.info(`Synchronized administrator credentials for: ${adminEmail}`, {}, 'App');
        }
      }
    } catch (err: any) {
      logger.warn(`Auto-bootstrap check skipped: ${err.message}`, {}, 'App');
    }
  }

  // Domain service composition
  const providers = new Providers(cfg, db);
  const auth = new Auth(db, cfg, providers);
  const realtime = new Realtime(auth, cfg);
  const notify = (tenant: number, event: any) => {
    void realtime.broadcast(tenant, event).catch(e => logger.error('Realtime delivery failed:', e, 'Realtime'));
  };

  const files = new Files(db, cfg);
  const campaigns = new Campaigns(db, cfg, providers, notify);
  const reports = new Reports(db, files);
  const billing = new Billing(db, providers);
  const commerce = new Commerce(db, cfg);
  const workflows = new Workflows(db, campaigns);
  const automation = new Automation(db, campaigns, commerce, workflows);
  const chat = new Chat(db, cfg, providers, notify, campaigns, automation);
  const webhooks = new Webhooks(cfg, campaigns, chat, billing, db);
  const features = new Features(db);
  const api = new Api(
    cfg,
    db,
    auth,
    providers,
    new Resources(db, cfg),
    new Users(db),
    billing,
    campaigns,
    files,
    reports,
    chat,
    webhooks,
    commerce,
    automation,
    workflows,
    features
  );

  const app = await NestFactory.create(ApplicationModule, { bodyParser: false });
  app.use(correlationMiddleware);

  // Enforce HTTPS in production
  if (cfg.NODE_ENV === 'production') {
    app.use((req: Request, res: Response, next: NextFunction) => {
      const proto = req.headers['x-forwarded-proto'];
      if (proto && proto !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  // Security Headers via Helmet
  const configuredCorsOrigins = cfg.CORS_ORIGINS.split(',').map(s => s.trim()).filter(Boolean);
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", 'https://connect.facebook.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", ...configuredCorsOrigins, 'https://*.workers.dev', 'https://*.pages.dev', 'https://graph.facebook.com', 'https://www.facebook.com'],
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

  // Cross-Origin Resource Sharing (CORS)
  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      const allowed = isOriginAllowed(origin, configuredCorsOrigins, cfg.NODE_ENV === 'production');
      if (allowed) {
        return callback(null, true);
      }
      return callback(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key', 'x-correlation-id', 'x-request-id', 'Accept', 'x-mfa-stepup-token'],
    credentials: true
  });

  // Global & Route-Specific Rate Limiting
  app.use('/api', rateLimit({
    windowMs: RATE_LIMIT_API.windowMs,
    limit: RATE_LIMIT_API.limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({
      error: true,
      code: 429,
      message: RATE_LIMIT_API.message,
      timestamp: new Date().toISOString()
    })
  }));

  const authLimit = rateLimit({
    windowMs: RATE_LIMIT_AUTH.windowMs,
    limit: RATE_LIMIT_AUTH.limit,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (_req, res) => res.status(429).json({
      error: true,
      code: 429,
      message: RATE_LIMIT_AUTH.message,
      timestamp: new Date().toISOString()
    })
  });

  for (const path of ['invitations/accept', 'login', 'forgot-password', 'verify-otp', 'resent-otp', 'sign-up', 'update-password', 'auth/refresh']) {
    app.use(`/api/${path}`, authLimit);
  }

  // Request body parsing with raw body buffer capture for webhook HMAC verification
  const capture = (req: any, _res: any, buffer: Buffer) => {
    req.rawBody = Buffer.from(buffer);
  };
  app.use(express.json({ limit: '1mb', verify: capture }));
  app.use(express.urlencoded({ extended: false, limit: '1mb', verify: capture }));

  // File Upload Pipeline
  const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: UPLOAD_LIMITS.fileSize,
      files: UPLOAD_LIMITS.files,
      fields: UPLOAD_LIMITS.fields
    }
  }).single('file');

  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    if (!req.is('multipart/form-data')) return next();
    // Authenticate prior to allocating memory for file upload
    void auth.authenticate(req.headers.authorization || '', req.ip).then(() => upload(req, res, next)).catch(next);
  });

  // Health and root discovery routes
  app.use('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', service: 'krad-chat', timestamp: new Date().toISOString() });
  });

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'GET' && (req.path === '/' || req.path === '')) {
      return res.status(200).json({ status: 'ok', service: 'krad-chat', timestamp: new Date().toISOString() });
    }
    next();
  });

  // Interactive OpenAPI / Swagger Documentation
  app.use('/api/docs.json', handleDocsJson);
  app.use('/api/docs', handleDocsUi);

  // Main API Router
  app.use('/api', (req: Request, res: Response, next: NextFunction) => {
    void api.handle(req, res).catch(next);
  });

  // Centralized Error Handling Middleware
  app.use((err: any, req: Request, res: Response, _next: NextFunction) => {
    const status = err instanceof ApiError ? err.status
      : err instanceof ZodError ? 422
      : err?.code === '23505' ? 409
      : err?.code === '22P02' ? 422
      : err?.code === 'LIMIT_FILE_SIZE' ? 413
      : err?.type === 'entity.parse.failed' ? 400
      : 500;

    const message = err instanceof ApiError ? err.message
      : err instanceof ZodError ? 'Validation failed.'
      : status === 409 ? 'Record already exists.'
      : status === 422 ? 'Invalid input.'
      : status === 413 ? 'File too large.'
      : status === 400 ? 'Invalid JSON.'
      : 'Internal server error.';

    const correlationId = (req as any).correlationId;

    if (status === 500) {
      logger.error('Internal server error:', err, 'Http');
    } else if (status >= 400) {
      logger.warn(`Request failed (${status}): ${message}`, {
        status,
        message,
        details: err instanceof ZodError ? err.issues : err?.message
      }, 'Http');
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

  // Frontend static bundle serving for unified container deployments
  const staticDir = options.staticDir || (existsSync('../frontend/build/index.html') ? '../frontend/build' : undefined);
  if (staticDir) {
    const resolved = resolve(staticDir);
    app.use(express.static(resolved));
    app.use((req: Request, res: Response, next: NextFunction) => {
      if (req.method === 'GET' && !req.path.startsWith('/api/') && req.accepts('html')) {
        res.sendFile(resolve(resolved, 'index.html'));
      } else {
        next();
      }
    });
  }

  await app.init();
  realtime.attach(app.getHttpServer(), chat);

  // Background workers orchestration
  let timer: NodeJS.Timeout | undefined;
  if (cfg.WORKER_ENABLED) {
    timer = setInterval(() => {
      void webhooks.inbox.tick().catch(e => logger.error('Webhook worker failed:', e, 'Worker'));
      void campaigns.tick().catch(e => logger.error('Campaign worker failed:', e, 'Worker'));
      void reports.tick().catch(e => logger.error('Export worker failed:', e, 'Worker'));
      void workflows.tick().catch(e => logger.error('Workflow worker failed:', e, 'Worker'));
      void automation.tick().catch(e => logger.error('Automation worker failed:', e, 'Worker'));
      void commerce.expire().catch(e => logger.error('Order expiry failed:', e, 'Worker'));
    }, WORKER_TICK_INTERVAL_MS);
  }

  const shutdown = async () => {
    if (timer) clearInterval(timer);
    realtime.close();
    await app.close();
    await db.pool.end();
  };

  return { app, db, shutdown, cfg };
}

// Process-level unhandled rejection and exception traps
process.on('unhandledRejection', reason => {
  logger.error('Unhandled Promise Rejection:', reason instanceof Error ? reason : { reason }, 'Process');
});

process.on('uncaughtException', err => {
  logger.error('Uncaught Exception:', err, 'Process');
  process.exit(1);
});

// Standalone server bootstrap
if (require.main === module) {
  createApplication().then(async ({ app, cfg }) => {
    const host = process.env.HOST || DEFAULT_HOST;
    await app.listen(cfg.PORT, host);
    logger.info(`Backend listening at http://${host}:${cfg.PORT}/api (${cfg.PROVIDER_MODE} providers)`, {
      host,
      port: cfg.PORT,
      providerMode: cfg.PROVIDER_MODE
    }, 'Server');
  }).catch(async e => {
    logger.error('Fatal startup error:', e instanceof Error ? e : new Error(String(e)), 'Server');
    try {
      const { Client } = require('pg');
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl && dbUrl.startsWith('postgresql://')) {
        const client = new Client({
          connectionString: dbUrl,
          ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: true } : undefined
        });
        await client.connect();
        await client.query('INSERT INTO audit_logs(tenant_id, user_id, action, target) VALUES(1, 1, $1, $2)', [
          'server.startup.fatal',
          String(e?.message || e).slice(0, 1000)
        ]);
        await client.end();
      }
    } catch (logErr) {
      logger.error('Failed to record startup error to database:', logErr instanceof Error ? logErr : new Error(String(logErr)), 'Server');
    }
    process.exit(1);
  });
}
