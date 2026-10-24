import {referenceOrder} from './research-payment-reference.js';
import {createClient} from '@supabase/supabase-js';
import {intakeSettings} from './research-intake.js';

export const RETURN_URL='https://www.shmilapps.com/api/research-payment-return';
const COMPANY_ID=2496834247;
export async function getSumitPayment(paymentId,key,fetcher=fetch){
  const response=await fetcher('https://api.sumit.co.il/billing/payments/get/',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({Credentials:{CompanyID:COMPANY_ID,APIKey:key},PaymentID:paymentId}),signal:AbortSignal.timeout(15000)});
  if(!response.ok)throw new Error('provider_unavailable');
  const data=await response.json();
  if(![0,'0','Success','Success (0)'].includes(data.Status)||!data.Data?.Payment)throw new Error('provider_unavailable');
  return data.Data.Payment;
}
export function validPayment(payment,{paymentId,reference,amount}){
  return payment?.ID===paymentId && payment.ValidPayment===true && payment.ExternalIdentifier===reference
    && [0,'ILS','ILS (0)'].includes(payment.Currency) && typeof payment.Amount==='number'
    && Number.isFinite(payment.Amount) && Math.abs(payment.Amount*100-amount)<0.000001;
}
export function createPaymentVerifier({env=()=>process.env,getPayment=getSumitPayment,getDb=(settings)=>createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(15000)})}})}={}){
 return async ({paymentId,reference})=>{
  const config=env();const settings=intakeSettings(config);const providerKey=(config.SUMIT_API_KEY||'').trim();
  if(!settings.enabled||!providerKey||config.SUMIT_PAYMENT_VERIFICATION_ENABLED!=='true')return {status:'unavailable'};
  const orderId=referenceOrder(reference,settings.key);
  if(!orderId||!Number.isSafeInteger(paymentId)||paymentId<=0)return {status:'unverified'};
  try{
   const db=getDb(settings);
   const found=await db.from('orders').select('id,status,final_price_agorot').eq('id',orderId).maybeSingle();
   if(found.error||!found.data)return {status:'unverified'};
   const order=found.data;
   if(!['pending_payment','paid'].includes(order.status))return {status:'unverified'};
   const payment=await getPayment(paymentId,providerKey);
   if(!validPayment(payment,{paymentId,reference,amount:order.final_price_agorot}))return {status:'unverified'};
   // Read the committed state after a duplicate/racing confirmation. Never treat
   // a false RPC result as success without matching the durable verified event.
   const confirmed=async()=>{
    const current=await db.from('orders').select('id,status,final_price_agorot').eq('id',orderId).maybeSingle();
    const existing=await db.from('payment_events').select('order_id,provider_transaction_id,verified,event_type,amount_agorot,currency').eq('provider','sumit').eq('provider_event_id','payment:'+paymentId).maybeSingle();
    const event=existing.data;
    return !current.error&&current.data?.status==='paid'&&current.data.final_price_agorot===order.final_price_agorot&&!existing.error&&event?.order_id===orderId&&event.provider_transaction_id===String(paymentId)&&event.verified===true&&event.event_type==='payment_confirmed'&&event.amount_agorot===order.final_price_agorot&&event.currency==='ILS';
   };
   if(order.status==='paid')return await confirmed()?{status:'paid',orderId}:{status:'unverified'};
   const committed=await db.rpc('confirm_order_payment',{p_order_id:orderId,p_provider:'sumit',p_event_id:'payment:'+paymentId,p_transaction_id:String(paymentId),p_amount_agorot:order.final_price_agorot,p_currency:'ILS'});
   if(committed.error)return {status:'unverified'};
   if(committed.data!==true)return committed.data===false&&await confirmed()?{status:'paid',orderId}:{status:'unverified'};
   return {status:'paid',orderId};
  }catch{return {status:'unavailable'};}
 };
}
