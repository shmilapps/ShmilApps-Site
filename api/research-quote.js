import { researchQuote } from '../lib/server/research-coupons.js';
import { getOrderProduct,orderQuantity } from '../lib/server/research-products.js';

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
  const product=getOrderProduct(body?.service);
  if(!product || typeof body.coupon!=='string' || body.coupon.length>80)return send(400,{error:'invalid_request'});
  let quantity;try{quantity=orderQuantity(product,body.quantity??1);}catch{return send(400,{error:'invalid_quantity'});}
  let quote;
  try{quote=researchQuote(body.coupon,{service:product.id,quantity});}catch{quote={accepted:false,amount:product.regularAmount*quantity};}
  return send(200,{service:product.id,currency:product.currency,regularAmount:product.regularAmount*quantity,quantity,...quote});
}
