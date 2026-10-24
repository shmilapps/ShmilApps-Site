import {createHmac,timingSafeEqual} from 'node:crypto';
export function paymentReference(orderId,key){
  if(!/^[a-f0-9-]{36}$/.test(orderId)||!key)throw new Error('invalid_reference');
  return orderId+'.'+createHmac('sha256',key).update('shmilapps-sumit-order-v1\0'+orderId).digest('hex');
}
export function referenceOrder(reference,key){
  if(typeof reference!=='string'||!key)return null;
  const [id,signature,...extra]=reference.split('.');
  if(extra.length||!/^[a-f0-9-]{36}$/.test(id||'')||!/^[a-f0-9]{64}$/.test(signature||''))return null;
  const expected=paymentReference(id,key).split('.')[1];
  return timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(expected,'hex'))?id:null;
}
