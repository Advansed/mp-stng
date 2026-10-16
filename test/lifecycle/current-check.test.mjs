import test from 'node:test';
import assert from 'node:assert/strict';
import { currentCheckService } from '../../src/utils/currentCheckService.ts';
test('primary check receives newly typed number and uploaded passport, not original template',()=>{
 const original={id:'synthetic',chapters:[{data:[{name:'СНИЛС',value:''}],files:[{name:'Passport1',data:[]}]}]};
 const current=currentCheckService(original,[{title:'test',data:[{name:'СНИЛС',data:'12345678964'},{name:'Passport1',data:['sealed/synthetic']}]}]);
 assert.equal(current.chapters[0].data[0].value,'12345678964');assert.deepEqual(current.chapters[0].files[0].data,['sealed/synthetic']);assert.equal(original.chapters[0].data[0].value,'');
});
