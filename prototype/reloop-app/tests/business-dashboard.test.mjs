import test from 'node:test';import assert from 'node:assert/strict';
import {businessMetrics} from '../src/business-metrics.mjs';import {nextStep,journeyStages} from '../src/order-journey.mjs';import {cost} from '../../reloop-shared-review/app-domain.mjs';
import {translateText} from '../src/translations.mjs';
const seller={id:'s',role:'seller'},partner={id:'p',role:'partner'},ops={id:'ops',role:'ops'};
const base={id:'o',kind:'recovery',buyer:'p',ref:'l',qty:100,unitPrice:10000,members:[{owner:'s',qty:40},{owner:'other',qty:60}],cost:cost(100,10000),createdAt:100,payment:{at:200,amount:1205000},status:'pickup',acceptances:[]};
const data=(me,orders)=>({me,orders,lots:[],rfqs:[],stocks:[]});
test('cash recovery uses own settled contribution and keeps pending payouts and savings distinct',()=>{
 const settled={...base,id:'settled',status:'settled',settledAt:1000,settlements:[{owner:'s',qty:30,amount:300000},{owner:'other',qty:60,amount:600000}]};const m=businessMetrics(data(seller,[settled,{...base,id:'pending'},{...base,id:'cancelled',status:'cancelled'}]),2000);
 assert.equal(m.cashRecovered,300000);assert.equal(m.pendingPayout,400000);assert.equal(m.unitsRecovered,30);assert.equal(m.recovery.length,2);assert.equal(m.sourceSavingsCount,0);assert.equal(m.tasks.length,1);assert.equal(m.weeks.reduce((s,x)=>s+x.value,0),300000);
});
test('partner combines buying and supply earnings without mixing turnover, fees or unreferenced savings',()=>{
 const o={...base,status:'delivered',buyerComparison:{comparable:true,quantity:100,unitPrice:13000}};const supply={...base,id:'sup',kind:'source',buyer:'s',members:[{owner:'p',qty:100}],cost:cost(100,10000,'source'),status:'settled',settledAt:1000};const m=businessMetrics(data(partner,[o,supply,{...o,id:'unreferenced',buyerComparison:undefined},{...o,id:'cancel',status:'cancelled'}]));
 assert.equal(m.purchaseSavings,95000);assert.equal(m.comparisonCount,1);assert.equal(m.eligibleComparisons,2);assert.equal(m.supplyEarned,955000);assert.equal(m.purchaseSpend,2410000);
 const more=businessMetrics(data(partner,[{...o,buyerComparison:{comparable:true,quantity:100,unitPrice:10000}}]));assert.equal(more.purchaseSavings,-205000);
});
test('negotiation savings require same quantity, original supplier offer and a settled purchase',()=>{
 const o={...base,kind:'source',buyer:'s',members:[{owner:'p',qty:100}],cost:cost(100,10000,'source'),status:'settled',agreedOffer:{quoteId:'q'}};const d=data(seller,[o]);d.rfqs=[{id:'l',quotes:[{id:'q',offers:[{side:'supplier',qty:100,price:11000}]}]}];assert.equal(businessMetrics(d).sourceSavings,100000);d.rfqs[0].quotes[0].offers[0].qty=200;assert.equal(businessMetrics(d).sourceSavingsCount,0);
});
test('pickup next steps distinguish availability, collection coordination, buyer waiting and issue holds',()=>{
 assert.equal(nextStep(base,seller).action,'Choose pickup slot');assert.equal(nextStep(base,partner).action,null);assert.equal(nextStep(base,partner).owner,'Seller');
 const ready={...base,pickups:{s:{date:'2030-01-01'},other:{date:'2030-01-01'}}};assert.equal(nextStep(ready,seller).title,'Pickup availability confirmed');assert.equal(nextStep(ready,partner).owner,'Meesho operations');assert.equal(nextStep(ready,ops).action,'Record inspection');assert.equal(nextStep({...ready,issue:'Damaged'},partner).action,null);
 assert.equal(journeyStages(base).filter(s=>s.state==='current')[0].key,'prepare');assert.ok(journeyStages({...base,status:'settled'}).every(s=>s.state==='done'));assert.equal(journeyStages({...base,status:'cancelled'}).filter(s=>s.state==='current').length,0);
});
test('primary dashboard and timeline terms have Hindi translations',()=>{for(const s of ['Cash recovered','Estimated purchase savings','Your business at a glance.','Order timeline','Change pickup slot','Meesho coordinating pickup','Meesho coordinates recovery logistics','Next step owner:'])assert.match(translateText(s,'hi'),/[\u0900-\u097F]/,s)});
test('savings exclude stale or unverified quantities until the buyer reconfirms',()=>{
 const o={...base,status:'delivered',buyerComparison:{comparable:true,quantity:120,unitPrice:13000}};
 assert.equal(businessMetrics(data(partner,[o])).comparisonCount,0);
 assert.equal(businessMetrics(data(partner,[{...o,buyerComparison:{comparable:true,unitPrice:13000}}])).comparisonCount,0);
 assert.equal(businessMetrics(data(partner,[{...o,buyerComparison:{...o.buyerComparison,quantity:100}}])).comparisonCount,1);
});
