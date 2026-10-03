import test from 'node:test';
import assert from 'node:assert/strict';
import {cost,emptyMarket,upgradeSourcePricing,executeMarket} from '../app-domain.mjs';
test('Source buyer pays goods and delivery; supplier pays 4.5% on goods, while ReLoop stays unchanged',()=>{
 assert.deepEqual(cost(100,10000),{goods:1000000,premium:125000,logistics:80000,total:1205000});
 const c=cost(100,10000,'source');assert.equal(c.total,1080000);assert.equal(c.supplierFee,45000);assert.equal(c.supplierNet,955000);assert.equal(c.supplierNet+c.supplierFee+c.logistics,c.total);
 for(const price of [101,333,10001,99999]){const x=cost(17,price,'source');assert.ok(Number.isSafeInteger(x.supplierFee));assert.equal(x.supplierNet+x.supplierFee,x.goods);}
});
test('pricing migration is idempotent and keeps IDs, history, paid orders, cancelled orders and ReLoop amounts',()=>{
 const w=emptyMarket(),base={id:'source-unpaid',kind:'source',status:'awaiting_payment',qty:100,unitPrice:10000,cost:cost(100,10000),members:[{owner:'supplier',qty:100}],buyer:'seller',payment:null,agreedOffer:{revision:2,price:10000}};
 w.orders=[base,{...structuredClone(base),id:'paid',status:'delivered',payment:{id:'original-payment',amount:1205000}},{...structuredClone(base),id:'cancelled',status:'cancelled',refund:1205000},{...structuredClone(base),id:'recovery',kind:'recovery'}];w.events=[{id:'original-event'}];w.receipts=[{id:'original-receipt'}];const original=structuredClone(w);
 assert.equal(upgradeSourcePricing(w),true);assert.equal(w.orders[0].cost.total,1080000);assert.deepEqual(w.orders.slice(1),original.orders.slice(1));assert.deepEqual(w.events,original.events);assert.deepEqual(w.receipts,original.receipts);assert.deepEqual(w.orders[0].agreedOffer,original.orders[0].agreedOffer);assert.equal(w.orders[0].id,'source-unpaid');assert.equal(upgradeSourcePricing(w),false);
 const paid=executeMarket(w,{id:'ops',role:'ops'},{type:'order.settle',id:'paid'},crypto.randomUUID()).world.orders[1];assert.equal(paid.settlements[0].amount,1000000);assert.equal(paid.payment.amount,1205000);
});
test('cancelled Source payment refunds the buyer total without deducting a supplier fee',()=>{
 const w=emptyMarket(),c=cost(100,10000,'source');w.rfqs=[{id:'r',quotes:[]}];w.orders=[{id:'o',kind:'source',ref:'r',buyer:'buyer',status:'awaiting_payment',members:[{owner:'supplier',qty:100}],qty:100,unitPrice:10000,cost:c,payment:null}];
 const out=executeMarket(w,{id:'buyer',role:'seller'},{type:'order.cancel',id:'o'},crypto.randomUUID()).world.orders[0];assert.equal(out.refund,0);assert.equal(out.settlements,undefined);
});
