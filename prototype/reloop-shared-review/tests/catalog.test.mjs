import test from 'node:test';
import assert from 'node:assert/strict';
import {seedDemo,demoProfile} from '../app-demo.mjs';
import {expandDemo} from '../demo-expand.mjs';
import {catalogProducts,catalogPhoto} from '../demo-catalog.mjs';
import {emptyMarket,executeMarket,visibleMarket} from '../app-domain.mjs';
const now=Date.now(),space='catalog-test';
test('expanded demo offers diverse searchable stock, mapped photos and honest dense/sparse price evidence',()=>{
 const w=seedDemo(space,now),v=visibleMarket(w,demoProfile({space_id:space,role:'buyer'})),open=v.lots.filter(l=>l.status==='open');
 assert.equal(open.length,36);assert.equal(new Set(open.map(l=>l.title)).size,12);assert.equal(new Set(open.map(l=>l.city)).size,18);assert.equal(new Set(open.map(l=>l.state)).size,18);assert.equal(new Set(open.map(l=>l.category)).size,6);
 assert.ok(w.stocks.every(s=>s.photos.every(id=>catalogPhoto(id))));assert.ok(open.some(l=>l.priceEvidence.ready));assert.ok(open.some(l=>!l.priceEvidence.ready));
 assert.ok(w.rfqs.length>=7);assert.ok(w.rfqs.flatMap(r=>r.quotes).every(q=>q.dispatchFrom<=q.dispatchTo&&q.note));
});
test('additive upgrade keeps existing decisions and uploads; a repeat makes no changes',()=>{
 const w=emptyMarket(),photo=crypto.randomUUID(),id=crypto.randomUUID();
 w.stocks.push({id,owner:space+':seller',title:'My personal item',city:'Jaipur',photos:[photo],description:'User-entered stock data',qty:37,reserve:9123,status:'draft'});
 w.orders.push({id:'existing-order',members:[],qty:17,cost:{total:98765},status:'shipped',tracking:'MY-TRACKING'});w.receipts.push({id:'saved-command',owner:'owner',result:{id}});w.events.push({id:'saved-event',message:'Customer note'});
 const stock=structuredClone(w.stocks[0]),order=structuredClone(w.orders[0]),receipts=structuredClone(w.receipts),event=structuredClone(w.events[0]);
 assert.equal(expandDemo(w,space,now),true);assert.deepEqual(w.stocks[0],{...stock,state:'Rajasthan'});assert.deepEqual(w.orders[0],order);assert.deepEqual(w.receipts,receipts);assert.deepEqual(w.events[0],event);
 const after=JSON.stringify(w);assert.equal(expandDemo(w,space,now),false);assert.equal(JSON.stringify(w),after);
});
test('seeded historical records do not exhaust the demo sellers own listing allowance',()=>{
 const w=seedDemo(space,now),user=demoProfile({space_id:space,role:'seller'});assert.ok(w.stocks.length>100);
 const command={type:'stock.create',title:'My kitchen stock',description:'My unused steel bowls ready for inspection.',category:'Kitchen',condition:'Unused surplus',city:'Jaipur',qty:60,reserve:9500,moq:50,photos:catalogProducts.slice(0,3).map(p=>p.photoId),ownership:true,noOpenClaim:true};
 const next=executeMarket(w,user,command,crypto.randomUUID(),now);assert.equal(next.world.stocks.length,w.stocks.length+1);assert.equal(next.world.stocks.at(-1).title,command.title);
});
