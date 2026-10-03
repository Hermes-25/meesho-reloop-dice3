// Also safe when MediaRecorder construction/start fails after microphone access.
export function releaseCapture(recorder,stream){
 if(recorder){recorder.onstop=null;recorder.onerror=null;recorder.ondataavailable=null;try{if(recorder.state==='recording'||recorder.state==='paused')recorder.stop()}catch{}}
 for(const track of stream?.getTracks()||[]){try{track.stop()}catch{}}
}
