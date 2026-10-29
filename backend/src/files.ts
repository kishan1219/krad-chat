import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { parse } from 'csv-parse/sync';
import { Actor, authorize } from './auth';
import { ApiError, normalizePhone } from './common';
import { Config, requiredEnv } from './config';
import { Db } from './db';
import { Resources } from './resources';

export class Files {
  constructor(private db: Db, private cfg: Config) {}
  private s3() {
    return new S3Client({ region: process.env.S3_REGION || 'auto', endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: { accessKeyId: requiredEnv('S3_ACCESS_KEY_ID'), secretAccessKey: requiredEnv('S3_SECRET_ACCESS_KEY') } });
  }
  async save(actor: Actor, name: string, mime: string, buffer: Buffer) {
    if (buffer.length > 10 * 1024 * 1024) throw new ApiError(413, 'Maximum upload is 10 MB.');
    const allowed = ['text/csv', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'application/pdf', 'video/mp4'];
    if (!allowed.includes(mime)) throw new ApiError(422, 'Unsupported file type.');
    const id = randomUUID(); const key = `${actor.tenant_id}/${id}`;
    const cleanName = name.replace(/[^a-zA-Z0-9._ -]/g, '_').slice(0, 150);
    let storage = 'local';
    if (this.cfg.PROVIDER_MODE === 'live') {
      await this.s3().send(new PutObjectCommand({ Bucket: requiredEnv('S3_BUCKET'), Key: key, Body: buffer, ContentType: mime }));
      storage = 's3';
    } else {
      await mkdir(resolve('storage', String(actor.tenant_id)), { recursive: true });
      await writeFile(resolve('storage', key), buffer, { flag: 'wx' });
    }
    await this.db.query('INSERT INTO files(id,tenant_id,name,mime,size,storage_key,storage) VALUES($1,$2,$3,$4,$5,$6,$7)', [id, actor.tenant_id, cleanName, mime, buffer.length, key, storage]);
    return { id, file_id: id, name: cleanName, size: buffer.length, mime, download_path: `/api/files/${id}` };
  }
  async download(actor: Actor, id: string) {
    const file = (await this.db.query('SELECT * FROM files WHERE tenant_id=$1 AND id=$2', [actor.tenant_id, id])).rows[0];
    if (!file) throw new ApiError(404, 'File not found.');
    if (file.storage === 's3') return { url: await getSignedUrl(this.s3(), new GetObjectCommand({ Bucket: requiredEnv('S3_BUCKET'), Key: file.storage_key }), { expiresIn: 300 }) };
    return { file, buffer: await readFile(resolve('storage', file.storage_key)) };
  }
  async importContacts(actor: Actor, buffer: Buffer, kind: 'contact' | 'blacklist', groupId?: number) {
    authorize(actor, 'contacts:write');
    const records: Record<string, string>[] = parse(buffer, { columns: true, bom: true, skip_empty_lines: true, trim: true, max_record_size: 10000 });
    if (records.length > 10000) throw new ApiError(422, 'Maximum 10,000 contacts per import.');
    const rows = [...new Map(records.map(r => {
      const phone = normalizePhone(r.phone || r.mobile_number || r.mobile || '');
      return [phone, { phone, name: (r.name || '').slice(0, 100), ...(groupId ? { group_id: groupId } : {}) }];
    })).values()];
    return this.db.transaction(async c => {
      if (groupId && !(await c.query("SELECT 1 FROM resources WHERE id=$1 AND tenant_id=$2 AND kind='contact_group'", [groupId, actor.tenant_id])).rowCount) throw new ApiError(422, 'Group not found.');
      await c.query('SELECT pg_advisory_xact_lock($1)', [actor.tenant_id]);
      const existing = new Set((await c.query("SELECT data->>'phone' AS phone FROM resources WHERE tenant_id=$1 AND kind=$2", [actor.tenant_id, kind])).rows.map(r => r.phone));
      let inserted = 0;
      for (const row of rows) {
        if (existing.has(row.phone)) continue;
        await c.query('INSERT INTO resources(tenant_id,kind,data,created_by) VALUES($1,$2,$3,$4)', [actor.tenant_id, kind, row, actor.id]);
        inserted++;
      }
      return { imported: inserted, skipped: records.length - inserted };
    });
  }
  async importMetadata(actor: Actor, buffer: Buffer, kind: 'dlt_template' | 'dlr_code') {
    authorize(actor, kind === 'dlr_code' ? 'admin:write' : 'resources:write');
    const records: Record<string, string>[] = parse(buffer, { columns: true, bom: true, skip_empty_lines: true, trim: true, max_record_size: 10000 });
    if (records.length > 10000) throw new ApiError(422, 'Maximum 10,000 rows per import.');
    return new Resources(this.db, this.cfg).importMetadata(actor, kind, records);
  }
}
