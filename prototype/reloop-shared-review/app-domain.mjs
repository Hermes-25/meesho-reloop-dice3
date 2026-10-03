import {categories} from './demo-catalog.mjs';
import {orderFinancialView,financialEventView} from './order-financials.mjs';
import {accountView,canBuy,canSupply,matchesSupply,partnerRole,validatePartner} from './partner-access.mjs';
import {makeOffer,latestOffer,checkLive,checkRevision,negotiate} from './negotiation.mjs';
// Server-authoritative marketplace commands. Money is stored as integer paise.
export const emptyMarket=()=>({stocks:[],lots:[],rfqs:[],orders:[],events:[],receipts:[]});
const fail=(s)=>{throw Object.assign(new Error(s),{status:400})};
const text=(v,min=1,max=300)=>{if(typeof v!=='string'||v.trim().length<min||v.length>max)fail('Please complete the required details.');return v.trim()};
const integer=(v,min,max)=>{if(!Number.isSafeInteger(v)||v<min||v>max)fail('Check the quantity or amount.');return v};
const member=(u,roles)=>{if(!roles.includes(u.role))throw Object.assign(new Error('Your account cannot perform this action.'),{status:403})};
const find=(arr,id)=>arr.find(x=>x.id===id)||fail('This record was not found.');
const own=(v,u)=>{if(v.owner!==u.id)throw Object.assign(new Error('This record belongs to another account.'),{status:403});return v};
const currency=(v)=>integer(v,100,100000000);
const date=(v,now)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(v||'')||!Number.isFinite(Date.parse(v))||Date.parse(v)+86400000<now)fail('Choose a valid date, today or later.');return v};
export const cost=(units,unitPrice,kind='recovery')=>{const goods=units*unitPrice,logistics=units*800;if(kind==='source'){const supplierFee=Math.round(goods*45/1000);return {goods,premium:0,logistics,total:goods+logistics,supplierFee,supplierNet:goods-supplierFee,pricingModel:'source-supplier-4.5-v1'}}const premium=Math.round(goods*.125);return {goods,premium,logistics,total:goods+premium+logistics}};
// Upgrade only unpaid Source orders. Paid/cancelled history and all ReLoop records stay intact.
export function upgradeSourcePricing(w){let changed=false;for(const o of w.orders)if(o.kind==='source'&&o.status==='awaiting_payment'&&!o.payment&&o.cost.pricingModel!=='source-supplier-4.5-v1'){o.cost=cost(o.qty,o.unitPrice,'source');changed=true}return changed}
export const lotQty=l=>l.members.reduce((n,m)=>n+m.qty,0);
export const lotFloor=l=>Math.max(...l.members.map(m=>m.reserve));
const recordEvent=(w,u,entity,message,now,id)=>w.events.push({id,entity,actor:u.id,role:u.role,message,at:now});
export function executeMarket(input,user,c,id,now=Date.now()){
 const w=structuredClone(input),prior=w.receipts.find(r=>r.id===id&&r.owner===user.id);if(prior)return {world:input,result:prior.result,replayed:true};
 if(!c||typeof c.type!=='string')fail('Choose an action.');user=accountView(w,user);let result={},entity='',message='',audience;
 const addOrder=(kind,ref,buyer,members,unitPrice,qty)=>{const order={id:crypto.randomUUID(),kind,ref,buyer,members,unitPrice,qty,originalQty:qty,status:'awaiting_payment',cost:cost(qty,unitPrice,kind),createdAt:now,acceptances:[],issue:'',payment:null};w.orders.push(order);return order};
 switch(c.type){
 case 'partner.configure':{
  if(!partnerRole(user))member(user,['partner']);w.partnerProfiles??={};w.partnerProfiles[user.id]=validatePartner(c);entity=user.id;message='Business capabilities and supply coverage updated';audience=[user.id];break;
 }
 case 'stock.update':
 case 'stock.create':{
  member(user,['seller']);const existing=c.type==='stock.update'?own(find(w.stocks,c.id),user):null;if(existing&&existing.status!=='draft')fail('Only a draft can be edited.');if(!existing&&w.stocks.filter(x=>x.owner===user.id&&(!user.demo||!x.sampleImage)).length>=100)fail('This account has reached its 100-listing limit.');
  const category=text(c.category),condition=text(c.condition);if(!categories.includes(category)||!['Unused surplus','Minor visible wear','Repair required'].includes(condition))fail('Choose a category and condition.');
  const photos=c.photos;if(!Array.isArray(photos)||photos.length!==3||new Set(photos).size!==3)fail('Add three different photos: front, defect or detail, and full stock.');
  if(c.ownership!==true||c.noOpenClaim!==true)fail('Confirm ownership and resolve any pending return or compensation claim first.');
  const stock={id:existing?.id||crypto.randomUUID(),owner:user.id,title:text(c.title,3,100),description:text(c.description,10,1000),category,condition,city:text(c.city,2,60),qty:integer(c.qty,1,10000),reserve:currency(c.reserve),moq:integer(c.moq,1,10000),photos,status:'draft',createdAt:existing?.createdAt||now};
  if(existing){w.stocks[w.stocks.indexOf(existing)]=stock}else w.stocks.push(stock);result={id:stock.id};entity=stock.id;message=existing?'Stock draft reviewed and updated':'Stock draft created';break;
 }
 case 'stock.publish':{
  member(user,['seller']);const s=own(find(w.stocks,c.id),user);if(s.status!=='draft')fail('Only a draft can be published.');if(s.reviewAfterCancellation)fail('Review and save this returned stock draft before publishing again.');
  const key=[s.title.toLocaleLowerCase(),s.category,s.condition,s.city.toLocaleLowerCase(),s.moq].join('|');
  let lot=w.lots.find(l=>l.key===key&&['forming','open'].includes(l.status)&&l.bids.length===0);
  if(!lot){lot={id:crypto.randomUUID(),key,title:s.title,description:s.description,category:s.category,condition:s.condition,city:s.city,moq:s.moq,members:[],bids:[],status:'forming',createdAt:now};w.lots.push(lot)}
  lot.members.push({stockId:s.id,owner:s.owner,qty:s.qty,reserve:s.reserve,description:s.description,photos:s.photos});lot.status=lotQty(lot)>=lot.moq?'open':'forming';s.status='published';s.lotId=lot.id;result={id:lot.id};entity=lot.id;message='Stock added to a compatible recovery lot';break;
 }
 case 'stock.withdraw':{
  const s=own(find(w.stocks,c.id),user);if(s.status!=='published')fail('This stock is not listed.');const l=find(w.lots,s.lotId);if(l.bids.length||!['open','forming'].includes(l.status))fail('A bid or commitment already exists; stock is locked.');l.members=l.members.filter(m=>m.stockId!==s.id);l.status=l.members.length?(lotQty(l)>=l.moq?'open':'forming'):'withdrawn';s.status='withdrawn';entity=l.id;message='Uncommitted stock withdrawn';break;
 }
 case 'bid.place':{
  if(!canBuy(user))member(user,[]);const l=find(w.lots,c.id);if(l.status!=='open'||lotQty(l)<l.moq||l.members.some(m=>m.owner===user.id))fail('This lot is not available for your bid.');
  const price=currency(c.price),best=Math.max(0,...l.bids.map(b=>b.price));if(price<lotFloor(l)||price<=best)fail('Your bid must meet every seller’s minimum and exceed the current bid.');
  l.bids.push({id:crypto.randomUUID(),owner:user.id,price,at:now});entity=l.id;message='New recovery bid received';break;
 }
 case 'auction.close':{
  member(user,['ops']);const l=find(w.lots,c.id);if(l.status!=='open'||!l.bids.length)fail('An open lot with at least one bid is required.');const bid=[...l.bids].sort((a,b)=>b.price-a.price||a.at-b.at)[0];
  const order=addOrder('recovery',l.id,bid.owner,l.members,bid.price,lotQty(l));l.status='awarded';l.orderId=order.id;result={id:order.id};entity=order.id;message='Auction closed; highest valid bid awarded';break;
 }
 case 'order.pay':{
  const o=find(w.orders,c.id);if(o.buyer!==user.id||o.status!=='awaiting_payment')fail('This order cannot be paid by this account.');o.payment={mode:'test',id:'test_'+crypto.randomUUID(),amount:o.cost.total,at:now};o.status=o.kind==='recovery'?'pickup':'fulfilment';entity=o.id;message='Test payment recorded; no money charged';break;
 }
 case 'pickup.book':{
  const o=find(w.orders,c.id);if(o.status!=='pickup'||!o.members.some(m=>m.owner===user.id))fail('Pickup availability can only be set for your paid stock.');const window=String(c.window||'').replace(/\s*-\s*/g,' – ');if(!['10 AM – 1 PM','2 PM – 5 PM'].includes(window))fail('Choose an available pickup window.');o.pickups={...o.pickups,[user.id]:{date:date(c.date,now),window,at:now}};entity=o.id;message='Seller availability confirmed; Meesho operations coordinates pickup';break;
 }
 case 'order.comparison':{
  const o=find(w.orders,c.id);if(o.kind!=='recovery'||o.buyer!==user.id||o.status==='cancelled')fail('Only the recovery buyer can save a comparison for this order.');
  if(c.clear===true){delete o.buyerComparison}else{if(c.comparable!==true||!['Supplier quote','Recent purchase'].includes(c.basis))fail('Confirm a like-for-like landed-price comparison.');if(c.quantity!==o.qty)fail('The order quantity changed. Refresh and confirm your comparison again.');o.buyerComparison={unitPrice:currency(c.unitPrice),basis:c.basis,quantity:o.qty,at:now,comparable:true};}
  entity=o.id;message='Your purchase comparison updated';audience=[user.id];break;
 }
 case 'inspection.submit':{
  member(user,['ops']);const o=find(w.orders,c.id);if(o.kind!=='recovery'||o.status!=='pickup'||o.members.some(m=>!o.pickups?.[m.owner]))fail('Every seller must book pickup before inspection.');
  if(!Array.isArray(c.accepted)||c.accepted.length!==o.members.length)fail('Enter the accepted quantity for each contribution.');
  o.inspection=o.members.map(m=>({stockId:m.stockId,owner:m.owner,qty:integer(c.accepted.find(x=>x.stockId===m.stockId)?.qty,0,m.qty)}));
  o.proposedQty=o.inspection.reduce((n,m)=>n+m.qty,0);o.inspectionNote=text(c.note,5,1000);o.status='review';o.acceptances=[];entity=o.id;message='Inspection recorded; buyer and sellers must accept before dispatch';break;
 }
 case 'inspection.accept':{
  const o=find(w.orders,c.id);if(o.status!=='review'||(o.buyer!==user.id&&!o.members.some(m=>m.owner===user.id)))fail('No inspection decision is waiting for you.');
  if(!o.proposedQty)fail('No accepted stock remains; cancel this order.');if(!o.acceptances.includes(user.id))o.acceptances.push(user.id);
  const parties=[o.buyer,...new Set(o.members.map(m=>m.owner))];if(parties.every(p=>o.acceptances.includes(p))){o.qty=o.proposedQty;o.cost=cost(o.qty,o.unitPrice);o.refund=o.payment.amount-o.cost.total;o.status='ready_dispatch'}entity=o.id;message='Revised inspection explicitly accepted';break;
 }
 case 'order.cancel':{
  const o=find(w.orders,c.id);if(o.buyer!==user.id&&user.role!=='ops')fail('Only the buyer or operations can cancel.');if(!['awaiting_payment','review'].includes(o.status))fail('Raise an issue for an order already in progress.');o.status='cancelled';o.refund=o.payment?.amount||0;
  if(o.kind==='recovery'){find(w.lots,o.ref).status='cancelled';for(const m of o.members){const s=find(w.stocks,m.stockId);s.status='draft';s.reviewAfterCancellation=true;delete s.lotId}}else{const r=find(w.rfqs,o.ref);r.status='open';delete r.orderId;const q=r.quotes.find(q=>q.id===o.agreedOffer?.quoteId);if(q?.state==='accepted')q.state='active';}
  entity=o.id;message='Order cancelled; full test refund recorded and stock released for review';break;
 }
 case 'order.dispatch':{
  const o=find(w.orders,c.id);if(o.kind==='recovery'){member(user,['ops']);if(o.status!=='ready_dispatch')fail('All parties must accept inspection first.')}else if(!o.members.some(m=>m.owner===user.id)||o.status!=='fulfilment')fail('This supplier order cannot be dispatched.');
  o.tracking=text(c.tracking,3,120);o.status='shipped';entity=o.id;message='Test dispatch recorded';break;
 }
 case 'order.receive':{
  const o=find(w.orders,c.id);if(o.buyer!==user.id||o.status!=='shipped')fail('Only the buyer can confirm a shipped order.');o.status='delivered';o.deliveredAt=now;entity=o.id;message='Buyer confirmed receipt';break;
 }
 case 'order.issue':{
  const o=find(w.orders,c.id);if(o.buyer!==user.id&&!o.members.some(m=>m.owner===user.id))fail('This order belongs to other users.');if(['settled','cancelled','awaiting_payment'].includes(o.status))fail('This order cannot receive a delivery issue.');o.issue=text(c.note,5,1000);o.issueBy=user.id;entity=o.id;message='Issue raised; settlement is on hold';break;
 }
 case 'order.resolve':{
  member(user,['ops']);const o=find(w.orders,c.id);if(!o.issue)fail('There is no open issue.');o.resolution=text(c.note,5,1000);o.issue='';entity=o.id;message='Operations recorded an issue resolution';break;
 }
 case 'order.settle':{
  member(user,['ops']);const o=find(w.orders,c.id);if(o.status!=='delivered'||o.issue)fail('Confirm delivery and resolve every issue before settlement.');o.status='settled';let remainingFee=o.cost.supplierFee||0;const rows=o.inspection||o.members;o.settlements=rows.map((m,i)=>{const gross=m.qty*o.unitPrice,fee=i===rows.length-1?remainingFee:Math.round((o.cost.supplierFee||0)*gross/o.cost.goods);remainingFee-=fee;return {owner:m.owner,qty:m.qty,amount:gross-fee,...(o.cost.pricingModel==='source-supplier-4.5-v1'?{gross,supplierFee:fee}:{})}});entity=o.id;message=o.cost.pricingModel==='source-supplier-4.5-v1'?'Test settlement recorded; supplier receives goods value less the 4.5% supplier fee':'Test settlement recorded; seller receives the cleared product value';break;
 }
 case 'rfq.create':{
  member(user,['seller']);if(!categories.includes(c.category))fail('Choose a category and condition.');const r={id:crypto.randomUUID(),owner:user.id,title:text(c.title,3,100),description:text(c.description,10,1000),category:text(c.category),city:text(c.city,2,60),qty:integer(c.qty,1,10000),neededBy:date(c.neededBy,now),quotes:[],status:'open',createdAt:now};w.rfqs.push(r);entity=r.id;result={id:r.id};message='Fresh-stock request published';break;
 }
 case 'quote.submit':{
  if(!canSupply(user))member(user,[]);const r=find(w.rfqs,c.id);if(r.status!=='open'||r.owner===user.id||!matchesSupply(user,r))fail('This request is outside your supply categories, coverage or capacity.');
  if(r.quotes.some(q=>q.owner===user.id))fail('You have already quoted on this request.');
  const offer=makeOffer({...c,qty:c.qty??r.qty},user,r,1,now);if(offer.qty>(user.supplyProfile?.capacity||0))fail('This quantity exceeds your supply capacity.');
  r.quotes.push({id:crypto.randomUUID(),owner:user.id,price:offer.price,dispatchFrom:offer.dispatchFrom,dispatchTo:offer.dispatchTo,at:now,offers:[offer],state:'active'});entity=r.id;audience=[r.owner,user.id];message='Supplier quote received';break;
 }
 case 'quote.counter':case 'quote.agree':case 'quote.decline':case 'quote.clarify':{
  const n=negotiate(w,user,c,now);if(user.id===n.quote.owner&&['quote.counter','quote.agree'].includes(c.type)&&!canSupply(user))member(user,[]);if(['quote.counter','quote.agree'].includes(c.type)&&user.id===n.quote.owner&&latestOffer(n.quote,n.request).qty>(user.supplyProfile?.capacity||0))fail('This quantity exceeds your supply capacity.');
  entity=n.request.id;audience=n.audience;message=({'quote.counter':'A private counteroffer was sent','quote.agree':'Supplier agreed; requester can review checkout','quote.decline':'Offer declined','quote.clarify':'Private clarification saved'})[c.type];break;
 }
 case 'quote.accept':{
  member(user,['seller']);const r=own(find(w.rfqs,c.id),user);if(r.status!=='open')fail('A quote has already been selected.');const q=find(r.quotes,c.quoteId),offer=latestOffer(q,r);checkRevision(q,r,c);checkLive(q,r,now);
  if(offer.side==='requester'&&!(q.state==='agreed'&&q.agreedRevision===offer.revision))fail('The supplier must agree to your counteroffer before checkout.');
  date(r.neededBy,now);date(offer.dispatchFrom,now);date(offer.dispatchTo,now);const o=addOrder('source',r.id,user.id,[{owner:q.owner,qty:offer.qty,photos:[]}],offer.price,offer.qty);o.title=r.title;o.dispatchFrom=offer.dispatchFrom;o.dispatchTo=offer.dispatchTo;o.agreedOffer={quoteId:q.id,...structuredClone(offer)};q.state='accepted';r.status='ordered';r.orderId=o.id;entity=o.id;result={id:o.id};message='Supplier quote accepted; awaiting test payment';break;
 }
 default:fail('This action is not supported.');
 }
 const changed=w.orders.find(o=>o.id===entity);if(changed){changed.updatedAt=now;if(c.type==='order.settle')changed.settledAt=now;if(c.type==='order.issue')changed.issueAt=now;}
 recordEvent(w,user,entity,message,now,id);if(audience)w.events.at(-1).audience=audience;w.receipts.push({id,owner:user.id,result});if(w.receipts.length>1000)w.receipts.shift();if(w.events.length>5000)w.events.shift();return {world:w,result};
}
export function priceEvidence(w,l,now=Date.now()){
 const tokens=s=>new Set(s.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu,' ').split(/\s+/).filter(x=>x.length>2&&!['with','mixed','demo','stock'].includes(x)));
 const target=tokens(l.title),q=lotQty(l);
 const rows=w.orders.filter(o=>{const other=w.lots.find(x=>x.id===o.ref);return o.kind==='recovery'&&o.status==='settled'&&o.settledAt>=now-90*86400000&&other&&other.category===l.category&&other.condition===l.condition&&o.qty>=q/2&&o.qty<=q*2&&[...tokens(other.title)].some(t=>target.has(t))});
 if(rows.length<5)return {count:rows.length,ready:false};const values=rows.map(o=>o.unitPrice).sort((a,b)=>a-b),quantile=p=>values[Math.floor((values.length-1)*p)];
 return {count:rows.length,ready:true,low:quantile(.25),median:quantile(.5),high:quantile(.75)};
}
export function visibleMarket(w,u){
 u=accountView(w,u);
 const ops=u.role==='ops',mine=o=>o.buyer===u.id||o.members.some(m=>m.owner===u.id);
 const label=id=>w.businesses?.[id]?.business||'Seller '+id.slice(-6);
 const stocks=w.stocks.filter(s=>ops||s.owner===u.id).map(s=>({...s,business:label(s.owner)}));
 const lots=w.lots.filter(l=>(ops||l.status!=='withdrawn'||l.members.some(m=>m.owner===u.id))&&(ops||canBuy(u)||l.members.some(m=>m.owner===u.id)||w.orders.some(o=>o.ref===l.id&&mine(o)))).map(l=>({...l,members:l.members.map(m=>({...m,business:label(m.owner)})),bids:l.bids.filter(b=>ops||b.owner===u.id||l.members.some(m=>m.owner===u.id)),highestBid:Math.max(0,...l.bids.map(b=>b.price)),bidCount:l.bids.length,...(canBuy(u)?{priceEvidence:priceEvidence(w,l)}:{})}));
 const orders=w.orders.filter(o=>ops||mine(o)).map(o=>orderFinancialView(o,u));
 const rfqs=w.rfqs.filter(r=>ops||r.owner===u.id||r.quotes.some(q=>q.owner===u.id)||r.status==='open'&&matchesSupply(u,r)).map(r=>({...r,business:label(r.owner),quotes:r.quotes.filter(q=>ops||r.owner===u.id||q.owner===u.id).map(q=>({...q,offers:q.offers||[latestOffer(q,r)]}))}));
 const ids=new Set([...stocks,...lots,...orders,...rfqs].map(x=>x.id));
 ids.add(u.id);return {stocks,lots,orders,rfqs,events:w.events.filter(e=>ids.has(e.entity)&&(!e.audience||ops||e.audience.includes(u.id))).slice(-150).map(e=>financialEventView(e,w.orders.find(o=>o.id===e.entity),u))};
}
