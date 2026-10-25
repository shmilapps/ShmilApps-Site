import {paymentReference} from './research-payment-reference.js';
import { createHash, createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { marketResearchProduct } from './research-products.js';
import { researchQuote } from './research-coupons.js';
import { documentMetadata, validateDocument } from './research-document.js';

const PROJECT_URL = 'https://ufolbezpnhyrsyuxuaox.supabase.co';
const BUCKET = 'order-specifications';
const KEY_NAME = 'SUPABASE_SECRET_KEY';

export function intakeSettings(env=process.env) {
  const key = (env[KEY_NAME] || '').trim();
  let isServiceKey=key.startsWith('sb_secret_');
  if (!isServiceKey) { try { isServiceKey=JSON.parse(Buffer.from(key.split('.')[1] || '', 'base64url').toString()).role==='service_role'; } catch {} }
  return { enabled:env.SHMILAPPS_ORDER_INTAKE_ENABLED==='true' && (env.SUPABASE_URL || '').trim().replace(/\/$/,'')===PROJECT_URL && isServiceKey, key, url:PROJECT_URL };
}

export function normalizeIntake(body) {
  const text=(field,max,required=false) => {
    const raw=body?.[field];
    if ((raw===undefined || raw===null) && !required) return '';
    if (typeof raw!=='string' || raw.length>max || (required && !raw.trim()) || raw.includes('\0')) throw new Error('invalid_fields');
    return raw.trim();
  };
  if (body?.service!=='market-research-full' || body?.terms!==true) throw new Error('invalid_fields');
  const full_name=text('fullName',120,true); const email=text('email',254,true); const phone=text('phone',40,true);
  if (full_name.length<2 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\+?[\d ()-]+$/.test(phone) || phone.replace(/\D/g,'').length<7 || phone.replace(/\D/g,'').length>15) throw new Error('invalid_fields');
  const market=text('market',20,true); const report_language=text('reportLanguage',20,true);
  if (!['israel','international','both'].includes(market) || !['he','en','both'].includes(report_language)) throw new Error('invalid_fields');
  const quote=researchQuote(body.coupon ?? '');
  const file=documentMetadata(body.file);
  const payload={full_name,email,phone,business:text('business',160),description:text('description',10000,true),market,report_language,audience:text('audience',5000),links:text('links',5000),final_price_agorot:quote.amount*100,discount_decision:quote.accepted?'approved':'none',is_test:quote.isTest===true,terms_accepted:true};
  return { payload,file };
}

function mac(key,value) { return createHmac('sha256',key).update('shmilapps-intake-v1\0').update(value).digest('hex'); }
function fingerprint(settings,input) { return mac(settings.key,JSON.stringify(input)); }
function ticket(settings,claims) { const body=Buffer.from(JSON.stringify(claims)).toString('base64url'); return body+'.'+mac(settings.key,body); }
function readTicket(settings,value) {
  if (typeof value!=='string' || value.length>2048) throw new Error('invalid_session');
  const [body,signature,...extra]=value.split('.');
  if (extra.length || !/^[a-f0-9]{64}$/.test(signature || '') || !timingSafeEqual(Buffer.from(signature,'hex'),Buffer.from(mac(settings.key,body),'hex'))) throw new Error('invalid_session');
  const claims=JSON.parse(Buffer.from(body,'base64url').toString('utf8'));
  if (claims.v!==1 || typeof claims.id!=='string' || !/^[a-f0-9-]{36}$/.test(claims.id) || !Number.isInteger(claims.exp) || claims.exp < Date.now()-24*60*60*1000) throw new Error('invalid_session');
  return claims;
}

function client(settings) { return createClient(settings.url,settings.key,{auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url,options={})=>fetch(url,{...options,signal:AbortSignal.timeout(15000)})}}); }

export function createIntakeHandler({settings:intakeConfig=intakeSettings,getClient=client,now=()=>Date.now()}={}) {
  return async function handler(req,res) {
    const send=(status,body) => {res.statusCode=status;res.end(JSON.stringify(body));};
    res.setHeader('Content-Type','application/json; charset=utf-8'); res.setHeader('Cache-Control','no-store'); res.setHeader('X-Content-Type-Options','nosniff');
    const settings=intakeConfig();
    if (req.method==='GET') return send(200,{intakeEnabled:settings.enabled,paymentEnabled:false});
    if (req.method!=='POST') {res.setHeader('Allow','GET, POST');return send(405,{error:'method_not_allowed'});}
    if (!settings.enabled) return send(503,{error:'intake_not_ready'});
    const origins=new Set(['https://www.shmilapps.com','https://shmilapps.com']);
    if (process.env.VERCEL_URL) origins.add('https://'+process.env.VERCEL_URL);
    if (process.env.NODE_ENV!=='production') origins.add('http://localhost:5173');
    if (!origins.has(req.headers?.origin) || !/^application\/json\b/i.test(req.headers?.['content-type'] || '')) return send(403,{error:'invalid_origin'});
    let body,input;
    try {
      if (Number(req.headers?.['content-length']||0)>98304) return send(413,{error:'body_too_large'});
      body=typeof req.body==='string'?JSON.parse(req.body):req.body;
      if (JSON.stringify(body)?.length>98304) return send(413,{error:'body_too_large'});
      input=normalizeIntake(body);
    } catch(error) { return send(400,{error:['invalid_coupon','invalid_document','invalid_fields'].includes(error.message)?error.message:'invalid_fields'}); }
    const db=getClient(settings); const hash=fingerprint(settings,input);
    // Temporary hosted checkout: opening/returning from it never confirms payment.
    const savedResponse=orderId=>{
      const checkout=new URL(input.payload.is_test?marketResearchProduct.paymentUrls.test:input.payload.final_price_agorot===6900?marketResearchProduct.paymentUrls.discounted:marketResearchProduct.paymentUrls.regular);
      checkout.searchParams.set('externalidentifier',paymentReference(orderId,settings.key));
      return {orderId,editTicket:body.ticket,status:'saved',paymentEnabled:false,checkoutUrl:checkout.toString(),amount:input.payload.final_price_agorot/100,isTest:input.payload.is_test,paymentVerification:'manual'};
    };
    try {
      if (body.action==='prepare') {
        let editOrderId;
        if (body.editTicket) {
          let previous;
          try {previous=readTicket(settings,body.editTicket);} catch {return send(403,{error:'invalid_edit_session'});}
          const previousSession=await db.from('research_intake_sessions').select('id,request_hash,order_id').eq('id',previous.id).maybeSingle();
          if(previousSession.error)throw new Error('database_unavailable');
          if(!previousSession.data?.order_id || previousSession.data.request_hash!==previous.hash) return send(403,{error:'invalid_edit_session'});
          editOrderId=previousSession.data.order_id;
          const current=await db.from('orders').select('id,status,final_price_agorot,discount_decision,is_test').eq('id',editOrderId).maybeSingle();
          if(current.error)throw new Error('database_unavailable');
          if(current.data?.status!=='pending_payment')return send(409,{error:'order_not_editable'});
          if(current.data.final_price_agorot!==input.payload.final_price_agorot || current.data.discount_decision!==input.payload.discount_decision || current.data.is_test!==input.payload.is_test)
            return send(409,{error:'checkout_price_locked'});
        }
        const id=randomUUID(); const objectPath=`intake/${id}/specification.${input.file.extension}`;
        const ip=process.env.VERCEL==='1'?String(req.headers?.['x-forwarded-for']||'unknown').split(',')[0].trim():req.socket?.remoteAddress || 'unknown';
        const reserved=await db.rpc('reserve_research_intake',{p_id:id,p_request_hash:hash,p_ip_hash:mac(settings.key,ip),p_object_path:objectPath});
        if (reserved.error) throw new Error('database_unavailable');
        if (reserved.data!==true) return send(429,{error:'rate_limited'});
        const signed=await db.storage.from(BUCKET).createSignedUploadUrl(objectPath,{upsert:false});
        if (signed.error || !signed.data?.signedUrl) throw new Error('storage_unavailable');
        const upload=new URL(signed.data.signedUrl);
        if (upload.origin!==settings.url || upload.pathname!==`/storage/v1/object/upload/sign/${BUCKET}/${objectPath}`) throw new Error('invalid_upload_url');
        return send(200,{ticket:ticket(settings,{v:1,id,hash,...(editOrderId?{orderId:editOrderId}:{}),exp:now()+30*60*1000}),uploadUrl:upload.toString(),contentType:input.file.mime,amount:input.payload.final_price_agorot/100});
      }
      if (body.action!=='finalize') return send(400,{error:'invalid_action'});
      let claims;
      try {claims=readTicket(settings,body.ticket);} catch {return send(400,{error:'invalid_session'});}
      if (claims.hash!==hash) return send(409,{error:'changed_details'});
      const sessionResult=await db.from('research_intake_sessions').select('id,request_hash,object_path,order_id,expires_at').eq('id',claims.id).maybeSingle();
      if (sessionResult.error) throw new Error('database_unavailable');
      const session=sessionResult.data;
      if (!session || session.request_hash!==hash || session.object_path!==`intake/${claims.id}/specification.${input.file.extension}`) return send(400,{error:'invalid_session'});
      if(claims.orderId){
        if(!/^[a-f0-9-]{36}$/.test(claims.orderId))return send(400,{error:'invalid_session'});
        const current=await db.from('orders').select('id,status').eq('id',claims.orderId).maybeSingle();
        if(current.error)throw new Error('database_unavailable');
        if(current.data?.status!=='pending_payment')return send(409,{error:'order_not_editable'});
        if(session.order_id && session.order_id!==claims.orderId)return send(400,{error:'invalid_session'});
      }
      if (session.order_id) return send(200,savedResponse(session.order_id));
      if (claims.exp<=now() || Date.parse(session.expires_at)<=now()) return send(410,{error:'expired_session'});
      const downloaded=await db.storage.from(BUCKET).download(session.object_path);
      if (downloaded.error || !downloaded.data) return send(409,{error:'upload_missing'});
      try {
        if (downloaded.data.size!==input.file.size) throw new Error('invalid_document');
        const bytes=Buffer.from(await downloaded.data.arrayBuffer());
        if (createHash('sha256').update(bytes).digest('hex')!==input.file.sha256) throw new Error('invalid_document');
        await validateDocument(bytes,input.file);
      } catch {
        await db.storage.from(BUCKET).remove([session.object_path]);
        return send(400,{error:'invalid_document'});
      }
      const saved=await db.rpc(claims.orderId?'revise_research_intake':'commit_research_intake',{
        ...(claims.orderId?{p_order_id:claims.orderId}:{}),p_id:claims.id,p_request_hash:hash,p_payload:input.payload,
        p_document:{object_path:session.object_path,original_filename:input.file.name,mime_type:input.file.mime,size_bytes:input.file.size}});
      if(saved.error && claims.orderId){
        const constraint=/constraint "([a-z0-9_]{1,100})"/i.exec(saved.error.message || '')?.[1];
        console.warn('research_order_revision_error',{code:/^[A-Z0-9]{4,12}$/i.test(saved.error.code || '')?saved.error.code:'unknown',...(constraint?{constraint}:{})});
      }
      if(saved.error?.message?.includes('order_not_editable'))return send(409,{error:'order_not_editable'});
      if(saved.error?.message?.includes('checkout_price_locked'))return send(409,{error:'checkout_price_locked'});
      if (saved.error || typeof saved.data!=='string' || saved.data!==(claims.orderId||claims.id)) throw new Error('database_unavailable');
      // Static links are temporary; the order remains pending_payment for manual reconciliation.
      return send(200,savedResponse(saved.data));
    } catch { return send(503,{error:'save_unavailable'}); }
  };
}
