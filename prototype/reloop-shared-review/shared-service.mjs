const json=(data,status=200)=>Response.json(data,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const allowed=['scenario','qty','reserve','reason','consent','eligibility','stage','bid','sellable','resale','repair','slot','pickupBooked','orderAccepted','issue','decision','quote','rfqQty','rfqProduct','rfqDate','rfqCreated','quoteSent','sourceOrdered','held','dispatchPromise','sellerAccepted','sourceIssue','selectedQuote','selectedSupplier','selectedDispatch','sourceDispatched','sourceDelivered','sourceAccepted','sourceCompleted','poolExtended','decisionDraft','rfqCategory','rfqCity','rfqSpecs','dispatchFrom','dispatchTo','auctionPaused','poolSources'];
const numeric={qty:[1,200],reserve:[1,500],bid:[1,1000],sellable:[0,100],resale:[1,10000],repair:[0,10000],quote:[1,10000],rfqQty:[1,10000],selectedQuote:[1,10000]};
export async function hash(value){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value)))].map(x=>x.toString(16).padStart(2,'0')).join('')}
function cleanState(input){if(!input||Array.isArray(input)||typeof input!=='object')throw new Error('Invalid draft');const out={};for(const key of allowed){const v=input[key];if(v===undefined)continue;if(!['string','number','boolean'].includes(typeof v)||typeof v==='string'&&v.length>2000)throw new Error('Invalid field');if(numeric[key]&&(!Number.isFinite(v)||v<numeric[key][0]||v>numeric[key][1]))throw new Error('Check quantities and prices');if(['qty','rfqQty'].includes(key)&&!Number.isInteger(v))throw new Error('Use whole quantities');out[key]=v}return out}
async function body(request){const raw=await request.text();if(raw.length>30000)throw new Error('Draft too large');return JSON.parse(raw)}
async function snapshot(db,room){const p=await db.prepare('SELECT id, slot, mime, created_at FROM demo_photos WHERE room_id = ? ORDER BY created_at DESC, id DESC LIMIT 30').bind(room.id).all();const slots=new Set();const photos=p.results.filter(x=>{if(slots.has(x.slot))return false;slots.add(x.slot);return true});const e=await db.prepare('SELECT id, version, actor, state, created_at FROM demo_events WHERE room_id = ? ORDER BY version DESC LIMIT 30').bind(room.id).all();return {id:room.id,version:room.version,state:JSON.parse(room.state),photos,history:e.results.map(x=>({...x,state:JSON.parse(x.state)}))}}
export async function sharedService(request,env){
 const url=new URL(request.url),parts=url.pathname.split('/').filter(Boolean),db=env.DB;
 if(!db)return json({error:'Shared drafts are temporarily unavailable.'},503);
 if(!['GET','POST','PUT'].includes(request.method))return json({error:'Method not supported'},405);
 if(request.method!=='GET'&&request.headers.get('Origin')&&request.headers.get('Origin')!==url.origin)return json({error:'Use this site to save your draft.'},403);
 try{
  if(parts.length===2&&request.method==='POST'){
   const input=await body(request),state=cleanState(input.state),now=Date.now(),rateKey=await hash(new Date(now).toISOString().slice(0,10)+'|'+(request.headers.get('CF-Connecting-IP')||'local'));
   const recent=await db.prepare('SELECT COUNT(*) AS n FROM demo_rooms WHERE rate_key = ? AND created_at > ?').bind(rateKey,now-86400000).first();if(recent.n>=30)return json({error:'Daily demo limit reached. Reuse your existing session link.'},429);
   const id=crypto.randomUUID(),key=crypto.randomUUID()+crypto.randomUUID();await db.prepare('INSERT INTO demo_rooms (id,key_hash,state,version,created_at,updated_at,rate_key) VALUES (?,?,?,1,?,?,?)').bind(id,await hash(key),JSON.stringify(state),now,now,rateKey).run();
   return json({id,key,version:1,state,photos:[],history:[]},201);
  }
  const id=parts[2];if(!uuid.test(id||''))return json({error:'Session not found.'},404);
  const room=await db.prepare('SELECT * FROM demo_rooms WHERE id = ?').bind(id).first();if(!room)return json({error:'Session not found.'},404);
  const token=request.headers.get('Authorization')?.replace(/^Bearer /,'')||'',tokenHash=await hash(token),owner=tokenHash===room.key_hash;
  let capture=false;if(!owner){const c=await db.prepare('SELECT room_id, expires_at FROM demo_captures WHERE token_hash = ?').bind(tokenHash).first();capture=!!c&&c.room_id===id&&c.expires_at>Date.now()}
  if(!owner&&!capture)return json({error:'This link is invalid or expired. Open a new phone link from the original draft.'},403);
  if(parts.length===3&&request.method==='GET'){const snap=await snapshot(db,room);return json(owner?snap:{id,version:snap.version,photos:snap.photos,state:{qty:snap.state.qty,stage:snap.state.stage},captureOnly:true})}
  if(parts[3]==='photos'&&parts[4]&&request.method==='GET'){
   const photo=await db.prepare('SELECT object_key, mime FROM demo_photos WHERE id = ? AND room_id = ?').bind(parts[4],id).first();if(!photo)return json({error:'Photo not found.'},404);
   const object=await env.BUCKET?.get(photo.object_key);if(!object)return json({error:'Photo unavailable. Try again.'},503);return new Response(object.body,{headers:{'Content-Type':photo.mime,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff'}});
  }
  if(parts[3]==='photos'&&parts.length===4&&request.method==='POST'){
   if(!env.BUCKET)return json({error:'Photo storage is unavailable. Your file has not been uploaded.'},503);
   const slot=Number(url.searchParams.get('slot'));if(!Number.isInteger(slot)||slot<0||slot>2)return json({error:'Choose a photo slot.'},400);
   const state=JSON.parse(room.state);if(!['draft','pool','withdrawn'].includes(state.stage||'draft'))return json({error:'This lot is committed. Its evidence is locked.'},409);
   const count=await db.prepare('SELECT COUNT(*) AS n FROM demo_photos WHERE room_id = ?').bind(id).first();if(count.n>=30)return json({error:'This demo has reached its 30-photo limit.'},429);
   if(Number(request.headers.get('Content-Length')||0)>600000)return json({error:'Use a smaller photo.'},413);
   const bytes=await request.arrayBuffer(),b=new Uint8Array(bytes);if(b.length>600000||b.length<12)return json({error:'Use an image smaller than 600 KB.'},413);
   const mime=b[0]===255&&b[1]===216?'image/jpeg':b[0]===137&&b[1]===80&&b[2]===78&&b[3]===71?'image/png':String.fromCharCode(...b.slice(0,4))==='RIFF'&&String.fromCharCode(...b.slice(8,12))==='WEBP'?'image/webp':null;if(!mime)return json({error:'Choose a JPG, PNG or WebP photo.'},415);
   const photoId=crypto.randomUUID(),key='demo/'+id+'/'+photoId;await env.BUCKET.put(key,bytes,{httpMetadata:{contentType:mime}});
   try{await db.prepare('INSERT INTO demo_photos (id,room_id,slot,object_key,mime,created_at) VALUES (?,?,?,?,?,?)').bind(photoId,id,slot,key,mime,Date.now()).run()}catch(e){await env.BUCKET.delete(key);throw e}
   return json({id:photoId,slot,uploaded:true},201);
  }
  if(!owner)return json({error:'This phone link only allows photo capture.'},403);
  if(parts[3]==='handoff'&&request.method==='POST'){const key=crypto.randomUUID()+crypto.randomUUID(),expires=Date.now()+15*60000;await db.prepare('INSERT INTO demo_captures (token_hash,room_id,expires_at) VALUES (?,?,?)').bind(await hash(key),id,expires).run();return json({key,expires},201)}
  if(parts.length===3&&request.method==='PUT'){
   const input=await body(request);if(input.version!==room.version)return json({error:'Another device saved a newer version. Reload the shared version before saving your changes.',conflict:true},409);
   const state=cleanState(input.state),previous=JSON.parse(room.state);
   if(previous.stage&&['bid','won','paid','hub','review','dispatch','delivered','settled','cancelled'].includes(previous.stage)&&['qty','reserve','reason','eligibility','poolSources'].some(k=>state[k]!==previous[k]))return json({error:'Committed stock details are locked. Start a separate demo for new stock.'},409);
   if(previous.sourceOrdered&&['rfqQty','rfqProduct','rfqDate','rfqCity','quote','selectedQuote','selectedSupplier','dispatchFrom','dispatchTo'].some(k=>state[k]!==previous[k]))return json({error:'The agreed Source order is locked.'},409);
   if(state.rfqCreated&&(!state.rfqProduct?.trim()||!state.rfqDate||!state.rfqCity?.trim()))return json({error:'Complete product, quantity, location and required date.'},400);
   if(state.quoteSent&&(!state.dispatchFrom||!state.dispatchTo||state.dispatchFrom>state.dispatchTo))return json({error:'Choose a valid earliest and latest dispatch date.'},400);
   const now=Date.now(),changed=['stage','decision','rfqCreated','quoteSent','sourceOrdered','held','orderAccepted','sellerAccepted','sourceDispatched','auctionPaused'].some(k=>previous[k]!==state[k]);
   const updateStatement=db.prepare('UPDATE demo_rooms SET state = ?, version = version + 1, updated_at = ? WHERE id = ? AND version = ?').bind(JSON.stringify(state),now,id,input.version);
   const results=changed?await db.batch([updateStatement,db.prepare('INSERT INTO demo_events (id,room_id,version,actor,state,created_at) SELECT ?,?,?,?,?,? WHERE changes() = 1').bind(crypto.randomUUID(),id,input.version+1,['seller','buyer','supplier','ops'].includes(input.actor)?input.actor:'reviewer',JSON.stringify(state),now)]):[await updateStatement.run()];
   if((results[0].meta?.changes??results[0].changes)!==1)return json({error:'Another device saved first. Reload the shared version.',conflict:true},409);
   return json({saved:true,version:input.version+1});
  }
  return json({error:'Not found.'},404);
 }catch(e){console.error('Shared demo service',e.message);const invalid=e instanceof SyntaxError||/Invalid|large|quantities|whole/.test(e.message);return json({error:invalid?'Check your draft: '+e.message:'Could not save right now. Your draft is kept; please retry.'},invalid?400:503)}
}
