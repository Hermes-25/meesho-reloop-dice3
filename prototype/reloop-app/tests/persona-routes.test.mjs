import test from 'node:test';import assert from 'node:assert/strict';import {workspaceLinks,homePath,routeAllowed} from '../src/workspace-model.mjs';import {translateText} from '../src/translations.mjs';
test('seller, partner and operations navigation follows the approved workspaces and denies unrelated routes',()=>{
 const seller={role:'seller'},partner={role:'partner',capabilities:{buy:true,supply:true}},ops={role:'ops'};
 assert.deepEqual(workspaceLinks(seller).slice(0,4).map(x=>x[1]),['Dashboard','My stock','Recovery orders','Source fresh stock']);assert.equal(routeAllowed(seller,'/market'),false);assert.equal(routeAllowed(seller,'/issues'),false);assert.equal(homePath(seller),'/dashboard');assert.equal(homePath(partner),'/dashboard');assert.equal(routeAllowed(ops,'/dashboard'),false);
 assert.equal(routeAllowed(partner,'/source/new'),false);assert.equal(routeAllowed(partner,'/inventory/new'),false);assert.equal(routeAllowed(partner,'/market'),true);assert.equal(routeAllowed({...partner,capabilities:{buy:false}},'/market'),false);
 assert.deepEqual(workspaceLinks(ops).slice(0,4).map(x=>x[1]),['Dashboard','Lots & auctions','Procurement oversight','Issues & settlements']);assert.equal(homePath(ops),'/operations');
 for(const me of [seller,partner,ops])for(const [,label]of workspaceLinks(me))assert.match(translateText(label,'hi'),/[\u0900-\u097f]/,label);
});
