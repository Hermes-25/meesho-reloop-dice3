import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {translateText} from '../src/translations.mjs';
test('separately deployed UI and API use the same financial visibility contract',async()=>{
 const [client,server]=await Promise.all([readFile(new URL('../src/order-financials.mjs',import.meta.url),'utf8'),readFile(new URL('../../reloop-shared-review/order-financials.mjs',import.meta.url),'utf8')]);assert.equal(client,server);
});
test('checkout and payout labels remain available in Hindi',()=>{
 for(const text of ['Your earnings','Your goods value','Your payment summary','Supplier fee · 4.5%','Item subtotal','You receive','Total payable','Fee details','Payout details','Your revised earnings','No payout — order cancelled'])assert.match(translateText(text,'hi'),/[\u0900-\u097F]/,text);
});
