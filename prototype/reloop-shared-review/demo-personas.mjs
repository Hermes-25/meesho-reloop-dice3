import {catalogCities,catalogProducts,stateForCity} from './demo-catalog.mjs';
// Demo-only correction. Record IDs, prices, receipts, photos and transaction
// stages remain intact; ownership follows each sample business and its city.
export function upgradePersonas(w,space,now=Date.now()){
 if(w.personaVersion>=3)return false;
 const seller=space+':seller',partner=space+':buyer',oldSupplier=space+':supplier';
 const sellerAt=city=>city==='Jaipur'?seller:space+':seller:'+city.toLowerCase().replace(/[^a-z]/g,'');
 w.businesses??={};for(const c of catalogCities)w.businesses[sellerAt(c.city)]={business:c.city==='Jaipur'?'Aarohi Retail':c.city+' Traders',city:c.city,role:'seller'};
 w.businesses[partner]={business:'Prakash Wholesale',city:'Jaipur',role:'partner'};
 w.partnerProfiles??={};w.partnerProfiles[partner]??={buy:true,supply:true,categories:['Bags','Clothing','Home'],states:['Rajasthan','Delhi','Gujarat','Maharashtra','Uttar Pradesh'],capacity:1000};
 const sample=s=>s.sampleImage||s.photos?.every(p=>/^00000000-0000-4000-8000-/.test(p));
 for(const s of w.stocks)if(sample(s)){s.owner=sellerAt(s.city);s.sampleBusiness=true;}
 const stockById=new Map(w.stocks.map(s=>[s.id,s]));
 for(const l of w.lots)for(const m of l.members){const s=stockById.get(m.stockId);if(s?.sampleBusiness)m.owner=s.owner;}
 for(const r of w.rfqs){if(r.description.startsWith('200 natural cotton totes')||catalogProducts.some(p=>p.description===r.description))r.owner=sellerAt(r.city);r.state??=stateForCity(r.city);for(const q of r.quotes)if(q.owner===oldSupplier)q.owner=partner;}
 for(const o of w.orders){
  const oldMembers=structuredClone(o.members);
  if(o.kind==='recovery')for(const m of o.members){const s=stockById.get(m.stockId);if(s?.sampleBusiness)m.owner=s.owner;}
  else{const r=w.rfqs.find(r=>r.id===o.ref);if(r)o.buyer=r.owner;for(const m of o.members)if(m.owner===oldSupplier)m.owner=partner;}
  const remap=id=>id===oldSupplier?[partner]:[...new Set(oldMembers.flatMap((m,i)=>m.owner===id?[o.members[i].owner]:[]))].length?[...new Set(oldMembers.flatMap((m,i)=>m.owner===id?[o.members[i].owner]:[]))]:[id];
  if(o.pickups)o.pickups=Object.fromEntries(Object.entries(o.pickups).flatMap(([id,v])=>remap(id).map(n=>[n,v])));
  if(o.acceptances)o.acceptances=[...new Set(o.acceptances.flatMap(remap))];
  if(o.inspection)for(const m of o.inspection)m.owner=o.members.find(x=>x.stockId===m.stockId)?.owner||remap(m.owner)[0];
  if(o.settlements)for(const m of o.settlements)m.owner=remap(m.owner)[0];
  if(o.issueBy)o.issueBy=remap(o.issueBy)[0];
 }
 for(const e of w.events)if(e.actor===oldSupplier){e.actor=partner;e.role='partner';}
 for(const r of w.receipts)if(r.owner===oldSupplier)r.owner=partner;
 // Give the Jaipur seller an actionable quote from the merged supply partner.
 const request=w.rfqs.find(r=>r.owner===seller&&r.status==='open'&&r.title==='Plain cotton tote bags');
 if(request&&!request.quotes.some(q=>q.owner===partner))request.quotes.push({id:crypto.randomUUID(),owner:partner,price:7500,dispatchFrom:new Date(now+2*86400000).toISOString().slice(0,10),dispatchTo:new Date(now+4*86400000).toISOString().slice(0,10),note:'Standard packing included',at:now});
 w.personaVersion=3;return true;
}
