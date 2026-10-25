// Called only after the signed edit ticket, ownership binding and pending order are verified.
// Keep authenticated revisions out of the anonymous per-IP reservation budget.
export async function reserveResearchRevision(db,{id,hash,bucket,objectPath,now=Date.now()}){
 const recent=await db.from('research_intake_sessions').select('id,object_path,expires_at')
  .eq('ip_hash',bucket).eq('request_hash',hash).is('order_id',null)
  .gt('expires_at',new Date(now).toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
 if(recent.error)throw new Error('database_unavailable');
 if(recent.data)return{allowed:true,id:recent.data.id,objectPath:recent.data.object_path,expiresAt:Date.parse(recent.data.expires_at)};
 const hour=await db.from('research_intake_sessions').select('id',{count:'exact',head:true})
  .eq('ip_hash',bucket).gte('created_at',new Date(now-3600000).toISOString());
 const day=await db.from('research_intake_sessions').select('id',{count:'exact',head:true})
  .eq('ip_hash',bucket).gte('created_at',new Date(now-86400000).toISOString());
 if(hour.error||day.error||!Number.isSafeInteger(hour.count)||!Number.isSafeInteger(day.count))throw new Error('database_unavailable');
 if(hour.count>=20||day.count>=60)return{allowed:false};
 const expiresAt=now+1800000;
 const inserted=await db.from('research_intake_sessions').insert({id,request_hash:hash,ip_hash:bucket,object_path:objectPath,expires_at:new Date(expiresAt).toISOString()});
 if(inserted.error)throw new Error('database_unavailable');
 return{allowed:true,id,objectPath,expiresAt};
}
