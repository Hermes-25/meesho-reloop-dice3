import {Readable} from 'node:stream';
import {handleVoice} from '../server/voice.mjs';
export const config={maxDuration:30};
export default async function handler(req,res){
 const base=process.env.RELOOP_API_ORIGIN,secret=process.env.RELOOP_GATEWAY_SECRET;
 res.setHeader('Cache-Control','no-store');
 if(!base||!secret)return res.status(503).json({error:'The application is not connected yet.'});
 const host=req.headers['x-forwarded-host']||req.headers.host;
 if(req.method!=='GET'&&req.headers.origin&&req.headers.origin!==`https://${host}`&&req.headers.origin!==`http://${host}`)return res.status(403).json({error:'Use this application to submit your request.'});
 const requestUrl=new URL(req.url,'https://'+host); const route=requestUrl.searchParams.get('route'); const pathname=route?'/api/'+route:requestUrl.pathname;
 if(!/^\/api\/(health|signup|login|recover|setup-operator|logout|state|command|voice|demo\/(?:start|role|end)|photos(?:\/[a-f0-9-]+)?)$/.test(pathname))return res.status(404).json({error:'Route not found.'});
 const headers={'X-ReLoop-Gateway':secret,'X-ReLoop-Client-IP':req.headers['x-vercel-forwarded-for']||req.headers['x-forwarded-for']||'unknown'};
 if(req.headers.cookie)headers.Cookie=req.headers.cookie;
 if(req.headers['content-type'])headers['Content-Type']=req.headers['content-type'];
 if(pathname==='/api/voice')return handleVoice(req,res,{base,headers});
 try{
  let body;if(!['GET','HEAD'].includes(req.method)){if(req.body!==undefined){body=Buffer.isBuffer(req.body)?req.body:Buffer.from(typeof req.body==='string'?req.body:JSON.stringify(req.body));if(body.length>850000)return res.status(413).json({error:'Please use a smaller upload.'})}else{const pieces=[];let n=0;for await(const c of req){n+=c.length;if(n>850000)return res.status(413).json({error:'Please use a smaller upload.'});pieces.push(c)}body=Buffer.concat(pieces)}}
  const r=await fetch(base+'/api/application'+pathname.slice(4),{method:req.method,headers,body,signal:AbortSignal.timeout(25000)});
  res.statusCode=r.status;for(const k of ['content-type','x-content-type-options'])if(r.headers.get(k))res.setHeader(k,r.headers.get(k));
  // Set-Cookie cannot be comma-joined: an upstream CDN cookie's Domain would
  // invalidate our host-only session. Forward only app cookies, individually.
  const cookies=r.headers.getSetCookie().filter(cookie=>/^reloop_(?:auth|demo)=/.test(cookie));
  if(cookies.length)res.setHeader('Set-Cookie',cookies);
  if(r.body)Readable.fromWeb(r.body).pipe(res);else res.end();
 }catch{res.status(503).json({error:'Connection interrupted. Your saved records are safe; please retry.'})}
}
