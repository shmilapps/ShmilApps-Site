import {timingSafeEqual} from 'node:crypto';
import {createPaymentSync} from '../lib/server/research-payment-reconcile.js';
export function validSyncAuthorization(value,secret){
 if(!/^[a-f0-9]{64}$/.test(secret||'')||typeof value!=='string'||!/^Bearer [a-f0-9]{64}$/.test(value))return false;
 return timingSafeEqual(Buffer.from(value.slice(7),'hex'),Buffer.from(secret,'hex'));
}
export function createReconciliationHandler({env=()=>process.env,sync=createPaymentSync(),log=entry=>console.info('research_payment_sync',entry)}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  const send=(code,body)=>{res.statusCode=code;res.end(JSON.stringify(body));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{status:'method_not_allowed'});}
  if(!validSyncAuthorization(req.headers?.authorization,env().RESEARCH_PAYMENT_SYNC_SECRET))return send(401,{status:'unauthorized'});
  try{const result=await sync();log(result);return send(result.status==='complete'?200:503,result);}
  catch{log({status:'unavailable'});return send(503,{status:'unavailable'});}
 };
}
export default createReconciliationHandler();
