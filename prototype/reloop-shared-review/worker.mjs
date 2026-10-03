import {sharedService} from './shared-service.mjs';
import {applicationService} from './application-service.mjs';
const screenIds=new Set(['S1','S2','S3','S4','S5','B1','B2','B3','B4','O1','O2','F1','F2','F3','A1']);
const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const database=env=>{if(!env.DB)throw new Error('Comment storage unavailable');return env.DB};
async function digest(value){const bytes=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));return [...new Uint8Array(bytes)].map(b=>b.toString(16).padStart(2,'0')).join('')}
export default {async fetch(request,env){
 const url=new URL(request.url);
 if(url.pathname.startsWith('/api/application'))return applicationService(request,env);
 if(url.pathname.startsWith('/api/rooms'))return sharedService(request,env);
 if(url.pathname!=='/api/comments')return env.ASSETS?env.ASSETS.fetch(request):new Response('Not found',{status:404});
 try{
  const db=database(env);
  if(request.method==='GET'){
   const screen=url.searchParams.get('screen');
   if(screen&&!screenIds.has(screen))return json({error:'Choose a valid screen.'},400);
   // Limit conversations, not individual messages: never separate a reply from its root.
   const sql=`WITH roots AS (SELECT id FROM review_comments WHERE parent_id IS NULL ${screen?'AND screen = ?':''} ORDER BY created_at DESC, id DESC LIMIT 200)
    SELECT id, screen, name, body, context, created_at, parent_id, thread_id FROM review_comments
    WHERE id IN (SELECT id FROM roots) OR thread_id IN (SELECT id FROM roots) ORDER BY created_at ASC, id ASC`;
   const query=screen?db.prepare(sql).bind(screen):db.prepare(sql);
   const {results}=await query.all();return json({comments:results||[]});
  }
  if(request.method!=='POST')return json({error:'Method not supported.'},405);
  const origin=request.headers.get('Origin');
  if(origin&&origin!==url.origin)return json({error:'Post comments from this review page.'},403);
  if(!request.headers.get('Content-Type')?.includes('application/json'))return json({error:'Send a JSON comment.'},415);
  if(Number(request.headers.get('Content-Length')||0)>12000)return json({error:'This comment is too long.'},413);
  const raw=await request.text();if(raw.length>6000)return json({error:'This comment is too long.'},413);
  let data;try{data=JSON.parse(raw)}catch{return json({error:'Comment could not be read.'},400)}
  if(!data||typeof data!=='object')return json({error:'Add a comment.'},400);
  const {id,screen}=data,name=typeof data.name==='string'?data.name.trim():'',body=typeof data.body==='string'?data.body.trim():'';
  const context=typeof data.context==='string'?data.context.slice(0,100):'';
  const parentId=data.parentId??null;
  if(parentId!==null&&(typeof parentId!=='string'||!/^[a-f0-9-]{36}$/i.test(parentId)))return json({error:'Choose a valid comment to reply to.'},400);
  if(!/^[a-f0-9-]{36}$/i.test(id||'')||!screenIds.has(screen)||!name||name.length>50||!body||body.length>2000)return json({error:'Add your first name (up to 50 characters) and a comment (up to 2,000 characters).'},400);
  const existing=await db.prepare('SELECT id, screen, name, body, parent_id FROM review_comments WHERE id = ?').bind(id).first();
  if(existing){
   if(existing.screen!==screen||existing.name!==name||existing.body!==body||existing.parent_id!==parentId)return json({error:'This draft was already posted with different text. Refresh to check it before starting a new reply.'},409);
   return json({id:existing.id,posted:true});
  }
  let threadId=null;
  if(parentId){
   const parent=await db.prepare('SELECT id, screen, thread_id FROM review_comments WHERE id = ?').bind(parentId).first();
   if(!parent)return json({error:'That comment could not be found. Refresh and choose a comment again. Your draft is kept.'},404);
   if(parent.screen!==screen)return json({error:'Replies must stay on the original comment’s screen.'},400);
   threadId=parent.thread_id||parent.id;
  }
  const now=Date.now(),rateKey=await digest(new Date(now).toISOString().slice(0,10)+'|'+(request.headers.get('CF-Connecting-IP')||'local'));
  const recent=await db.prepare('SELECT COUNT(*) AS count FROM review_comments WHERE rate_key = ? AND created_at > ?').bind(rateKey,now-60000).first();
  if(Number(recent?.count)>=8)return json({error:'Please wait a minute before posting more comments. Your draft is kept.'},429);
  await db.prepare('INSERT INTO review_comments (id, screen, name, body, context, created_at, rate_key, parent_id, thread_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO NOTHING').bind(id,screen,name,body,context,now,rateKey,parentId,threadId).run();
  return json({id,posted:true},201);
 }catch(error){console.error('Comment service failed',error?.message);return json({error:'Comments are temporarily unavailable. Your draft is kept; please try again.'},503)}
}};
