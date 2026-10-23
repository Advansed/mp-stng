import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';
import { sendReading, parseReading, UNCONFIRMED_READING } from '../../src/utils/meterReadings.ts';
import { requestJson } from '../../src/Store/api.ts';

for(const [name,value,previous,expected] of [
 ['equal','12345',12345,12345],['increase','12346',12345,12346],
 ['decrease','12344',12345,null],['zero','0',0,null],['negative','-1',0,null],
 ['decimal','12345.5',12345,null],['suffix','12345abc',12345,null],['empty','',0,null],
 ['maximum delta','22345',12345,22345],['excess delta','22346',12345,null],
 ['unsafe integer','99999999999999999999',0,null],['invalid baseline','12345',NaN,null]]) {
 test(`input ${name}`,()=>assert.equal(parseReading(value,previous),expected));
}
for(const reply of [{error:true},{error:1},{},{error:false,success:false},null]) {
 test(`negative or ambiguous acknowledgement ${JSON.stringify(reply)}`,async()=>{
  let refreshes=0;const result=await sendReading(async()=>reply,async()=>refreshes++);
  assert.equal(result.error,true);assert.equal(refreshes,0);
 });
}
for(const error of [false,0])test(`explicit success ${error}`,async()=>{
 let refreshes=0;const result=await sendReading(async()=>({error}),async()=>{refreshes++});
 assert.equal(result.error,false);assert.equal(refreshes,1);
});
test('legacy no-op response is not success',async()=>{
 const r=await sendReading(async()=>({error:0,message:'Нет показаний для сохранения (все показания нулевые или NULL)'}),async()=>assert.fail('must not refresh'));
 assert.equal(r.error,true);
});
test('refresh failure preserves confirmed submission, never resends',async()=>{
 let sends=0;const r=await sendReading(async()=>{sends++;return {error:false}},async()=>{throw Error('offline')});
 assert.equal(r.error,false);assert.equal(r.refreshFailed,true);assert.equal(sends,1);
});
test('save transport error is ambiguous, never success or automatic retry',async()=>{
 let sends=0;const r=await sendReading(async()=>{sends++;throw Error('offline')},async()=>assert.fail());
 assert.equal(r.error,true);assert.equal(r.message,UNCONFIRMED_READING);assert.equal(sends,1);
});
test('actual store clears loading on failed request and failed refresh',async()=>{
 const text=fs.readFileSync(new URL('../../src/Store/licsStore.ts',import.meta.url),'utf8');
 const body=text.slice(text.indexOf('async (token: string, counters: LicCounter[]) =>'),text.indexOf('      get_payment:')).trim().replace(/,$/,'');
 for(const stage of ['save','refresh']){
  let state={},calls=0;const api=async()=>{calls++;if(stage==='save'||calls===2)throw Error('offline');return {error:false}};
  const fn=vm.runInNewContext(stripTypeScriptTypes('const f='+body)+'\nf',{sendReading,api,set:x=>Object.assign(state,x)});
  const result=await fn('synthetic',[]);assert.equal(state.loading,false);assert.equal(result.error,stage==='save');
 }
});
test('actual form does not show success on error object; blocks a concurrent click',async()=>{
 const source=fs.readFileSync(new URL('../../src/components/Lics/components/Indices/Counter.tsx',import.meta.url),'utf8');
 const body=source.slice(source.indexOf('  const handleSubmitIndication'),source.indexOf('  const handleInputChange'));
 let success=0,errors=0,accepted=0,sends=0,release;const inFlight={current:false};
 const run=vm.runInNewContext(stripTypeScriptTypes(body)+'\nhandleSubmitIndication',{
  inFlight,mode:true,setSubmitting:()=>{},setMode:()=>{},info:{},
  setIndice:async()=>{sends++;return new Promise(r=>release=r)},lload:()=>accepted++,UNCONFIRMED_READING,
  toast:{success:()=>success++,error:()=>errors++},
 });
 const first=run();await run();assert.equal(sends,1);release({error:true,message:'rejected'});await first;
 assert.equal(success,0);assert.equal(accepted,0);assert.equal(errors,1);assert.equal(inFlight.current,false);
});
test('bounded transport aborts fetch once without automatic retry',async()=>{
 const original=globalThis.fetch;let calls=0;
 globalThis.fetch=async(_url,init)=>{calls++;return new Promise((_,reject)=>init.signal.addEventListener('abort',()=>reject(Error('aborted'))))};
 try{await assert.rejects(requestJson('synthetic','https://synthetic.invalid',{timeoutMs:10}));assert.equal(calls,1)}finally{globalThis.fetch=original}
});
test('bounded transport rejects HTTP errors',async()=>{
 const original=globalThis.fetch;globalThis.fetch=async()=>({ok:false,status:500,json:async()=>({error:false})});
 try{await assert.rejects(requestJson('synthetic','https://synthetic.invalid',{timeoutMs:1000}))}finally{globalThis.fetch=original}
});
