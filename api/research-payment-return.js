import {randomBytes} from 'node:crypto';
import {createPaymentVerifier} from '../lib/server/research-payment.js';
import {paymentReturnParams} from '../lib/server/research-payment-return-params.js';
const verify=createPaymentVerifier();
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');
 if(req.method!=='GET'){res.statusCode=405;res.setHeader('Allow','GET');return res.end();}
 const url=new URL(req.url,'https://www.shmilapps.com');
 const {paymentId,reference}=paymentReturnParams(url.searchParams);
 const result=await verify({paymentId,reference});
 const nonce=randomBytes(18).toString('base64');
 res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Content-Security-Policy',`default-src 'none'; script-src 'nonce-${nonce}'; style-src 'unsafe-inline'; frame-ancestors https://www.shmilapps.com https://shmilapps.com; base-uri 'none'; form-action 'none'`);
 const message=result.status==='paid'?'התשלום אומת וההזמנה התקבלה. תודה!':'לא ניתן לאמת כרגע את התשלום. אם חויבתם, אין לשלם שוב. פנו אלינו עם אישור התשלום.';
 // No provider payload, card details or customer information is rendered/logged.
 const data=JSON.stringify({type:'shmilapps:payment-result',...result}).replace(/</g,'\\u003c');
 res.statusCode=200;
 res.end(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>אישור תשלום</title><body style="font-family:Arial,sans-serif;padding:32px;text-align:center"><h2>${message}</h2><script nonce="${nonce}">const result=${data};if(window.parent!==window){window.parent.postMessage(result,'https://www.shmilapps.com');window.parent.postMessage(result,'https://shmilapps.com');}if(window.opener){window.opener.postMessage(result,'https://www.shmilapps.com');}history.replaceState(null,'',location.pathname);</script></body></html>`);
}
