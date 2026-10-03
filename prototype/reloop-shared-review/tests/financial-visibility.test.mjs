import test from 'node:test';
import assert from 'node:assert/strict';
import {emptyMarket,cost,visibleMarket} from '../app-domain.mjs';
import {orderFinancialView,payoutFor} from '../order-financials.mjs';
const buyer={id:'buyer',role:'seller'},supplier={id:'supplier',role:'partner'},ops={id:'ops',role:'ops'};
function source(){return {id:'o',ref:'r',kind:'source',buyer:buyer.id,members:[{owner:supplier.id,qty:200}],qty:200,unitPrice:7500,cost:cost(200,7500,'source'),status:'delivered',payment:{mode:'test',id:'payment',at:1,amount:1660000},refund:123}}
test('Source projections isolate customer bill and supplier earnings in state, events and exports without mutating records',()=>{
 const w=emptyMarket();w.orders=[source()];w.events=[{id:'event',entity:'o',message:'Test settlement recorded; supplier receives goods value less the 4.5% supplier fee'}];const original=structuredClone(w);
 const b=visibleMarket(w,buyer),s=visibleMarket(w,supplier),a=visibleMarket(w,ops);
 assert.deepEqual(b.orders[0].cost,{goods:1500000,premium:0,logistics:160000,total:1660000});
 assert.equal(b.orders[0].payout,undefined);assert.equal(b.orders[0].settlements,undefined);assert.doesNotMatch(JSON.stringify(b),/supplierFee|supplierNet|4\.5/);
 assert.equal(s.orders[0].payout.net,1432500);assert.equal(s.orders[0].payout.fee,67500);assert.deepEqual(s.orders[0].cost,{});assert.equal(s.orders[0].payment.amount,undefined);assert.equal(s.orders[0].refund,undefined);assert.doesNotMatch(JSON.stringify(s),/premium|logistics|1660000/);
 assert.deepEqual(a.orders,w.orders);assert.deepEqual(w,original);assert.deepEqual(orderFinancialView(s.orders[0],supplier),s.orders[0]);
});
test('pooled recovery sellers see only their accepted contribution; buyers never receive settlement rows',()=>{
 const o={...source(),kind:'recovery',members:[{owner:'seller-a',qty:40},{owner:'seller-b',qty:60}],qty:80,originalQty:100,unitPrice:10000,cost:cost(80,10000),inspection:[{owner:'seller-a',qty:30},{owner:'seller-b',qty:50}],status:'review'};
 const a=orderFinancialView(o,{id:'seller-a',role:'seller'});assert.equal(a.payout.goods,300000);assert.equal(a.payout.net,300000);assert.equal(a.payout.fee,0);assert.equal(a.payout.status,'provisional');assert.equal(a.payout.qty,30);assert.doesNotMatch(JSON.stringify(a.cost),/premium|total/);
 o.status='settled';o.settlements=[{owner:'seller-a',qty:30,amount:300000},{owner:'seller-b',qty:50,amount:500000}];
 assert.equal(orderFinancialView(o,{id:'seller-a',role:'seller'}).settlements.length,1);assert.equal(orderFinancialView(o,buyer).settlements,undefined);assert.equal(orderFinancialView(o,ops).settlements.length,2);
});
test('legacy paid Source, cancellations and holds retain their recorded economics',()=>{
 const o=source();o.cost=cost(200,7500);assert.equal(payoutFor(o,supplier.id).net,1500000);assert.equal(payoutFor(o,supplier.id).feeRate,0);assert.equal(orderFinancialView(o,buyer).cost.total,1847500);
 o.issue='Hold';assert.equal(payoutFor(o,supplier.id).status,'on_hold');o.status='cancelled';assert.equal(payoutFor(o,supplier.id).net,0);assert.equal(payoutFor(o,supplier.id).fee,0);
 o.status='settled';o.settlements=[{owner:supplier.id,qty:200,amount:1500000}];assert.equal(payoutFor(o,supplier.id).net,1500000);
});
test('supplier fee allocation rounds and reconciles exactly and unrelated accounts are denied',()=>{
 const o=source();o.members=[{owner:'a',qty:1},{owner:'b',qty:2}];o.qty=3;o.unitPrice=101;o.cost=cost(3,101,'source');
 const a=payoutFor(o,'a'),b=payoutFor(o,'b');assert.equal(a.fee+b.fee,o.cost.supplierFee);assert.equal(a.net+b.net,o.cost.supplierNet);assert.throws(()=>orderFinancialView(o,{id:'unknown',role:'seller'}));
});
