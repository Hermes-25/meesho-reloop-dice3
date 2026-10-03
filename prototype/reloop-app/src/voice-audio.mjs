export const VOICE_SECONDS=25;
export function encodeVoiceWav(samples){
 const count=Math.min(samples.length,16000*VOICE_SECONDS),buffer=new ArrayBuffer(44+count*2),v=new DataView(buffer);
 const word=(offset,text)=>{for(let i=0;i<text.length;i++)v.setUint8(offset+i,text.charCodeAt(i))};
 word(0,'RIFF');v.setUint32(4,36+count*2,true);word(8,'WAVE');word(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,16000,true);v.setUint32(28,32000,true);v.setUint16(32,2,true);v.setUint16(34,16,true);word(36,'data');v.setUint32(40,count*2,true);
 let energy=0;for(let i=0;i<count;i++){const x=Math.max(-1,Math.min(1,Number.isFinite(samples[i])?samples[i]:0));energy+=x*x;v.setInt16(44+i*2,Math.round(x*(x<0?32768:32767)),true)}
 if(count<4800||Math.sqrt(energy/count)<.003)throw Error('I couldn’t hear that clearly. Move closer to the mic and try again.');
 return new Blob([buffer],{type:'audio/wav'});
}
export function silenceState(previous,rms,elapsed){
 const loud=rms>=.012,frames=loud?previous.frames+1:0,heard=previous.heard||frames>=3,last=loud?elapsed:previous.last;
 return {frames,heard,last,stop:heard&&elapsed-last>=2000,quiet:!heard&&elapsed>=10000};
}
