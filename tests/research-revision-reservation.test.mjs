import assert from 'node:assert/strict';
import {reserveResearchRevision} from '../lib/server/research-revision-reservation.js';
let counts=[0,0],existing=null,inserts=[],error=false;
const db={from(table){assert.equal(table,'research_intake_sessions');return{
 select(_cols,options){if(options){return{eq:()=>({gte:async()=>({count:counts.shift(),error:error?{}:null})})};}
 return{eq:()=>({eq:()=>({is:()=>({gt:()=>({order:()=>({limit:()=>({maybeSingle:async()=>({data:existing,error:error?{}:null})})})})})})})};},
 async insert(row){inserts.push(row);return{error:error?{}:null};}
};}};
const a={id:'new-id',hash:'a'.repeat(64),bucket:'b'.repeat(64),objectPath:'intake/new-id/specification.txt',now:1800000000000};
let result=await reserveResearchRevision(db,a);assert.equal(result.allowed,true);assert.equal(inserts.length,1);assert.equal(inserts[0].ip_hash,a.bucket);
counts=[20,20];result=await reserveResearchRevision(db,a);assert.equal(result.allowed,false);assert.equal(inserts.length,1);
counts=[1,60];result=await reserveResearchRevision(db,a);assert.equal(result.allowed,false);assert.equal(inserts.length,1);
counts=[null,1];await assert.rejects(()=>reserveResearchRevision(db,a));assert.equal(inserts.length,1);
existing={id:'existing-id',object_path:'intake/existing-id/specification.txt',expires_at:new Date(a.now+30000).toISOString()};
counts=[20,60];result=await reserveResearchRevision(db,a);assert.equal(result.allowed,true);assert.equal(result.id,'existing-id');assert.equal(result.expiresAt,a.now+30000);assert.equal(inserts.length,1);
error=true;await assert.rejects(()=>reserveResearchRevision(db,a));
console.log('PASS signed-revision reservation: existing upload reused before quota checks, per-order hourly/daily limits, fail closed on DB/count errors, no anonymous budget mutation. Mock only.');
