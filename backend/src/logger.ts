import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';
import { Request, Response, NextFunction } from 'express';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogContext {
  correlationId?: string;
  tenantId?: number;
  userId?: number;
}

export interface StructuredLog {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  correlationId?: string;
  tenantId?: number;
  userId?: number;
  durationMs?: number;
  meta?: Record<string, any>;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

const asyncLocalStorage = new AsyncLocalStorage<LogContext>();

const SENSITIVE_KEYS = new Set([
  'password',
  'token',
  'access_token',
  'system_user_token',
  'secret',
  'app_secret',
  'verify_token',
  'encryption_key',
  'jwt_secret',
  'pin',
  'two_factor_pin',
  'authorization',
  'credit_card',
  'cvv',
  'key_secret',
  'razorpay_webhook_secret'
]);

export function redactSensitiveData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(item => redactSensitiveData(item));
  }

  const sanitized: Record<string, any> = {};
  for (const [key, val] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.has(lowerKey) || lowerKey.includes('secret') || lowerKey.includes('password') || lowerKey.includes('token')) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof val === 'object' && val !== null) {
      sanitized[key] = redactSensitiveData(val);
    } else {
      sanitized[key] = val;
    }
  }
  return sanitized;
}

export class Logger {
  constructor(private readonly defaultContext: string = 'App') {}

  static getContext(): LogContext | undefined {
    return asyncLocalStorage.getStore();
  }

  static runWithContext<T>(context: LogContext, fn: () => T): T {
    return asyncLocalStorage.run(context, fn);
  }

  static setTenantAndUser(tenantId?: number, userId?: number): void {
    const store = asyncLocalStorage.getStore();
    if (store) {
      if (tenantId !== undefined) store.tenantId = tenantId;
      if (userId !== undefined) store.userId = userId;
    }
  }

  private write(level: LogLevel, message: string, meta?: Record<string, any>, err?: Error, customContext?: string, durationMs?: number): void {
    const store = asyncLocalStorage.getStore();
    const entry: StructuredLog = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context: customContext || this.defaultContext,
      correlationId: store?.correlationId,
      tenantId: store?.tenantId,
      userId: store?.userId,
      ...(durationMs !== undefined ? { durationMs } : {}),
      ...(meta ? { meta: redactSensitiveData(meta) } : {})
    };

    if (err) {
      entry.error = {
        name: err.name,
        message: err.message,
        ...(process.env.NODE_ENV !== 'production' ? { stack: err.stack } : {})
      };
    }

    const json = JSON.stringify(entry);
    if (level === 'error') {
      console.error(json);
    } else if (level === 'warn') {
      console.warn(json);
    } else {
      console.log(json);
    }
  }

  debug(message: string, meta?: Record<string, any>, context?: string): void {
    this.write('debug', message, meta, undefined, context);
  }

  info(message: string, meta?: Record<string, any>, context?: string, durationMs?: number): void {
    this.write('info', message, meta, undefined, context, durationMs);
  }

  warn(message: string, meta?: Record<string, any>, context?: string): void {
    this.write('warn', message, meta, undefined, context);
  }

  error(message: string, errorOrMeta?: Error | Record<string, any>, context?: string): void {
    if (errorOrMeta instanceof Error) {
      this.write('error', message, undefined, errorOrMeta, context);
    } else {
      this.write('error', message, errorOrMeta, undefined, context);
    }
  }
}

export const logger = new Logger('App');

/**
 * Express middleware to extract or generate x-correlation-id,
 * attach it to response headers, and run the downstream pipeline within AsyncLocalStorage.
 */
export function correlationMiddleware(req: Request, res: Response, next: NextFunction): void {
  const incomingId = (req.headers['x-correlation-id'] || req.headers['x-request-id']) as string | undefined;
  const correlationId = incomingId && incomingId.trim().length > 0 ? incomingId.trim() : randomUUID();

  // Attach to response headers for distributed tracing & client debug reference
  res.setHeader('x-correlation-id', correlationId);
  (req as any).correlationId = correlationId;

  const startTime = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - startTime;
    const statusCode = res.statusCode;
    const logLevel: LogLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

    logger.info(
      `${req.method} ${req.originalUrl || req.url} ${statusCode} (${durationMs}ms)`,
      {
        method: req.method,
        path: req.originalUrl || req.url,
        statusCode,
        ip: req.ip,
        userAgent: req.get('user-agent')
      },
      'Http',
      durationMs
    );
  });

  asyncLocalStorage.run({ correlationId }, () => next());
}
