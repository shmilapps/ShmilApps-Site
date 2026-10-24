import { researchQuote } from '../lib/server/research-coupons.js';
import { marketResearchProduct as product } from '../lib/server/research-products.js';

export default function handler(req,res) {
  res.setHeader('Cache-Control','no-store');
  res.setHeader('Content-Type','application/json; charset=utf-8');
  const send=(status,body)=>{res.statusCode=status;res.end(JSON.stringify(body));};
  if(req.method!=='POST'){res.setHeader('Allow','POST');return send(405,{error:'method_not_allowed'});}
  let body;
  try{
    if(Number(req.headers?.['content-length']||0)>2048)return send(413,{error:'body_too_large'});
    body=typeof req.body==='string'?JSON.parse(req.body):req.body;
    if(JSON.stringify(body)?.length>2048)return send(413,{error:'body_too_large'});
  }catch{return send(400,{error:'invalid_json'});}
  if(body?.service!==product.id || typeof body.coupon!=='string' || body.coupon.length>80)return send(400,{error:'invalid_request'});
  let quote;
  try{quote=researchQuote(body.coupon);}catch{quote={accepted:false,amount:product.regularAmount};}
  return send(200,{service:product.id,currency:product.currency,regularAmount:product.regularAmount,...quote});
}
