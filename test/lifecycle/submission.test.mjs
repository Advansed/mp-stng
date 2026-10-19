import test from 'node:test';
import assert from 'node:assert/strict';
import { submissionPayload, assertSaved } from '../../src/utils/submission.ts';
const payload={id:'aaaaaaaa-bbbb-4ccc-8ddd-eeeeeeeeeeee',ПаспортСерия:'1234',ПаспортНомер:'123456',СНИЛС:'12345678964',Файлы:[{name:'Passport1',files:['fixture/passport']},{name:'SNILS',files:['fixture/snils']}]};
test('explicit submit overrides stored draft flag and preserves ID, fields and attachments',()=>{
 const final=submissionPayload({...payload,Проведен:2},'submit');
 assert.equal(final.Проведен,0);assert.equal(final.intent,'submit');
 for(const key of Object.keys(payload))assert.deepEqual(final[key],payload[key]);
 assert.equal(payload.Проведен,undefined);
});
test('draft never submits; passive edit never invents final state',()=>{
 assert.equal(submissionPayload(payload,'draft').Проведен,2);
 const edit=submissionPayload(payload,'edit');assert.equal(edit.intent,'edit');assert.equal(edit.Проведен,undefined);
});
test('both legacy response shapes accepted, refusal/ambiguous response never accepted',()=>{
 for(const result of [{success:true},{error:false}])assert.doesNotThrow(()=>assertSaved(result));
 for(const result of [null,{},'',{error:true},{success:false},{success:false,error:false},{error:true,success:true}])assert.throws(()=>assertSaved(result));
});
