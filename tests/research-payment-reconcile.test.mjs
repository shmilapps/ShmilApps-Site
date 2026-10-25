import assert from 'node:assert/strict';
import {createPaymentReconciler,listSumitPayments} from '../lib/server/research-payment-reconcile.js';
import {createReconciliationHandler} from '../api/research-payment-reconcile.js';
import {paymentReference} from '../lib/server/research-payment-reference.js';
const id='00000000-0000-4000-8000-000000000001',token='00000000-0000-4000-8000-000000000002',claim='00000000-0000-4000-8000-000000000003';
const env={SUPABASE_URL:'https://ufolbezpnhyrsyuxuaox.supabase.co',SUPABASE_SECRET_KEY:'sb_secret_mock',SHMILAPPS_ORDER_INTAKE_ENABLED:'true',SUMIT_API_KEY:'mock',SUMIT_PAYMENT_VERIFICATION_ENABLED:'true'};
const reference=paymentReference(id,env.SUPABASE_SECRET_KEY);
let leased,finished,verifications,mails,registered,calls,pages,context,verified,registration,notifyFails;
const match={ID:123,ValidPayment:true,ExternalIdentifier:reference,Amount:99,Currency:0};
function reset(){leased=false;finished=[];verifications=[];mails=0;registered=0;calls=[];pages=[{payments:[match],hasNextPage:false}];context={order_id:id,claim_token:claim,amount_agorot:9900,created_at:'2026-10-25T10:00:00Z',scan_until:'2026-10-25T11:00:00Z',page_start:0,payment_reference:reference,verified_payment_id:null};verified=true;registration=true;notifyFails=false;}
const db={rpc:async(name,args)=>{
 if(name==='claim_research_payment_check'){if(args.p_job_token!==token||leased)return{data:null};leased=true;return{data:context};}
 if(name==='register_research_notification_retry'){assert.equal(args.p_payment_id,123);assert.equal(args.p_reference,reference);registered++;return{data:registration};}
 assert.equal(name,'finish_research_payment_check');assert.equal(args.p_token,claim);finished.push(args);return{data:true};
}};
const run=createPaymentReconciler({env:()=>env,getDb:()=>db,now:()=>Date.parse('2026-10-25T12:00:00Z'),listPayments:async args=>{calls.push(args);return pages.shift()||{payments:[],hasNextPage:false};},verify:async args=>{verifications.push(args);return verified?{status:'paid',orderId:id}:{status:'unverified'};},notify:async()=>{mails++;if(notifyFails)throw new Error('mail retry will recover');}});
reset();assert.deepEqual(await run({orderId:id,token}),{status:'paid',pages:1});assert.equal(mails,1);assert.equal(registered,1);assert.equal(verifications.length,1);assert.equal(finished[0].p_result,'paid');assert.equal(calls[0].from,'2026-10-24T10:00:00.000Z');
// No browser redirect or window is involved: the authenticated scheduler is sufficient.
await run({orderId:id,token});assert.equal(mails,1);assert.equal(calls.length,1);
reset();await run({orderId:id,token:'00000000-0000-4000-8000-000000000099'});assert.equal(calls.length,0);assert.equal(mails,0);
reset();assert.equal((await run({orderId:'bad',token})).status,'unauthorized');assert.equal(calls.length,0);
for(const patch of [{Amount:69},{Currency:1},{ValidPayment:false},{ExternalIdentifier:'forged'},{ID:0}]){reset();pages=[{payments:[{...match,...patch}],hasNextPage:false}];assert.equal((await run({orderId:id,token})).status,'pending');assert.equal(verifications.length,0);assert.equal(mails,0);}
for(const amount of [500,6900,9900]){reset();context.amount_agorot=amount;pages=[{payments:[{...match,Amount:amount/100}],hasNextPage:false}];assert.equal((await run({orderId:id,token})).status,'paid');}
reset();verified=false;assert.equal((await run({orderId:id,token})).status,'failed');assert.equal(mails,0);
reset();registration=false;assert.equal((await run({orderId:id,token})).status,'failed');assert.equal(mails,0);
reset();notifyFails=true;assert.equal((await run({orderId:id,token})).status,'paid');assert.equal(registered,1);
reset();context.verified_payment_id='123';assert.equal((await run({orderId:id,token})).status,'paid');assert.equal(calls.length,0);assert.equal(verifications.length,1);
reset();context.payment_reference='wrong';assert.equal((await run({orderId:id,token})).status,'failed');assert.equal(calls.length,0);
reset();pages=Array.from({length:3},()=>({payments:[{...match,ExternalIdentifier:'other'}],hasNextPage:true}));assert.deepEqual(await run({orderId:id,token}),{status:'pending',pages:3});assert.equal(finished[0].p_next_start,3);assert.deepEqual(calls.map(c=>c.startIndex),[0,1,2]);assert(calls.every(c=>c.to==='2026-10-25T11:00:00.000Z'));
reset();context.page_start=3;pages=[{payments:[],hasNextPage:false}];await run({orderId:id,token});assert.equal(calls[0].startIndex,3);assert.equal(finished[0].p_next_start,0);
const request={from:'2026-10-24T00:00:00Z',to:'2026-10-25T12:00:00Z',startIndex:0,key:'mock'};
assert.equal((await listSumitPayments(request,async(url,options)=>{assert.equal(url,'https://api.sumit.co.il/billing/payments/list/');const body=JSON.parse(options.body);assert.equal(body.Valid,true);assert.equal(body.StartIndex,0);assert(!('Amount' in body));return{ok:true,json:async()=>({Status:0,Data:{Payments:[match],HasNextPage:false}})};})).payments.length,1);
await assert.rejects(()=>listSumitPayments(request,async()=>({ok:true,json:async()=>({Status:0,Data:{Payments:[],HasNextPage:true}})})));
async function invoke(method,body,reconcile){let result;const res={setHeader(){},end(text){result={code:this.statusCode,body:JSON.parse(text)};}};await createReconciliationHandler({reconcile,log:()=>{}})({method,body,headers:{}},res);return result;}
assert.equal((await invoke('GET',null,()=>{throw new Error('must not execute');})).code,405);
assert.equal((await invoke('POST','bad',()=>{})).code,400);
assert.deepEqual(await invoke('POST',{orderId:id,token},async()=>({status:'paid',pages:1})),{code:200,body:{status:'paid'}});
console.log('PASS closed-window scheduler path; 99/69/5 matching; wrong amount/currency/reference/failed payments rejected; fresh authoritative verification; durable notification retry before send; duplicate claim suppression; bounded stable pagination/resume; no browser dependency; no charge/create endpoint. Mock only.');
