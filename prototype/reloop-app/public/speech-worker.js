import {env,pipeline} from './vendor/transformers.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.wasmPaths='/vendor/';
env.backends.onnx.wasm.numThreads=1;
let recognizer;
self.onmessage=async({data})=>{try{
 if(!recognizer)recognizer=await pipeline('automatic-speech-recognition','Xenova/whisper-base',{dtype:'q8',device:'wasm',progress_callback:p=>{if(p.status==='progress')postMessage({status:'Downloading voice model · '+Math.round(p.progress||0)+'% of current file'})}});
 postMessage({status:'Transcribing on this device…'});
 const options={task:'transcribe',...(data.language==='en'?{language:'english'}:data.language==='hi'?{language:'hindi'}:{})};
 const result=await recognizer(data.audio,options);postMessage({text:result.text?.trim()||''});
 }catch(e){postMessage({error:'On-device voice could not finish. Try browser voice or type your search. '+(e.message||'')})}};
