import {gmailSettings,getReceiptPdf,getSpecificationAttachment,orderMail,sendGmailOrder} from './research-gmail.js';
import {createClient} from '@supabase/supabase-js';
import {intakeSettings} from './research-intake.js';
import {getSumitPayment,validPayment} from './research-payment.js';
import {referenceOrder} from './research-payment-reference.js';

const RECIPIENTS=['customer','owner'];
const STATES=new Set(['pending','sending','sent','failed','uncertain']);
const isEmail=value=>typeof value==='string'&&value.length<=320&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&!/[<>\r\n]/.test(value);

const dbClient=settings=>createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});

export function createNotificationProcessor({env=()=>process.env,getDb=dbClient,getPayment=getSumitPayment,getReceipt=getReceiptPdf,getSpecification=getSpecificationAttachment,sendMail=sendGmailOrder}={}){
 return async function notify(orderId,{paymentId:verifiedPaymentId,reference}={}){
  const config=env(),settings=intakeSettings(config),key=(config.SUMIT_API_KEY||'').trim();
  if(!settings.enabled||!key||config.SUMIT_PAYMENT_VERIFICATION_ENABLED!=='true')return {customer:'pending',owner:'pending'};
  const mailSettings=gmailSettings(config);
  const db=getDb(settings);
  if(!mailSettings){
   const status=await db.rpc('research_notification_status',{p_order_id:orderId});
   return Object.fromEntries(RECIPIENTS.map(role=>[role,STATES.has(status.data?.[role])?status.data[role]:'pending']));
  }
  if(Number.isSafeInteger(verifiedPaymentId)&&referenceOrder(reference,settings.key)===orderId){
   try{await db.rpc('register_research_notification_retry',{p_order_id:orderId,p_payment_id:verifiedPaymentId,p_reference:reference});}catch{/* Immediate delivery remains possible if retry registration is unavailable. */}
  }
  // A process-local shared provider read, never a process-local delivery lock.
  // Durable row locks and per-recipient claim tokens live in PostgreSQL.
  let paymentPromise,receiptPromise;
  await Promise.allSettled(RECIPIENTS.map(async recipient=>{
   const claimed=await db.rpc('claim_research_notification',{p_order_id:orderId,p_recipient:recipient});
   if(claimed.error||!claimed.data)return;
   const context=claimed.data;
   let outcome='failed',documentId=null,errorCode='preflight_failed';
   try{
    if(context.order_id!==orderId||context.recipient!==recipient||!context.claim_token||!context.outbox_id||context.currency!=='ILS'||!isEmail(context.email))throw new Error('invalid_context');
    const paymentId=/^[1-9]\d{0,14}$/.test(context.payment_id||'')?Number(context.payment_id):0;
    if(!paymentId)throw new Error('invalid_payment');
    paymentPromise??=getPayment(paymentId,key);
    const payment=await paymentPromise;
    if(!validPayment(payment,{paymentId,reference:payment.ExternalIdentifier,amount:context.amount_agorot})||referenceOrder(payment.ExternalIdentifier,settings.key)!==orderId||!Number.isSafeInteger(payment.DocumentID)||payment.DocumentID<=0)throw new Error('invalid_payment');
    documentId=payment.DocumentID;
    receiptPromise??=getReceipt(documentId,key);
    const receipt=await receiptPromise;
    const specification=recipient==='owner'?await getSpecification(db,context):null;
    const message=orderMail(context,recipient,receipt,specification);
    // From here a timeout must not cause an automatic duplicate send.
    outcome='uncertain';errorCode='provider_unknown';
    const result=await sendMail(message,mailSettings);
    if(!['sent','failed','uncertain'].includes(result))throw new Error('invalid_send_result');
    outcome=result;errorCode=result==='sent'?null:result==='failed'?'provider_rejected':'provider_unknown';
   }catch{/* Never persist/log provider bodies, customer data or signed links. */}
   await db.rpc('finish_research_notification',{p_outbox_id:context.outbox_id,p_recipient:recipient,p_claim_token:context.claim_token,p_result:outcome,p_document_id:documentId,p_error_code:errorCode});
  }));
  try{
   const status=await db.rpc('research_notification_status',{p_order_id:orderId});
   if(status.error)throw new Error();
   return Object.fromEntries(RECIPIENTS.map(role=>[role,STATES.has(status.data?.[role])?status.data[role]:'pending']));
  }catch{return {customer:'pending',owner:'pending'};}
 };
}
