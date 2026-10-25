import assert from 'node:assert/strict';
import {createHash,randomUUID} from 'node:crypto';
import {createRequire} from 'node:module';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const {createIntakeHandler}=await import(pathToFileURL(root+'/lib/server/research-intake.js'));
const bytes=Buffer.from('Synthetic revised specification.');
const payload={service:'market-research-full',fullName:'Synthetic Customer',email:'synthetic@example.invalid',phone:'0500000000',business:'',description:'Original synthetic request',market:'both',reportLanguage:'he',audience:'',links:'',terms:true,coupon:'',file:{name:'test.txt',size:bytes.length,sha256:createHash('sha256').update(bytes).digest('hex')}};
const settings={enabled:true,key:'sb_secret_synthetic_only',url:'https://ufolbezpnhyrsyuxuaox.supabase.co'};
const sessions=new Map(),orders=new Map(),objects=new Map();let commits=0,revisions=0,loseReply=false,paidAtCommit=false,anonymousLimited=false,revisionReservations=0;
const db={
 from(table){const rows=table==='research_intake_sessions'?sessions:orders;return{select:()=>({eq:(_,id)=>({maybeSingle:async()=>({data:rows.get(id)})})})};},
 storage:{from:()=>({createSignedUploadUrl:async p=>({data:{signedUrl:settings.url+'/storage/v1/object/upload/sign/order-specifications/'+p+'?token=synthetic'}}),download:async p=>objects.has(p)?{data:new Blob([objects.get(p)])}:{error:{}},remove:async()=>({data:[]})})},
 async rpc(name,a){
  if(name==='reserve_research_intake'){if(anonymousLimited)return{data:false};sessions.set(a.p_id,{id:a.p_id,request_hash:a.p_request_hash,object_path:a.p_object_path,order_id:null,expires_at:new Date(Date.now()+1800000).toISOString()});return{data:true};}
  const session=sessions.get(a.p_id);
  if(name==='commit_research_intake'){commits++;session.order_id=a.p_id;orders.set(a.p_id,{id:a.p_id,status:'pending_payment',...a.p_payload});return{data:a.p_id};}
  assert.equal(name,'revise_research_intake');
  const order=orders.get(a.p_order_id);
  if(paidAtCommit)order.status='paid';
  if(order.status!=='pending_payment')return{error:{message:'order_not_editable'}};
  assert.equal(a.p_payload.final_price_agorot,order.final_price_agorot);
  revisions++;Object.assign(order,a.p_payload);session.order_id=a.p_order_id;
  if(loseReply){loseReply=false;throw Error('lost reply');}
  return{data:a.p_order_id};
 }
};
const handler=createIntakeHandler({settings:()=>settings,getClient:()=>db,reserveRevision:async(_db,a)=>{
 revisionReservations++;assert.match(a.bucket,/^[a-f0-9]{64}$/);const expiresAt=Date.now()+1800000;
 sessions.set(a.id,{id:a.id,request_hash:a.hash,object_path:a.objectPath,order_id:null,expires_at:new Date(expiresAt).toISOString()});
 return{allowed:true,id:a.id,objectPath:a.objectPath,expiresAt};
}});
async function call(body){let out;await handler({method:'POST',headers:{origin:'https://www.shmilapps.com','content-type':'application/json'},body,socket:{remoteAddress:'127.0.0.1'}},{setHeader(){},end(text){out={status:this.statusCode,...JSON.parse(text)};}});return out;}
async function prepare(data,editTicket){const r=await call({...data,action:'prepare',...(editTicket?{editTicket}:{})});if(r.ticket){const c=JSON.parse(Buffer.from(r.ticket.split('.')[0],'base64url'));objects.set(sessions.get(c.id).object_path,bytes);}return r;}
const first=await prepare(payload);assert.equal(first.status,200);
const saved=await call({...payload,action:'finalize',ticket:first.ticket});assert.equal(saved.status,'saved');assert(saved.editTicket);assert.equal(commits,1);
assert.equal((await call({...payload,action:'prepare',editTicket:saved.editTicket+'x'})).error,'invalid_edit_session');
const changed={...payload,fullName:'Updated Synthetic Customer',description:'Updated synthetic request',reportLanguage:'en'};
anonymousLimited=true;assert.equal((await call({...payload,action:'prepare'})).error,'rate_limited');
const next=await prepare(changed,saved.editTicket);assert.equal(next.status,200);
assert.equal((await call({...changed,description:'tampered after prepare',action:'finalize',ticket:next.ticket})).error,'changed_details');
const revised=await call({...changed,action:'finalize',ticket:next.ticket});assert.equal(revised.orderId,saved.orderId);assert.equal(commits,1);assert.equal(revisions,1);assert.equal(orders.size,1);assert.equal(orders.get(saved.orderId).description,changed.description);
await call({...changed,action:'finalize',ticket:next.ticket});assert.equal(revisions,1);
assert.equal((await prepare({...changed,coupon:'SHMILAPPSDEAL'},revised.editTicket)).error,'checkout_price_locked');
const lost=await prepare({...changed,description:'After lost reply'},revised.editTicket);loseReply=true;
assert.equal((await call({...changed,description:'After lost reply',action:'finalize',ticket:lost.ticket})).error,'save_unavailable');
const recovered=await call({...changed,description:'After lost reply',action:'finalize',ticket:lost.ticket});assert.equal(recovered.orderId,saved.orderId);assert.equal(revisions,2);assert.equal(orders.size,1);
orders.get(saved.orderId).status='paid';assert.equal((await prepare(changed,recovered.editTicket)).error,'order_not_editable');orders.get(saved.orderId).status='pending_payment';
const racing=await prepare(changed,recovered.editTicket);paidAtCommit=true;assert.equal((await call({...changed,action:'finalize',ticket:racing.ticket})).error,'order_not_editable');assert.equal(revisions,2);
assert(revisionReservations>0);
console.log('PASS mock: anonymous quota exhausted still allows authenticated edit; new-order quota preserved; signed edit authorization, same order ID, no duplicate order, changed contact/request/report language, payload binding, idempotency, lost reply recovery, price locking, paid rejection and payment race. SQL function still requires installation and live verification.');
