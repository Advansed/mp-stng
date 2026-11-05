const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
function setup(fetchImpl, revision) {
  const storage = new Map(); let timer; let calls = 0; let lastInit;
  const localStorage = { getItem: k => storage.get(k) ?? null, setItem: (k,v) => storage.set(k,v), removeItem:k=>storage.delete(k) };
  function compile(file, imports) {
    const out = ts.transpileModule(revision ? require('node:child_process').execFileSync('git',['show',`${revision}:${file}`],{cwd:root,encoding:'utf8'}) : fs.readFileSync(path.join(root,file),'utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText;
    const exports = {};
    vm.runInNewContext(out, {exports, require:n=>imports[n], localStorage, console:{log(){},error(){}}, Error, AbortController, setTimeout:fn=>{timer=fn;return 1;},clearTimeout:()=>{timer=undefined;},fetch:(url,init)=>{calls++;lastInit=init;return fetchImpl(url,init);}});
    return exports;
  }
  const api = compile('src/Store/api.ts',{});
  const {useAuthStore:store} = compile('src/components/Login/authStore.ts', {'zustand':require('zustand'),'../../Store/api':api,'../DataEditor/fields/snils':{formatSnils:s=>s}});
  return {store,storage, expire:()=>timer(), calls:()=>calls,init:()=>lastInit, hasTimer:()=>!!timer};
}
const response = data => ({ok:true,status:200,json:async()=>data});
const aborted = () => Object.assign(new Error('aborted'), {name:'AbortError'});
test('valid login preserves payload and success/token behavior',async()=>{
 const ctx=setup(async()=>response({error:false,data:{token:'synthetic-token',code:'synthetic-code'}}));
 const result=await ctx.store.getState().login('synthetic-phone','synthetic-password');
 assert.equal(result.error,false);assert.equal(ctx.store.getState().auth,true);assert.equal(ctx.store.getState().isLoading,false);
 assert.equal(ctx.storage.get('token'),'synthetic-token');assert.equal(ctx.init().method,'POST');
 assert.deepEqual(JSON.parse(ctx.init().body),{phone:'synthetic-phone',password:'synthetic-password',version:'2.5.9',mode:'android'});
});
test('server business error retained and loading cleared',async()=>{
 const ctx=setup(async()=>response({error:true,message:'Пароль не верен'}));
 assert.equal((await ctx.store.getState().login('x','x')).message,'Пароль не верен');assert.equal(ctx.store.getState().isLoading,false);assert.equal(ctx.store.getState().auth,false);
});
test('transport failure is readable, no raw Failed to fetch',async()=>{
 const ctx=setup(async()=>{throw new TypeError('Failed to fetch')});
 const result=await ctx.store.getState().login('x','x');assert.equal(result.error,true);assert.match(result.message,/подключение/);assert.doesNotMatch(result.message,/fetch/);assert.equal(ctx.store.getState().isLoading,false);
});
for(const stage of ['fetch','body']) test(`${stage} timeout clears loading, no automatic retry`,async()=>{
 const ctx=setup(async(url,init)=>{
  const wait = ()=>new Promise((resolve,reject)=>{ if(init.signal.aborted) return reject(aborted()); init.signal.addEventListener('abort',()=>reject(aborted()),{once:true}); });
  return stage==='fetch'?wait():{ok:true,status:200,json:wait};
 });
 const pending=ctx.store.getState().login('x','x');await Promise.resolve();await Promise.resolve();ctx.expire();
 const result=await pending;assert.match(result.message,/вовремя/);assert.equal(ctx.store.getState().isLoading,false);assert.equal(ctx.calls(),1);
});
test('double press issues only one request',async()=>{
 let done;const ctx=setup(()=>new Promise(resolve=>done=resolve));const pending=ctx.store.getState().login('x','x');
 const duplicate=await ctx.store.getState().login('x','x');assert.equal(duplicate.error,true);assert.equal(ctx.calls(),1);assert.equal(ctx.store.getState().isLoading,true);
 done(response({error:true,message:'denied'}));await pending;assert.equal(ctx.store.getState().isLoading,false);
});
for(const kind of ['http','json']) test(`${kind} failure clears loading without auth`,async()=>{
 const ctx=setup(async()=>kind==='http'?{ok:false,status:502}:{ok:true,status:200,json:async()=>{throw new SyntaxError('bad json')}});
 assert.equal((await ctx.store.getState().login('x','x')).error,true);assert.equal(ctx.store.getState().isLoading,false);assert.equal(ctx.store.getState().auth,false);
});

test('installed 2.5.7 reproduces unbounded pending and unchanged auth contract', async()=>{
 let done; const ctx=setup(()=>new Promise(resolve=>done=resolve),'4c1a672');
 const pending=ctx.store.getState().login('synthetic-phone','synthetic-password');
 assert.equal(ctx.hasTimer(),false);assert.equal(ctx.init().signal,undefined);assert.equal(ctx.store.getState().isLoading,true);
 assert.deepEqual(JSON.parse(ctx.init().body),{phone:'synthetic-phone',password:'synthetic-password',version:'2.5.7',mode:'android'});
 done(response({error:true,message:'synthetic-denial'}));await pending;assert.equal(ctx.store.getState().isLoading,false);
});
test('installed 2.5.7 surfaces Failed to fetch directly and then clears loading',async()=>{
 const ctx=setup(async()=>{throw new TypeError('Failed to fetch')},'4c1a672');
 assert.equal((await ctx.store.getState().login('x','x')).message,'Failed to fetch');assert.equal(ctx.store.getState().isLoading,false);
});
test('installed 2.5.7 double press starts two authorization requests',async()=>{
 let finish=[];const ctx=setup(()=>new Promise(resolve=>finish.push(resolve)),'4c1a672');
 const first=ctx.store.getState().login('x','x');const second=ctx.store.getState().login('x','x');assert.equal(ctx.calls(),2);
 for(const done of finish) done(response({error:true,message:'synthetic-denial'}));await Promise.all([first,second]);
});
test('next explicit attempt works after a network failure',async()=>{
 let attempts=0;const ctx=setup(async()=>{if(++attempts===1) throw new TypeError('Failed to fetch');return response({error:false,data:{token:'synthetic-token'}});});
 assert.equal((await ctx.store.getState().login('x','x')).error,true);assert.equal(ctx.calls(),1);assert.equal(ctx.store.getState().isLoading,false);
 assert.equal((await ctx.store.getState().login('x','x')).error,false);assert.equal(ctx.calls(),2);assert.equal(ctx.store.getState().auth,true);assert.equal(ctx.store.getState().isLoading,false);
});
