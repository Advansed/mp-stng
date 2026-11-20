const {test}=require('node:test'),assert=require('node:assert/strict'),ts=require('typescript'),fs=require('node:fs'),vm=require('node:vm');
const exportsObj={};vm.runInNewContext(ts.transpileModule(fs.readFileSync('src/referral/install.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports:exportsObj});
const {createInstallReferrerCapture}=exportsObj,token='a'.repeat(43);
for(const source of ['google-play','rustore'])test(`${source}: persist before ack; repeated concurrent startup joined`,async()=>{
 const order=[];let calls=0;const run=createInstallReferrerCapture({getPending:async()=>{calls++;return {status:'pending',source,token}},acknowledge:async p=>{assert.equal(p.token,token);order.push('ack')}},async url=>{assert.equal(url,`https://referal.aostng.ru/r/${token}`);order.push('persist');return 'captured'});
 await Promise.all([run(),run()]);assert.equal(calls,1);assert.deepEqual(order,['persist','ack']);
});
test('storage failure retains native receipt, next foreground retries',async()=>{
 let fail=true,acks=0;const run=createInstallReferrerCapture({getPending:async()=>({status:'pending',source:'rustore',token}),acknowledge:async()=>acks++},async()=>{if(fail)throw Error();return 'captured'});await run();assert.equal(acks,0);fail=false;await run();assert.equal(acks,1);
});
test('invalid, unavailable or unknown store never persists or acknowledges',async()=>{
 for(const result of [{status:'none'},{status:'pending',source:'foreign',token},{status:'pending',source:'rustore',token:'invalid'}])await createInstallReferrerCapture({getPending:async()=>result,acknowledge:async()=>assert.fail()},async()=>assert.fail())();
});
test('duplicate receipt safe after lost ack; competing link cannot replace first',async()=>{
 for(const result of ['duplicate','kept-first']){let ack=0;await createInstallReferrerCapture({getPending:async()=>({status:'pending',source:'google-play',token}),acknowledge:async()=>ack++},async()=>result)();assert.equal(ack,result==='duplicate'?1:0);}
});
