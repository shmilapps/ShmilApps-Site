import {createPaymentReconciler} from '../lib/server/research-payment-reconcile.js';
export function createReconciliationHandler({reconcile=createPaymentReconciler(),log=entry=>console.info('research_payment_reconcile',entry)}={}){
 return async function handler(req,res){
  res.setHeader('Cache-Control','no-store');res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Content-Type','application/json; charset=utf-8');
  const send=(code,status)=>{res.statusCode=code;res.end(JSON.stringify({status}));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,'method_not_allowed');}
  if(Number(req.headers?.['content-length']||0)>2048)return send(413,'invalid_request');
  let body;
  try{body=typeof req.body==='string'?JSON.parse(req.body):req.body;if(!body||JSON.stringify(body).length>2048)throw new Error();}catch{return send(400,'invalid_request');}
  try{
   const result=await reconcile({orderId:body.orderId,token:body.token});
   log({status:result.status,pages:result.pages});
   return send(result.status==='unauthorized'?401:result.status==='unavailable'||result.status==='failed'?503:200,result.status);
  }catch{log({status:'unavailable',pages:0});return send(503,'unavailable');}
 };
}
export default createReconciliationHandler();
