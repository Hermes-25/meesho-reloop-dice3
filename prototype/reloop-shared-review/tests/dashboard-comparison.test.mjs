import test from 'node:test';import assert from 'node:assert/strict';import {cost,emptyMarket,executeMarket,visibleMarket} from '../app-domain.mjs';
const buyer={id:'b',role:'partner'},seller={id:'s',role:'seller'},ops={id:'ops',role:'ops'};const now=Date.now();
function world(){const w=emptyMarket();w.orders=[{id:'o',kind:'recovery',buyer:'b',members:[{owner:'s',qty:80}],qty:80,unitPrice:9840,cost:cost(80,9840),status:'pickup',payment:{at:now,amount:949600}}];return w}
test('purchase references are buyer-owned, private, replay-safe and never alter the actual bill',()=>{
 const original=world(),c={type:'order.comparison',id:'o',quantity:80,unitPrice:14000,basis:'Recent purchase',comparable:true};const out=executeMarket(original,buyer,c,'comparison',now),w=out.world;
 assert.equal(w.orders[0].buyerComparison.unitPrice,14000);assert.equal(w.orders[0].buyerComparison.quantity,80);assert.throws(()=>executeMarket(w,buyer,{...c,quantity:79},'quantity-race'));assert.deepEqual(w.orders[0].cost,original.orders[0].cost);assert.deepEqual(executeMarket(w,buyer,c,'comparison',now).world,w);
 assert.ok(visibleMarket(w,buyer).orders[0].buyerComparison);assert.ok(visibleMarket(w,ops).orders[0].buyerComparison);assert.equal(visibleMarket(w,seller).orders[0].buyerComparison,undefined);assert.equal(visibleMarket(w,seller).events.length,0);
 assert.throws(()=>executeMarket(w,seller,c,'bad'));assert.throws(()=>executeMarket(w,buyer,{...c,comparable:false},'bad2'));
 const cleared=executeMarket(w,buyer,{type:'order.comparison',id:'o',clear:true},'clear').world;assert.equal(cleared.orders[0].buyerComparison,undefined);assert.deepEqual(cleared.orders[0].cost,original.orders[0].cost);
});
test('seller can confirm and change availability, buyer cannot book logistics, and inspection locks scheduling',()=>{
 const date=new Date(now+86400000).toISOString().slice(0,10),c={type:'pickup.book',id:'o',date,window:'2 PM – 5 PM'},w=executeMarket(world(),seller,c,'slot',now).world;
 assert.equal(w.orders[0].pickups.s.window,'2 PM – 5 PM');assert.equal(w.orders[0].status,'pickup');assert.match(w.events[0].message,/Meesho operations/);
 const changed=executeMarket(w,seller,{...c,window:'10 AM – 1 PM'},'slot2',now).world;assert.equal(changed.orders[0].pickups.s.window,'10 AM – 1 PM');assert.throws(()=>executeMarket(w,buyer,c,'bad'));assert.throws(()=>executeMarket(w,seller,{...c,window:'arbitrary'},'bad2'));
 changed.orders[0].status='review';assert.throws(()=>executeMarket(changed,seller,c,'late'));
});
