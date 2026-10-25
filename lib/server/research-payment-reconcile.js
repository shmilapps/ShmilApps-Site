import {createClient} from '@supabase/supabase-js';
import {intakeSettings} from './research-intake.js';
import {referenceOrder} from './research-payment-reference.js';
import {createPaymentVerifier} from './research-payment.js';
import {createNotificationProcessor} from './research-notifications.js';

export async function listSumitPayments({from,to,startIndex,key},fetcher=fetch){
 const response=await fetcher('https://api.sumit.co.il/billing/payments/list/',{method:'POST',redirect:'error',headers:{'Content-Type':'application/json'},body:JSON.stringify({Credentials:{CompanyID:2496834247,APIKey:key},Date_From:from,Date_To:to,Valid:true,StartIndex:startIndex}),signal:AbortSignal.timeout(12000)});
 if(!response.ok)throw new Error('provider_unavailable');
 const body=await response.json(),data=body.Data;
 if(![0,'0','Success','Success (0)'].includes(body.Status)||!data||typeof data.HasNextPage!=='boolean'||(data.Payments!==null&&!Array.isArray(data.Payments)))throw new Error('provider_unavailable');
 const payments=data.Payments||[];
 if(payments.length>5000||(data.HasNextPage&&!payments.length))throw new Error('provider_unavailable');
 return{payments,hasNextPage:data.HasNextPage};
}
const defaultDb=settings=>createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(10000)})}});

// One stateless job; existing orders, payment events and mail ledger remain the source of truth.
export function createPaymentSync({env=()=>process.env,getDb=defaultDb,listPayments=listSumitPayments,verify=createPaymentVerifier(),notify=createNotificationProcessor(),now=()=>Date.now()}={}){
 return async()=>{
  const config=env(),settings=intakeSettings(config),key=(config.SUMIT_API_KEY||'').trim();
  const stats={pages:0,matched:0,confirmed:0,alreadySent:0,failed:0,remaining:0};
  if(!settings.enabled||!key||config.SUMIT_PAYMENT_VERIFICATION_ENABLED!=='true')return{status:'unavailable',...stats};
  const started=now(),deadline=started+85000,from=new Date(started-30*86400000).toISOString(),to=new Date(started).toISOString();
  const candidates=new Map();let startIndex=0,hasMore=false;
  try{
   do{
    const page=await listPayments({from,to,startIndex,key});stats.pages++;
    for(const payment of page.payments){
     const orderId=referenceOrder(payment.ExternalIdentifier,settings.key);
     if(!orderId||!Number.isSafeInteger(payment.ID)||payment.ID<=0||payment.ValidPayment!==true||![0,'ILS','ILS (0)'].includes(payment.Currency)||!Number.isFinite(payment.Amount)||![500,6900,9900].some(amount=>Math.abs(payment.Amount*100-amount)<0.000001))continue;
     candidates.set(payment.ID,{orderId,paymentId:payment.ID,reference:payment.ExternalIdentifier});
    }
    hasMore=page.hasNextPage;startIndex+=page.payments.length;
   }while(hasMore&&stats.pages<20&&now()<deadline);
   stats.matched=candidates.size;
   if(candidates.size){
    const db=getDb(settings),ids=[...new Set([...candidates.values()].map(item=>item.orderId))];
    const orders=await db.from('orders').select('id,status').in('id',ids);
    const outboxes=await db.from('notification_outbox').select('order_id,customer_mail_state,owner_mail_state').in('order_id',ids);
    if(orders.error||outboxes.error)throw new Error('database_unavailable');
    const orderMap=new Map((orders.data||[]).map(order=>[order.id,order]));
    const mailMap=new Map((outboxes.data||[]).map(box=>[box.order_id,box]));
    const pending=[];
    for(const candidate of candidates.values()){
     const order=orderMap.get(candidate.orderId),mail=mailMap.get(candidate.orderId);
     if(!order||!['pending_payment','paid'].includes(order.status))continue;
     if(order.status==='paid'&&mail?.customer_mail_state==='sent'&&mail?.owner_mail_state==='sent'){stats.alreadySent++;continue;}
     pending.push({...candidate,status:order.status});
    }
    pending.sort((a,b)=>(a.status==='paid')-(b.status==='paid'));
    let processed=0;
    for(const candidate of pending){
     if(processed>=10||now()>=deadline)break;processed++;
     try{
      const result=await verify({paymentId:candidate.paymentId,reference:candidate.reference});
      if(result.status!=='paid'||result.orderId!==candidate.orderId)throw new Error('not_verified');
      const registered=await db.rpc('register_research_notification_retry',{p_order_id:candidate.orderId,p_payment_id:candidate.paymentId,p_reference:candidate.reference});
      if(registered.error||registered.data!==true)throw new Error('retry_not_registered');
      await notify(candidate.orderId,{paymentId:candidate.paymentId,reference:candidate.reference});
      stats.confirmed++;
     }catch{stats.failed++;}
    }
    stats.remaining=pending.length-processed;
   }
   return{status:hasMore||stats.failed||stats.remaining?'partial':'complete',...stats};
  }catch{return{status:'unavailable',...stats};}
 };
}
