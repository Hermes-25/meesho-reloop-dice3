import test from 'node:test';
import assert from 'node:assert/strict';
import {encodeVoiceWav,silenceState} from '../src/voice-audio.mjs';
import {checkVoiceWav,handleVoice} from '../server/voice.mjs';
import gateway from '../api/gateway.js';
const tone=(seconds=1)=>Float32Array.from({length:seconds*16000},(_,i)=>.1*Math.sin(i/20));
const wav=async(seconds=1)=>Buffer.from(await encodeVoiceWav(tone(seconds)).arrayBuffer());
function reply(){return {headers:{},setHeader(k,v){this.headers[k]=v},status(n){this.code=n;return this},json(d){this.data=d;return this}}}
function key(t){const before=process.env.GROQ_API_KEY;process.env.GROQ_API_KEY='test-only-speech-key';t.after(()=>{if(before===undefined)delete process.env.GROQ_API_KEY;else process.env.GROQ_API_KEY=before})}
const context={base:'https://backend.example',headers:{Cookie:'reloop_demo=test','X-ReLoop-Gateway':'test-gateway','Content-Type':'audio/wav'}};
const request=async()=>({method:'POST',headers:{cookie:'reloop_demo=test','content-type':'audio/wav'},body:await wav()});

test('speech audio is valid 16 kHz mono PCM; duration, silence and forged headers are rejected',async()=>{
 const b=await wav();assert.equal(checkVoiceWav(b).length,32044);
 assert.equal((await wav(30)).length,800044);
 assert.throws(()=>encodeVoiceWav(new Float32Array(16000)),/hear/);
 for(const length of [0,20,44,800046])assert.throws(()=>checkVoiceWav(Buffer.alloc(length)));
 const forged=Buffer.from(b);forged.writeUInt32LE(8000,24);assert.throws(()=>checkVoiceWav(forged));
 const silent=Buffer.from(b);silent.fill(0,44);assert.throws(()=>checkVoiceWav(silent),/hear/);
});
test('silence detection waits for sustained speech and does not cut off short pauses',()=>{
 let s={frames:0,heard:false,last:0};s=silenceState(s,.04,100);s=silenceState(s,.04,200);s=silenceState(s,.04,300);
 assert.equal(s.heard,true);s=silenceState(s,0,1500);assert.equal(s.stop,false);s=silenceState(s,0,2300);assert.equal(s.stop,true);
 assert.equal(silenceState({frames:0,heard:false,last:0},0,10000).quiet,true);
});
test('hosted voice authenticates and reserves a quota before sending audio; secrets remain server-side',async t=>{
 key(t);const calls=[];t.mock.method(globalThis,'fetch',async(url,options)=>{calls.push({url,options});return calls.length===1?Response.json({ok:true}):Response.json({text:'मुझे जयपुर में स्कूल बैग चाहिए।',segments:[{no_speech_prob:.01,avg_logprob:-.2}]})});
 const res=reply();await handleVoice(await request(),res,context);assert.equal(res.code,200);assert.match(res.data.text,/जयपुर/);assert.equal(res.headers['Cache-Control'],'no-store');
 assert.equal(calls[0].url,'https://backend.example/api/application/voice/authorize');assert.equal(calls[0].options.headers.Authorization,undefined);
 assert.equal(calls[1].url,'https://api.groq.com/openai/v1/audio/transcriptions');assert.equal(calls[1].options.headers.Cookie,undefined);assert.equal(calls[1].options.headers['X-ReLoop-Gateway'],undefined);
 assert.equal(calls[1].options.body.get('model'),'whisper-large-v3');assert.equal(calls[1].options.body.get('language'),null);assert.equal(calls[1].options.body.get('file').name,'search.wav');
 assert.ok(!JSON.stringify(res.data).includes('key'));
});
test('unauthenticated, invalid and quota-exceeded requests never call speech inference',async t=>{
 key(t);let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return Response.json({error:'limit'},{status:429})});
 const req=await request(),a=reply();await handleVoice({...req,headers:{'content-type':'audio/wav'}},a,context);assert.equal(a.code,401);assert.equal(calls,0);
 const b=reply();await handleVoice({...req,body:Buffer.alloc(2)},b,context);assert.equal(b.code,400);assert.equal(calls,0);
 const c=reply();await handleVoice(req,c,context);assert.equal(c.code,429);assert.equal(calls,1);
});
test('provider errors are sanitized and never fall through to a paid alternative',async t=>{
 key(t);let calls=0;t.mock.method(globalThis,'fetch',async()=>{calls++;return calls===1?Response.json({ok:true}):Response.json({error:'private-provider-detail'},{status:429})});
 const res=reply();await handleVoice(await request(),res,context);assert.equal(res.code,429);assert.equal(calls,2);assert.ok(!JSON.stringify(res.data).includes('private-provider'));
});
test('gateway rejects cross-origin audio before the provider and keeps authorization endpoint private',async t=>{
 const values=['RELOOP_API_ORIGIN','RELOOP_GATEWAY_SECRET'].map(k=>[k,process.env[k]]);process.env.RELOOP_API_ORIGIN='https://backend.example';process.env.RELOOP_GATEWAY_SECRET='test';t.after(()=>{for(const[k,v]of values)if(v===undefined)delete process.env[k];else process.env[k]=v});
 t.mock.method(globalThis,'fetch',()=>assert.fail('must not reach backend'));
 const a=reply();await gateway({method:'POST',url:'/api/voice',headers:{host:'app.example',origin:'https://other.example'}},a);assert.equal(a.code,403);
 const b=reply();await gateway({method:'POST',url:'/api/voice/authorize',headers:{host:'app.example',origin:'https://app.example'}},b);assert.equal(b.code,404);
});
