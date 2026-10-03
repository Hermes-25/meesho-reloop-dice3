import test from 'node:test';
import assert from 'node:assert/strict';
import {sourceCost} from '../src/source-pricing.mjs';
import {cost} from '../../reloop-shared-review/app-domain.mjs';
import {translateText} from '../src/translations.mjs';
import {opsMetrics} from '../src/ops-metrics.mjs';
test('Source quote previews match authoritative checkout, including paise rounding',()=>{
 for(const [qty,price] of [[100,10000],[180,6800],[1,101],[9999,19999]])assert.deepEqual(sourceCost(qty,price),cost(qty,price,'source'));
 for(const s of ['Buyer sourcing fee · ₹0','Supplier fee · 4.5%','Net supplier payout','Supplier payout on completion','Platform fees on settled orders'])assert.match(translateText(s,'hi'),/[\u0900-\u097F]/,s);
});
test('operations counts Source fees once and shows net payout awaiting settlement',()=>{
 const now=Date.now(),base={kind:'source',ref:'r',members:[{owner:'supplier',qty:100}],qty:100,unitPrice:10000,cost:sourceCost(100,10000),createdAt:now-1000,payment:{at:now-500,amount:1080000}};
 const data={orders:[{...base,id:'paid',status:'delivered'},{...base,id:'settled',status:'settled',settledAt:now}],events:[],lots:[],rfqs:[{id:'r',city:'Jaipur',category:'Bags'}]};const m=opsMetrics(data,{now});assert.equal(m.awaitingValue,955000);assert.equal(m.premium,45000);
});
