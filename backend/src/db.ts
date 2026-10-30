import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { Config } from './config';

export class Db {
  readonly pool: { end: () => Promise<void> };
  private pglite?: PGlite;
  private isEmbedded = false;

  constructor(config: Config) {
    if (config.DATABASE_URL === 'local-embedded') {
      this.isEmbedded = true;
      this.pglite = new PGlite('.local-data');
      this.pool = { end: async () => { await this.pglite?.close(); } };
    } else {
      const pool = new Pool({
        connectionString: config.DATABASE_URL,
        ssl: (config.DATABASE_SSL || config.DATABASE_URL.includes('supabase')) ? { rejectUnauthorized: false } : undefined,
        max: 10,
        statement_timeout: 15000
      });
      this.pool = pool;
    }
  }

  async query<R extends QueryResultRow = any>(text: string, values: unknown[] = []): Promise<QueryResult<R>> {
    if (this.isEmbedded && this.pglite) {
      if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
      if (!values.length && text.trim().split(';').filter(Boolean).length > 1) {
        await this.pglite.exec(text);
        return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] };
      }
      const r: any = await this.pglite.query(text, values);
      return { rows: r.rows || [], rowCount: r.affectedRows || r.rows?.length || 0, command: '', oid: 0, fields: [] };
    }
    return (this.pool as Pool).query<R>(text, values);
  }

  async transaction<T>(fn: (client: PoolClient) => Promise<T>): Promise<T> {
    if (this.isEmbedded && this.pglite) {
      return this.pglite.transaction(async tx => {
        const client = {
          query: async (text: string, values: unknown[] = []) => {
            if (text.includes('pg_advisory_xact_lock')) return { rows: [], rowCount: 1, command: 'SELECT', oid: 0, fields: [] };
            if (!values.length && text.trim().split(';').filter(Boolean).length > 1) {
              await tx.exec(text);
              return { rows: [], rowCount: 0, command: '', oid: 0, fields: [] };
            }
            const r: any = await tx.query(text, values);
            return { rows: r.rows || [], rowCount: r.affectedRows || r.rows?.length || 0, command: '', oid: 0, fields: [] };
          }
        };
        return fn(client as unknown as PoolClient);
      });
    }
    const client = await (this.pool as Pool).connect();
    try {
      await client.query('BEGIN');
      const value = await fn(client);
      await client.query('COMMIT');
      return value;
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    } finally {
      client.release();
    }
  }
}
