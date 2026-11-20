'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),ts=require('typescript');
const root=path.resolve(__dirname,'..');
function load(file){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(root,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020}}).outputText,{exports});return exports;}
const {invitationToken,createInvitationStore,INVITATION_KEY,INVITATION_TTL_MS}=load('src/referral/invitation.ts');
const {observeInvitationLinks}=load('src/referral/launch.ts');
const token='a'.repeat(43),other='b'.repeat(43),url=t=>`https://referal.aostng.ru/r/${t}`;
function fixture(initial){let value=initial,clock=1000,writes=0;const storage={async getItem(){return value},async setItem(k,v){assert.equal(k,INVITATION_KEY);value=v;writes++;},async removeItem(){value=null}};return {storage,store:createInvitationStore(storage,()=>clock),setTime:v=>clock=v,getValue:()=>value,writes:()=>writes};}
const tick=()=>new Promise(resolve=>setImmediate(resolve));
test('strict invitation URL only; ESIA, payload and normalization tricks ignored',()=>{
 assert.equal(invitationToken(url(token)),token);
 for(const value of [null,{},'mystnglk://auth/callback?code=x',url(token)+'?token=secret',url(token)+'#fragment',url(token)+'/',url(token)+'\n',url(token).replace('https:','http:'),url(token).replace('referal.','referal.evil.'),url(token).replace('/r/','/x/../r/'),url(token).replace('/r/','/r/%61'),url(token).replace('https://','https://user@'),url(token.slice(1)),url(token+'a')])assert.equal(invitationToken(value),null,String(value));
});
test('persists exact allowlisted reference only; reload retains it, no identity',async()=>{
 const f=fixture();assert.equal(await f.store.capture(url(token)),'captured');assert.deepEqual(Object.keys(f.getValue()).sort(),['capturedAt','expiresAt','token','version']);
 assert.equal((await createInvitationStore(f.storage,()=>1100).read()).token,token);assert.equal(f.writes(),1);
});
test('concurrent cold/warm duplicate and competing invitations preserve first; no TTL extension',async()=>{
 const f=fixture();assert.deepEqual(await Promise.all([f.store.capture(url(token)),f.store.capture(url(token)),f.store.capture(url(other))]),['captured','duplicate','kept-first']);
 f.setTime(2000);await f.store.capture(url(token));assert.equal(f.getValue().capturedAt,1000);assert.equal(f.writes(),1);
});
test('expired records cleared and new invitation accepted at exact boundary',async()=>{
 const f=fixture();await f.store.capture(url(token));f.setTime(1000+INVITATION_TTL_MS);assert.equal(await f.store.read(),null);assert.equal(await f.store.capture(url(other)),'captured');assert.equal(f.getValue().token,other);
});
test('malformed/future records fail closed, unknown fields are not exposed',async()=>{
 for(const value of [{version:2,token},'broken',{version:1,token,capturedAt:2000,expiresAt:2000+INVITATION_TTL_MS},{version:1,token,capturedAt:100,expiresAt:999999999}]){const f=fixture(value);assert.equal(await f.store.read(),null);assert.equal(f.getValue(),null);}
 const f=fixture({version:1,token,capturedAt:100,expiresAt:100+INVITATION_TTL_MS,phone:'synthetic'});assert.equal('phone' in await f.store.read(),false);
});
test('storage failure does not poison queue or pretend success',async()=>{
 const f=fixture();let fail=true;const original=f.storage.setItem;f.storage.setItem=async(...args)=>{if(fail)throw Error('unavailable');return original(...args)};
 await assert.rejects(f.store.capture(url(token)));fail=false;assert.equal(await f.store.capture(url(token)),'captured');
});
test('observer captures cold and warm URLs, removes only owned listener',async()=>{
 let callback,removed=0;const calls=[];const source={async addListener(name,cb){assert.equal(name,'appUrlOpen');callback=cb;return {async remove(){removed++}}},async getLaunchUrl(){return {url:url(token)}}};
 const observer=observeInvitationLinks(source,async value=>calls.push(value));await observer.ready;callback({url:url(other)});await tick();observer.stop();callback({url:url(token)});await tick();assert.deepEqual(calls,[url(token),url(other)]);assert.equal(removed,1);
});
test('unmount during listener registration disposes late handle, never reads launch',async()=>{
 let resolve,reads=0,removed=0;const observer=observeInvitationLinks({addListener:()=>new Promise(r=>resolve=r),async getLaunchUrl(){reads++;}},async()=>assert.fail());observer.stop();resolve({async remove(){removed++}});await observer.ready;assert.equal(reads,0);assert.equal(removed,1);
});
test('subscription failure still allows cold lookup; failed capture never rejects startup',async()=>{
 let captures=0;const observer=observeInvitationLinks({async addListener(){throw Error('not supported')},async getLaunchUrl(){return {url:url(token)}}},async()=>{captures++;throw Error('storage blocked')});await observer.ready;await tick();observer.stop();assert.equal(captures,1);
});
test('unmount during cold lookup ignores late delivery',async()=>{
 let resolve;const observer=observeInvitationLinks({async addListener(){return {async remove(){}}},getLaunchUrl:()=>new Promise(r=>resolve=r)},async()=>assert.fail());await tick();observer.stop();resolve({url:url(token)});await observer.ready;
});
test('referral path has no network, credentials, auth store or status-event side effects',()=>{
 for(const file of ['invitation.ts','launch.ts','ReferralInitializer.tsx']){const source=fs.readFileSync(path.join(root,'src/referral',file),'utf8');assert.doesNotMatch(source,/\bfetch\s*\(|axios|useAuthStore|authorization|localStorage|REGISTRATION_CONFIRMED|PHONE_VERIFIED|APP_FIRST_OPEN/);}
 assert.doesNotMatch(fs.readFileSync(path.join(root,'src/components/Login/ESIALoginButton.tsx'),'utf8'),/App\.removeAllListeners/);
});
