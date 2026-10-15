import {test} from 'node:test';import assert from 'node:assert/strict';
import {deleteAttachment} from '../../src/utils/attachmentDelete.ts';
const input={token:'fixture',documentId:'fixture-doc',group:'Passport1',reference:'https://fixture.invalid/file?sig=temporary'};
test('mobile delete resolves persisted key and sends exact revision',async()=>{
 const calls=[];const result=await deleteAttachment(input,async(op,body)=>{calls.push({op,body});return op==='attachments_state'?{data:{attachmentRevision:7,attachments:[{name:'Passport1',files:['https://fixture.invalid/file']}]}}:{data:{storageObjectDeleted:false}};});
 assert.equal(result.storageObjectDeleted,false);assert.equal(calls[1].body.attachmentRevision,7);assert.equal(calls[1].body.key,'https://fixture.invalid/file');
});
test('revision conflict is an error, never a successful local removal',async()=>{
 await assert.rejects(()=>deleteAttachment(input,async op=>op==='attachments_state'?{data:{attachmentRevision:7,attachments:[{name:'Passport1',files:['https://fixture.invalid/file']}]}}:{error:true}),/DELETE_NOT_CONFIRMED/);
});
test('unknown provider aliases are not guessed',async()=>{
 await assert.rejects(()=>deleteAttachment(input,async()=>({data:{attachmentRevision:7,attachments:[{name:'Passport1',files:['file']}]}})),/UNRESOLVED/);
});
test('unbound new upload is discarded through server CAS, not physical deletion',async()=>{
 const calls=[];await deleteAttachment({...input,originalKey:'lifecycle/sealed/11111111-1111-4111-8111-111111111111'},async(op,body)=>{calls.push({op,body});return op==='attachments_state'?{data:{attachmentRevision:0,attachments:[]}}:{data:{storageObjectDeleted:false,pending:true}};});assert.equal(calls[1].op,'attachments_delete');assert.equal(calls[1].body.attachmentRevision,0);
});
test('persisted sealed preview alias resolves after application restart',async()=>{
 const key='lifecycle/sealed/11111111-1111-4111-8111-111111111111';let deleted;
 await deleteAttachment(input,async(op,body)=>{if(op==='attachments_state')return {data:{attachmentRevision:3,attachments:[{name:'Passport1',files:[key],references:[{key,url:'https://fixture.invalid/file?new-signature'}]}]}};deleted=body;return {data:{storageObjectDeleted:false}};});assert.equal(deleted.key,key);
});
