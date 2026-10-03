// Additive demo-only upgrade. Never resets IDs, bids, orders, uploads or receipts.
import {catalogProducts as products,catalogCities as cities,productForTitle,stateForCity} from './demo-catalog.mjs';
import {cost} from './app-domain.mjs';
const oldPhoto=id=>/^00000000-0000-4000-8000-00000000000[123]$/.test(id);
export function expandDemo(world,space,now=Date.now()){
 if(world.demoCatalogVersion>=2)return false;
 const actor=role=>space+':'+role,day=86400000,later=n=>new Date(now+n*day).toISOString().slice(0,10);
 for(const s of world.stocks){const p=productForTitle(s.title);if(p&&s.photos.every(oldPhoto)){s.photos=[p.photoId];s.catalogCode=p.code;s.sampleImage=true;if(s.description.startsWith('Illustrative demo stock.'))s.description=p.description}s.state??=stateForCity(s.city)}
 for(const l of world.lots){l.state??=stateForCity(l.city);const p=productForTitle(l.title);if(p&&l.members.every(m=>m.photos.every(oldPhoto))){l.catalogCode=p.code;l.sampleImage=true;if(l.description.startsWith('Illustrative demo stock.'))l.description=p.description;for(const m of l.members){m.photos=[p.photoId];if(m.description?.startsWith('Illustrative demo stock.'))m.description=p.description}}}
 for(const o of world.orders)for(const m of o.members){const s=world.stocks.find(x=>x.id===m.stockId);if(s?.sampleImage&&m.photos?.every(oldPhoto))m.photos=[...s.photos]}
 function listing(index,status='open',age=2){const p=products[index%products.length],location=cities[index%cities.length],q=[60,80,100,120,160,200][Math.floor(index/products.length)%6],id=crypto.randomUUID(),stockId=crypto.randomUUID();
  const s={id:stockId,owner:actor('seller'),...p,...location,qty:q,reserve:p.reserve,moq:50,photos:[p.photoId],sampleImage:true,catalogCode:p.code,status:'published',lotId:id,createdAt:now-age*day};delete s.photoId;delete s.image;world.stocks.push(s);
  const l={id,key:id,title:p.title,description:p.description,category:p.category,condition:p.condition,city:location.city,state:location.state,moq:50,members:[{stockId,owner:s.owner,qty:q,reserve:p.reserve,description:p.description,photos:s.photos}],bids:[],status,createdAt:s.createdAt,catalogCode:p.code,sampleImage:true};world.lots.push(l);return l;
 }
 function recovery(index,status,age){const l=listing(index,'awarded',age+4),q=l.members[0].qty,price=l.members[0].reserve+100+(index%5)*120,id=crypto.randomUUID();l.orderId=id;l.bids=[{id:crypto.randomUUID(),owner:actor('buyer'),price,at:now-(age+3)*day}];const o={id,kind:'recovery',ref:l.id,buyer:actor('buyer'),members:structuredClone(l.members),unitPrice:price,qty:q,originalQty:q,cost:cost(q,price),status,createdAt:now-(age+3)*day,updatedAt:now-age*day};
  if(status!=='awaiting_payment')o.payment={mode:'test',id:'demo-payment-'+id,amount:o.cost.total,at:now-(age+2)*day};
  if(!['awaiting_payment'].includes(status))o.pickups={[actor('seller')]:{date:later(1),window:'10 AM – 1 PM'}};
  if(['review','ready_dispatch','shipped','delivered','settled'].includes(status)){o.inspection=[{stockId:l.members[0].stockId,owner:actor('seller'),qty:status==='review'?q-4:q}];o.proposedQty=o.inspection[0].qty;o.inspectionNote='Sample inspection: count and visible condition checked.';o.acceptances=status==='review'?[]:[actor('buyer'),actor('seller')];if(status!=='review'){o.qty=o.proposedQty;o.cost=cost(o.qty,price);o.refund=o.payment.amount-o.cost.total}}
  if(['shipped','delivered','settled'].includes(status))o.tracking='DEMO-'+id.slice(0,8);
  if(['delivered','settled'].includes(status))o.deliveredAt=now-(age+.5)*day;
  if(status==='settled'){o.settledAt=now-age*day;o.settlements=[{owner:actor('seller'),qty:o.qty,amount:o.cost.goods}]}
  world.orders.push(o);world.events.push({id:crypto.randomUUID(),entity:id,actor:actor('ops'),role:'ops',message:'Sample order ready for review',at:o.updatedAt});return o;
 }
 // Existing eight open fixtures + 28 additions = 36 in a fresh demo.
 for(let i=0;i<28;i++){const l=listing(i);if(i%4===0)l.bids.push({id:crypto.randomUUID(),owner:actor('buyer'),price:l.members[0].reserve+200,at:now-3600000})}
 // Keep an explicit sparse-evidence case for accessories; other categories can demonstrate comparisons.
 for(let i=0;i<72;i++)if(i%12!==11)recovery(i,'settled',1+i%27);
 for(let i=12;i<18;i++)recovery(i,['pickup','review','ready_dispatch','shipped','delivered','awaiting_payment'][i-12],.2+i/30);
 for(let i=1;i<=6;i++){const p=products[(i*2)%12],loc=cities[(i*3)%18],id=crypto.randomUUID(),r={id,owner:actor(i===6?'buyer':'seller'),title:p.title,description:p.description,category:p.category,city:loc.city,state:loc.state,qty:100+i*25,neededBy:later(12+i),quotes:[],status:'open',createdAt:now-i*3600000};if(i<=2)r.quotes.push({id:crypto.randomUUID(),owner:actor('supplier'),price:p.reserve+2200,dispatchTo:later(6+i),dispatchFrom:later(5+i),note:'Sample quote: standard packing included; final quantity confirmed before dispatch.',at:now});world.rfqs.push(r)}
 world.demoCatalogVersion=2;return true;
}
