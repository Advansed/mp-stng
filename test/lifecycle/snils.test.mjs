import {test} from 'node:test';
import assert from 'node:assert/strict';
import {isValidSnils, formatSnils} from '../../src/components/DataEditor/fields/snils.ts';
import {extractAiInboundFromCheckResponse, patchInboundInCheckAiResponse} from '../../src/utils/aiRequisites.ts';
test('SNILS field keeps exact validation and existing mask',()=>{
 assert.equal(formatSnils('12345678964'),'123-456-789 64');
 assert.equal(isValidSnils('123-456-789 64'),true);
 for(const s of ['123456789640','12345678965','x12345678964','00000000000']) assert.equal(isValidSnils(s),false);
});
test('SNILS responses use their own method without overwriting passport',()=>{
 const check={is_snils:true,data:{number:'12345678964'},errors:[]};
 const response={data:{data:{checks:{snils:check,passport_front:{is_passport:true}}}}};
 assert.deepEqual(extractAiInboundFromCheckResponse('snils',response),check);
 const replaced=patchInboundInCheckAiResponse(response,'snils',{...check,has_error:true});
 assert.equal(replaced.data.data.checks.passport_front.is_passport,true);
 assert.equal(replaced.data.data.checks.snils.has_error,true);
});
