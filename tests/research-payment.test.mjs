import assert from 'node:assert/strict';
import {paymentReference,referenceOrder} from '../lib/server/research-payment-reference.js';
import {createPaymentVerifier,getSumitPayment,validPayment} from '../lib/server/research-payment.js';
const id='00000000-0000-4000-8000-000000000001';const key='sb_secret_test_only';
const reference=paymentReference(id,key);
assert.equal(referenceOrder(reference,key),id);assert.equal(referenceOrder(reference+'x',key),null);assert.equal(referenceOrder(reference,'wrong'),null);
const env={SUPABASE_URL:'https://ufolbezpnhyrsyuxuaox.supabase.co',SUPABASE_SECRET_KEY:key,SHMILAPPS_ORDER_INTAKE_ENABLED:'true',SUMIT_API_KEY:'private-test',SUMIT_PAYMENT_VERIFICATION_ENABLED:'true'};
let order={id,status:'pending_payment',final_price_agorot:9900},commits=0,providerCalls=0,record=null,rpcResult=true;
let payment={ID:123,ValidPayment:true,ExternalIdentifier:reference,Amount:99,Currency:0};
const db={from:table=>({select:()=>{const q={eq:()=>q,maybeSingle:async()=>({data:table==='orders'?order:record})};return q;}}),rpc:async(name,args)=>{assert.equal(name,'confirm_order_payment');assert.equal(args.p_order_id,id);assert.equal(args.p_event_id,'payment:123');assert.equal(args.p_amount_agorot,9900);commits++;order.status='paid';record={order_id:id,provider_transaction_id:'123',verified:true,event_type:'payment_confirmed',amount_agorot:9900,currency:'ILS'};return {data:rpcResult};}};
const verify=createPaymentVerifier({env:()=>env,getDb:()=>db,getPayment:async(pid,secret)=>{assert.equal(pid,123);assert.equal(secret,'private-test');providerCalls++;return payment;}});
assert.equal((await verify({paymentId:123,reference:reference+'x'})).status,'unverified');assert.equal(providerCalls,0);
for(const patch of [{Amount:69},{Currency:1},{ValidPayment:false},{ExternalIdentifier:'different'},{ID:124}]){const original=payment;payment={...payment,...patch};assert.equal((await verify({paymentId:123,reference})).status,'unverified');payment=original;}
assert.equal(commits,0);
assert.equal((await verify({paymentId:123,reference})).status,'paid');assert.equal(commits,1);
assert.equal((await verify({paymentId:123,reference})).status,'paid');assert.equal(commits,1);
record={...record,order_id:'another'};assert.equal((await verify({paymentId:123,reference})).status,'unverified');assert.equal(commits,1);
order.status='cancelled';assert.equal((await verify({paymentId:123,reference})).status,'unverified');
order.status='pending_payment';record=null;rpcResult=false;
assert.equal((await verify({paymentId:123,reference})).status,'paid');assert.equal(commits,2);
for(const patch of [{amount_agorot:6900},{currency:'USD'},{verified:false},{event_type:'refund'}]){const original=record;record={...record,...patch};assert.equal((await verify({paymentId:123,reference})).status,'unverified');record=original;}
assert.equal((await createPaymentVerifier({env:()=>({})})({paymentId:123,reference})).status,'unavailable');
assert(validPayment({...payment,Currency:'ILS'},{paymentId:123,reference,amount:9900}));
await getSumitPayment(123,'private-test',async(url,options)=>{assert.equal(url,'https://api.sumit.co.il/billing/payments/get/');const body=JSON.parse(options.body);assert.equal(body.Credentials.CompanyID,2496834247);assert.equal(body.Credentials.APIKey,'private-test');assert.equal(body.PaymentID,123);assert.equal(options.redirect,'error');return{ok:true,json:async()=>({Status:0,Data:{Payment:payment}})};});
await assert.rejects(()=>getSumitPayment(123,'private-test',async()=>({ok:true,json:async()=>({Status:1,TechnicalErrorDetails:'private details'})})));
console.log('PASS signed mapping, authoritative payment ID/order/amount/currency/success checks, no write on mismatch, atomic confirm contract, idempotent paid retry, failed provider response and absent configuration. No real payment or DB mutation.');
