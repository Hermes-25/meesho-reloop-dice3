import test from 'node:test';
import assert from 'node:assert/strict';
import {bidBudget} from '../src/bid-math.mjs';
import {opsMetrics,DAY,dayKey} from '../src/ops-metrics.mjs';
import {seedDemo} from '../../reloop-shared-review/app-demo.mjs';
import {visibleMarket,priceEvidence} from '../../reloop-shared-review/app-domain.mjs';
test('bid ceiling includes fees, loss of saleable units and a conservative stress case; never silently raises a ceiling',()=>{
 const args={resale:20000,repair:1000,other:500,saleable:85,margin:20,qty:100},b=bidBudget(args);
 assert.equal(b.ceiling,10044);assert.ok(b.stressCeiling<b.ceiling);
 const cost=p=>100*p+Math.round(100*p*.125)+100*(1000+500+800),cap=100*20000*.85*.8;
 assert.ok(cost(b.ceiling)<=cap);assert.ok(cost(b.ceiling+1)>cap);
 assert.equal(bidBudget({...args,resale:100}).ceiling,0);
 assert.equal(bidBudget({...args,saleable:101}),null);assert.equal(bidBudget({...args,repair:-100}),null);assert.equal(bidBudget({...args,margin:100}),null);
});
test('operations queue has no duplicate orders; filtered counts and dated values reconcile',()=>{
 const now=Date.now(),w=seedDemo('test-space',now),data=visibleMarket(w,{id:'test-space:ops',role:'ops'}),m=opsMetrics(data,{now});
 assert.equal(new Set(m.tasks.map(t=>t.id)).size,m.tasks.length);assert.equal(m.tasks[0].label,'Resolve issue');
 assert.equal(m.recoveryValue,m.trend.reduce((s,d)=>s+d.value,0));
 assert.equal(m.awaitingValue,m.active.filter(o=>o.payment).reduce((s,o)=>s+o.cost.goods,0));
 assert.ok(opsMetrics(data,{city:'Jaipur',now}).active.every(o=>o.city==='Jaipur'));
 assert.equal(opsMetrics(data,{kind:'source',now}).tasks.length,0);
 const clone=structuredClone(data);clone.orders[0].status='cancelled';clone.orders[0].issue='Closed issue';assert.ok(!opsMetrics(clone,{now}).tasks.some(t=>t.id===clone.orders[0].id));
});
test('settled price evidence abstains with sparse data and exposes only aggregate statistics',()=>{
 const now=Date.now(),w=seedDemo('test-space',now),l=w.lots[0];assert.ok(priceEvidence(w,l,now).ready);
 const e=priceEvidence(w,l,now);assert.deepEqual(Object.keys(e).sort(),['count','high','low','median','ready']);
 assert.equal(priceEvidence({...w,orders:w.orders.slice(0,13)},l,now).ready,false);
 assert.equal(priceEvidence(w,{...l,title:'Unrelated umbrellas'},now).ready,false);
 assert.equal(priceEvidence(w,l,now+100*DAY).ready,false);
});
test('India-day boundary and missing settlement dates do not fabricate recent revenue',()=>{
 const now=Date.parse('2026-09-27T00:30:00Z'),w=seedDemo('s',now),d=visibleMarket(w,{role:'ops'});d.orders=d.orders.filter(o=>o.status==='settled').slice(0,2);delete d.orders[0].settledAt;d.orders[1].settledAt=Date.parse('2026-09-20T18:29:59Z');
 assert.equal(dayKey(Date.parse('2026-09-20T18:30:00Z')),'2026-09-21');const m=opsMetrics(d,{days:7,now});assert.equal(m.missingSettlementDates,1);assert.equal(m.recoveryValue,0);
});
