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
test('confirmed upload keeps the immutable key when preview URL is serialized', async () => {
 const {rememberConfirmedUpload}=await import('../../src/utils/fileReferences.ts');
 const url='https://reg.invalid/stng/lifecycle/sealed/11111111-1111-4111-8111-111111111111?signature=fixture';
 const key='lifecycle/sealed/11111111-1111-4111-8111-111111111111';
 rememberConfirmedUpload(url,key);assert.deepEqual(persistentFileReferences({data:[url]}),[key]);
});
test('API diagnostics never log token, payload, response body or signed URL', async () => {
 const {requestJson}=await import('../../src/Store/api.ts');
 const oldFetch=globalThis.fetch,oldLog=console.log;const logs=[];
 try {
  console.log=(...args)=>logs.push(JSON.stringify(args));globalThis.fetch=async()=>new Response(JSON.stringify({token:'PRIVATE_FIXTURE'}),{status:200});
  await requestJson('fixture','https://fixture.invalid/?signature=PRIVATE_FIXTURE',{method:'POST',params:{token:'PRIVATE_FIXTURE'}});
  assert.equal(logs.some(line=>line.includes('PRIVATE_FIXTURE')),false);
 }finally{globalThis.fetch=oldFetch;console.log=oldLog;}
});
