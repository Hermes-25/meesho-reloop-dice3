import {categories,catalogCities,stateForCity} from './demo-catalog.mjs';
export const partnerRole=u=>['partner','buyer','supplier'].includes(u.role);
export function accountView(w,u){
 if(!partnerRole(u))return {...u,capabilities:{buy:false,supply:false}};
 const saved=w?.partnerProfiles?.[u.id];
 const defaults={buy:u.role==='buyer'||u.role==='partner',supply:u.role==='supplier',categories:[],states:[],capacity:0,...u.capabilities,...u.supplyProfile};
 const p={...defaults,...saved};
 return {...u,role:'partner',capabilities:{buy:!!p.buy,supply:!!p.supply},supplyProfile:{categories:p.categories,states:p.states,capacity:p.capacity}};
}
export const canBuy=u=>u.role==='buyer'||u.role==='partner'&&u.capabilities?.buy===true;
export const canSupply=u=>u.role==='supplier'||u.role==='partner'&&u.capabilities?.supply===true;
export function matchesSupply(u,r){const p=u.supplyProfile;if(!p)return u.role==='supplier';return canSupply(u)&&p.categories.includes(r.category)&&p.states.includes(r.state||stateForCity(r.city))&&r.qty<=p.capacity;}
export function validatePartner(c){
 const fail=()=>{throw Object.assign(new Error('Choose a buying or supplying capability and complete your supply coverage.'),{status:400})};
 if(typeof c.buy!=='boolean'||typeof c.supply!=='boolean'||!c.buy&&!c.supply)fail();
 const list=(v,allowed)=>Array.isArray(v)&&v.length<=allowed.length&&new Set(v).size===v.length&&v.every(x=>allowed.includes(x));
 const states=[...new Set(catalogCities.map(x=>x.state))];
 if(!list(c.categories,categories)||!list(c.states,states))fail();
 if(c.supply&&(!c.categories.length||!c.states.length||!Number.isSafeInteger(c.capacity)||c.capacity<1||c.capacity>10000))fail();
 return {buy:c.buy,supply:c.supply,categories:c.categories,states:c.states,capacity:c.supply?c.capacity:0};
}
