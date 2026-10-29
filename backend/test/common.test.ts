import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encrypt, decrypt, normalizePhone, safeCsv, smsSegments, verifyHmac } from '../src/common';
import { createHmac } from 'node:crypto';

test('SMS segmentation accounts for GSM extension and UTF-16 lengths', () => {
  assert.equal(smsSegments('a'.repeat(160)), 1);
  assert.equal(smsSegments('a'.repeat(161)), 2);
  assert.equal(smsSegments('^'.repeat(81)), 2);
  assert.equal(smsSegments('ह'.repeat(71)), 2);
  assert.equal(smsSegments('😀'.repeat(36)), 2);
});
test('phone normalization validates destination values', () => {
  assert.equal(normalizePhone('9876543210'), '+919876543210');
  assert.equal(normalizePhone('+1 (415) 555-2671'), '+14155552671');
  assert.throws(() => normalizePhone('abc'));
});
test('encrypted credentials reject tampering', () => {
  const key = '34'.repeat(32); const encrypted = encrypt('private', key);
  assert.equal(decrypt(encrypted, key), 'private');
  const bytes = Buffer.from(encrypted, 'base64'); bytes[30] ^= 1;
  assert.throws(() => decrypt(bytes.toString('base64'), key));
});
test('webhook signatures cover exact bytes', () => {
  const raw = Buffer.from('{"amount":100}'); const signature = createHmac('sha256','secret').update(raw).digest('hex');
  assert.equal(verifyHmac(raw, signature, 'secret'), true);
  assert.equal(verifyHmac(Buffer.from('{"amount":1000}'), signature, 'secret'), false);
});
test('CSV export neutralizes spreadsheet formulas', () => {
  assert.equal(safeCsv('=HYPERLINK("url")'), '"\'=HYPERLINK(""url"")"');
  assert.equal(safeCsv('name'), '"name"');
});
