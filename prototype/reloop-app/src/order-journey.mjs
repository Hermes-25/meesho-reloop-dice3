export function nextStep(o,me){
 const buyer=o.buyer===me.id,ops=me.role==='ops',own=o.members.some(m=>m.owner===me.id),allSlots=o.members.every(m=>o.pickups?.[m.owner]);
 if(o.status==='cancelled')return {title:'Order cancelled',owner:'No further action',detail:'This journey has stopped. See the order record for the final amounts.'};
 if(o.issue)return {title:'Issue under review',owner:'Meesho operations',detail:'Operations must resolve the issue before payout. You can follow the resolution here.',action:ops?'Resolve issue':null};
 switch(o.status){
 case 'awaiting_payment':return {title:buyer?'Payment due':'Waiting for buyer payment',owner:buyer?'You':'Buyer',detail:buyer?'Review your bill and make the test payment to start fulfilment.':'Stock stays with the seller until payment is confirmed.',action:buyer?'Review and pay':null};
 case 'pickup':
  if(own&&!o.pickups?.[me.id])return {title:'Choose pickup availability',owner:'You',detail:'Choose when your stock is ready. Meesho coordinates collection; you do not book a courier.',action:'Choose pickup slot'};
  return {title:own?'Pickup availability confirmed':allSlots?'Meesho coordinating pickup':'Waiting for seller availability',owner:allSlots?'Meesho operations':'Seller',detail:allSlots?'Meesho coordinates collection and inspection. No action is needed from the buyer.':own?'Your availability is saved. Remaining sellers must share theirs before Meesho can coordinate the combined pickup.':'The seller confirms a ready-to-collect slot; Meesho then coordinates pickup and inspection. You do not arrange transport.',action:ops&&allSlots?'Record inspection':null};
 case 'review':return {title:'Inspection needs agreement',owner:'Buyer and affected sellers',detail:o.acceptances?.includes(me.id)?'Your agreement is saved. Waiting for the other affected parties.':'Review the accepted quantity and your revised amount before dispatch.',action:(buyer||own)&&!o.acceptances?.includes(me.id)?'Review inspection':null};
 case 'ready_dispatch':return {title:'Meesho preparing dispatch',owner:'Meesho operations',detail:'Inspection is agreed. Meesho coordinates onward delivery and records tracking.',action:ops?'Record dispatch':null};
 case 'fulfilment':return {title:'Supplier preparing stock',owner:own?'You':'Supply partner',detail:own?'Prepare the agreed stock and record the test dispatch when it is ready.':'The supplier is preparing the agreed stock. Track dispatch here.',action:own?'Record dispatch':null};
 case 'shipped':return {title:'On the way',owner:buyer?'You, after delivery':'Buyer, after delivery',detail:buyer?'Track the shipment below. Confirm receipt only after the goods arrive.':'Waiting for the buyer to receive and confirm the goods.',action:buyer?'Confirm receipt':null};
 case 'delivered':return {title:'Delivered · payout pending',owner:'Meesho operations',detail:'Delivery is confirmed. Operations releases payout after any issues are resolved.',action:ops?'Release settlement':null};
 case 'settled':return {title:'Order completed',owner:'No further action',detail:'The test settlement is recorded. Your order history remains available.'};
 default:return {title:'Order in progress',owner:'Meesho operations',detail:'Follow the recorded stages below.'};
 }
}
export function orderStageLabel(o,me){return nextStep({...o,issue:''},me).title}
export function journeyStages(o){
 const recovery=o.kind==='recovery';
 const steps=[{key:'agreed',label:'Order agreed',owner:'Trading partners',at:o.createdAt},{key:'paid',label:'Payment',owner:'Buyer',at:o.payment?.at},{key:'prepare',label:recovery?'Pickup coordination':'Stock preparation',owner:recovery?'Seller + Meesho':'Supply partner'},...(recovery?[{key:'inspect',label:'Inspection agreement',owner:'Buyer + seller'}]:[]),{key:'dispatch',label:'Dispatch',owner:recovery?'Meesho':'Supply partner'},{key:'delivery',label:'Delivery',owner:'Buyer confirms receipt',at:o.deliveredAt},{key:'settle',label:'Settlement',owner:'Meesho operations',at:o.settledAt}];
 const key=({awaiting_payment:'paid',pickup:'prepare',fulfilment:'prepare',review:'inspect',ready_dispatch:'dispatch',shipped:'delivery',delivered:'settle',settled:'settle'})[o.status];
 const active=steps.findIndex(s=>s.key===key);
 return steps.map((s,i)=>({...s,state:o.status==='cancelled'?(i===0||s.key==='paid'&&o.payment?'done':'stopped'):o.status==='settled'||i<active?'done':i===active?'current':'upcoming'}));
}
