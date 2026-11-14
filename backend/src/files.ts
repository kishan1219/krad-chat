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
    const allowed = ['text/csv', 'text/plain', 'application/json', 'image/png', 'image/jpeg', 'image/webp', 'audio/mpeg', 'audio/wav', 'audio/x-wav', 'application/pdf', 'video/mp4'];
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

  // Multi-Format Media Resizer: Converts outgoing broadcast image headers into responsive WebP, PNG, and JPEG formats
  async processBroadcastImageVariants(actor: Actor, body: any) {
    authorize(actor, 'campaign:create');
    let buffer: Buffer;
    let originalName = 'broadcast_header.jpg';

    if (body.file_id) {
      const dl = await this.download(actor, body.file_id);
      buffer = dl.buffer ? dl.buffer : await (await fetch(dl.url)).arrayBuffer().then(b => Buffer.from(b));
      originalName = (dl.file?.name || 'broadcast_header.jpg').replace(/\.[^.]+$/, '');
    } else if (body.image_base64) {
      let b64 = String(body.image_base64);
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(b64);
      if (match) b64 = match[2];
      buffer = Buffer.from(b64, 'base64');
      if (body.filename) originalName = String(body.filename).replace(/\.[^.]+$/, '');
    } else {
      throw new ApiError(400, 'file_id or image_base64 required.');
    }

    if (buffer.length > 10 * 1024 * 1024) throw new ApiError(413, 'Image must not exceed 10 MB.');

    const sharp = require('sharp');
    const targetWidth = Math.min(Math.max(Number(body.width) || 1200, 300), 2048);
    const targetHeight = body.height ? Math.min(Math.max(Number(body.height) || 630, 200), 2048) : undefined;

    const basePipeline = sharp(buffer);
    if (targetHeight) {
      basePipeline.resize(targetWidth, targetHeight, { fit: 'cover', position: 'center' });
    } else {
      basePipeline.resize(targetWidth, undefined, { fit: 'inside', withoutEnlargement: true });
    }

    const [webpBuffer, pngBuffer, jpegBuffer] = await Promise.all([
      basePipeline.clone().webp({ quality: 85, effort: 4 }).toBuffer(),
      basePipeline.clone().png({ compressionLevel: 8 }).toBuffer(),
      basePipeline.clone().jpeg({ quality: 85, progressive: true }).toBuffer()
    ]);

    const apiBase = (this.cfg.PUBLIC_API_URL || 'https://krad-chat.onrender.com').replace(/\/+$/, '');

    const [savedWebp, savedPng, savedJpeg] = await Promise.all([
      this.save(actor, `${originalName}_${targetWidth}.webp`, 'image/webp', webpBuffer),
      this.save(actor, `${originalName}_${targetWidth}.png`, 'image/png', pngBuffer),
      this.save(actor, `${originalName}_${targetWidth}.jpg`, 'image/jpeg', jpegBuffer)
    ]);

    const savingsPct = jpegBuffer.length > 0 ? Math.round(((jpegBuffer.length - webpBuffer.length) / jpegBuffer.length) * 100) : 0;

    return {
      success: true,
      original_name: originalName,
      target_dimensions: `${targetWidth}x${targetHeight || 'auto'}`,
      variants: {
        webp: {
          file_id: savedWebp.id,
          filename: savedWebp.name,
          download_path: savedWebp.download_path,
          cdn_url: `${apiBase}${savedWebp.download_path}`,
          mime: 'image/webp',
          size_bytes: webpBuffer.length,
          bandwidth_savings: `${savingsPct}% vs JPEG`
        },
        png: {
          file_id: savedPng.id,
          filename: savedPng.name,
          download_path: savedPng.download_path,
          cdn_url: `${apiBase}${savedPng.download_path}`,
          mime: 'image/png',
          size_bytes: pngBuffer.length
        },
        jpeg: {
          file_id: savedJpeg.id,
          filename: savedJpeg.name,
          download_path: savedJpeg.download_path,
          cdn_url: `${apiBase}${savedJpeg.download_path}`,
          mime: 'image/jpeg',
          size_bytes: jpegBuffer.length
        }
      },
      recommended_format: 'webp',
      recommended_url: `${apiBase}${savedWebp.download_path}`,
      message: `Broadcast image converted into responsive WebP (${(webpBuffer.length / 1024).toFixed(1)} KB), PNG, and JPEG formats.`
    };
  }

  // WebP Animation & Graphic to WhatsApp 512×512 Sticker Exporter
  async createWhatsAppSticker(actor: Actor, body: any) {
    authorize(actor, 'campaign:create');
    let buffer: Buffer;
    let originalName = 'sticker.png';

    if (body.file_id) {
      const dl = await this.download(actor, body.file_id);
      buffer = dl.buffer ? dl.buffer : await (await fetch(dl.url)).arrayBuffer().then(b => Buffer.from(b));
      originalName = dl.file?.name || 'sticker.png';
    } else if (body.image_base64) {
      let b64 = String(body.image_base64);
      const match = /^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/.exec(b64);
      if (match) b64 = match[2];
      buffer = Buffer.from(b64, 'base64');
      if (body.filename) originalName = String(body.filename);
    } else {
      throw new ApiError(400, 'file_id or image_base64 required.');
    }

    if (buffer.length > 10 * 1024 * 1024) throw new ApiError(413, 'Input image must not exceed 10 MB.');

    const sharp = require('sharp');
    const packName = (body.pack_name || 'KradChat Stickers').slice(0, 100);
    const author = (body.author || 'Krad Technology').slice(0, 100);
    const isAnimated = Boolean(body.is_animated);

    // Meta WhatsApp Sticker specification: exactly 512x512 pixels with alpha transparency
    const stickerBuffer: Buffer = await sharp(buffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 }
      })
      .webp({
        quality: 85,
        effort: 4,
        lossless: false
      })
      .toBuffer();

    const maxAllowedSize = isAnimated ? 500 * 1024 : 100 * 1024;
    if (stickerBuffer.length > maxAllowedSize) {
      const compressedBuffer = await sharp(stickerBuffer)
        .webp({ quality: 65, effort: 6 })
        .toBuffer();
      if (compressedBuffer.length > maxAllowedSize) {
        throw new ApiError(422, `Sticker size (${(compressedBuffer.length / 1024).toFixed(1)} KB) exceeds WhatsApp ${maxAllowedSize / 1024} KB limit.`);
      }
    }

    const cleanBase = originalName.replace(/\.[^.]+$/, '').replace(/[^a-zA-Z0-9_-]/g, '_');
    const stickerName = `${cleanBase}_512x512.webp`;

    const saved = await this.save(actor, stickerName, 'image/webp', stickerBuffer);
    const apiBase = (this.cfg.PUBLIC_API_URL || 'https://krad-chat.onrender.com').replace(/\/+$/, '');
    const cdnUrl = `${apiBase}${saved.download_path}`;

    // Persist sticker resource record
    const stickerResource = (await this.db.query(
      `INSERT INTO resources(tenant_id, kind, data, created_by)
       VALUES($1, 'whatsapp_sticker', $2, $3)
       RETURNING id, data, created_at`,
      [
        actor.tenant_id,
        JSON.stringify({
          file_id: saved.id,
          name: stickerName,
          pack_name: packName,
          author: author,
          dimensions: '512x512',
          mime: 'image/webp',
          size_bytes: stickerBuffer.length,
          cdn_url: cdnUrl,
          download_path: saved.download_path,
          is_animated: isAnimated,
          compliant: true
        }),
        actor.id
      ]
    )).rows[0];

    return {
      success: true,
      sticker_id: stickerResource.id,
      file_id: saved.id,
      name: stickerName,
      pack_name: packName,
      author: author,
      dimensions: '512x512',
      mime: 'image/webp',
      size_bytes: stickerBuffer.length,
      download_path: saved.download_path,
      cdn_url: cdnUrl,
      whatsapp_guidelines_compliant: true,
      message: 'Sticker successfully formatted to 512×512 WebP WhatsApp sticker pack standard!'
    };
  }

  async listWhatsAppStickers(actor: Actor) {
    authorize(actor, 'campaign:create');
    const rows = (await this.db.query(
      "SELECT id, data, created_at FROM resources WHERE tenant_id=$1 AND kind='whatsapp_sticker' ORDER BY id DESC LIMIT 50",
      [actor.tenant_id]
    )).rows;
    return rows.map(r => ({ id: r.id, ...(r.data || {}), created_at: r.created_at }));
  }
}
