import assert from 'node:assert/strict';
import {createNotificationProcessor} from '../lib/server/research-notifications.js';
import {paymentReference} from '../lib/server/research-payment-reference.js';
const orderId='00000000-0000-4000-8000-000000000001',key='sb_secret_only_mock';
const reference=paymentReference(orderId,key);
const env={SUPABASE_URL:'https://ufolbezpnhyrsyuxuaox.supabase.co',SUPABASE_SECRET_KEY:key,SHMILAPPS_ORDER_INTAKE_ENABLED:'true',SUMIT_API_KEY:'mock-sumit',SUMIT_PAYMENT_VERIFICATION_ENABLED:'true',SHMILAPPS_GMAIL_ENABLED:'true',SHMILAPPS_GMAIL_APP_PASSWORD:'abcdefghijklmnop'};
const base={order_id:orderId,amount_agorot:500,currency:'ILS',is_test:true,paid_at:'2026-10-25T11:07:29Z',description:'Research <script>alert(1)</script>',market:'both',report_language:'he',audience:'Farmers',links:'https://example.invalid',full_name:'Example Customer',email:'test@example.invalid',phone:'0500000000',business:'Example farm',bucket_id:'order-specifications',object_path:`intake/${orderId}/specification.pdf`,original_filename:'specification.pdf',payment_id:'123'};
let ledger,sends,paymentCalls,allowClaim,payment,sendOutcome,registered;
function reset(){ledger={customer:'pending',owner:'pending'};sends=[];paymentCalls=0;allowClaim=true;payment={ID:123,ValidPayment:true,ExternalIdentifier:reference,Amount:5,Currency:0,DocumentID:789};sendOutcome={customer:'sent',owner:'sent'};registered=0;}
const db={rpc:async(name,args)=>{
 if(name==='register_research_notification_retry'){registered++;assert.equal(args.p_payment_id,123);assert.equal(args.p_reference,reference);return{data:true};}
 if(name==='claim_research_notification'){
  const role=args.p_recipient;
  assert.equal(args.p_order_id,orderId);
  if(!allowClaim||!['pending','failed'].includes(ledger[role]))return{data:null};
  ledger[role]='sending';return{data:{...base,recipient:role,outbox_id:'outbox',claim_token:role+'-claim'}};
 }
 if(name==='finish_research_notification'){
  assert.equal(args.p_claim_token,args.p_recipient+'-claim');
  assert(['sent','failed','uncertain'].includes(args.p_result));
  if(args.p_result==='sent')assert.equal(args.p_document_id,789);
  ledger[args.p_recipient]=args.p_result;return{data:true};
 }
 assert.equal(name,'research_notification_status');return{data:ledger};
}};
const processor=createNotificationProcessor({env:()=>env,getDb:()=>db,getPayment:async(id,secret)=>{paymentCalls++;assert.equal(id,123);assert.equal(secret,'mock-sumit');return payment;},getReceipt:async(id)=>{assert.equal(id,789);return{filename:'receipt.pdf',content:Buffer.from('%PDF-1.4\n%%EOF'),contentType:'application/pdf'};},getSpecification:async()=>({filename:'specification.pdf',content:Buffer.from('spec'),contentType:'application/pdf'}),sendMail:async message=>{const role=message.to==='shmilapps@gmail.com'?'owner':'customer';sends.push({...message,role});return sendOutcome[role];}});
reset();
assert.deepEqual(await processor(orderId,{paymentId:123,reference}),{customer:'sent',owner:'sent'});
assert.equal(sends.length,2);assert.equal(paymentCalls,1);assert.equal(registered,1);
const customer=sends.find(x=>x.role==='customer'),owner=sends.find(x=>x.role==='owner');
assert.equal(customer.to,base.email);assert.equal(customer.bcc,'shmilapps@gmail.com');assert.equal(customer.attachments.length,1);assert.equal(owner.attachments.length,2);assert(owner.html.includes(base.phone));assert(owner.html.includes(base.email));assert(owner.html.includes('Farmers'));assert(!owner.html.includes('<script>'));assert(!owner.html.includes('mock-private'));assert(owner.subject.includes('הזמנה חדשה'));
await processor(orderId,{paymentId:123,reference});assert.equal(sends.length,2);assert.equal(paymentCalls,1);
reset();allowClaim=false;assert.deepEqual(await processor(orderId),{customer:'pending',owner:'pending'});assert.equal(sends.length,0);assert.equal(paymentCalls,0);
reset();sendOutcome.owner='failed';assert.deepEqual(await processor(orderId),{customer:'sent',owner:'failed'});sendOutcome.owner='sent';await processor(orderId);assert.equal(sends.filter(x=>x.role==='customer').length,1);assert.equal(sends.filter(x=>x.role==='owner').length,2);
reset();sendOutcome.owner='uncertain';await processor(orderId);await processor(orderId);assert.equal(sends.length,2);assert.equal(ledger.owner,'uncertain');
for(const patch of [{DocumentID:0},{Amount:99},{ExternalIdentifier:'wrong'},{ValidPayment:false},{ID:321}]){
 reset();payment={...payment,...patch};await processor(orderId);assert.equal(sends.length,0);assert.deepEqual(ledger,{customer:'failed',owner:'failed'});
}

reset();const disabled=createNotificationProcessor({env:()=>({}),getDb:()=>{throw new Error('must not access DB');}});assert.deepEqual(await disabled(orderId),{customer:'pending',owner:'pending'});
console.log('PASS Gmail claims/replay, separate receipt and owner work email, actual attachment descriptors, strict payment matching, safe partial retry and unknown-outcome suppression. Mock only; no real mail/payment/DB access.');
