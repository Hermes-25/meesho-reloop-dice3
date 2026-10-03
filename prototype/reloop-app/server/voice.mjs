const endpoint='https://api.groq.com/openai/v1/audio/transcriptions';
const MAX_BYTES=800044;
export function checkVoiceWav(bytes){
 const b=Buffer.from(bytes);
 if(b.length<9644||b.length>MAX_BYTES||b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WAVE'||b.toString('ascii',12,16)!=='fmt '||b.readUInt32LE(16)!==16||b.readUInt16LE(20)!==1||b.readUInt16LE(22)!==1||b.readUInt32LE(24)!==16000||b.readUInt32LE(28)!==32000||b.readUInt16LE(32)!==2||b.readUInt16LE(34)!==16||b.toString('ascii',36,40)!=='data'||b.readUInt32LE(40)!==b.length-44||b.readUInt32LE(4)!==b.length-8||(b.length-44)%2)throw Error('Record a short search using the microphone button.');
 let energy=0;for(let i=44;i<b.length;i+=2)energy+=(b.readInt16LE(i)/32768)**2;
 if(Math.sqrt(energy/((b.length-44)/2))<.003)throw Error('I couldn’t hear that clearly. Move closer to the mic and try again.');
 return b;
}
export async function handleVoice(req,res,{base,headers}){
 res.setHeader('Cache-Control','no-store');
 if(!['GET','POST'].includes(req.method))return res.status(405).json({error:'Use the microphone button to search.'});
 const key=process.env.GROQ_API_KEY;
 if(req.method==='GET')return res.status(200).json({available:!!key,provider:'Groq',model:'whisper-large-v3'});
 if(!key)return res.status(503).json({error:'Voice search is being connected. Please type your search for now.'});
 if(!req.headers.cookie?.match(/(?:^|;\s*)reloop_(?:auth|demo)=/))return res.status(401).json({error:'Open a demo view or sign in before using voice search.'});
 if(req.headers['content-type']?.split(';')[0]!=='audio/wav')return res.status(415).json({error:'Please record your search with the microphone button.'});
 let bytes;
 try{
  if(Number(req.headers['content-length'])>MAX_BYTES)throw Error('Keep voice searches under 25 seconds.');
  if(req.body!==undefined){if(!Buffer.isBuffer(req.body)&&!(req.body instanceof Uint8Array))throw Error('Please record your search again.');bytes=req.body}
  else{const chunks=[];let n=0;for await(const chunk of req){n+=chunk.length;if(n>MAX_BYTES)throw Error('Keep voice searches under 25 seconds.');chunks.push(chunk)}bytes=Buffer.concat(chunks)}
  bytes=checkVoiceWav(bytes);
 }catch(e){return res.status(400).json({error:e.message})}
 try{
  // Persistent quota/session checks happen before hosted inference.
  const auth=await fetch(base+'/api/application/voice/authorize',{method:'POST',headers:{...headers,'Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(6000)});
  if(!auth.ok){const status=[401,403,429].includes(auth.status)?auth.status:503;return res.status(status).json({error:status===429?'Voice search has reached its free usage limit. Please type your search and try the mic later.':status===401?'Your session expired. Sign in or reopen the demo.':'Voice search could not connect. Please try again.'})}
  const form=new FormData();form.set('file',new Blob([bytes],{type:'audio/wav'}),'search.wav');form.set('model','whisper-large-v3');form.set('response_format','verbose_json');form.set('temperature','0');
  form.set('prompt','थोक, स्टॉक, बैग, कुर्ती, कपड़े, school bags, cotton kurtas, wholesale stock.');
  const upstream=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+key},body:form,signal:AbortSignal.timeout(18000)});
  if(!upstream.ok)return res.status(upstream.status===429?429:503).json({error:upstream.status===429?'The free voice service is busy. Please type your search or try again shortly.':'Voice search could not connect. Please try again.'});
  const result=await upstream.json(),text=typeof result.text==='string'?result.text.trim():'';
  if(!text||text.length>1200||(result.segments?.length&&result.segments.every(s=>s.no_speech_prob>.7&&s.avg_logprob<-.8)))return res.status(422).json({error:'I couldn’t hear a clear search. Move closer to the mic and try again.'});
  return res.status(200).json({text});
 }catch{return res.status(503).json({error:'Voice search took too long to connect. Please try again.'})}
}
