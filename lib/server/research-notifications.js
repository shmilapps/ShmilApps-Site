import {createClient} from '@supabase/supabase-js';
import {intakeSettings} from './research-intake.js';
import {getSumitPayment,validPayment} from './research-payment.js';
import {referenceOrder} from './research-payment-reference.js';

const OWNER_EMAIL='shmilapps@gmail.com';
const COMPANY_ID=2496834247;
const RECIPIENTS=['customer','owner'];
const STATES=new Set(['pending','sending','sent','failed','uncertain']);
const clean=value=>String(value??'').replace(/[<>\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g,'').trim();
const isEmail=value=>typeof value==='string'&&value.length<=320&&/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)&&!/[<>\r\n]/.test(value);
const marketLabel={israel:'ישראל',international:'חו״ל',both:'ישראל וחו״ל'};
const languageLabel={he:'עברית',en:'אנגלית',both:'עברית ואנגלית'};

export function notificationMessage(context,recipient,specificationUrl){
 const amount=(context.amount_agorot/100).toFixed(2);
 const paidDate=new Date(context.paid_at);
 const paidAt=Number.isNaN(paidDate.getTime())?clean(context.paid_at):new Intl.DateTimeFormat('he-IL',{dateStyle:'short',timeStyle:'short',timeZone:'Asia/Jerusalem'}).format(paidDate);
 const title=context.is_test?'הזמנת בדיקה — סקר שוק מלא':'סקר שוק מלא';
 if(recipient==='customer')return [
  `שלום ${clean(context.full_name)},`,
  'התשלום אומת וההזמנה שלך התקבלה ב-ShmilApps.',
  `${title} | סכום ששולם: ${amount} ש״ח`,
  `מספר הזמנה: ${context.order_id}`,
  'מסמך האפיון נקלט ונשמר באופן פרטי. הקבלה על התשלום מצורפת למייל זה.',
  `שוק לבדיקה: ${marketLabel[context.market]||''} | שפת הדוח: ${languageLabel[context.report_language]||''}`,
  'הדוח יימסר בתוך עד 72 שעות מקבלת הבקשה המלאה, מסמך האפיון והתשלום.',
  'לשאלות או עדכונים אפשר לפנות אלינו: shmilapps@gmail.com',
  'תודה, ShmilApps',
 ].join('\n\n');
 if(recipient!=='owner'||!specificationUrl)throw new Error('invalid_notification');
 return [
  `${context.is_test?'הזמנת בדיקה ששולמה':'הזמנה חדשה ששולמה — מוכנה לתחילת עבודה'} | ShmilApps`,
  `שירות: סקר שוק מלא\nמספר הזמנה: ${context.order_id}\nסכום ששולם: ${amount} ש״ח\nמועד אישור התשלום: ${paidAt}`,
  `שם: ${clean(context.full_name)}\nעסק / ארגון: ${clean(context.business)||'לא צוין'}\nאימייל: ${clean(context.email)}\nטלפון: ${clean(context.phone)}`,
  `מה לבדוק:\n${clean(context.description)}`,
  `שוק יעד: ${marketLabel[context.market]||''}\nשפת הדוח: ${languageLabel[context.report_language]||''}`,
  `קהל יעד, מדינות ודגשים:\n${clean(context.audience)||'לא צוין'}`,
  `מתחרים וקישורים מוכרים:\n${clean(context.links)||'לא צוינו'}`,
  `מסמך האפיון: ${clean(context.original_filename)}\nקישור פרטי להורדה (תקף לשבעה ימים; אין להעבירו לאחרים):\n${specificationUrl}`,
  'כל פרטי החובה, מסמך האפיון והתשלום התקבלו. יעד מסירה: בתוך עד 72 שעות מקבלת שלושתם. הקבלה על התשלום מצורפת.',
 ].join('\n\n');
}

// SUMIT renders PersonalMessage inside HTML; plain newlines collapse there.
// Escape every supplied value before adding our own fixed layout and link.
export function notificationHtml(message,specificationUrl){
 const escape=value=>String(value).replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
 let content=message.split('\n\n').map(part=>`<p style="margin:0 0 16px">${escape(part).replace(/\n/g,'<br>')}</p>`).join('');
 if(specificationUrl){
  const url=new URL(specificationUrl);
  if(url.origin!=='https://ufolbezpnhyrsyuxuaox.supabase.co'||!url.pathname.startsWith('/storage/v1/object/sign/order-specifications/'))throw new Error('invalid_document_url');
  content=content.replaceAll(escape(specificationUrl),`<a href="${escape(specificationUrl)}" style="display:inline-block;padding:10px 18px;background:#e6f6be;color:#182b00;border-radius:6px;text-decoration:underline;font-weight:bold">הורדת מסמך האפיון</a>`);
 }
 return `<div dir="rtl" style="text-align:right;font-style:normal;font-family:Arial,sans-serif;font-size:15px;line-height:1.7;color:#17210b">${content}</div>`;
}

// This endpoint sends an EXISTING accounting document. It never charges a card
// or creates a new document. A network timeout has an unknown delivery outcome.
export async function sendSumitDocument({documentId,email,message,key,original=false},fetcher=fetch){
 let response;
 try{
  response=await fetcher('https://api.sumit.co.il/accounting/documents/send/',{
   method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({Credentials:{CompanyID:COMPANY_ID,APIKey:key},EntityID:documentId,EmailAddress:email,Original:original,PersonalMessage:message}),
   signal:AbortSignal.timeout(12000),
  });
 }catch{return 'uncertain';}
 if(!response.ok)return 'uncertain';
 try{
  const result=await response.json();
  if([0,'0','Success','Success (0)'].includes(result.Status))return 'sent';
  return result.Status!==undefined?'failed':'uncertain';
 }catch{return 'uncertain';}
}

const dbClient=settings=>createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});

export function createNotificationProcessor({env=()=>process.env,getDb=dbClient,getPayment=getSumitPayment,sendDocument=sendSumitDocument}={}){
 return async function notify(orderId,{paymentId:verifiedPaymentId,reference}={}){
  const config=env(),settings=intakeSettings(config),key=(config.SUMIT_API_KEY||'').trim();
  if(!settings.enabled||!key||config.SUMIT_PAYMENT_VERIFICATION_ENABLED!=='true')return {customer:'pending',owner:'pending'};
  const db=getDb(settings);
  if(Number.isSafeInteger(verifiedPaymentId)&&referenceOrder(reference,settings.key)===orderId){
   try{await db.rpc('register_research_notification_retry',{p_order_id:orderId,p_payment_id:verifiedPaymentId,p_reference:reference});}catch{/* Immediate delivery remains possible if retry registration is unavailable. */}
  }
  // A process-local shared provider read, never a process-local delivery lock.
  // Durable row locks and per-recipient claim tokens live in PostgreSQL.
  let paymentPromise;
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
    let specificationUrl;
    if(recipient==='owner'){
     if(context.bucket_id!=='order-specifications'||typeof context.object_path!=='string'||!context.object_path.startsWith(`intake/${orderId}/`)||context.object_path.includes('..'))throw new Error('invalid_document');
     const signed=await db.storage.from('order-specifications').createSignedUrl(context.object_path,7*24*60*60,{download:clean(context.original_filename)});
     if(signed.error||!signed.data?.signedUrl)throw new Error('document_unavailable');
     const url=new URL(signed.data.signedUrl);
     if(url.origin!==settings.url||decodeURIComponent(url.pathname)!==`/storage/v1/object/sign/order-specifications/${context.object_path}`)throw new Error('invalid_document_url');
     specificationUrl=url.toString();
    }
    const message=notificationHtml(notificationMessage(context,recipient,specificationUrl),specificationUrl);
    // From here a timeout must not cause an automatic duplicate send.
    outcome='uncertain';errorCode='provider_unknown';
    const result=await sendDocument({documentId,email:recipient==='owner'?OWNER_EMAIL:context.email,message,key,original:recipient==='customer'});
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
