export async function api(path,body,method){
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),35000);
 try{
  const r=await fetch('/api/'+path,{method:method||(body?'POST':'GET'),credentials:'same-origin',headers:body?{'Content-Type':'application/json'}:{},body:body?JSON.stringify(body):undefined,signal:controller.signal});
  const d=await r.json();
  if(!r.ok)throw Object.assign(new Error(d.error||'Please try again.'),{status:r.status});
  return d;
 }catch(e){
  if(controller.signal.aborted)throw new Error('The connection took too long. Please try again. Your saved records are safe.');
  throw e;
 }finally{clearTimeout(timeout)}
}

// Entry must verify that the browser retained its session before dismissing
// the chooser. Background refresh intentionally handles signed-out state.
export async function readWorkspace(request=api){
 try{return await request('state')}
 catch(e){
  if(e.status===401)throw new Error('We could not keep you signed in. Please try Enter demo again. If it repeats, allow cookies for this site and reload.');
  throw e;
 }
}
