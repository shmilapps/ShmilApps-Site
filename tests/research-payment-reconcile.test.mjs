import assert from 'node:assert/strict';
import {createPaymentSync,listSumitPayments} from '../lib/server/research-payment-reconcile.js';
import {createReconciliationHandler,validSyncAuthorization} from '../api/research-payment-reconcile.js';
import {createPaymentVerifier} from '../lib/server/research-payment.js';
import {paymentReference} from '../lib/server/research-payment-reference.js';
const id='00000000-0000-4000-8000-000000000001',secret='a'.repeat(64);
const env={SUPABASE_URL:'https://ufolbezpnhyrsyuxuaox.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_mock',SHMILAPPS_ORDER_INTAKE_ENABLED:'true',SUMIT_API_KEY:'mock',SUMIT_PAYMENT_VERIFICATION_ENABLED:'true',RESEARCH_PAYMENT_SYNC_SECRET:secret};
const reference=paymentReference(id,env.SUPABASE_SECRET_KEY);
let order,record,mail,commits,sends,payment,verifiedCalls,listCalls,pages,registered,registerOk,throwNotify;
function reset(amount=9900){order={id,status:'pending_payment',final_price_agorot:amount};record=null;mail=null;commits=0;sends=0;verifiedCalls=0;registered=0;listCalls=[];registerOk=true;throwNotify=false;payment={ID:123,ValidPayment:true,ExternalIdentifier:reference,Amount:amount/100,Currency:0};pages=null;}
const db={from:table=>({select:()=>{const q={eq:()=>q,maybeSingle:async()=>({data:table==='orders'?order:record}),in:async()=>({data:table==='orders'?[order]:mail?[mail]:[]})};return q;}}),rpc:async(name,args)=>{
 if(name==='register_research_notification_retry'){registered++;assert.equal(order.status,'paid');return{data:registerOk};}
 assert.equal(name,'confirm_order_payment');assert.equal(args.p_order_id,id);assert.equal(args.p_amount_agorot,order.final_price_agorot);commits++;order.status='paid';record={order_id:id,provider_transaction_id:'123',verified:true,event_type:'payment_confirmed',amount_agorot:order.final_price_agorot,currency:'ILS'};return{data:true};
}};
const verify=createPaymentVerifier({env:()=>env,getDb:()=>db,getPayment:async()=>{verifiedCalls++;return payment;}});
const sync=createPaymentSync({env:()=>env,getDb:()=>db,verify,now:()=>Date.parse('2026-10-25T12:00:00Z'),listPayments:async args=>{listCalls.push(args);return pages?pages.shift():{payments:[payment],hasNextPage:false};},notify:async()=>{assert(registered>0);if(throwNotify)throw new Error('transient');sends++;mail={order_id:id,customer_mail_state:'sent',owner_mail_state:'sent'};}});
for(const amount of [500,6900,9900,49900,34900,99800,69800]){
 reset(amount);const result=await sync();assert.equal(result.status,'complete');assert.equal(order.status,'paid');assert.equal(commits,1);assert.equal(sends,1);assert.equal(verifiedCalls,1);
 await sync();assert.equal(commits,1);assert.equal(sends,1);assert.equal(verifiedCalls,1);
}
// The browser return handler is never called anywhere in this test.
for(const patch of [{Amount:69},{Currency:1},{ValidPayment:false},{ExternalIdentifier:'forged'},{ID:0}]){reset();payment={...payment,...patch};await sync();assert.equal(commits,0);assert.equal(sends,0);}
reset();registerOk=false;assert.equal((await sync()).status,'partial');assert.equal(commits,1);assert.equal(sends,0);registerOk=true;await sync();assert.equal(sends,1);assert.equal(commits,1);
reset();throwNotify=true;await sync();assert.equal(commits,1);throwNotify=false;await sync();assert.equal(sends,1);assert.equal(commits,1);
reset();pages=[{payments:[{...payment,ExternalIdentifier:'other'}],hasNextPage:true},{payments:[payment],hasNextPage:false}];await sync();assert.deepEqual(listCalls.map(x=>x.startIndex),[0,1]);assert.equal(sends,1);assert.equal(listCalls[0].from,'2026-09-25T12:00:00.000Z');
reset();pages=Array.from({length:20},()=>({payments:[{...payment,ExternalIdentifier:'other'}],hasNextPage:true}));assert.equal((await sync()).status,'partial');assert.equal(listCalls.length,20);
reset();const noConfig=createPaymentSync({env:()=>({}),listPayments:()=>{throw new Error('must not call');}});assert.equal((await noConfig()).status,'unavailable');
const request={from:'2026-10-24T00:00:00Z',to:'2026-10-25T12:00:00Z',startIndex:0,key:'mock'};
await listSumitPayments(request,async(url,options)=>{assert.equal(url,'https://api.sumit.co.il/billing/payments/list/');const b=JSON.parse(options.body);assert.equal(b.Valid,true);assert(!('Amount' in b));return{ok:true,json:async()=>({Status:0,Data:{Payments:[],HasNextPage:false}})};});
await assert.rejects(()=>listSumitPayments(request,async()=>({ok:true,json:async()=>({Status:0,Data:{Payments:[],HasNextPage:true}})})));
assert(validSyncAuthorization('Bearer '+secret,secret));assert(!validSyncAuthorization('Bearer '+secret+'0',secret));assert(!validSyncAuthorization('Bearer '+'b'.repeat(64),secret));assert(!validSyncAuthorization(undefined,secret));
async function invoke(method,authorization){let result,called=false;const res={setHeader(){},end(value){result={code:this.statusCode,body:JSON.parse(value)};}};await createReconciliationHandler({env:()=>env,sync:async()=>{called=true;return{status:'complete',pages:1};},log:()=>{}})({method,headers:{authorization}},res);return{...result,called};}
assert.equal((await invoke('GET','Bearer '+secret)).code,405);assert.equal((await invoke('POST',undefined)).called,false);assert.equal((await invoke('POST','Bearer '+secret)).code,200);
console.log('PASS scheduler-only full paid transition for all products including two-minute videos without browser callback; replay skips paid/sent; authoritative amount/currency/reference/provider checks; durable mail retries; pagination/time bounds; secret header authentication; no new tables/RPCs, charge or document creation. Mock only.');
