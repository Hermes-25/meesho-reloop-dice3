import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import {applicationService,reserveVoiceQuota} from '../application-service.mjs';
function setup(){const db=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+f,'utf8'));const binding={async batch(st){return Promise.all(st.map(x=>x.run()))},prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return db.prepare(sql).get(...values)},async all(){return{results:db.prepare(sql).all(...values)}},async run(){return db.prepare(sql).run(...values)}}}};return{db,binding}}
test('voice quota requires a valid session and leaves markets, photos and review comments unchanged',async()=>{
 const{db,binding}=setup(),env={DB:binding,APP_GATEWAY_SECRET:'test'};
 db.exec("INSERT INTO review_comments(id,screen,name,body,context,created_at,rate_key) VALUES ('preserved','S1','Reviewer','Keep this comment','{}',1,'x')");
 const call=(path,cookie='',gateway='test')=>applicationService(new Request('https://test/api/application/'+path,{method:'POST',headers:{'X-ReLoop-Gateway':gateway,Cookie:cookie,'X-ReLoop-Client-IP':'test-device'},body:path==='demo/start'?JSON.stringify({role:'buyer'}):'{}'}),env);
 assert.equal((await call('voice/authorize')).status,401);assert.equal((await call('voice/authorize','','wrong')).status,403);assert.equal(db.prepare('SELECT COUNT(*) AS n FROM app_limits').get().n,0);
 const demo=await call('demo/start'),cookie=demo.headers.get('set-cookie').split(';')[0];const before=db.prepare('SELECT body FROM app_market').get().body;
 assert.equal((await call('voice/authorize',cookie)).status,200);assert.equal(db.prepare('SELECT body FROM app_market').get().body,before);assert.equal(db.prepare("SELECT body FROM review_comments WHERE id='preserved'").get().body,'Keep this comment');assert.equal(db.prepare('SELECT COUNT(*) AS n FROM app_demo_photos').get().n,0);
 db.exec('UPDATE app_demo_sessions SET expires_at=0');assert.equal((await call('voice/authorize',cookie)).status,401);db.close();
});
test('durable per-user quotas survive separate calls; global cap applies across distinct people and IPs',async()=>{
 const{db,binding}=setup(),now=1700000000000,req=ip=>new Request('https://test',{headers:{'X-ReLoop-Client-IP':ip}});
 for(let i=0;i<8;i++)await reserveVoiceQuota(binding,req('device'),{id:'a'},now);
 await assert.rejects(reserveVoiceQuota(binding,req('other'),{id:'a'},now),e=>e.status===429);
 for(let i=0;i<4;i++)await reserveVoiceQuota(binding,req('other'+i),{id:'b'+i},now);
 await assert.rejects(reserveVoiceQuota(binding,req('fresh'),{id:'fresh'},now),e=>e.status===429);
 // A new minute allows traffic while the old ten-minute user cap persists.
 await reserveVoiceQuota(binding,req('fresh2'),{id:'fresh2'},now+60000);
 await assert.rejects(reserveVoiceQuota(binding,req('device'),{id:'a'},now+60000),e=>e.status===429);
 db.close();
});
