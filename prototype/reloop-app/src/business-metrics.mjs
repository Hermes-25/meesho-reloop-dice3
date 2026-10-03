import {orderFinancialView} from './order-financials.mjs';
import {nextStep} from './order-journey.mjs';
const sum=(a,f)=>a.reduce((s,x)=>s+f(x),0);
export function businessMetrics(data,now=Date.now()){
 const me=data.me,orders=data.orders.map(o=>orderFinancialView(o,me)),valid=orders.filter(o=>o.status!=='cancelled');
 const recovery=valid.filter(o=>o.kind==='recovery'),source=valid.filter(o=>o.kind==='source'),earned=valid.filter(o=>o.financialView==='earnings'),settled=earned.filter(o=>o.status==='settled'),pending=earned.filter(o=>o.payment&&o.status!=='settled');
 const purchases=valid.filter(o=>o.buyer===me.id),received=purchases.filter(o=>['delivered','settled'].includes(o.status));
 const comparisons=received.filter(o=>o.kind==='recovery'&&o.buyerComparison?.comparable&&o.buyerComparison.quantity===o.qty);
 const sourceSavings=source.filter(o=>o.buyer===me.id&&o.status==='settled').flatMap(o=>{
  const r=data.rfqs.find(r=>r.id===o.ref),q=r?.quotes.find(q=>q.id===o.agreedOffer?.quoteId),first=q?.offers?.find(h=>h.side==='supplier');
  return first&&first.qty===o.qty?[{id:o.id,value:(first.price-o.unitPrice)*o.qty}]:[];
 });
 const today=new Date(now);today.setHours(0,0,0,0);const start=today.getTime()-41*86400000;
 const weeks=Array.from({length:6},(_,i)=>{const from=start+i*7*86400000,to=from+7*86400000;return {from,to,value:sum(settled.filter(o=>o.settledAt>=from&&o.settledAt<to),o=>o.payout.net)}});
 const tasks=orders.map(o=>({order:o,...nextStep(o,me)})).filter(x=>x.action).sort((a,b)=>a.order.createdAt-b.order.createdAt);
 const active=valid.filter(o=>o.status!=='settled');
 return {orders,valid,recovery,source,earned,settled,pending,purchases,received,tasks,active,weeks,
  cashRecovered:sum(settled.filter(o=>o.kind==='recovery'),o=>o.payout.net),supplyEarned:sum(settled.filter(o=>o.kind==='source'),o=>o.payout.net),pendingPayout:sum(pending,o=>o.payout.net),unitsRecovered:sum(settled.filter(o=>o.kind==='recovery'),o=>o.payout.qty),
  purchaseSpend:sum(purchases.filter(o=>o.payment),o=>o.cost.total),purchaseSavings:sum(comparisons,o=>o.buyerComparison.unitPrice*o.qty-o.cost.total),comparisonCount:comparisons.length,eligibleComparisons:received.filter(o=>o.kind==='recovery').length,
  sourceSavings:sum(sourceSavings,x=>x.value),sourceSavingsCount:sourceSavings.length,
  pipeline:[{label:'Awaiting payment',value:active.filter(o=>o.status==='awaiting_payment').length},{label:'Pickup / preparation',value:active.filter(o=>['pickup','fulfilment'].includes(o.status)).length},{label:'Inspection / dispatch',value:active.filter(o=>['review','ready_dispatch'].includes(o.status)).length},{label:'In transit',value:active.filter(o=>o.status==='shipped').length},{label:'Awaiting settlement',value:active.filter(o=>o.status==='delivered').length}],
  activeListings:data.stocks.filter(s=>s.status==='published'&&data.lots.some(l=>l.id===s.lotId&&['open','forming'].includes(l.status))).length,drafts:data.stocks.filter(s=>s.status==='draft').length};
}
