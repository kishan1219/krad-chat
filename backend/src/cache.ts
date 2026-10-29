/**
 * High-Performance In-Memory Cache with TTL & Pattern Eviction
 * Provides sub-millisecond response times for read-heavy operations
 * (white-label domain routing, feature flags, public plans).
 * Designed for immediate pluggability with Redis / Memcached in multi-instance deployments.
 */

export interface CacheOptions {
  ttlMs?: number; // Time-to-live in milliseconds (default: 60,000ms / 1 min)
  maxItems?: number; // Maximum items before LRU eviction (default: 5,000)
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  lastAccessed: number;
}

export class CacheService {
  private store = new Map<string, CacheEntry<any>>();
  private hits = 0;
  private misses = 0;
  private evictions = 0;
  private defaultTtlMs: number;
  private maxItems: number;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor(options: CacheOptions = {}) {
    this.defaultTtlMs = options.ttlMs ?? 60_000;
    this.maxItems = options.maxItems ?? 5_000;

    // Periodic sweep every 2 minutes to reclaim expired keys
    this.cleanupInterval = setInterval(() => this.sweep(), 120_000);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) {
      this.misses++;
      return undefined;
    }

    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      this.misses++;
      return undefined;
    }

    entry.lastAccessed = Date.now();
    this.hits++;
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs?: number): void {
    if (this.store.size >= this.maxItems && !this.store.has(key)) {
      this.evictOldest();
    }

    const duration = ttlMs ?? this.defaultTtlMs;
    this.store.set(key, {
      value,
      expiresAt: Date.now() + duration,
      lastAccessed: Date.now()
    });
  }

  del(key: string): boolean {
    return this.store.delete(key);
  }

  invalidatePrefix(prefix: string): number {
    let count = 0;
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) {
        this.store.delete(key);
        count++;
      }
    }
    return count;
  }

  async wrap<T>(key: string, fn: () => Promise<T>, ttlMs?: number): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    const result = await fn();
    this.set(key, result, ttlMs);
    return result;
  }

  clear(): void {
    this.store.clear();
  }

  getStats() {
    return {
      size: this.store.size,
      maxItems: this.maxItems,
      hits: this.hits,
      misses: this.misses,
      hitRate: this.hits + this.misses > 0 ? (this.hits / (this.hits + this.misses)).toFixed(3) : '0.000',
      evictions: this.evictions
    };
  }

  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestAccess = Infinity;

    for (const [key, entry] of this.store.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
      this.evictions++;
    }
  }

  private sweep(): void {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (now > entry.expiresAt) {
        this.store.delete(key);
      }
    }
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }
}

export const platformCache = new CacheService({ ttlMs: 60_000, maxItems: 10_000 });
