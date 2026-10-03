import test from 'node:test';
import assert from 'node:assert/strict';
import {photoLabel,expandPhotoScores} from '../public/matching.js';
test('duplicate descriptions retain every eligible lot after photo ranking',()=>{const candidates=[{id:'a',text:'Tan bag'},{id:'b',text:'Tan bag'},{id:'c',text:'Water bottle'}];const scores=[{label:photoLabel(candidates[0]),score:.9},{label:photoLabel(candidates[2]),score:.1}];const ranked=expandPhotoScores(candidates,scores);assert.deepEqual(ranked.map(x=>x.id),['a','b','c']);assert.equal(ranked[0].score,ranked[1].score)});
