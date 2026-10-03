import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
import {translateText} from '../src/translations.mjs';
import {catalogProducts,catalogCities} from '../src/catalog.mjs';
import backend from '../src/data/india-map.json' with {type:'json'};
test('Hindi covers catalogue and status language without changing unknown user text or numeric values',()=>{
 for(const text of ['Record settlement','Submit quote','Your bid is saved.','Keep stock moving. Clear the holds first.',...catalogProducts.map(p=>p.title),...catalogCities.flatMap(c=>[c.city,c.state])])assert.match(translateText(text,'hi'),/[\u0900-\u097F]/,text);
 assert.equal(translateText('My custom SKU AB-178','hi'),'My custom SKU AB-178');assert.equal(translateText('₹85.00','hi'),'₹85.00');assert.equal(translateText('Orders','en'),'Orders');assert.equal(translateText('  36 matching lots ','hi'),'  36 मिलते-जुलते लॉट ');
});
test('every catalogue photo is present and every sample city has a map point; both services share the same catalogue',()=>{
 for(const p of catalogProducts){assert.ok(existsSync(new URL('../public'+p.image,import.meta.url)),p.code);assert.ok(existsSync(new URL('../public'+p.image.replace(/\.png$/,'.jpg'),import.meta.url)),p.code+' web image');}
 for(const c of catalogCities)assert.ok(backend.positions[c.city],c.city);
 assert.equal(readFileSync(new URL('../src/catalog.mjs',import.meta.url),'utf8'),readFileSync(new URL('../../reloop-shared-review/demo-catalog.mjs',import.meta.url),'utf8'));
});
