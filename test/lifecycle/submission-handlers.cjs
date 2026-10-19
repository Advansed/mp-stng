const fs=require('fs'),vm=require('vm'),assert=require('assert/strict'),ts=require('typescript');
const base=require('path').resolve(__dirname,'../..')+'/';
const opts={module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2020};
const compile=s=>ts.transpileModule(s,{compilerOptions:opts}).outputText;
const mod={exports:{}};vm.runInNewContext(compile(fs.readFileSync(base+'src/utils/submission.ts','utf8')),{exports:mod.exports});
function fn(file,name,context){const s=fs.readFileSync(base+file,'utf8'),ast=ts.createSourceFile('test.tsx',s,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);let d;const visit=n=>{if(ts.isVariableDeclaration(n)&&n.name.getText(ast)===name)d=n;ts.forEachChild(n,visit)};visit(ast);assert.ok(d);return vm.runInNewContext(compile('const '+d.getText(ast)+';'+name),context);}
(async()=>{
 let count=0;
 for(const file of ['src/components/Apps/AppOrder.tsx','src/components/Services/Order.tsx'])for(const fail of [false,true]){
  let back=0,sent;const ctx={...mod.exports,isLoading:false,normalizedService:{chapters:[{}]},didPersistRef:{current:false},getOrderData:()=>({id:'fixture',Проведен:2,Файлы:[{name:'SNILS',files:['synthetic']}]}),onSave:async p=>{sent=p;if(fail)throw Error('fixture rejection')},onBack:()=>back++,toast:{error(){}},console:{error(){}}};
  await fn(file,'handleSave',ctx)([]);assert.equal(sent.Проведен,0);assert.equal(sent.intent,'submit');assert.equal(sent.Файлы[0].files[0],'synthetic');assert.equal(back,fail?0:1);count++;
 }
 for(const kind of ['Черновик','Договор']){
  let sent;const ctx={...mod.exports,isLoading:false,normalizedService:{chapters:[{}],type:'agreement'},service:{type:'agreement',Тип:kind},didPersistRef:{current:false},getOrderData:()=>({id:'fixture'}),onSave:async p=>{sent=p}};
  await fn('src/components/Services/Order.tsx','persistDraft',ctx)([]);assert.equal(sent.intent,kind==='Договор'?'edit':'draft');assert.equal(sent.Проведен,kind==='Договор'?undefined:2);count++;
 }
 let back=0;await fn('src/components/Services/Order.tsx','handleExit',{persistDraft:async()=>{throw Error('reject')},orderData:[],toast:{error(){}},onBack:()=>back++})([]);assert.equal(back,0);count++;
 console.log(JSON.stringify({passed:count,actualHandlers:true,productionRequests:0}));
})().catch(e=>{console.error(e);process.exitCode=1});
