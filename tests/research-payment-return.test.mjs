import assert from 'node:assert/strict';
import {createPaymentReturnHandler} from '../api/research-payment-return.js';
let mails=0;
const handler=createPaymentReturnHandler({verify:async()=>({status:'paid',orderId:'synthetic-order'}),notify:async(orderId,args)=>{mails++;assert.equal(orderId,'synthetic-order');assert.equal(args.paymentId,123);assert.equal(args.reference,'synthetic-reference');return{customer:'sent',owner:'sent'};}});
async function invoke(handle,method='GET'){let body;const res={setHeader(){},end(value){body=value;}};await handle({method,url:'/?OG-PaymentID=123&OG-ExternalIdentifier=synthetic-reference'},res);return{body,status:res.statusCode};}
let result=await invoke(handler);assert.equal(mails,1);assert(result.body.includes('אישור ההזמנה והקבלה נשלחו'));assert(result.body.includes('"customer":"sent"'));assert.equal(result.status,200);
const rejected=createPaymentReturnHandler({verify:async()=>({status:'unverified'}),notify:async()=>{throw new Error('must not send');}});result=await invoke(rejected);assert(result.body.includes('אין לשלם שוב'));assert(!result.body.includes('אישור ההזמנה והקבלה נשלחו'));
const mailFailure=createPaymentReturnHandler({verify:async()=>({status:'paid',orderId:'synthetic-order'}),notify:async()=>{throw new Error('private detail');}});result=await invoke(mailFailure);assert(result.body.includes('"status":"paid"'));assert(result.body.includes('עדיין בטיפול'));assert(!result.body.includes('private detail'));
assert.equal((await invoke(handler,'POST')).status,405);assert.equal(mails,1);
console.log('PASS callback sends only after verified paid, preserves paid on mail failure, exposes no internal failure, and handles actual SUMIT keys. Mock only.');
