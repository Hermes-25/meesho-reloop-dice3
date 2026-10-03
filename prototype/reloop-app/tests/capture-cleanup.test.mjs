import test from 'node:test';
import assert from 'node:assert/strict';
import {releaseCapture} from '../src/capture-cleanup.mjs';
test('microphone tracks close even when recorder construction or stop fails',()=>{
 let stopped=0;const stream={getTracks:()=>[{stop(){stopped++}},{stop(){stopped++}}]};releaseCapture(undefined,stream);assert.equal(stopped,2);
 const recorder={state:'recording',onstop:()=>assert.fail('must not transcribe cancelled audio'),onerror(){},ondataavailable(){},stop(){throw Error('recorder failed')}};releaseCapture(recorder,stream);assert.equal(stopped,4);assert.equal(recorder.onstop,null);assert.equal(recorder.onerror,null);assert.equal(recorder.ondataavailable,null);
});
