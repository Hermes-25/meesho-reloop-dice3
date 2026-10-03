// Disposable, server-scoped judging workspaces. Never grant access to real operations.
import {emptyMarket,cost} from './app-domain.mjs';
import {hash} from './shared-service.mjs';
import {catalogProducts} from './demo-catalog.mjs';
import {expandDemo} from './demo-expand.mjs';
import {upgradePersonas} from './demo-personas.mjs';
export const demoRoles=['seller','partner','buyer','supplier','ops'];
const legacyPhotos=[1,2,3].map(n=>'00000000-0000-4000-8000-'+String(n).padStart(12,'0'));
export const fixturePhotos=[...legacyPhotos,...catalogProducts.map(p=>p.photoId)];
export const demoCookie=(token,age=86400)=>`reloop_demo=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${age}`;
export function demoProfile(session){const role=['buyer','supplier','partner'].includes(session.role)?'partner':session.role,labels={seller:'Aarohi Retail',partner:'Prakash Wholesale',ops:'Meesho operations · demo'};return {id:session.space_id+':'+(role==='partner'?'buyer':role),username:'demo_'+role,role,business:labels[role],city:'Jaipur',demo:true}}
export async function demoSession(db,request){const token=request.headers.get('Cookie')?.match(/(?:^|;\s*)reloop_demo=([^;]+)/)?.[1];return token?db.prepare('SELECT * FROM app_demo_sessions WHERE id=? AND expires_at>?').bind(await hash(token),Date.now()).first():null}
export function seedDemo(space,now=Date.now()){
 const w=emptyMarket(),day=86400000,actor=r=>space+':'+r,later=n=>new Date(now+n*day).toISOString().slice(0,10);
 const cities=['Jaipur','Surat','Delhi','Mumbai','Bengaluru','Kolkata','Lucknow','Guwahati','Hyderabad','Chennai','Indore','Kochi'];
 const products=[['Tan crossbody bags','Bags','Minor visible wear',8500],['Cotton kurtas · mixed sizes','Clothing','Unused surplus',14500],['School backpacks · navy','Bags','Unused surplus',12000],['Cotton cushion covers','Home','Unused surplus',6500]];
 function listing(i,status='open',age=2){const [title,category,condition,reserve]=products[i%4],city=cities[i%cities.length],id=crypto.randomUUID(),stockId=crypto.randomUUID(),owner=actor('seller'),q=80+(i%5)*20;
  const description='Illustrative demo stock. '+(category==='Bags'?'Mixed pieces; check zips and straps.':'Assorted sizes and colours; inspect before dispatch.')+' Replace sample images with actual stock photos for a new listing.';
  const s={id:stockId,owner,title,description,category,condition,city,qty:q,reserve,moq:50,photos:legacyPhotos,status:'published',lotId:id,createdAt:now-age*day};w.stocks.push(s);
  const l={id,key:id,title,description,category,condition,city,moq:50,members:[{stockId,owner,qty:q,reserve,description,photos:legacyPhotos}],bids:[],status,createdAt:s.createdAt};w.lots.push(l);return l;
 }
 function order(i,status,age){const l=listing(i,'awarded',age+4),price=l.members[0].reserve+500+(i%3)*200,q=l.members[0].qty,id=crypto.randomUUID();l.orderId=id;l.bids=[{id:crypto.randomUUID(),owner:actor('buyer'),price,at:now-(age+3)*day}];
  const o={id,kind:'recovery',ref:l.id,buyer:actor('buyer'),members:structuredClone(l.members),unitPrice:price,qty:q,originalQty:q,cost:cost(q,price),status,createdAt:now-(age+3)*day,updatedAt:now-age*day};
  if(status!=='awaiting_payment')o.payment={mode:'test',id:'demo-payment-'+id,amount:o.cost.total,at:now-(age+2)*day};
  if(!['awaiting_payment'].includes(status))o.pickups={[actor('seller')]:{date:later(1),window:'10 AM – 1 PM'}};
  if(['review','ready_dispatch','shipped','delivered','settled'].includes(status)){o.inspection=[{stockId:l.members[0].stockId,owner:actor('seller'),qty:q-(i%3)*2}];o.proposedQty=o.inspection[0].qty;o.inspectionNote='Illustrative inspection: remove visibly affected pieces; remaining units checked.';o.acceptances=status==='review'?[]:[actor('buyer'),actor('seller')];if(status!=='review'){o.qty=o.proposedQty;o.cost=cost(o.qty,price);o.refund=o.payment.amount-o.cost.total}}
  if(['shipped','delivered','settled'].includes(status))o.tracking='DEMO-'+String(i).padStart(3,'0');
  if(['delivered','settled'].includes(status))o.deliveredAt=now-(age+.5)*day;
  if(status==='settled'){o.settledAt=now-age*day;o.settlements=[{owner:actor('seller'),qty:o.qty,amount:o.cost.goods}]}
  w.orders.push(o);w.events.push({id:crypto.randomUUID(),entity:id,actor:actor('ops'),role:'ops',message:'Illustrative demo record · '+status,at:o.updatedAt});return o;
 }
 for(let i=0;i<8;i++){const l=listing(i);if(i%3===0)l.bids.push({id:crypto.randomUUID(),owner:actor('buyer'),price:l.members[0].reserve+300,at:now-3600000*(i+1)})}
 ['pickup','review','ready_dispatch','delivered','shipped','awaiting_payment','pickup','delivered','review','shipped','pickup','ready_dispatch'].forEach((s,i)=>{const o=order(i,s,.2+i/3);if(i===7)o.issue='Buyer reports two packages missing; verify the handover count.'});
 [24,36,48,25,37,26,38,27].forEach((i,n)=>order(i,['pickup','shipped','delivered','review'][n%4],.4+n/5));
 for(let i=0;i<28;i++)order(i,'settled',1+i);
 w.rfqs.push({id:crypto.randomUUID(),owner:actor('seller'),title:'Plain cotton tote bags',description:'200 natural cotton totes, reinforced handles, no print. Illustrative sourcing request.',category:'Bags',city:'Jaipur',qty:200,neededBy:later(14),quotes:[],status:'open',createdAt:now});
 expandDemo(w,space,now);upgradePersonas(w,space,now);return w;
}
