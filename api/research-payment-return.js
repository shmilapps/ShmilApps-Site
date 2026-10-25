import {randomBytes} from 'node:crypto';
import {createPaymentVerifier} from '../lib/server/research-payment.js';
import {paymentReturnParams} from '../lib/server/research-payment-return-params.js';
import {createNotificationProcessor} from '../lib/server/research-notifications.js';

export function createPaymentReturnHandler({verify=createPaymentVerifier(),notify=createNotificationProcessor()}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
  if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');return res.end();}
  const url=new URL(req.url,'https://www.shmilapps.com');
  const {paymentId,reference}=paymentReturnParams(url.searchParams);
  const result=await verify({paymentId,reference});
  if(result.status==='paid'){
   try{result.notifications=await notify(result.orderId,{paymentId,reference});}
   catch{result.notifications={customer:'pending',owner:'pending'};}
  }
  const nonce=randomBytes(18).toString('base64');
  res.setHeader('Content-Type','text/html; charset=utf-8');
  res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; frame-ancestors https://www.shmilapps.com https://shmilapps.com; base-uri 'none'; form-action 'none'`);
  const paid=result.status==='paid';
  const message=paid?'התשלום אומת וההזמנה התקבלה. תודה!':'לא ניתן לאמת כרגע את התשלום. אם חויבתם, אין לשלם שוב. פנו אלינו עם אישור התשלום.';
  const mailMessage=paid?(result.notifications?.customer==='sent'?'אישור ההזמנה והקבלה נשלחו לכתובת המייל שהזנתם.':'התשלום אושר. משלוח אישור ההזמנה והקבלה עדיין בטיפול; אין צורך לשלם שוב.') : '';
  // Only delivery states are public. Never render/log provider bodies, emails,
  // customer details, private specification links or accounting document IDs.
  const data=JSON.stringify({type:'shmilapps:payment-result',...result}).replace(/</g,'\\u003c');
  res.statusCode=200;
  res.end(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>אישור תשלום</title><body style="margin:0;padding:24px;box-sizing:border-box;background:#080e03;color:#f4f6ec;font-family:Arial,sans-serif;line-height:1.7;text-align:center"><main style="max-width:620px;margin:24px auto;padding:28px;border:1px solid #586b28;border-radius:14px"><h2 style="font-size:24px;color:#d2ff38">${message}</h2><p>${mailMessage}</p>${paid&&result.notifications?.customer!=='sent'?'<button id="mail-check" style="padding:12px 20px;border:0;border-radius:8px;background:#c3ff00;color:#101900;font-size:16px">בדיקת שליחת האישור</button>':''}</main><script nonce="${nonce}">const result=${data};const retryUrl=location.href;const button=document.getElementById('mail-check');if(button)button.addEventListener('click',()=>location.replace(retryUrl));if(window.parent!==window){window.parent.postMessage(result,'https://www.shmilapps.com');window.parent.postMessage(result,'https://shmilapps.com');}if(window.opener){window.opener.postMessage(result,'https://www.shmilapps.com');}history.replaceState(null,'',location.pathname);</script></body></html>`);
 };
}
export default createPaymentReturnHandler();
