import {env,pipeline} from './vendor/transformers.min.js';
import {photoLabel,expandPhotoScores} from './matching.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths='/vendor/';
env.backends.onnx.wasm.numThreads=1;
let semantic,visual;const cache=new Map();
let announced=false;const progress=d=>{if(!announced&&['progress','initiate'].includes(d.status)){announced=true;postMessage({status:'Preparing your search… This may take a moment the first time.'})}};
self.onmessage=async({data})=>{try{
 const {mode,query,image,candidates}=data;if(!candidates?.length)throw new Error('No eligible stock is available.');let results;
 if(mode==='text'){
  if(!semantic)semantic=await pipeline('feature-extraction','Xenova/multilingual-e5-small',{dtype:'q8',device:'wasm',progress_callback:progress});
  postMessage({status:'Understanding your request and comparing available stock…'});
  const q=await semantic('query: '+query,{pooling:'mean',normalize:true});
  const v=q.data;results=[];
  for(const c of candidates){let b=cache.get(c.text);if(!b){const x=await semantic('passage: '+c.text,{pooling:'mean',normalize:true});b=Array.from(x.data);cache.set(c.text,b)}results.push({id:c.id,score:b.reduce((s,x,i)=>s+x*v[i],0)})}
 }else{
  if(!visual)visual=await pipeline('zero-shot-image-classification','Xenova/clip-vit-base-patch32',{dtype:'q8',device:'wasm',progress_callback:progress});
  postMessage({status:'Comparing the photo with eligible stock descriptions…'});
  const labels=[...new Set(candidates.map(photoLabel))];
  const scores=await visual(image,labels);results=expandPhotoScores(candidates,scores);
 }
 results.sort((a,b)=>b.score-a.score);postMessage({results});
 }catch(e){postMessage({error:'Matching could not finish. Please try again or type a simpler search.'})}};
