import test from 'node:test';
import assert from 'node:assert/strict';
import { initialCorrectionPage } from '../../src/utils/correctionStep.ts';
const service={status:'edit',chapters:[{data:[{name:'Фамилия'}]},{files:[{name:'SNILS'},{name:'Passport1'}]}],statuses:[{status:'new'},{status:'edit',comment:'СНИЛС: переснимите документ'}]};
test('returned mobile application opens affected document with values retained',()=>{const before=JSON.stringify(service);assert.equal(initialCorrectionPage(service),1);assert.equal(JSON.stringify(service),before)});
test('new applications and unknown reasons retain the normal entry point',()=>{assert.equal(initialCorrectionPage({...service,status:'new',statuses:[]}),0);assert.equal(initialCorrectionPage({...service,statuses:[{status:'edit',comment:'Уточните данные'}]}),0)});
