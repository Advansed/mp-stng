import {test} from 'node:test';
import assert from 'node:assert/strict';
import {uploadAttachment} from '../../src/utils/attachmentUpload.ts';
const input={token:'fixture',documentId:'fixture-doc',group:'Passport1',file:new Blob(['abc'],{type:'image/png'}),requestId:'fixture-request'};
test('begin, PUT and complete are ordered; only sealed result is returned',async()=>{
 const calls=[];const result=await uploadAttachment(input,async(op,body)=>{calls.push(op);return op==='begin'?{id:'fixture',state:'pending',uploadUrl:'https://fixture.invalid/upload'}:{id:'fixture',state:'sealed',key:'final',fileUrl:'https://fixture.invalid/final'};},async()=>{calls.push('PUT');return new Response('',{status:200});});
 assert.deepEqual(calls,['begin','PUT','complete']);assert.equal(result.key,'final');
});
test('PUT failure cannot complete or masquerade as base64 success',async()=>{
 const calls=[];await assert.rejects(()=>uploadAttachment(input,async op=>{calls.push(op);return {id:'fixture',state:'pending',uploadUrl:'https://fixture.invalid/upload'};},async()=>new Response('',{status:503})),/UPLOAD_FAILED/);assert.deepEqual(calls,['begin']);
});
test('retry after completion reuses sealed identity without another PUT',async()=>{
 assert.equal((await uploadAttachment(input,async()=>({id:'fixture',state:'sealed',key:'same',fileUrl:'https://fixture.invalid/final'}),async()=>{throw new Error('UNEXPECTED_PUT');})).key,'same');
});
test('completion failure leaves upload unconfirmed',async()=>{
 await assert.rejects(()=>uploadAttachment(input,async op=>{if(op==='complete')throw new Error('UNAVAILABLE');return {id:'fixture',state:'pending',uploadUrl:'https://fixture.invalid/upload'};},async()=>new Response('',{status:200})),/UNAVAILABLE/);
});
