// Read projections only: never change the authoritative order or its recorded prices.
export function payoutFor(order, owner) {
 const rows=order.inspection||order.members;
 let remaining=order.cost.supplierFee||0;
 const allocations=rows.map((m,i)=>{
  const goods=m.qty*order.unitPrice;
  const fee=i===rows.length-1?remaining:Math.round((order.cost.supplierFee||0)*goods/order.cost.goods);
  remaining-=fee;
  return {owner:m.owner,qty:m.qty,goods,fee,net:goods-fee};
 });
 const own=order.settlements?order.settlements.filter(s=>s.owner===owner).map(s=>({qty:s.qty,goods:s.gross??s.qty*order.unitPrice,fee:s.supplierFee||0,net:s.amount})):allocations.filter(s=>s.owner===owner);
 const result=own.reduce((a,s)=>({qty:a.qty+s.qty,goods:a.goods+s.goods,fee:a.fee+s.fee,net:a.net+s.net}),{qty:0,goods:0,fee:0,net:0});
 return {...result,...(order.status==='cancelled'?{goods:0,fee:0,net:0}:{}),feeRate:order.kind==='source'&&order.cost.pricingModel==='source-supplier-4.5-v1'?4.5:0,status:order.status==='cancelled'?'cancelled':order.status==='settled'?'recorded':order.issue?'on_hold':order.status==='review'?'provisional':'estimated'};
}
export function orderFinancialView(order,user) {
 if(user.role==='ops')return structuredClone(order);
 // This projection also runs in the UI during a rolling deployment.
 if(order.financialView)return structuredClone(order);
 const o=structuredClone(order);
 if(o.buyer===user.id){
  o.financialView='buyer';
  o.cost={goods:o.cost.goods,premium:o.cost.premium,logistics:o.cost.logistics,total:o.cost.total};
  delete o.settlements;
 }else if(o.members.some(m=>m.owner===user.id)){
  o.financialView='earnings';o.payout=payoutFor(order,user.id);
  // No counterparty payment, refund, delivery charge or service premium in this view.
  o.cost={};
  delete o.buyerComparison;
  if(o.payment)o.payment={mode:o.payment.mode,at:o.payment.at};
  delete o.refund;
  if(o.settlements)o.settlements=o.settlements.filter(s=>s.owner===user.id);
 }else throw new Error('This order belongs to other users.');
 return o;
}
export function financialEventView(event,order,user){
 if(!order||user.role==='ops')return event;
 if(/Test settlement recorded/.test(event.message))return {...event,message:order.buyer===user.id?'Order completed; test settlement recorded':'Your test payout recorded'};
 if(order.buyer!==user.id&&/full test refund/.test(event.message))return {...event,message:'Order cancelled; stock released for review'};
 if(order.buyer!==user.id&&/Test payment recorded/.test(event.message))return {...event,message:'Payment confirmed; fulfilment can proceed.'};
 return event;
}
