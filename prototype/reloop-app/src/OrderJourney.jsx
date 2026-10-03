import React,{useState} from 'react';
import {Check,Clock,Truck,ArrowRight} from 'lucide-react';
import {nextStep,journeyStages} from './order-journey.mjs';
import {useLanguage} from './i18n.jsx';
import './business-dashboard.css';
export function OrderJourney({order,me}){
 const step=nextStep(order,me),stages=journeyStages(order),{lang}=useLanguage();
 return <section className="order-journey" aria-label="Order timeline"><div className="journey-heading"><h2>Order timeline</h2><span>{order.kind==='recovery'?'Meesho coordinates recovery logistics':'Supplier fulfilment tracked here'}</span></div>
 <ol className="journey-steps">{stages.map((s,i)=><li key={s.key} className={s.state} aria-current={s.state==='current'?'step':undefined}><span className="journey-node">{s.state==='done'?<Check size={14}/>:i+1}</span><b>{s.label}</b><small>{s.owner}</small>{s.at&&s.state==='done'&&<time>{new Date(s.at).toLocaleDateString(lang==='hi'?'hi-IN':'en-IN',{day:'numeric',month:'short'})}</time>}</li>)}</ol>
 <div className={'next-owner '+(order.issue?'has-issue':'')}><Truck size={22}/><div><h3>{step.title}</h3><p>{step.detail}</p><strong>Next step owner: <span>{step.owner}</span></strong></div>{step.action&&<a href="#order-next-action" className="button secondary">{step.action}<ArrowRight size={16}/></a>}</div>
 </section>
}
export function PickupAvailability({order:o,me,command}){
 const saved=o.pickups?.[me.id],[editing,setEditing]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const today=new Date().toLocaleDateString('en-CA');
 return <section className="section pickup-availability"><h2>{saved?'Pickup availability confirmed':'When is your stock ready?'}</h2><p>Meesho arranges collection and inspection. You only confirm when the stock is ready to hand over.</p>
 {saved&&!editing?<><p className="success"><Check size={18}/>{saved.date} · {saved.window}</p><button className="button secondary" onClick={()=>setEditing(true)}>Change pickup slot</button><p className="subtle">Availability saved. Meesho operations handles the next step.</p></>:<form className="form" onSubmit={async e=>{e.preventDefault();const v=Object.fromEntries(new FormData(e.currentTarget));setBusy(true);setError('');try{await command({type:'pickup.book',id:o.id,...v});setEditing(false)}catch(e){setError(e.message)}finally{setBusy(false)}}}><fieldset disabled={busy}><div className="form-grid"><label className="field"><span>Pickup date</span><input name="date" type="date" min={today} defaultValue={saved?.date>=today?saved.date:today} required/></label><label className="field"><span>Time window</span><select name="window" defaultValue={saved?.window||'10 AM – 1 PM'}><option>10 AM – 1 PM</option><option>2 PM – 5 PM</option></select></label></div>{error&&<p className="error" role="alert">{error}</p>}<div className="row-actions"><button className="button primary" type="submit">{busy?'Saving…':saved?'Save new availability':'Confirm pickup availability'}</button>{saved&&<button type="button" className="button secondary" onClick={()=>setEditing(false)}>Cancel</button>}</div></fieldset></form>}
 <small className="subtle">Demo scheduling only. A saved slot is not a live courier booking.</small></section>
}
