import {createClient} from '@supabase/supabase-js';
import {intakeSettings} from './research-intake.js';
import {paymentReference} from './research-payment-reference.js';
import {createPaymentVerifier,validPayment} from './research-payment.js';
import {createNotificationProcessor} from './research-notifications.js';
const UUID=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const success=status=>[0,'0','Success','Success (0)'].includes(status);
export async function listSumitPayments({from,to,startIndex,key},fetcher=fetch){
 const response=await fetcher('https://api.sumit.co.il/billing/payments/list/',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({Credentials:{CompanyID:2496834247,APIKey:key},Date_From:from,Date_To:to,Valid:true,StartIndex:startIndex}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('provider_unavailable');
 const body=await response.json();
 if(!success(body.Status)||!Array.isArray(body.Data?.Payments)||typeof body.Data.HasNextPage!=='boolean'||body.Data.Payments.length>5000||(body.Data.HasNextPage&&!body.Data.Payments.length))throw new Error('provider_unavailable');
 return {payments:body.Data.Payments,hasNextPage:body.Data.HasNextPage};
}
const defaultDb=settings=>createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});
export function createPaymentReconciler({env=()=>process.env,getDb=defaultDb,listPayments=listSumitPayments,verify=createPaymentVerifier(),notify=createNotificationProcessor(),now=()=>Date.now()}={}){
 return async ({orderId,token})=>{
  if(!UUID.test(orderId||'')||!UUID.test(token||''))return{status:'unauthorized',pages:0};
  const config=env(),settings=intakeSettings(config),key=(config.SUMIT_API_KEY||'').trim();
  if(!settings.enabled||!key||config.SUMIT_PAYMENT_VERIFICATION_ENABLED!=='true')return{status:'unavailable',pages:0};
  const db=getDb(settings);
  const claimed=await db.rpc('claim_research_payment_check',{p_order_id:orderId,p_job_token:token});
  if(claimed.error)return{status:'unavailable',pages:0};
  if(!claimed.data)return{status:'idle',pages:0};
  const context=claimed.data;
  let outcome='failed',nextStart=context.page_start||0,pages=0;
  try{
   if(context.order_id!==orderId||!UUID.test(context.claim_token||'')||![500,6900,9900].includes(context.amount_agorot)||!Number.isSafeInteger(nextStart)||nextStart<0||nextStart>1000000)throw new Error('invalid_context');
   const reference=paymentReference(orderId,settings.key);
   if(context.payment_reference&&context.payment_reference!==reference)throw new Error('invalid_reference');
   const fromTime=Date.parse(context.created_at)-86400000,toTime=Date.parse(context.scan_until);
   if(!Number.isFinite(fromTime)||!Number.isFinite(toTime)||fromTime>toTime||toTime>now()+300000)throw new Error('invalid_dates');
   let paymentId=/^[1-9]\d{0,14}$/.test(context.verified_payment_id||'')?Number(context.verified_payment_id):null;
   // Stable Date_To is retained across bounded batches, so new payments cannot
   // continually shift pagination. A completed scan resets to include new entries.
   if(!paymentId){
    for(let page=0;page<3;page++){
     const result=await listPayments({from:new Date(fromTime).toISOString(),to:new Date(toTime).toISOString(),startIndex:nextStart,key});pages++;
     const candidate=result.payments.find(payment=>Number.isSafeInteger(payment.ID)&&payment.ID>0&&validPayment(payment,{paymentId:payment.ID,reference,amount:context.amount_agorot}));
     if(candidate){paymentId=candidate.ID;break;}
     nextStart=result.hasNextPage?nextStart+result.payments.length:0;
     if(nextStart>1000000)throw new Error('invalid_page');
     if(!result.hasNextPage)break;
    }
   }
   if(paymentId){
    // Listing is only discovery. Re-fetch and use the existing atomic verifier.
    const verified=await verify({paymentId,reference});
    if(verified.status!=='paid'||verified.orderId!==orderId)throw new Error('verification_unavailable');
    const registered=await db.rpc('register_research_notification_retry',{p_order_id:orderId,p_payment_id:paymentId,p_reference:reference});
    if(registered.error||registered.data!==true)throw new Error('notification_retry_unavailable');
    // A durable retry is registered before delivery; browser lifetime is irrelevant.
    try{await notify(orderId,{paymentId,reference});}catch{/* The existing mail retry job owns recovery. */}
    outcome='paid';nextStart=0;
   }else outcome='pending';
  }catch{/* No customer/provider body, job token, reference or credential in logs. */}
  const finished=await db.rpc('finish_research_payment_check',{p_order_id:orderId,p_token:context.claim_token,p_result:outcome,p_next_start:nextStart});
  return {status:finished.error||finished.data!==true?'unavailable':outcome,pages};
 };
}
