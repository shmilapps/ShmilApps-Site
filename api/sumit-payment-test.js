import {createHash,createHmac,randomBytes,timingSafeEqual} from 'node:crypto';
import {getSumitPayment,validPayment} from '../lib/server/research-payment.js';
const ACCESS_HASH='3fbae661ce110d38e75dbc5f17539daf27508e5b582edb2c032267f5e1a6c7de';
const TEST_EXPIRES=1792943144411;
const key=()=>(process.env.SUMIT_API_KEY||'').trim();
const mac=value=>createHmac('sha256',key()).update('shmilapps-readonly-payment-test-v1\0'+value).digest('hex');
export function validTestReference(reference,now=Date.now()){
 if(!key()||typeof reference!=='string')return false;
 const [prefix,expiry,nonce,signature,...extra]=reference.split('.');
 if(extra.length||prefix!=='test5'||!/^\d{13}$/.test(expiry||'')||!Number.isSafeInteger(Number(expiry))||Number(expiry)<now||Number(expiry)>TEST_EXPIRES||!/^[a-f0-9]{24}$/.test(nonce||'')||!/^[a-f0-9]{64}$/.test(signature||''))return false;
 return timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(mac([prefix,expiry,nonce].join('.')),'hex'));
}
export default async function handler(req,res){
 res.setHeader('Cache-Control','no-store');res.setHeader('Referrer-Policy','no-referrer');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','text/html; charset=utf-8');
 res.setHeader('Content-Security-Policy',"default-src 'none'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'; frame-ancestors 'none'");
 const page=(status,title,body='')=>{res.statusCode=status;res.end(`<!doctype html><html lang="he" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>בדיקת חיבור תשלום</title><body style="font:20px Arial,sans-serif;max-width:650px;margin:60px auto;padding:20px;line-height:1.7"><h1>${title}</h1>${body}</body></html>`);};
 if(req.method!=='GET'){res.setHeader('Allow','GET');return page(405,'הפעולה אינה נתמכת');}
 if(!key()||Date.now()>TEST_EXPIRES)return page(404,'קישור הבדיקה אינו זמין');
 const url=new URL(req.url,'https://www.shmilapps.com');
 const reference=url.searchParams.get('og-externalidentifier');
 if(reference!==null){
  const rawId=url.searchParams.get('og-paymentid');const paymentId=/^[1-9]\d{0,14}$/.test(rawId||'')?Number(rawId):0;
  if(!validTestReference(reference)||!Number.isSafeInteger(paymentId)||!paymentId)return page(400,'לא התקבל אישור בדיקה תקין','<p>אם חויבתם, אין לשלם שוב. שמרו את אישור התשלום.</p>');
  try{
   const payment=await getSumitPayment(paymentId,key());
   if(!validPayment(payment,{paymentId,reference,amount:500}))return page(409,'פרטי העסקה לא תאמו לבדיקת 5 ש״ח','<p>אין לשלם שוב. נדרש לבדוק את אישור העסקה.</p>');
   return page(200,'אימות התשלום מול סאמיט הצליח',`<p>עסקה מספר ${paymentId}: תשלום תקין בסך 5 ש״ח. מזהה הבדיקה, הסכום והמטבע אומתו בקריאה ישירה לסאמיט.</p><p>לא נוצרה או עודכנה הזמנה במסד הנתונים. זו בדיקת חיבור בלבד.</p>`);
  }catch{return page(503,'לא ניתן להשלים כרגע את הבדיקה מול סאמיט','<p>אם חויבתם, אין לשלם שוב. שמרו את אישור התשלום ואת הקישור הנוכחי כדי שנוכל לבדוק.</p>');}
 }
 const access=url.searchParams.get('access');
 if(typeof access!=='string'||access.length!==48||createHash('sha256').update(access).digest('hex')!==ACCESS_HASH)return page(404,'קישור הבדיקה אינו זמין');
 const body=['test5',String(TEST_EXPIRES),randomBytes(12).toString('hex')].join('.');
 const destination=new URL('https://pay.sumit.co.il/15ajtmv/15er2an/15er2ao/payment/');destination.searchParams.set('externalidentifier',body+'.'+mac(body));destination.searchParams.set('quantity','1');
 return page(200,'בדיקת חיבור תשלום בסך 5 ש״ח',`<p>זהו חיוב אמיתי של 5 ש״ח. את פרטי הכרטיס ואת אישור התשלום תמלאו בעצמכם בסאמיט.</p><p>בסיום נבדוק את העסקה מול סאמיט, בלי לשנות את הזמנות סקר השוק ובלי להפעיל אימות אוטומטי להזמנות.</p><a rel="noreferrer" style="display:inline-block;padding:12px 22px;background:#1657e8;color:white;border-radius:8px;text-decoration:none" href="${destination.toString().replace(/&/g,'&amp;')}">המשך לתשלום הבדיקה · 5 ש״ח</a>`);
}
