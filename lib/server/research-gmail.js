import {orderPresentation} from './research-products.js';
import nodemailer from 'nodemailer';
import {createHash} from 'node:crypto';
import {documentMetadata,validateDocument,MAX_DOCUMENT_BYTES} from './research-document.js';
import {renderOwnerOrderEmail} from './research-owner-email.js';
export const BUSINESS_EMAIL='shmilapps@gmail.com';
const COMPANY_ID=2496834247;
export function gmailSettings(env){
 const password=(env.SHMILAPPS_GMAIL_APP_PASSWORD||'').replace(/\s/g,'');
 return env.SHMILAPPS_GMAIL_ENABLED==='true'&&/^[a-zA-Z0-9]{16}$/.test(password)?{password}:null;
}
export async function getReceiptPdf(documentId,key,fetcher=fetch){
 if(!Number.isSafeInteger(documentId)||documentId<=0||!key)throw new Error('invalid_document');
 const response=await fetcher('https://api.sumit.co.il/accounting/documents/getpdf/',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json','Accept':'application/pdf'},body:JSON.stringify({Credentials:{CompanyID:COMPANY_ID,APIKey:key},DocumentID:documentId,Original:false}),signal:AbortSignal.timeout(15000)});
 if(!response.ok||!response.body)throw new Error('receipt_unavailable');
 const chunks=[];let size=0;
 for await(const chunk of response.body){size+=chunk.length;if(size>MAX_DOCUMENT_BYTES)throw new Error('receipt_too_large');chunks.push(chunk);}
 const bytes=Buffer.concat(chunks);
 await validateDocument(bytes,{extension:'pdf',size:bytes.length});
 return {filename:`קבלה-${documentId}.pdf`,content:bytes,contentType:'application/pdf'};
}
export async function getSpecificationAttachment(db,context){
 const {order_id:id,object_path:path,original_filename:name}=context;
 const match=typeof path==='string'?/^intake\/([a-f0-9-]{36})\/specification\.(pdf|docx|txt)$/.exec(path):null;
 if(context.bucket_id!=='order-specifications'||!match)throw new Error('invalid_document_path');
 if(match[1]!==id){const session=await db.from('research_intake_sessions').select('order_id').eq('id',match[1]).maybeSingle();if(session.error||session.data?.order_id!==id)throw new Error('invalid_document_path');}

 const result=await db.storage.from('order-specifications').download(path);
 if(result.error||!result.data||result.data.size<1||result.data.size>MAX_DOCUMENT_BYTES)throw new Error('document_unavailable');
 const bytes=Buffer.from(await result.data.arrayBuffer());
 const metadata=documentMetadata({name,size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')});
 await validateDocument(bytes,metadata);
 return {filename:metadata.name,content:bytes,contentType:metadata.mime};
}
export function orderMail(context,recipient,receipt,specification){
 if(recipient==='owner'){
  if(!specification)throw new Error('specification_required');
  const attachments=[specification,receipt];
  return {...renderOwnerOrderEmail(context,attachments),to:BUSINESS_EMAIL,replyTo:context.email,attachments,messageId:`<research-owner-${context.order_id}@shmilapps.com>`};
 }
 if(recipient!=='customer')throw new Error('invalid_recipient');
 const product=orderPresentation(context),en=product.details.ui_language==='en';
 const amount=new Intl.NumberFormat(en?'en-IL':'he-IL',{style:'currency',currency:'ILS'}).format(context.amount_agorot/100);
 const delivery=product.research?(en?'Your report will be delivered within 72 hours of receiving the complete request, specification and payment.':'הדוח יימסר בתוך עד 72 שעות מקבלת הבקשה המלאה, האפיון והתשלום.'):(en?'We will coordinate creative direction, deliverables and timing based on your request.':'נתאם את הכיוון היצירתי, התוצרים ולוחות הזמנים בהתאם לבקשה.');
 const text=en?`Hello ${context.full_name},\n\nPayment for ${product.en} has been verified.\nAmount paid: ${amount}\nOrder number: ${context.order_id}\nQuantity: ${product.quantity}\n\nYour receipt is attached. Your specification has been received and the order is ready for processing.\n${delivery}\n\nReply to this email with any questions.\nThank you,\nShmilApps`:`שלום ${context.full_name},\n\nהתשלום עבור ${product.he} התקבל ואומת.\nסכום ששולם: ${amount}\nמספר הזמנה: ${context.order_id}\nכמות: ${product.quantity}\n\nהקבלה מצורפת למייל זה. מסמך האפיון נקלט, וההזמנה הועברה לטיפול.\n${delivery}\n\nאפשר להשיב למייל זה בכל שאלה.\nתודה,\nShmilApps`;

 const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 return {to:context.email,bcc:context.email.toLowerCase()===BUSINESS_EMAIL?undefined:BUSINESS_EMAIL,replyTo:BUSINESS_EMAIL,subject:`${context.is_test?'[TEST] ':''}${en?'Payment confirmation and receipt':'אישור תשלום וקבלה'} — ${en?product.en:product.he}`,text,html:`<div dir="${en?'ltr':'rtl'}" style="font:16px Arial;line-height:1.8;text-align:${en?'left':'right'}">${escape(text).replace(/\n/g,'<br>')}</div>`,attachments:[receipt],messageId:`<research-receipt-${context.order_id}@shmilapps.com>`};
}
export async function sendGmailOrder(message,settings,makeTransport=options=>nodemailer.createTransport(options)){
 const transport=makeTransport({host:'smtp.gmail.com',port:465,secure:true,auth:{user:BUSINESS_EMAIL,pass:settings.password},connectionTimeout:10000,greetingTimeout:10000,socketTimeout:20000,logger:false,debug:false,disableFileAccess:true,disableUrlAccess:true});
 try{
  const result=await transport.sendMail({...message,from:{name:'ShmilApps',address:BUSINESS_EMAIL},disableFileAccess:true,disableUrlAccess:true});
  const expected=[message.to,...(message.bcc?[message.bcc]:[])].map(x=>x.toLowerCase());
  const accepted=(result.accepted||[]).map(x=>String(x).toLowerCase());
  if(expected.every(x=>accepted.includes(x)))return 'sent';
  // Partial acceptance must never trigger an automatic duplicate delivery.
  return accepted.length?'uncertain':'failed';
 }catch(error){
  // Only an explicit rejection or a failure before DATA is safe to retry.
  return error.code==='EAUTH'||[421,450,451,452,550,551,552,553,554].includes(error.responseCode)||['CONN','EHLO','STARTTLS','AUTH LOGIN','AUTH PLAIN','MAIL FROM','RCPT TO'].includes(error.command)?'failed':'uncertain';
 }finally{transport.close?.();}
}
