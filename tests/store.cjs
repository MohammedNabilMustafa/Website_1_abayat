const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const element={textContent:'',style:{},close(){},innerHTML:''};
const context=vm.createContext({console,Intl,Map,Math,Date,Number,String,JSON,localStorage:{getItem(){return null},setItem(){}},document:{querySelector(){return element}},location:{hash:''},window:{},FormData:class{constructor(form){this.form=form;return this}[Symbol.iterator](){return Object.entries(this.form)[Symbol.iterator]()}getAll(k){return this.form[k]===undefined?[]:[this.form[k]]}}});
vm.runInContext(fs.readFileSync('dist/app.js','utf8')+';render=()=>{};toast=()=>{};',context);
context.productSizes=p=>p.sizes||['S','M','L','XL','XXL'];context.collectionCards=()=>'';context.collectionToolbar=()=>'';let count=0;function test(name,code){vm.runInContext("{"+code+"}",context);count++;console.log('PASS '+name)}context.assert=assert;
test('combined sizes cannot reactivate above stock',`products=[{id:1,stock:1,price:100}];orders=[{id:'test',status:'ملغي',items:[{id:1,qty:1},{id:1,qty:1}]}];setStatus('test','جديد');assert.equal(products[0].stock,1);assert.equal(orders[0].status,'ملغي')`);
test('reactivation reserves combined quantities',`products[0].stock=3;setStatus('test','جديد');assert.equal(products[0].stock,1);assert.equal(orders[0].status,'جديد')`);
test('progress status does not reserve twice',`setStatus('test','جاري التجهيز');setStatus('test','تم الشحن');setStatus('test','مكتمل');assert.equal(products[0].stock,1)`);
test('cancellation restores once',`setStatus('test','ملغي');setStatus('test','ملغي');assert.equal(products[0].stock,3)`);
test('unknown status or order ignored',`setStatus('missing','جديد');setStatus('test','wrong');assert.equal(orders[0].status,'ملغي')`);
test('zero quantity rejected',`cart=[];qty=0;assert.equal(add(1),false);assert.equal(cart.length,0)`);
test('aggregate cart stock cap across sizes',`qty=2;size='S';assert.equal(add(1),true);size='M';assert.equal(add(1),false);assert.equal(cart.length,1)`);
test('cart increase caps available inventory',`changeQty(0,10);assert.equal(cart[0].qty,3)`);
test('cart decrease minimum one',`changeQty(0,-10);assert.equal(cart[0].qty,1)`);
test('shipping below threshold',`assert.equal(subtotal(),100);assert.equal(shipping(),25)`);
test('shipping free threshold',`cart[0].qty=3;assert.equal(shipping(),0)`);
test('changed stock blocks checkout',`products[0].stock=2;const old=orders.length;placeOrder({preventDefault(){},target:{name:'عميل اختبار',phone:'0500000000',city:'الرياض',address:'عنوان اختبار'}});assert.equal(orders.length,old);assert.equal(cart.length,1)`);
test('checkout creates snapshot and deducts stock',`products[0].stock=3;products[0].name='عباية';placeOrder({preventDefault(){},target:{name:'عميل اختبار',phone:'0500000000',city:'الرياض',address:'عنوان اختبار'}});assert.equal(cart.length,0);assert.equal(products[0].stock,0);assert.equal(orders[0].total,300);assert.equal(orders[0].items[0].price,100)`);
test('order prices remain historical',`products[0].price=200;assert.equal(orders[0].items[0].price,100)`);
test('product whitespace validation',`const n=products.length;saveProduct({preventDefault(){},target:{name:'   ',desc:'test',sizes:'M',price:'5',stock:'1',category:'black'}},0);assert.equal(products.length,n)`);
test('product rejects fractional inventory',`const n=products.length;saveProduct({preventDefault(){},target:{name:'test',desc:'test',sizes:'M',price:'5',stock:'1.5',category:'black'}},0);assert.equal(products.length,n)`);
test('settings reject blank name',`const n=settings.name;updateSettings({preventDefault(){},target:{name:'   ',phone:'',email:''}});assert.equal(settings.name,n)`);
test('HTML is escaped',`assert.equal(esc('<script>'), '&lt;script&gt;')`);
console.log(count+' tests passed');

context.indexedDB={open(){return {}}};
vm.runInContext(fs.readFileSync('dist/admin.js','utf8'),context);
vm.runInContext(`products=Array.from({length:5000},(_,i)=>({id:i+1,name:'عباية اختبار '+i,price:100,stock:20,category:i%2?'black':'beige',desc:'وصف'}));orders=Array.from({length:20000},(_,i)=>({id:'QA-'+i,name:'عميل '+i,phone:'0500000000',city:'الرياض',address:'تجريبي',status:statuses[i%5],total:100,date:'2026/10/10',createdAt:Date.now(),items:[{id:1,name:'عباية',qty:1,size:'M',price:100}]}));cart=[]`,context);
for(const expression of ['home()','shop()','admin()','admin(\'orders\')','admin(\'products\')','mediaPage()','ordersTable()']){const start=performance.now();const html=vm.runInContext(expression,context);const elapsed=(performance.now()-start).toFixed(2);assert.ok(html.length<100000);console.log('LOAD '+expression+': '+elapsed+' ms, '+html.length+' HTML characters');}
