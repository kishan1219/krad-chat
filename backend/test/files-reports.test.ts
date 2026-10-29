import { test } from 'node:test';
import assert from 'node:assert/strict';
import { database, testConfig } from './helpers';
import { Files } from '../src/files';
import { Reports } from '../src/reports';
import { Campaigns } from '../src/campaigns';
import { Providers } from '../src/providers';
import { Resources } from '../src/resources';

test('contact imports deduplicate and invalid CSV leaves no partial records', async () => {
  const { db, actor, close } = await database();
  try {
    const files = new Files(db, testConfig);
    const csv = Buffer.from('phone,name\n9876543210,A\n9876543210,A\n9876543211,B');
    assert.deepEqual(await files.importContacts(actor, csv, 'contact'), { imported: 2, skipped: 1 });
    assert.deepEqual(await files.importContacts(actor, csv, 'contact'), { imported: 0, skipped: 3 });
    await assert.rejects(files.importContacts(actor, Buffer.from('phone,name\n9876543212,C\ninvalid,D'), 'contact'), /Invalid phone/);
    assert.equal((await new Resources(db, testConfig).list(actor, 'contact', {})).total, 2);
  } finally { await close(); }
});
test('durable export produces an authenticated tenant-scoped file', async () => {
  const { db, actor, close } = await database();
  try {
    const files = new Files(db, testConfig); const reports = new Reports(db, files);
    const campaigns = new Campaigns(db, testConfig, new Providers(testConfig));
    await campaigns.create(actor, 'sms', { message: 'hello', recipients: ['9876543210'] }, 'export-campaign-001'); await campaigns.tick();
    const job = await reports.requestExport(actor, { channel: 'sms' }); await reports.tick();
    const completed = await reports.getExport(actor, job.id);
    assert.equal(completed.status, 'completed');
    const download = await files.download(actor, completed.file_id);
    assert.match(download.buffer!.toString(), /delivered/);
    await assert.rejects(files.download({ ...actor, tenant_id: actor.tenant_id + 1 }, completed.file_id), /not found/);
  } finally { await close(); }
});
