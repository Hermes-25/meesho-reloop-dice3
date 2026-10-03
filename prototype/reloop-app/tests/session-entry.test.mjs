import test from 'node:test';
import assert from 'node:assert/strict';
import {Writable} from 'node:stream';
import {once} from 'node:events';
import handler from '../api/gateway.js';
import {api,readWorkspace} from '../src/api-client.mjs';

class Reply extends Writable{
 headers={};chunks=[];
 setHeader(key,value){this.headers[key.toLowerCase()]=value}
 _write(chunk,encoding,done){this.chunks.push(chunk);done()}
 status(code){this.statusCode=code;return this}
 json(value){this.end(JSON.stringify(value));return this}
}

test('gateway keeps app session cookies separate and excludes upstream domain cookies',async t=>{
 const previous={origin:process.env.RELOOP_API_ORIGIN,secret:process.env.RELOOP_GATEWAY_SECRET};
 process.env.RELOOP_API_ORIGIN='https://backend.example';process.env.RELOOP_GATEWAY_SECRET='test-only';
 t.after(()=>{for(const [key,value] of [['RELOOP_API_ORIGIN',previous.origin],['RELOOP_GATEWAY_SECRET',previous.secret]])if(value===undefined)delete process.env[key];else process.env[key]=value});
 const session='reloop_demo=test-session; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400';
 const clearAuth='reloop_auth=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0';
 const cdn='__cf_bm=upstream-only; Domain=chatgpt.site; Expires=Sun, 27 Sep 2026 02:30:45 GMT; Secure';
 const h=new Headers({'Content-Type':'application/json'});
 for(const cookie of [session,cdn,clearAuth])h.append('Set-Cookie',cookie);
 let forwarded;
 t.mock.method(globalThis,'fetch',async(url,options)=>{forwarded=options;return new Response('{"ok":true}',{status:201,headers:h})});
 const req={method:'POST',url:'/api/gateway?route=demo/start',headers:{host:'app.example',origin:'https://app.example','content-type':'application/json',cookie:'reloop_auth=existing-session'},body:{role:'seller'}};
 const res=new Reply(),done=once(res,'finish');await handler(req,res);await done;
 assert.equal(res.statusCode,201);
 assert.deepEqual(res.headers['set-cookie'],[session,clearAuth]);
 assert.equal(res.headers['cache-control'],'no-store');
 assert.equal(forwarded.headers.Cookie,'reloop_auth=existing-session');
 assert.deepEqual(JSON.parse(Buffer.concat(res.chunks)),{ok:true});
});

test('entry does not succeed when the browser fails to retain the session',async()=>{
 await assert.rejects(readWorkspace(async()=>{throw Object.assign(new Error('Sign in required'),{status:401})}),/could not keep you signed in/);
 const workspace={me:{role:'seller'},version:1};
 assert.equal(await readWorkspace(async path=>{assert.equal(path,'state');return workspace}),workspace);
 const unavailable=new Error('Service unavailable');
 await assert.rejects(readWorkspace(async()=>{throw unavailable}),e=>e===unavailable);
});

test('API keeps same-origin credentials and reports a bounded timeout',async t=>{
 let request;
 t.mock.method(globalThis,'fetch',async(url,options)=>{request=options;return Response.json({ok:true})});
 assert.deepEqual(await api('demo/start',{role:'seller'}),{ok:true});
 assert.equal(request.credentials,'same-origin');assert.ok(request.signal instanceof AbortSignal);
 t.mock.timers.enable({apis:['setTimeout']});
 t.mock.method(globalThis,'fetch',async(url,options)=>new Promise((resolve,reject)=>options.signal.addEventListener('abort',()=>reject(new DOMException('Aborted','AbortError')),{once:true})));
 const pending=api('state');const check=assert.rejects(pending,/connection took too long/);
 t.mock.timers.tick(35000);await check;
});
