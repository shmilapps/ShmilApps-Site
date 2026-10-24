import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pathToFileURL,fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('..',import.meta.url));
const {createIntakeHandler,intakeSettings,normalizeIntake}=await import(pathToFileURL(root+'/lib/server/research-intake.js'));
const {marketResearchProduct}=await import(pathToFileURL(root+'/lib/server/research-products.js'));
const {documentMetadata,validateDocument}=await import(pathToFileURL(root+'/lib/server/research-document.js'));
const bytes=Buffer.from('Synthetic agriculture specification.');
const hash=b=>createHash('sha256').update(b).digest('hex');
const metadata=(name,data)=>documentMetadata({name,size:data.length,sha256:hash(data)});
const valid={service:'market-research-full',fullName:'Test Customer',email:'test@example.com',phone:'050-0000000',business:'',description:'Agriculture application research',market:'both',reportLanguage:'he',audience:'',links:'',terms:true,coupon:'',file:{name:'spec.txt',size:bytes.length,sha256:hash(bytes)}};
const settings={enabled:true,key:'sb_secret_test_server_key_only',url:'https://ufolbezpnhyrsyuxuaox.supabase.co'};
const sessions=new Map();const objects=new Map();let commits=0;let rateAllowed=true;let uploadWrongHost=false;let commitResponseLost=false;let rpcError=false;
const db={
 rpc:async(name,args)=>{
  if(rpcError)return{error:{message:'private error'}};
  if(name==='reserve_research_intake'){
   if(!rateAllowed)return{data:false};
   sessions.set(args.p_id,{id:args.p_id,request_hash:args.p_request_hash,object_path:args.p_object_path,order_id:null,expires_at:new Date(Date.now()+1800000).toISOString()});return{data:true};
  }
  assert.equal(name,'commit_research_intake');
  assert.equal(args.p_payload.final_price_agorot,valid.coupon?6900:9900);
  assert(!('status' in args.p_payload));assert(!('coupon' in args.p_payload));
  const session=sessions.get(args.p_id);if(!session.order_id){session.order_id=args.p_id;commits++;}
  if(commitResponseLost){commitResponseLost=false;throw new Error('lost response');}
  return{data:args.p_id};
 },
 from:table=>{assert.equal(table,'research_intake_sessions');return{select:()=>({eq:(_,id)=>({maybeSingle:async()=>({data:sessions.get(id)})})})};},
 storage:{from:bucket=>{assert.equal(bucket,'order-specifications');return{
  createSignedUploadUrl:async(path,options)=>{assert.equal(options.upsert,false);return{data:{signedUrl:`${uploadWrongHost?'https://wrong.example':settings.url}/storage/v1/object/upload/sign/${bucket}/${path}?token=upload-only`}};},
  download:async path=>objects.has(path)?{data:new Blob([objects.get(path)])}:{error:{message:'not found'}},
  remove:async paths=>{for(const p of paths)objects.delete(p);return{data:[]};},
 };}},
};
const handler=createIntakeHandler({settings:()=>settings,getClient:()=>db});
async function invoke(body,options={}){let result;const headers={'origin':'https://www.shmilapps.com','content-type':'application/json',...options.headers};const res={headers:{},setHeader(k,v){this.headers[k]=v;},end(body){result={status:this.statusCode,body:JSON.parse(body),headers:this.headers};}};await handler({method:options.method||'POST',headers,body,socket:{remoteAddress:'127.0.0.1'}},res);return result;}
const prepare=async(payload=valid)=>{const result=await invoke({...payload,action:'prepare'});assert.equal(result.status,200);const claims=JSON.parse(Buffer.from(result.body.ticket.split('.')[0],'base64url'));return{...result.body,id:claims.id,path:sessions.get(claims.id).object_path,payload};};
const finalize=(prepared,payload=prepared.payload)=>invoke({...payload,action:'finalize',ticket:prepared.ticket});

assert.equal(intakeSettings({}).enabled,false);
assert.equal(intakeSettings({SUPABASE_SECRET_KEY:'sb_publishable_invalid',SUPABASE_URL:settings.url,SHMILAPPS_ORDER_INTAKE_ENABLED:'true'}).enabled,false);
assert.equal(intakeSettings({SUPABASE_SECRET_KEY:settings.key,SUPABASE_URL:'https://other.supabase.co',SHMILAPPS_ORDER_INTAKE_ENABLED:'true'}).enabled,false);
assert.equal(intakeSettings({SUPABASE_SECRET_KEY:settings.key,SUPABASE_URL:settings.url,SHMILAPPS_ORDER_INTAKE_ENABLED:'true'}).enabled,true);
assert.equal((await invoke(null,{method:'GET'})).body.paymentEnabled,false);
assert.equal((await invoke(valid,{method:'DELETE'})).status,405);
assert.equal((await invoke({...valid,action:'prepare'},{headers:{origin:'https://attacker.example'}})).status,403);
assert.equal((await invoke({...valid,description:' ',action:'prepare'})).status,400);
assert.equal((await invoke({...valid,terms:false,action:'prepare'})).status,400);
assert.equal((await invoke({...valid,email:'invalid',action:'prepare'})).status,400);
assert.equal((await invoke({...valid,coupon:'NOT_VALID',action:'prepare'})).body.error,'invalid_coupon');
assert.equal((await invoke({...valid,file:{...valid.file,size:0},action:'prepare'})).body.error,'invalid_document');
rateAllowed=false;assert.equal((await invoke({...valid,action:'prepare'})).status,429);rateAllowed=true;
uploadWrongHost=true;assert.equal((await invoke({...valid,action:'prepare'})).status,503);uploadWrongHost=false;
rpcError=true;assert.equal((await invoke({...valid,action:'prepare'})).status,503);rpcError=false;
const first=await prepare();
assert(!JSON.stringify(first).includes(settings.key));
assert.equal((await finalize({...first,ticket:first.ticket+'x'})).body.error,'invalid_session');
assert.equal((await finalize(first,{...valid,description:'changed'})).body.error,'changed_details');
assert.equal((await finalize(first)).body.error,'upload_missing');
objects.set(first.path,bytes);
const regularReceipt=(await finalize(first)).body;
assert.equal(regularReceipt.status,'saved');assert.equal(commits,1);
assert.equal(regularReceipt.checkoutUrl,marketResearchProduct.paymentUrls.regular);assert.equal(regularReceipt.amount,99);assert.equal(regularReceipt.paymentVerification,'manual');assert.equal(regularReceipt.paymentEnabled,false);
assert.equal((await finalize(first)).body.orderId,first.id);assert.equal(commits,1);
const lost=await prepare();objects.set(lost.path,bytes);commitResponseLost=true;
assert.equal((await finalize(lost)).status,503);assert.equal((await finalize(lost)).body.orderId,lost.id);assert.equal(commits,2);
const bad=await prepare();objects.set(bad.path,Buffer.from('malicious bytes'));
assert.equal((await finalize(bad)).body.error,'invalid_document');assert(!objects.has(bad.path));
const expired=await prepare();sessions.get(expired.id).expires_at=new Date(0).toISOString();assert.equal((await finalize(expired)).status,410);
if(process.env.TEST_RESEARCH_COUPON){valid.coupon=process.env.TEST_RESEARCH_COUPON;assert.equal(normalizeIntake(valid).payload.final_price_agorot,6900);const discounted=await prepare();objects.set(discounted.path,bytes);const receipt=(await finalize(discounted)).body;assert.equal(receipt.status,'saved');assert.equal(receipt.amount,69);assert.equal(receipt.checkoutUrl,marketResearchProduct.paymentUrls.discounted);assert.equal((await finalize(discounted)).body.checkoutUrl,receipt.checkoutUrl);}

await validateDocument(bytes,metadata('spec.txt',bytes));
await assert.rejects(()=>validateDocument(Buffer.from([0xff,0xff]),metadata('spec.txt',Buffer.from([0xff,0xff]))));
await assert.rejects(()=>validateDocument(Buffer.from('   '),metadata('spec.txt',Buffer.from('   '))));
const pdf=Buffer.from('%PDF-1.7\n1 0 obj\n<<>>\nendobj\n%%EOF');await validateDocument(pdf,metadata('spec.pdf',pdf));
await assert.rejects(()=>validateDocument(bytes,metadata('fake.pdf',bytes)));
await assert.rejects(()=>validateDocument(bytes,metadata('fake.docx',bytes)));
function zipStored(entries){const locals=[];const central=[];let offset=0;for(const [name,text] of Object.entries(entries)){const n=Buffer.from(name);const b=Buffer.from(text);const l=Buffer.alloc(30);l.writeUInt32LE(0x04034b50);l.writeUInt16LE(20,4);l.writeUInt32LE(b.length,18);l.writeUInt32LE(b.length,22);l.writeUInt16LE(n.length,26);locals.push(l,n,b);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);c.writeUInt16LE(20,6);c.writeUInt32LE(b.length,20);c.writeUInt32LE(b.length,24);c.writeUInt16LE(n.length,28);c.writeUInt32LE(offset,42);central.push(c,n);offset+=l.length+n.length+b.length;}const dir=Buffer.concat(central);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(central.length/2,8);end.writeUInt16LE(central.length/2,10);end.writeUInt32LE(dir.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...locals,dir,end]);}
const docx=zipStored({'[Content_Types].xml':'<Types><Override ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>','word/document.xml':'<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"><w:body/></w:document>'});
await validateDocument(docx,metadata('spec.docx',docx));
const invalidDocx=zipStored({'word/document.xml':'plain wrong content'});await assert.rejects(()=>validateDocument(invalidDocx,metadata('spec.docx',invalidDocx)));
console.log('PASS: server validation, locked project, feature gate, origins, rate limits, private upload scope, metadata binding, tampered/expired sessions, byte hashes, TXT/PDF/DOCX checks, atomic persistence contract and lost-response retries; no payments.');
