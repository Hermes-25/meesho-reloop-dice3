import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyMarket,executeMarket,visibleMarket} from '../app-domain.mjs';
import {seedDemo,demoProfile} from '../app-demo.mjs';
import {accountView} from '../partner-access.mjs';
import {upgradePersonas} from '../demo-personas.mjs';
import {latestOffer} from '../negotiation.mjs';
const now=Date.now(),later=n=>new Date(now+n*86400000).toISOString().slice(0,10);
function setup(){let w=emptyMarket();const seller={id:'seller',role:'seller'},partner={id:'partner',role:'partner'},rival={id:'rival',role:'partner'},ops={id:'ops',role:'ops'};const run=(u,c,id=crypto.randomUUID(),at=now)=>{const out=executeMarket(w,u,c,id,at);w=out.world;return out.result};
 for(const u of [partner,rival])run(u,{type:'partner.configure',buy:true,supply:true,categories:['Bags'],states:['Rajasthan'],capacity:500});
 const r=run(seller,{type:'rfq.create',title:'Cotton tote bags',description:'Unbranded cotton bags with reinforced handles.',category:'Bags',city:'Jaipur',qty:200,neededBy:later(10)}).id;
 const initial={type:'quote.submit',id:r,price:7500,qty:200,dispatchFrom:later(2),dispatchTo:later(4),terms:['Standard packing included'],expiresHours:48};run(partner,initial);const q=w.rfqs[0].quotes[0].id;
 return {get w(){return w},run,seller,partner,rival,ops,r,q,initial};
}
test('three personas have scoped records; one partner can buy and supply, while disabled capabilities are enforced',()=>{
 const w=seedDemo('roles',now),seller=demoProfile({space_id:'roles',role:'seller'}),partner=demoProfile({space_id:'roles',role:'partner'}),v=visibleMarket(w,seller),pv=visibleMarket(w,partner);
 assert.ok(v.stocks.length>0&&v.stocks.length<25);assert.ok(v.stocks.every(s=>s.owner===seller.id&&s.city==='Jaipur'));assert.ok(v.lots.every(l=>l.members.some(m=>m.owner===seller.id)));assert.equal(pv.lots.filter(l=>l.status==='open').length,36);
 assert.deepEqual(accountView(w,partner).capabilities,{buy:true,supply:true});assert.equal(demoProfile({space_id:'roles',role:'supplier'}).id,partner.id);
 assert.ok(pv.rfqs.every(r=>r.quotes.some(q=>q.owner===partner.id)||['Bags','Clothing','Home'].includes(r.category)));assert.ok(!pv.rfqs.some(r=>r.category==='Kitchen'));
 const l=pv.lots.find(l=>l.status==='open');assert.throws(()=>executeMarket(w,seller,{type:'bid.place',id:l.id,price:99900},crypto.randomUUID()),/cannot perform/);
 assert.throws(()=>executeMarket(w,partner,{type:'rfq.create'},crypto.randomUUID()),/cannot perform/);
 const disabled=executeMarket(w,partner,{type:'partner.configure',buy:false,supply:true,categories:['Bags'],states:['Rajasthan'],capacity:500},crypto.randomUUID()).world;
 assert.throws(()=>executeMarket(disabled,partner,{type:'bid.place',id:l.id,price:99900},crypto.randomUUID()),/cannot perform/);
});
test('counteroffers remain private, require the latest revision, and lock all agreed terms into the order',()=>{
 const s=setup(),counter={type:'quote.counter',id:s.r,quoteId:s.q,revision:1,price:6800,qty:180,dispatchFrom:later(3),dispatchTo:later(5),terms:['Standard packing included'],expiresHours:48};
 s.run(s.seller,counter);assert.equal(visibleMarket(s.w,s.rival).rfqs[0].quotes.length,0);assert.ok(!visibleMarket(s.w,s.rival).events.some(e=>e.message.includes('counteroffer')));
 assert.throws(()=>s.run(s.rival,{...counter,revision:2}),/other accounts/);
 assert.throws(()=>s.run(s.seller,{type:'quote.accept',id:s.r,quoteId:s.q,revision:1}),/offer changed/);
 assert.throws(()=>s.run(s.seller,{type:'quote.accept',id:s.r,quoteId:s.q,revision:2}),/supplier must agree/);
 s.run(s.partner,{type:'quote.agree',id:s.r,quoteId:s.q,revision:2});const command={type:'quote.accept',id:s.r,quoteId:s.q,revision:2},requestId=crypto.randomUUID();const order=s.run(s.seller,command,requestId).id;assert.equal(s.run(s.seller,command,requestId).id,order);
 const o=s.w.orders[0];assert.equal(o.qty,180);assert.equal(o.unitPrice,6800);assert.equal(o.dispatchTo,later(5));assert.deepEqual(o.agreedOffer.terms,['Standard packing included']);assert.equal(o.cost.total,180*6800+180*800);assert.equal(o.cost.premium,0);assert.equal(o.cost.supplierFee,55080);assert.equal(o.cost.supplierNet,1168920);
 assert.throws(()=>s.run(s.partner,{...counter,revision:2}),/respond/);assert.equal(s.w.orders.length,1);
 s.run(s.seller,{type:'order.pay',id:order});assert.equal(s.w.orders[0].payment.amount,1368000);s.run(s.partner,{type:'order.dispatch',id:order,tracking:'DEMO-PARTNER'});s.run(s.seller,{type:'order.receive',id:order});s.run(s.seller,{type:'order.issue',id:order,note:'Packing needs review before settlement'});assert.throws(()=>s.run(s.ops,{type:'order.settle',id:order}),/resolve every issue/);assert.equal(s.w.orders[0].settlements,undefined);s.run(s.ops,{type:'order.resolve',id:order,note:'Packing verified and issue resolved'});const settleId=crypto.randomUUID();s.run(s.ops,{type:'order.settle',id:order},settleId);s.run(s.ops,{type:'order.settle',id:order},settleId);assert.deepEqual(s.w.orders[0].settlements,[{owner:s.partner.id,qty:180,gross:1224000,supplierFee:55080,amount:1168920}]);
});
test('negotiation blocks contact/free text, validates scope and expiry, and supports private preset clarification',()=>{
 const legacy={owner:'legacy',price:7500,at:now,dispatchFrom:later(1),dispatchTo:later(2)};assert.equal(latestOffer(legacy,{qty:10,neededBy:later(10)}).expiresAt,Date.parse(later(2))+86400000);
 const s=setup();assert.throws(()=>s.run(s.rival,{...s.initial,note:'WhatsApp 9999999999'}),/listed terms/);
 s.run(s.seller,{type:'quote.clarify',id:s.r,quoteId:s.q,revision:1,code:'Is standard packing included?'});const question=s.w.rfqs[0].quotes[0].clarifications[0].id;
 s.run(s.partner,{type:'quote.clarify',id:s.r,quoteId:s.q,revision:1,questionId:question,code:'Yes, confirmed'});assert.equal(s.w.rfqs[0].quotes[0].clarifications.length,2);
 assert.throws(()=>s.run(s.partner,{type:'quote.clarify',id:s.r,quoteId:s.q,revision:1,questionId:question,code:'Yes, confirmed'}),/unanswered/);
 assert.throws(()=>s.run(s.seller,{type:'quote.accept',id:s.r,quoteId:s.q,revision:1},crypto.randomUUID(),now+3*86400000),/expired/);
 s.run(s.rival,{type:'partner.configure',buy:true,supply:true,categories:['Kitchen'],states:['Rajasthan'],capacity:20});assert.throws(()=>s.run(s.rival,s.initial),/outside your supply/);
});
test('declining an offer closes that negotiation without selecting a supplier or changing another quote',()=>{
 const s=setup();s.run(s.rival,{...s.initial,price:7900});const rival=structuredClone(s.w.rfqs[0].quotes[1]);s.run(s.seller,{type:'quote.decline',id:s.r,quoteId:s.q,revision:1});assert.equal(s.w.rfqs[0].quotes[0].state,'declined');assert.deepEqual(s.w.rfqs[0].quotes[1],rival);assert.equal(s.w.rfqs[0].status,'open');assert.equal(s.w.orders.length,0);
});
test('demo ownership migration retains IDs, custom uploads, payment history, order states and counters',()=>{
 const w=emptyMarket(),space='upgrade';w.stocks=[{id:'s1',owner:space+':seller',sampleImage:true,city:'Mumbai',photos:['sample'],qty:20},{id:'mine',owner:space+':seller',city:'Delhi',photos:['my-real-upload'],qty:7}];w.lots=[{id:'l1',city:'Mumbai',members:[{stockId:'s1',owner:space+':seller',qty:20}],bids:[{owner:space+':buyer',price:7500}],status:'awarded'}];
 w.orders=[{id:'o1',kind:'recovery',ref:'l1',buyer:space+':buyer',members:[{stockId:'s1',owner:space+':seller',qty:20}],status:'shipped',unitPrice:7500,cost:{total:19999},payment:{amount:19999,id:'original'},tracking:'ORIGINAL',acceptances:[space+':seller',space+':buyer']}];w.receipts=[{id:'receipt',owner:space+':supplier',result:{id:'o1'}}];
 const financial=structuredClone(w.orders[0].payment),upload=structuredClone(w.stocks[1]);upgradePersonas(w,space,now);assert.equal(w.orders[0].id,'o1');assert.equal(w.orders[0].status,'shipped');assert.equal(w.orders[0].tracking,'ORIGINAL');assert.deepEqual(w.orders[0].payment,financial);assert.deepEqual(w.stocks[1],upload);assert.equal(w.orders[0].members[0].owner,'upgrade:seller:mumbai');assert.equal(w.receipts[0].id,'receipt');const snapshot=JSON.stringify(w);assert.equal(upgradePersonas(w,space,now),false);assert.equal(JSON.stringify(w),snapshot);
});
