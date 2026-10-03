export const DAY=86400000;
export const dayKey=t=>new Date(t+19800000).toISOString().slice(0,10);
export const stages=[['awaiting_payment','Payment'],['pickup','Pickup / inspect'],['review','Acceptance'],['ready_dispatch','Dispatch'],['fulfilment','Supplier prep'],['shipped','In transit'],['delivered','Settlement']];
export function orderContext(data,o){const record=(o.kind==='recovery'?data.lots:data.rfqs).find(x=>x.id===o.ref);return {city:record?.city||'Unknown city',category:record?.category||'Other',title:o.title||record?.title||'Recovery order'}}
export function actionFor(o){
 if(['settled','cancelled'].includes(o.status))return null;
 if(o.issue)return {label:'Resolve issue',priority:0,tone:'urgent'};
 if(o.status==='review'&&o.proposedQty<o.originalQty)return {label:'Review quantity mismatch',priority:1,tone:'urgent'};
 if(o.status==='pickup'&&o.members.every(m=>o.pickups?.[m.owner]))return {label:'Record inspection',priority:2,tone:'attention'};
 if(o.status==='ready_dispatch')return {label:'Record dispatch',priority:3,tone:'attention'};
 if(o.status==='delivered')return {label:'Release test settlement',priority:4,tone:'attention'};
 return null;
}
export function opsMetrics(data,{city='',kind='',days=30,now=Date.now()}={}){
 const allOrders=data.orders.map(o=>({...o,...orderContext(data,o)}));
 const orders=allOrders.filter(o=>(!city||o.city===city)&&(!kind||o.kind===kind));
 const active=orders.filter(o=>!['settled','cancelled'].includes(o.status));
 const lots=data.lots.filter(l=>(!city||l.city===city)&&kind!=='source');
 const last=o=>o.updatedAt||Math.max(o.createdAt,...data.events.filter(e=>e.entity===o.id).map(e=>e.at));
 const tasks=active.flatMap(o=>{const a=actionFor(o);return a?[{...a,id:o.id,title:o.title,city:o.city,href:'/orders/'+o.id,at:o.issue?o.issueAt||last(o):last(o),value:o.cost.goods}]:[]});
 for(const l of lots.filter(l=>l.status==='open'&&l.bidCount>0))tasks.push({id:l.id,title:l.title,city:l.city,href:'/market/'+l.id,label:'Review bids & award',priority:5,tone:'attention',at:l.bids[0]?.at||l.createdAt,value:l.highestBid*l.members.reduce((s,m)=>s+m.qty,0)});
 tasks.sort((a,b)=>a.priority-b.priority||a.at-b.at);
 const start=Date.parse(dayKey(now-(days-1)*DAY))-19800000;
 const exceptions=tasks.filter(t=>t.tone==='urgent'),settled=orders.filter(o=>o.status==='settled'&&o.settledAt>=start&&o.settledAt<=now),recovery=settled.filter(o=>o.kind==='recovery');
 const inspected=orders.filter(o=>o.inspection&&o.status!=='cancelled'),paid=orders.filter(o=>o.payment&&o.status!=='cancelled');
 const durations=settled.filter(o=>o.payment?.at&&o.settledAt>=o.payment.at).map(o=>(o.settledAt-o.payment.at)/DAY).sort((a,b)=>a-b);
 const trend=Array.from({length:days},(_,i)=>{const date=dayKey(now-(days-1-i)*DAY);return {date,value:recovery.filter(o=>dayKey(o.settledAt)===date).reduce((s,o)=>s+o.cost.goods,0)}});
 const regions=Object.values(allOrders.filter(o=>!['settled','cancelled'].includes(o.status)&&(!kind||o.kind===kind)).reduce((g,o)=>{const r=g[o.city]??={city:o.city,orders:0,units:0,issues:0,actions:0};r.orders++;r.units+=o.qty;const a=actionFor(o);if(a?.tone==='urgent')r.issues++;else if(a)r.actions++;return g},{})).sort((a,b)=>b.orders-a.orders||b.units-a.units);
 const open=lots.filter(l=>l.status==='open'),declared=inspected.reduce((s,o)=>s+o.originalQty,0),accepted=inspected.reduce((s,o)=>s+o.proposedQty,0);
 return {orders,active,lots,tasks,exceptions,regions,trend,settled,recovery,open,paid,inspected,accepted,declared,
  awaitingValue:active.filter(o=>o.payment).reduce((s,o)=>s+(o.cost.supplierNet??o.cost.goods),0),recoveryValue:recovery.reduce((s,o)=>s+o.cost.goods,0),premium:settled.reduce((s,o)=>s+o.cost.premium+(o.cost.supplierFee||0),0),
  bidCoverage:open.length?open.filter(l=>l.bidCount>0).length/open.length:null,
  medianDays:durations.length?(durations[Math.floor((durations.length-1)/2)]+durations[Math.ceil((durations.length-1)/2)])/2:null,
  pipeline:stages.map(([status,label])=>({status,label,count:active.filter(o=>o.status===status).length})),missingSettlementDates:orders.filter(o=>o.status==='settled'&&!o.settledAt).length};
}
