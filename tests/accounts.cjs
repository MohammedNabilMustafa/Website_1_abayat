const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const storage=()=>{const map=new Map();return {getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),dump:()=>JSON.stringify([...map])}};
const el={textContent:'',style:{},close(){},innerHTML:''};
class Data {constructor(form){this.form=form}[Symbol.iterator](){return Object.entries(this.form)[Symbol.iterator]()}get(k){return this.form[k]??null}getAll(k){const v=this.form[k];return v===undefined?[]:Array.isArray(v)?v:[v]}}
const context=vm.createContext({assert,console,Intl,Map,Math,Date,Number,String,JSON,Set,crypto:webcrypto,localStorage:storage(),sessionStorage:storage(),document:{querySelector(){return el}},location:{hash:''},FormData:Data,indexedDB:{open(){return {}}}});context.window=context;
for(const name of ['services/accounts','app','admin','accounts','catalogue','inventory'])vm.runInContext(fs.readFileSync('dist/'+name+'.js','utf8'),context);
vm.runInContext('render=()=>{};toast=()=>{};',context);
(async()=>{
 let n=0;async function test(name,code){await vm.runInContext('(async()=>{'+code+'})()',context);n++;console.log('PASS '+name)}
 await test('signup creates client and never stores password',`await accountService.signUp({name:'عميلة اختبار',email:'a@example.com',password:'Temporary123'});assert.equal(currentAccount().role,'client');assert.ok(!localStorage.dump().includes('Temporary123'));assert.ok(!sessionStorage.dump().includes('Temporary123'))`);
 await test('duplicate email rejected',`await assert.rejects(accountService.signUp({name:'اسم',email:'A@example.com',password:'Temporary123'}));`);
 await test('customer identity derives from selected account',`const d=orderIdentity({email:'a@example.com'});assert.equal(d.customerType,'account');assert.equal(d.customerId,currentAccount().uid);`);
 await test('client only sees own orders',`orders=[{id:'mine',customerId:currentAccount().uid},{id:'other',customerId:'another'}];assert.equal(customerOrders().length,1);assert.equal(canViewOrder(orders[1]),false)`);
 await test('guest order does not require account',`await accountService.signOut();const d=orderIdentity({});assert.equal(d.customerId,null);assert.equal(d.emailStatus,'not-requested');assert.equal(d.customerType,'guest');`);
 await test('guest receipts scoped to recorded IDs',`orders=[{id:'guest',customerId:null},{id:'unknown',customerId:null}];rememberGuestOrder('guest');assert.equal(canViewOrder(orders[0]),true);assert.equal(canViewOrder(orders[1]),false);`);
 await test('reset preview never reports actual sending',`const r=await accountService.requestPasswordReset('a@example.com');assert.equal(r.sent,false);assert.equal(r.preview,true);`);
 await test('admin preview explicit',`assert.equal(isAdminPreview(),false);await accountService.enterPreview('admin');assert.equal(isAdminPreview(),true);`);
 await test('product custom sizes parsed and deduplicated',`products=[{id:1,name:'عباية',price:100,stock:5,category:'black'}];saveProduct({preventDefault(){},target:{name:'عباية',desc:'وصف',price:'100',stock:'5',category:'black',sizes:'M',customSizes:'52،54,52','stock:M':'1','stock:52':'2','stock:54':'2'}},1);assert.equal(products[0].sizes.join(','),'M,52,54');`);
 await test('empty size selection rejected',`saveProduct({preventDefault(){},target:{name:'عباية',desc:'وصف',price:'100',stock:'5',category:'black',customSizes:''}},1);assert.equal(products[0].sizes.join(','),'M,52,54');`);
 await test('unavailable size cannot be added',`size='S';qty=1;cart=[];assert.equal(add(1),false);assert.equal(cart.length,0);`);
 await test('changed sizes block existing cart at checkout',`cart=[{id:1,qty:1,size:'S'}];const before=orders.length;placeOrder({preventDefault(){},target:{name:'اختبار',phone:'0500000000',city:'الرياض',address:'عنوان تجريبي'}});assert.equal(orders.length,before);`);
 await test('remove collection keeps products',`collections=[{id:'black',name:'الأسود'}];removeCollection('black');assert.equal(products.length,1);assert.equal(products[0].category,'uncategorized');assert.equal(collections.length,0);`);
 console.log(n+' account/catalogue tests passed');
})().catch(e=>{console.error(e);process.exitCode=1});
