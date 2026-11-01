import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Files } from '../src/files';
import { Chat } from '../src/chat';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { ApiError } from '../src/common';

test('Media Engine & Provider-Independent Storage Suite (Phase 6)', async (t) => {
  const { db, actor, close } = await database();

  try {
    const notifyEvents: any[] = [];
    const notify = (tenant: number, event: any) => notifyEvents.push({ tenant, event });
    const providers = new Providers(testConfig, db);
    const campaigns = new Campaigns(db, testConfig, providers, notify);
    const chat = new Chat(db, testConfig, providers, notify, campaigns);
    const files = new Files(db, testConfig);

    // Create a second tenant to test cross-tenant media isolation
    const tenantB = (await db.query("INSERT INTO tenants(name) VALUES('Tenant B') RETURNING id")).rows[0];
    const userB = (await db.query(
      "INSERT INTO users(tenant_id, email, name, password_hash, role) VALUES($1, 'b@test.com', 'User B', 'hash', 'admin') RETURNING id",
      [tenantB.id]
    )).rows[0];
    const actorB = { id: Number(userB.id), tenant_id: Number(tenantB.id), role: 'admin' as const, permissions: [], session_id: '' };

    let uploadedFileId: string;

    await t.test('1. Saves media upload with tenant-scoped key and returns metadata', async () => {
      const dummyBuffer = Buffer.from('fake-image-bytes-content-12345');
      const saved = await files.save(actor, 'receipt.jpg', 'image/jpeg', dummyBuffer);

      assert.ok(saved.id, 'File ID must be generated');
      uploadedFileId = saved.id;
      assert.equal(saved.name, 'receipt.jpg');
      assert.equal(saved.mime, 'image/jpeg');
      assert.equal(saved.size, dummyBuffer.length);

      // Verify database record
      const dbFile = (await db.query("SELECT * FROM files WHERE id = $1", [uploadedFileId])).rows[0];
      assert.ok(dbFile);
      assert.equal(Number(dbFile.tenant_id), actor.tenant_id);
      assert.equal(dbFile.storage_key, `${actor.tenant_id}/${uploadedFileId}`);
    });

    await t.test('2. Downloads saved file for authorized tenant', async () => {
      const download = await files.download(actor, uploadedFileId);
      assert.ok(download.buffer);
      assert.equal(download.buffer.toString(), 'fake-image-bytes-content-12345');
      assert.equal(download.file.mime, 'image/jpeg');
    });

    await t.test('3. Cross-tenant media isolation blocks Tenant B from accessing Tenant A files', async () => {
      await assert.rejects(
        async () => files.download(actorB, uploadedFileId),
        (err: any) => err instanceof ApiError && err.status === 404
      );
    });

    await t.test('4. Enforces file size limit (< 10 MB) and allowed MIME types', async () => {
      // Exceeds 10MB
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      await assert.rejects(
        async () => files.save(actor, 'large.pdf', 'application/pdf', largeBuffer),
        (err: any) => err instanceof ApiError && err.status === 413
      );

      // Unsupported MIME type
      const badMimeBuffer = Buffer.from('exe content');
      await assert.rejects(
        async () => files.save(actor, 'malicious.exe', 'application/x-msdownload', badMimeBuffer),
        (err: any) => err instanceof ApiError && err.status === 422
      );
    });

    await t.test('5. Attaches media_type and file_id to chat_messages records', async () => {
      // Create conversation
      const conv = (await db.query(
        "INSERT INTO conversations(tenant_id, phone, phone_number_id) VALUES($1, '+919876543210', 'phone-media-1') RETURNING id",
        [actor.tenant_id]
      )).rows[0];

      // Insert message with media attachment
      const msg = (await db.query(
        "INSERT INTO chat_messages(tenant_id, conversation_id, direction, message, media_type, file_id) VALUES($1, $2, 'out', 'Here is your receipt', 'image', $3) RETURNING *",
        [actor.tenant_id, conv.id, uploadedFileId]
      )).rows[0];

      assert.equal(msg.media_type, 'image');
      assert.equal(msg.file_id, uploadedFileId);

      // Verify chat.messages query returns media metadata
      const fetched = await chat.messages(actor, { conversation_id: conv.id });
      assert.equal(fetched.data.length, 1);
      assert.equal((fetched.data[0] as any).media_type, 'image');
      assert.equal((fetched.data[0] as any).file_id, uploadedFileId);
    });

  } finally {
    await close();
  }
});
