import { test } from 'node:test';
import assert from 'node:assert/strict';
import { persistentFileReferences, persistentFileReference } from '../../src/utils/fileReferences.ts';
test('REG, VK and MinIO origins survive save; temporary signatures do not', () => {
  const urls = ['https://reg.invalid/stng/a.jpg', 'https://vk.invalid/archive/a.jpg', 'https://minio.invalid/minio/servicefiles/a.jpg'];
  assert.deepEqual(persistentFileReferences({data: urls.map(url => url+'?signature=fixture')}), urls);
});
test('hydrated raw keys retain original representation, avoiding changed business versions', () => {
  const signed = 'https://reg.invalid/stng/a.jpg?signature=fixture';
  assert.deepEqual(persistentFileReferences({data:[signed],s3KeyByUrl:{[signed]:'a.jpg'}}),['a.jpg']);
});
test('base64 and malformed URLs cannot silently become persistent references', () => {
  for(const ref of ['data:image/png;base64,YWJj','file:///etc/passwd','https://u:p@host/file','https://host/file#x']) assert.equal(persistentFileReference(ref),null);
});
