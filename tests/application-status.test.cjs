const fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const {test}=require('node:test'),assert=require('node:assert/strict');
const base=path.resolve(__dirname,'..'),ts=require('typescript'),React=require('react');
const {renderToStaticMarkup}=require('react-dom/server');
function load(file,req){const exports={};vm.runInNewContext(ts.transpileModule(fs.readFileSync(path.join(base,file),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.React,esModuleInterop:true,target:ts.ScriptTarget.ES2020}}).outputText,{exports,require:req});return exports;}
const utils=load('src/components/Apps/appStatusUtils.ts',require);
let rows=[],route={},token=null,loader=()=>{throw Error('NETWORK_FORBIDDEN')};const store=fn=>fn({services:rows,loadServices:loader});store.getState=()=>({services:rows});
const ion=new Proxy({}, {get:(_,name)=>({children,onClick})=>React.createElement('div',{'data-component':name,onClick},children)});
const component=load('src/components/Apps/AppStatuses.tsx',name=>{
if(name==='react')return React;if(name==='@ionic/react')return ion;
if(name==='react-router-dom')return{useLocation:()=>({state:route})};
if(name==='ionicons/icons')return{};
if(name.includes('serviceStore'))return{useServiceStore:store};
if(name.includes('authStore'))return{useToken:()=>token};
if(name.includes('PDFDocModal'))return{PDFDocModal:()=>null,usePDFDocModal:()=>({isOpen:false})};
if(name==='../Toast')return{useToast:()=>({})};
if(name==='./useApps')return{useApps:()=>({})};
if(name==='./agreementContract')return{resolveAppDocId:(_,id)=>id};
if(name==='./appStatusUtils')return utils;
if(name.endsWith('.css'))return{};
throw Error('Unexpected dependency '+name);
});
function render(record,state={}){rows=record?[{id:'synthetic',...record}]:[];route=state;return renderToStaticMarkup(React.createElement(component.AppStatuses,{appId:'synthetic'}));}
function entry(status,comment,period='2026-10-29 10:00'){return{status,comment,period};}
test('all existing status codes human-readable; unknown never raw',()=>{
for(const code of ['new','checked','ai_checked','created','signed','success','edit','denied','unknown_internal_code'])assert.notEqual(utils.statusLabel(code),code);
assert.equal(utils.statusLabel('unknown_internal_code'),'Статус уточняется');
assert.equal(utils.statusLabel('ai_checked'),'Статус обновлён');
assert.equal(utils.isSignedStatus('success'),false);assert.equal(utils.isSignedStatus('signed'),true);
});
test('success comment visible in complete history, never correction or unverified document action',()=>{
const html=render({status:'success',statuses:[entry('success','Подписанный документ поступил из Госключа')]});
assert.match(html,/Госключ/);assert.doesNotMatch(html,/>success<|Следующее действие|Открыть договор/);
});
test('legacy signed preserves document action',()=>assert.match(render({status:'signed',statuses:[entry('signed','Документ подписан')]}),/Открыть договор/));
test('same codes with distinct reasons retained, including historical success message under denied',()=>{
const html=render({status:'success',statuses:[entry('edit','Первое замечание'),entry('edit','Второе замечание','2026-10-29 11:00'),entry('denied','Документ поступил из Госключа','2026-10-29 12:00'),entry('success','Завершено','2026-10-29 13:00')]});
for(const text of ['Первое замечание','Второе замечание','Отказано','Завершено'])assert.ok(html.includes(text));
assert.doesNotMatch(html,/Следующее действие|Редактировать/);
});
test('fresh store wins over stale navigation snapshot',()=>{
const html=render({status:'success',statuses:[entry('success','Актуальное сообщение')]},{statuses:[entry('edit','Старый снимок')]});
assert.match(html,/Актуальное сообщение/);assert.doesNotMatch(html,/Старый снимок|Редактировать/);
});
test('current status without history is meaningful and includes comment',()=>{
const html=render({status:'success',comment:'Текущее подтверждение',statuses:[]});assert.match(html,/Статус обновлён|Отмечено подписание/);assert.match(html,/Текущее подтверждение/);assert.match(html,/Нет записей/);
});
test('current success overrides old signed action without rewriting historic signed',()=>{
const html=render({status:'success',statuses:[entry('signed','Старая запись')]});assert.match(html,/Старая запись/);assert.doesNotMatch(html,/Открыть договор/);
});
test('current denied cannot be changed by success-like comment',()=>{
const html=render({status:'denied',statuses:[entry('denied','Подписанный документ поступил из Госключа')]});assert.match(html,/Отказано|Причина отказа/);assert.doesNotMatch(html,/Открыть договор/);
});

// Actual React effects, explicit refresh failure and retry; no network.
test('entry refresh loads once, exposes failure, explicit retry recovers without mutation',async()=>{
// Optional native canvas is irrelevant for this text/click test.
try { require.cache[require.resolve('canvas')]={exports:{}}; } catch (error) {
  if (error.code !== 'MODULE_NOT_FOUND') throw error;
}
const {JSDOM}=require('jsdom');const dom=new JSDOM('<div id="root"></div>',{url:'http://localhost'});
global.window=dom.window;global.document=dom.window.document;global.navigator=dom.window.navigator;global.IS_REACT_ACT_ENVIRONMENT=true;
const {createRoot}=require('react-dom/client'),{act}=require('react-dom/test-utils');
let calls=0;token='synthetic';route={statuses:[entry('edit','Stale route')]};rows=[{id:'synthetic',status:'success',statuses:[entry('success','Fresh receipt')]}];
loader=async()=>{calls++;return calls===1?{error:true}:{error:false,data:rows}};
const root=createRoot(document.getElementById('root'));
await act(async()=>{root.render(React.createElement(component.AppStatuses,{appId:'synthetic'}));});
assert.equal(calls,1);assert.match(document.body.textContent,/Не удалось обновить историю/);assert.doesNotMatch(document.body.textContent,/Stale route/);
// Ionic primitives are mocked as ordinary elements with the original click handler.
const refresh=[...document.querySelectorAll('[data-component="IonButton"]')].find(e=>e.textContent==='Обновить историю');
await act(async()=>{refresh.dispatchEvent(new window.MouseEvent('click',{bubbles:true}));});
assert.equal(calls,2);assert.doesNotMatch(document.body.textContent,/Не удалось обновить историю/);
await act(async()=>root.unmount());token=null;dom.window.close();
});

test('only approved success receipt gets Goskey presentation; arbitrary substring and denied do not',()=>{
const receipt='Успешно поступил подписанный документ из системы Госключ';
assert.equal(utils.isGoskeyReceipt('success',{comment:receipt}),true);
assert.equal(utils.isGoskeyReceipt('success',{comment:'"'+receipt+'"'}),true);
assert.equal(utils.isGoskeyReceipt('success',{comment:'«'+receipt+'»'}),false);
assert.equal(utils.statusLabel('success',{comment:receipt}),'Подписание подтверждено');
assert.equal(utils.isGoskeyReceipt('denied',{comment:receipt}),false);
assert.equal(utils.isGoskeyReceipt('success',{comment:'Ошибка Госключ'}),false);
assert.equal(utils.isGoskeyReceipt('success',{comment:'NOT '+receipt}),false);
assert.equal(utils.statusLabel('success'),'Статус обновлён');
const html=render({status:'success',statuses:[entry('success',receipt)]});assert.match(html,/Получено подтверждение подписания через Госключ/);assert.doesNotMatch(html,/Открыть договор/);
});

test('explicit empty current comment prevents history-based receipt classification',()=>{
const receipt='Успешно поступил подписанный документ из системы Госключ';
assert.equal(utils.isGoskeyReceipt('success',{comment:'',statuses:[entry('success',receipt)]}),false);
assert.equal(utils.isGoskeyReceipt('success',{statuses:[entry('denied',receipt)]}),false);
assert.equal(utils.isGoskeyReceipt('success',{statuses:[entry('success',receipt)]}),false);
assert.equal(utils.isGoskeyReceipt('success',{statuses:[entry('success',receipt),entry('success','Иное завершение','2026-10-29 11:00')]}),false);
});

test('current correction comment wins in action while old remark remains in history',()=>{
const html=render({status:'edit',comment:'Новое замечание',statuses:[entry('edit','Старое замечание')]});
assert.match(html,/Новое замечание/);assert.match(html,/Старое замечание/);
});
test('top-level success comment remains visible when nonempty history exists',()=>{
const html=render({status:'success',comment:'Новое подтверждение',statuses:[entry('checked','Ранее проверено')]});assert.match(html,/Новое подтверждение/);
});

// Presentation-only regression: no invented chronology/current state.
test('no history means no fabricated event; edit reason and action remain outside timeline',()=>{
 const html=render({status:'edit',comment:'Укажите полное имя',statuses:[]});
 assert.match(html,/Укажите полное имя/); assert.match(html,/Редактировать/);
 assert.match(html,/Нет записей/); assert.doesNotMatch(html,/role="listitem"/);
});
test('current signed without history keeps existing document action without inventing an event',()=>{
 const html=render({status:'signed',statuses:[]}); assert.match(html,/Открыть договор/);
 assert.doesNotMatch(html,/role="listitem"/);
});
test('history alone cannot assert current state or current correction action',()=>{
 const html=render({statuses:[entry('edit','Историческое замечание')]});
 assert.match(html,/Историческое замечание/); assert.doesNotMatch(html,/Текущий статус:|Редактировать/);
});
test('undated source event remains visible without a made-up date',()=>{
 const html=render({status:'denied',comment:'Причина отказа',statuses:[entry('denied','Причина отказа','')]});
 assert.match(html,/Дата не указана/); assert.match(html,/Причина отказа/);
});
test('labels never claim external delivery or generic completion',()=>{
 const expected={new:'Заявка зарегистрирована',checked:'Проверка пройдена',ai_checked:'Статус обновлён',created:'Подготовка договора',signed:'Отмечено подписание',success:'Статус обновлён',edit:'Есть замечания',denied:'Отказано'};
 for(const [code,label] of Object.entries(expected))assert.equal(utils.statusLabel(code),label);
 assert.equal(utils.statusLabel('new',{Тип:'Черновик'}),'Черновик');
});
