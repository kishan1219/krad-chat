import { Request, Response, NextFunction } from 'express';
import { Db } from './db';
import { ApiError } from './common';
import { logger } from './logger';

export interface FeatureFlagRecord {
  id: string;
  tenant_id: string | null;
  feature_key: string;
  enabled: boolean;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export class Features {
  private cache = new Map<string, { enabled: boolean; expiresAt: number }>();
  private readonly CACHE_TTL_MS = 60_000; // 1 minute TTL

  constructor(private readonly db: Db) {}

  /**
   * Check whether a feature is enabled for a given tenant.
   * Priority: Tenant override -> Global default -> false
   */
  async isEnabled(tenantId: number, featureKey: string): Promise<boolean> {
    const cacheKey = `${tenantId}:${featureKey}`;
    const cached = this.cache.get(cacheKey);
    const now = Date.now();

    if (cached && cached.expiresAt > now) {
      return cached.enabled;
    }

    try {
      // 1. Check tenant override
      const tenantRes = await this.db.query<{ enabled: boolean }>(
        'SELECT enabled FROM feature_flags WHERE tenant_id = $1 AND feature_key = $2 LIMIT 1',
        [tenantId, featureKey]
      );

      if (tenantRes.rows.length > 0) {
        const enabled = Boolean(tenantRes.rows[0].enabled);
        this.cache.set(cacheKey, { enabled, expiresAt: now + this.CACHE_TTL_MS });
        return enabled;
      }

      // 2. Fallback to global flag (tenant_id IS NULL)
      const globalRes = await this.db.query<{ enabled: boolean }>(
        'SELECT enabled FROM feature_flags WHERE tenant_id IS NULL AND feature_key = $1 LIMIT 1',
        [featureKey]
      );

      const enabled = globalRes.rows.length > 0 ? Boolean(globalRes.rows[0].enabled) : false;
      this.cache.set(cacheKey, { enabled, expiresAt: now + this.CACHE_TTL_MS });
      return enabled;
    } catch (err: any) {
      logger.error('Failed to resolve feature flag, defaulting to false', err, 'Features');
      return false;
    }
  }

  /**
   * Retrieve all effective flags for a tenant (global defaults merged with tenant overrides).
   */
  async getAllFlags(tenantId: number): Promise<Record<string, boolean>> {
    const res = await this.db.query<{ feature_key: string; enabled: boolean; is_override: boolean }>(
      `SELECT DISTINCT ON (feature_key) feature_key, enabled
       FROM (
         SELECT feature_key, enabled, 1 as priority FROM feature_flags WHERE tenant_id = $1
         UNION ALL
         SELECT feature_key, enabled, 2 as priority FROM feature_flags WHERE tenant_id IS NULL
       ) sub
       ORDER BY feature_key, priority ASC`,
      [tenantId]
    );

    const flags: Record<string, boolean> = {};
    for (const row of res.rows) {
      flags[row.feature_key] = Boolean(row.enabled);
    }
    return flags;
  }

  /**
   * Set or update a feature flag for a tenant or globally.
   */
  async setFlag(tenantId: number | null, featureKey: string, enabled: boolean, metadata: Record<string, any> = {}): Promise<void> {
    if (tenantId === null) {
      await this.db.query(
        `INSERT INTO feature_flags (tenant_id, feature_key, enabled, metadata, updated_at)
         VALUES (NULL, $1, $2, $3, now())
         ON CONFLICT (feature_key) WHERE tenant_id IS NULL
         DO UPDATE SET enabled = EXCLUDED.enabled, metadata = EXCLUDED.metadata, updated_at = now()`,
        [featureKey, enabled, JSON.stringify(metadata)]
      );
    } else {
      await this.db.query(
        `INSERT INTO feature_flags (tenant_id, feature_key, enabled, metadata, updated_at)
         VALUES ($1, $2, $3, $4, now())
         ON CONFLICT (tenant_id, feature_key) WHERE tenant_id IS NOT NULL
         DO UPDATE SET enabled = EXCLUDED.enabled, metadata = EXCLUDED.metadata, updated_at = now()`,
        [tenantId, featureKey, enabled, JSON.stringify(metadata)]
      );
    }

    // Invalidate local in-memory cache
    if (tenantId === null) {
      this.cache.clear();
    } else {
      this.cache.delete(`${tenantId}:${featureKey}`);
    }

    logger.info(`Feature flag '${featureKey}' updated`, { tenantId, enabled }, 'Features');
  }

  /**
   * Express middleware factory to guard routes by feature flag.
   */
  guard(featureKey: string) {
    return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      const user = (req as any).user;
      if (!user || !user.tenantId) {
        return next();
      }

      const enabled = await this.isEnabled(user.tenantId, featureKey);
      if (!enabled) {
        return next(new ApiError(403, `Feature '${featureKey}' is disabled for this organization.`));
      }

      next();
    };
  }
}
