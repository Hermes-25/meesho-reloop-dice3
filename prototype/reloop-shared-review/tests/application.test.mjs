import test from 'node:test';
import assert from 'node:assert/strict';
import {DatabaseSync} from 'node:sqlite';
import {readFileSync,readdirSync} from 'node:fs';
import worker from '../worker.mjs';
import {emptyMarket,executeMarket,visibleMarket} from '../app-domain.mjs';
const users={s1:{id:'seller1',role:'seller'},s2:{id:'seller2',role:'seller'},b:{id:'buyer',role:'buyer'},op:{id:'ops',role:'ops'},sp:{id:'supplier',role:'supplier',supplyProfile:{categories:['Bags'],states:['Rajasthan'],capacity:10000}}};
const listing=(qty)=>({type:'stock.create',title:'Tan bags',description:'Identical tan crossbody bags with scuff marks.',category:'Bags',condition:'Minor visible wear',city:'Jaipur',qty,reserve:8000,moq:100,photos:[crypto.randomUUID(),crypto.randomUUID(),crypto.randomUUID()],ownership:true,noOpenClaim:true});

test('pooled disclosures remain visible and inspection rejection releases reviewed drafts without losing history',()=>{
 let w=emptyMarket();const run=(u,c,id=crypto.randomUUID())=>{const r=executeMarket(w,u,c,id);w=r.world;return r.result};
 const a=run(users.s1,listing(50)).id,b=run(users.s2,{...listing(50),description:'Broken zip on five units; all other units have scuff marks.'}).id;
 run(users.s1,{type:'stock.publish',id:a});run(users.s2,{type:'stock.publish',id:b});const lot=w.lots[0].id;
 const publicLot=visibleMarket(w,users.b).lots[0];assert.match(publicLot.members[1].description,/Broken zip/);assert.equal(publicLot.members.flatMap(m=>m.photos).length,6);
 run(users.b,{type:'bid.place',id:lot,price:9000});const order=run(users.op,{type:'auction.close',id:lot}).id;run(users.b,{type:'order.pay',id:order});
 const date=new Date(Date.now()+86400000).toISOString().slice(0,10);for(const u of [users.s1,users.s2])run(u,{type:'pickup.book',id:order,date,window:'2 PM - 5 PM'});
 run(users.op,{type:'inspection.submit',id:order,accepted:[{stockId:a,qty:50},{stockId:b,qty:45}],note:'Five units excluded because of broken zips.'});
 const cancellation=crypto.randomUUID();run(users.b,{type:'order.cancel',id:order},cancellation);run(users.b,{type:'order.cancel',id:order},cancellation);
 assert.equal(w.orders[0].refund,w.orders[0].payment.amount);assert.equal(w.events.filter(e=>e.id===cancellation).length,1);assert.equal(w.lots[0].status,'cancelled');assert.equal(w.stocks[1].status,'draft');
 assert.throws(()=>run(users.s2,{type:'stock.publish',id:b}),/Review and save/);
 run(users.s2,{...w.stocks[1],type:'stock.update',qty:45,description:'Reviewed after inspection. Five broken-zip units removed.',ownership:true,noOpenClaim:true});const newLot=run(users.s2,{type:'stock.publish',id:b}).id;
 assert.notEqual(newLot,lot);assert.equal(w.orders[0].members[1].qty,50);assert.match(w.orders[0].members[1].description,/Broken zip/);assert.equal(w.orders[0].status,'cancelled');
});

test('cancelling an unpaid Source order reopens its request and retains cancelled history',()=>{
 let w=emptyMarket();const run=(u,c)=>{const r=executeMarket(w,u,c,crypto.randomUUID());w=r.world;return r.result};const later=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
 const request=run(users.s1,{type:'rfq.create',title:'Canvas totes',description:'Heavy cotton canvas shopping totes.',category:'Bags',city:'Jaipur',qty:120,neededBy:later(10)}).id;
 run(users.sp,{type:'quote.submit',id:request,price:11800,dispatchFrom:later(2),dispatchTo:later(3),terms:[]});const quote=w.rfqs[0].quotes[0].id;
 const old=run(users.s1,{type:'quote.accept',id:request,quoteId:quote,revision:1}).id;run(users.s1,{type:'order.cancel',id:old});assert.equal(w.rfqs[0].status,'open');assert.equal(w.orders[0].refund,0);
 const next=run(users.s1,{type:'quote.accept',id:request,quoteId:quote,revision:1}).id;assert.notEqual(old,next);assert.equal(w.orders[0].status,'cancelled');assert.equal(w.orders.length,2);
});
test('independent parties complete a pooled recovery with explicit acceptance, issue hold and exact settlement',()=>{
 let w=emptyMarket();const run=(u,c)=>{const r=executeMarket(w,u,c,crypto.randomUUID());w=r.world;return r.result};
 const a=run(users.s1,listing(24)).id,b=run(users.s2,listing(76)).id;
 run(users.s1,{type:'stock.publish',id:a});assert.equal(w.lots[0].status,'forming');assert.throws(()=>run(users.b,{type:'bid.place',id:w.lots[0].id,price:9000}),/not available/);
 run(users.s2,{type:'stock.publish',id:b});const lot=w.lots[0];assert.equal(lot.members.length,2);assert.equal(lot.status,'open');
 assert.throws(()=>run(users.s1,{type:'bid.place',id:lot.id,price:9000}),/cannot perform/);
 assert.throws(()=>run(users.b,{type:'bid.place',id:lot.id,price:7000}),/minimum/);
 run(users.b,{type:'bid.place',id:lot.id,price:9000});assert.throws(()=>run(users.s1,{type:'stock.withdraw',id:a}),/locked/);
 const oid=run(users.op,{type:'auction.close',id:lot.id}).id;
 assert.throws(()=>run(users.s1,{type:'order.pay',id:oid}),/cannot be paid/);run(users.b,{type:'order.pay',id:oid});
 assert.throws(()=>run(users.op,{type:'inspection.submit',id:oid,accepted:[],note:'Stock checked'}),/book pickup/);
 const date=new Date(Date.now()+86400000).toISOString().slice(0,10);for(const u of [users.s1,users.s2])run(u,{type:'pickup.book',id:oid,date,window:'2 PM – 5 PM'});
 run(users.op,{type:'inspection.submit',id:oid,accepted:[{stockId:a,qty:22},{stockId:b,qty:70}],note:'Eight units excluded after physical inspection.'});
 run(users.b,{type:'inspection.accept',id:oid});run(users.s1,{type:'inspection.accept',id:oid});assert.equal(w.orders[0].status,'review');assert.throws(()=>run(users.op,{type:'order.dispatch',id:oid,tracking:'test-123'}),/accept/);
 run(users.s2,{type:'inspection.accept',id:oid});assert.equal(w.orders[0].status,'ready_dispatch');assert.equal(w.orders[0].qty,92);
 run(users.op,{type:'order.dispatch',id:oid,tracking:'test-123'});run(users.b,{type:'order.receive',id:oid});run(users.b,{type:'order.issue',id:oid,note:'Package count needs a second check.'});assert.throws(()=>run(users.op,{type:'order.settle',id:oid}),/resolve/);
 run(users.op,{type:'order.resolve',id:oid,note:'Buyer confirmed the corrected package count.'});run(users.op,{type:'order.settle',id:oid});assert.equal(w.orders[0].status,'settled');assert.deepEqual(w.orders[0].settlements.map(x=>x.amount),[198000,630000]);
 assert.equal(visibleMarket(w,users.sp).orders.length,0);assert.equal(visibleMarket(w,users.s1).orders.length,1);
});
test('Source quote is locked on acceptance; supplier dispatch and buyer receipt are permission checked',()=>{
 let w=emptyMarket();const run=(u,c,id=crypto.randomUUID())=>{const r=executeMarket(w,u,c,id);w=r.world;return r.result};const later=n=>new Date(Date.now()+n*86400000).toISOString().slice(0,10);
 const id=run(users.s1,{type:'rfq.create',title:'Canvas totes',description:'Heavy cotton canvas shopping totes.',category:'Bags',city:'Jaipur',qty:120,neededBy:later(10)}).id;
 assert.throws(()=>run(users.b,{type:'quote.submit',id,price:11800,dispatchFrom:later(2),dispatchTo:later(3),terms:[]}),/cannot perform/);
 run(users.sp,{type:'quote.submit',id,price:11800,dispatchFrom:later(2),dispatchTo:later(3),terms:[]});const quote=w.rfqs[0].quotes[0].id,request=crypto.randomUUID();const o=run(users.s1,{type:'quote.accept',id,quoteId:quote,revision:1},request).id;
 assert.equal(run(users.s1,{type:'quote.accept',id,quoteId:quote,revision:1},request).id,o);assert.equal(w.orders.length,1);assert.equal(w.orders[0].cost.goods,1416000);
 run(users.s1,{type:'order.pay',id:o});run(users.sp,{type:'order.dispatch',id:o,tracking:'test-source-1'});assert.throws(()=>run(users.sp,{type:'order.receive',id:o}),/Only the buyer/);run(users.s1,{type:'order.receive',id:o});
});
function binding(db){return {async batch(st){db.exec('BEGIN');try{const r=[];for(const s of st)r.push(await s.run());db.exec('COMMIT');return r}catch(e){db.exec('ROLLBACK');throw e}},prepare(sql){let values=[];return{bind(...v){values=v;return this},async first(){return db.prepare(sql).get(...values)},async all(){return {results:db.prepare(sql).all(...values)}},async run(){return db.prepare(sql).run(...values)}}}}}
test('accounts, private photos and optimistic concurrency work without altering review comments',async()=>{
 const db=new DatabaseSync(':memory:');for(const f of readdirSync('drizzle').filter(x=>x.endsWith('.sql')).sort())db.exec(readFileSync('drizzle/'+f,'utf8'));
 db.exec("INSERT INTO review_comments(id,screen,name,body,context,created_at,rate_key) VALUES ('original','S1','Existing reviewer','Keep this comment','{}',1,'x')");
 const objects=new Map(),env={DB:binding(db),APP_GATEWAY_SECRET:'test-gateway',BUCKET:{async put(k,b){objects.set(k,b)},async get(k){return objects.has(k)?{body:objects.get(k)}:null},async delete(k){objects.delete(k)}}};
 const call=(path,method='GET',data,cookie='',gateway='test-gateway')=>worker.fetch(new Request('https://service.example/api/application'+path,{method,headers:{'X-ReLoop-Gateway':gateway,Cookie:cookie,...(data?{'Content-Type':data instanceof Uint8Array?'image/jpeg':'application/json'}:{})},...(data?{body:data instanceof Uint8Array?data:JSON.stringify(data)}:{})}),env);
 assert.equal((await call('/state','GET',null,'','wrong')).status,403);
 const a=await call('/signup','POST',{username:'seller_one',password:'test-password-long-enough',role:'seller',business:'Testing seller',city:'Jaipur'});assert.equal(a.status,201);const ac=a.headers.get('set-cookie').split(';')[0],ar=await a.json();assert.ok(ar.recoveryCode);assert.ok(!ar.me.password_hash);
 assert.equal((await call('/signup','POST',{username:'operator',password:'test-password-long-enough',role:'ops',business:'Bad elevation',city:'Jaipur'})).status,400);
 const b=await call('/signup','POST',{username:'buyer_one',password:'test-password-long-enough',role:'buyer',business:'Testing buyer',city:'Delhi'}),bc=b.headers.get('set-cookie').split(';')[0];
 assert.equal((await call('/login','POST',{username:'seller_one',password:'wrong'})).status,401);
 const state=await (await call('/state','GET',null,ac)).json();const photos=[];
 for(let i=0;i<3;i++){const bytes=new Uint8Array([255,216,255,224,0,16,74,70,73,70,0,i]);const r=await call('/photos','POST',bytes,ac);assert.equal(r.status,201);photos.push((await r.json()).id)}
 assert.equal((await call('/photos/'+photos[0],'GET',null,bc)).status,403);
 const command={...listing(100),photos};const r=await call('/command','POST',{version:state.version,requestId:crypto.randomUUID(),command},ac);assert.equal(r.status,200);const created=await r.json();assert.equal(created.stocks.length,1);
 assert.equal((await call('/command','POST',{version:state.version,requestId:crypto.randomUUID(),command},ac)).status,409);
 const published=await call('/command','POST',{version:created.version,requestId:crypto.randomUUID(),command:{type:'stock.publish',id:created.result.id}},ac);assert.equal(published.status,200);assert.equal((await call('/photos/'+photos[0],'GET',null,bc)).status,200);
 await call('/logout','POST',{},ac);assert.equal((await call('/state','GET',null,ac)).status,401);
 assert.equal(db.prepare("SELECT body FROM review_comments WHERE id='original'").get().body,'Keep this comment');
 db.close();
});
