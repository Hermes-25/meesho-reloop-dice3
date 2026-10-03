import {emptyMarket,executeMarket,visibleMarket,upgradeSourcePricing} from './app-domain.mjs';
import {hash} from './shared-service.mjs';
import {demoRoles,demoCookie,demoProfile,demoSession,seedDemo,fixturePhotos} from './app-demo.mjs';
import {expandDemo} from './demo-expand.mjs';
import {upgradePersonas} from './demo-personas.mjs';
import {accountView,canBuy} from './partner-access.mjs';
const json=(body,status=200,headers={})=>Response.json(body,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...headers}});
const error=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const safeProfile=p=>({id:p.id,username:p.username,role:p.role,business:p.business,city:p.city,...(p.demo?{demo:true}:{})});
const uuid=/^[0-9a-f-]{36}$/i;
const secret=()=>crypto.randomUUID()+crypto.randomUUID();
const cookie=(token,age=604800)=>`reloop_auth=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
async function input(r,max=12000){if(Number(r.headers.get('Content-Length'))>max)error('Request too large.',413);const t=await r.text();if(t.length>max)error('Request too large.',413);try{return JSON.parse(t)}catch{error('Invalid request.')}}
const clean=(s,min,max)=>{if(typeof s!=='string'||s.trim().length<min||s.length>max)error('Please check the required account details.');return s.trim()};
async function derive(password,salt){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);const bits=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:100000,hash:'SHA-256'},key,256);return [...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,'0')).join('')}
function equal(a,b){let n=a.length^b.length;for(let i=0;i<Math.max(a.length,b.length);i++)n|=(a.charCodeAt(i)||0)^(b.charCodeAt(i)||0);return n===0}
export async function reserveVoiceQuota(db,request,profile,now=Date.now()){
 const ip=request.headers.get('X-ReLoop-Client-IP')||'unknown';
 // Reserve one worst-case 25s clip. Persistent counters work across Vercel
 // instances and demo resets; hard caps sit below Groq's published free tier.
 const budgets=[['person:'+profile.id,600000,8],['ip:'+ip,600000,16],['global-minute',60000,12],['global-hour',3600000,120],['global-day',86400000,600]];
 for(const [scope,window,limit] of budgets){
  const id='voice:'+await hash(scope+'|'+Math.floor(now/window));
  const row=await db.prepare('INSERT INTO app_limits(id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1 WHERE count < ? RETURNING count').bind(id,limit).first();
  if(!row)error('Voice search has reached its free usage limit. Please try later.',429);
 }
}
async function throttle(db,r,scope,limit){const interval=Math.floor(Date.now()/600000),key=await hash(`${scope}|${interval}|${r.headers.get('X-ReLoop-Client-IP')||r.headers.get('CF-Connecting-IP')||'unknown'}`);await db.prepare('INSERT INTO app_limits (id,count) VALUES (?,1) ON CONFLICT(id) DO UPDATE SET count=count+1').bind(key).run();const row=await db.prepare('SELECT count FROM app_limits WHERE id=?').bind(key).first();if(row.count>limit)error('Too many attempts. Please try again in ten minutes.',429)}
async function market(db,id='market'){await db.prepare('INSERT OR IGNORE INTO app_market (id,version,body) VALUES (?,1,?)').bind(id,JSON.stringify(emptyMarket())).run();const r=await db.prepare('SELECT version,body FROM app_market WHERE id=?').bind(id).first();return {version:r.version,world:JSON.parse(r.body)}}
async function signIn(db,p){const t=secret();await db.prepare('INSERT INTO app_sessions (id,user_id,expires_at) VALUES (?,?,?)').bind(await hash(t),p.id,Date.now()+604800000).run();return {token:t,me:safeProfile(p)}}
async function user(db,r){const token=r.headers.get('Cookie')?.match(/(?:^|;\s*)reloop_auth=([^;]+)/)?.[1];if(!token)return null;const s=await db.prepare('SELECT user_id FROM app_sessions WHERE id=? AND expires_at>?').bind(await hash(token),Date.now()).first();return s?db.prepare('SELECT * FROM app_profiles WHERE id=?').bind(s.user_id).first():null}
export async function applicationService(request,env){
 try{
  if(!env.APP_GATEWAY_SECRET||!equal(request.headers.get('X-ReLoop-Gateway')||'',env.APP_GATEWAY_SECRET))return json({error:'Use the ReLoop application to access this service.'},403);
  const db=env.DB;if(!db)return json({error:'Data storage is temporarily unavailable.'},503);
  const url=new URL(request.url),path=url.pathname.replace('/api/application',''),method=request.method;
  if(path==='/health')return json({ok:true,payments:'test',ml:'on-device',bharat:false});
  const demo=await demoSession(db,request);
  if(path==='/demo/start'&&method==='POST'){
   await throttle(db,request,'demo-start',15);const v=await input(request);if(!demoRoles.includes(v.role))error('Choose a demo view.');
   if(demo){await db.prepare('UPDATE app_demo_sessions SET role=? WHERE id=?').bind(v.role,demo.id).run();return json({ok:true})}
   const expired=await db.prepare('SELECT id,space_id FROM app_demo_sessions WHERE expires_at<? LIMIT 5').bind(Date.now()).all();
   for(const old of expired.results){const photos=await db.prepare('SELECT object_key FROM app_demo_photos WHERE space_id=?').bind(old.space_id).all();for(const photo of photos.results)await env.BUCKET?.delete(photo.object_key);await db.batch([db.prepare('DELETE FROM app_demo_photos WHERE space_id=?').bind(old.space_id),db.prepare('DELETE FROM app_market WHERE id=?').bind('demo:'+old.space_id),db.prepare('DELETE FROM app_demo_sessions WHERE id=?').bind(old.id)])}
   const capacity=await db.prepare('SELECT COUNT(*) AS n FROM app_demo_sessions').first();if(capacity.n>=200)error('Demo capacity is full for today. Your saved account is still available; please try the demo later.',429);
   const space=crypto.randomUUID(),token=secret();await db.batch([db.prepare('INSERT INTO app_market(id,version,body) VALUES (?,1,?)').bind('demo:'+space,JSON.stringify(seedDemo(space))),db.prepare('INSERT INTO app_demo_sessions(id,space_id,role,expires_at) VALUES (?,?,?,?)').bind(await hash(token),space,v.role,Date.now()+86400000)]);return json({ok:true},201,{'Set-Cookie':demoCookie(token)});
  }
  if(path==='/demo/role'&&method==='POST'){if(!demo)error('This demo expired. Open a fresh demo from the sign-in screen.',401);const v=await input(request);if(!demoRoles.includes(v.role))error('Choose a demo view.');await db.prepare('UPDATE app_demo_sessions SET role=? WHERE id=?').bind(v.role,demo.id).run();return json({ok:true})}
  if(path==='/demo/end'&&method==='POST'){return json({ok:true},200,{'Set-Cookie':demoCookie('',0)})}
  if(!demo&&request.headers.get('Cookie')?.match(/(?:^|;\s*)reloop_demo=[^;]/))return json({error:'Your demo has expired. Reopen a view from the sign-in screen.',demoExpired:true},401,{'Set-Cookie':demoCookie('',0)});
  if(path==='/signup'&&method==='POST'){
   await throttle(db,request,'signup',10);const v=await input(request),username=clean(v.username,3,32).toLowerCase();if(!/^[a-z0-9_.-]+$/.test(username))error('Use letters, numbers, underscores or dots in your username.');const password=clean(v.password,12,128);
   let role=v.role;if(!['seller','partner','buyer','supplier'].includes(role))error('Choose a seller or supply partner account.');
   const existing=await db.prepare('SELECT id FROM app_profiles WHERE username=?').bind(username).first();if(existing)error('That username is already taken.',409);
   const p={id:crypto.randomUUID(),username,role,business:clean(v.business,2,90),city:clean(v.city,2,60)},salt=secret(),recovery=secret();
   await db.prepare('INSERT INTO app_profiles (id,username,password_hash,salt,recovery_hash,role,business,city,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(p.id,p.username,await derive(password,salt),salt,await hash(recovery),p.role,p.business,p.city,Date.now()).run();const session=await signIn(db,p);return json({me:session.me,recoveryCode:recovery},201,{'Set-Cookie':cookie(session.token)});
  }
  if(path==='/login'&&method==='POST'){
   await throttle(db,request,'login',25);const v=await input(request),username=clean(v.username,3,32).toLowerCase(),password=clean(v.password,1,128);const p=await db.prepare('SELECT * FROM app_profiles WHERE username=?').bind(username).first();const check=await derive(password,p?.salt||'invalid-account-salt');if(!p||!equal(check,p.password_hash))error('Username or password is incorrect.',401);const session=await signIn(db,p);return json({me:session.me},200,{'Set-Cookie':cookie(session.token)});
  }
  if(path==='/recover'&&method==='POST'){
   await throttle(db,request,'recover',10);const v=await input(request),username=clean(v.username,3,32).toLowerCase(),password=clean(v.password,12,128),code=clean(v.recoveryCode,20,200);const p=await db.prepare('SELECT * FROM app_profiles WHERE username=?').bind(username).first();if(!p||!equal(await hash(code),p.recovery_hash))error('The username or recovery code is incorrect.',403);const salt=secret(),recovery=secret();await db.batch([db.prepare('UPDATE app_profiles SET password_hash=?,salt=?,recovery_hash=? WHERE id=?').bind(await derive(password,salt),salt,await hash(recovery),p.id),db.prepare('DELETE FROM app_sessions WHERE user_id=?').bind(p.id)]);return json({recoveryCode:recovery});
  }
  if(path==='/setup-operator'&&method==='POST'){
   const v=await input(request);if(!env.APP_SETUP_SECRET||!equal(v.setupKey||'',env.APP_SETUP_SECRET))error('Operator setup is not available.',403);if(await db.prepare("SELECT id FROM app_profiles WHERE role='ops'").first())error('An operator account already exists.',409);
   const salt=secret(),recovery=secret(),p={id:crypto.randomUUID(),username:clean(v.username,3,32).toLowerCase(),role:'ops',business:'ReLoop operations',city:'All cities'};
   await db.prepare('INSERT INTO app_profiles (id,username,password_hash,salt,recovery_hash,role,business,city,created_at) VALUES (?,?,?,?,?,?,?,?,?)').bind(p.id,p.username,await derive(clean(v.password,12,128),salt),salt,await hash(recovery),p.role,p.business,p.city,Date.now()).run();return json({me:safeProfile(p),recoveryCode:recovery},201);
  }
  const p=demo?demoProfile(demo):await user(db,request);if(!p)return json({error:'Please sign in to continue.'},401);const me=safeProfile(p),marketId=demo?'demo:'+demo.space_id:'market',photoTable=demo?'app_demo_photos':'app_photos';
  if(path==='/voice/authorize'&&method==='POST'){await reserveVoiceQuota(db,request,p);return json({ok:true})}
  if(path==='/logout'&&method==='POST'){const token=request.headers.get('Cookie')?.match(/reloop_auth=([^;]+)/)?.[1]||'';await db.prepare('DELETE FROM app_sessions WHERE id=?').bind(await hash(token)).run();return json({ok:true},200,{'Set-Cookie':cookie('',0)})}
  if(path==='/state'&&method==='GET'){let m=await market(db,marketId);let changed=false;if(demo){changed=expandDemo(m.world,demo.space_id);changed=upgradePersonas(m.world,demo.space_id)||changed;}changed=upgradeSourcePricing(m.world)||changed;if(changed){const updated=await db.prepare('UPDATE app_market SET version=version+1,body=? WHERE id=? AND version=? RETURNING version').bind(JSON.stringify(m.world),marketId,m.version).first();if(updated)m.version=updated.version;else m=await market(db,marketId)}return json({me:accountView(m.world,me),version:m.version,...visibleMarket(m.world,me)})}
  if(path==='/command'&&method==='POST'){
   await throttle(db,request,'action',150);const v=await input(request);if(!uuid.test(v.requestId||''))error('Missing request identifier.');const m=await market(db,marketId);
   if(demo&&m.world.personaVersion<3)error("Your workspace has been updated. Refresh and try again.",409);
   if(m.world.orders.some(o=>o.kind==='source'&&o.status==='awaiting_payment'&&!o.payment&&o.cost.pricingModel!=='source-supplier-4.5-v1'))error('Source pricing has changed. Refresh to review the updated amount before continuing.',409);
   if(!m.world.receipts.some(x=>x.id===v.requestId&&x.owner===p.id)&&v.version!==m.version)error('Another update arrived. Refresh and try your action again.',409);
   if(['stock.create','stock.update'].includes(v.command?.type))for(const id of v.command.photos||[]){if(!uuid.test(id))error('Invalid photo.');if(demo&&fixturePhotos.includes(id))continue;const photo=await db.prepare('SELECT owner FROM '+photoTable+' WHERE id=?').bind(id).first();if(!photo||photo.owner!==p.id)error('Only your uploaded photos can be attached.',403)}
   const next=executeMarket(m.world,me,v.command,v.requestId);if(next.replayed)return json({me:accountView(m.world,me),version:m.version,...visibleMarket(m.world,me),result:next.result});
   const body=JSON.stringify(next.world);if(body.length>3000000)error('The judging workspace is full. Contact the team.',429);
   const updated=await db.prepare('UPDATE app_market SET version=version+1,body=? WHERE id=? AND version=? RETURNING version').bind(body,marketId,m.version).first();if(!updated)error('Another update arrived. Refresh and try your action again.',409);
   return json({me:accountView(next.world,me),version:updated.version,...visibleMarket(next.world,me),result:next.result});
  }
  if(path==='/photos'&&method==='POST'){
   await throttle(db,request,'upload',60);if(!env.BUCKET)error('Photo storage is temporarily unavailable.',503);const count=await db.prepare('SELECT COUNT(*) AS n FROM '+photoTable+' WHERE owner=?').bind(p.id).first();if(count.n>=(demo?12:300))error('This workspace has reached its photo limit.',429);
   if(Number(request.headers.get('Content-Length')||0)>800000)error('Please use a smaller photo.',413);const bytes=await request.arrayBuffer(),b=new Uint8Array(bytes);if(b.length>800000||b.length<12||b[0]!==255||b[1]!==216)error('Upload a JPEG smaller than 800 KB.');
   const contentHash=[...new Uint8Array(await crypto.subtle.digest('SHA-256',bytes))].map(x=>x.toString(16).padStart(2,'0')).join('');const existing=await db.prepare('SELECT id FROM '+photoTable+' WHERE owner=? AND digest=?').bind(p.id,contentHash).first();if(existing)return json({id:existing.id,duplicate:true});
   const id=crypto.randomUUID(),key='application/'+p.id+'/'+id;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:'image/jpeg'}});try{if(demo)await db.prepare('INSERT INTO app_demo_photos (id,space_id,owner,object_key,digest,created_at) VALUES (?,?,?,?,?,?)').bind(id,demo.space_id,p.id,key,contentHash,Date.now()).run();else await db.prepare('INSERT INTO app_photos (id,owner,object_key,digest,created_at) VALUES (?,?,?,?,?)').bind(id,p.id,key,contentHash,Date.now()).run()}catch(e){await env.BUCKET.delete(key);throw e}return json({id},201);
  }
  if(path.startsWith('/photos/')&&method==='GET'){
   const id=path.slice(8);if(!uuid.test(id))error('Photo not found.',404);const photo=await db.prepare('SELECT * FROM '+photoTable+' WHERE id=?').bind(id).first();if(!photo||demo&&photo.space_id!==demo.space_id)error('Photo not found.',404);
   if(photo.owner!==p.id&&p.role!=='ops'){const m=await market(db,marketId);const published=canBuy(accountView(m.world,me))&&m.world.stocks.some(s=>s.photos.includes(id)&&s.status==='published');const history=m.world.orders.some(o=>(o.buyer===p.id||o.members.some(x=>x.owner===p.id))&&o.members.some(x=>x.photos.includes(id)));if(!published&&!history)error('Photo is private.',403)}
   const file=await env.BUCKET?.get(photo.object_key);if(!file)error('Photo is temporarily unavailable.',503);return new Response(file.body,{headers:{'Content-Type':'image/jpeg','Cache-Control':'private,max-age=300','X-Content-Type-Options':'nosniff'}});
  }
  return json({error:'This action was not found.'},404);
 }catch(e){return json({error:e.status?e.message:'Something went wrong. Please try again.'},e.status||500)}
}
