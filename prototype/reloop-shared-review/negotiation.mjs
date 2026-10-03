export const offerTerms=['Standard packing included','Unbranded goods','Assorted sizes as requested','Inspection before dispatch'];
export const clarificationQuestions=['Is standard packing included?','Does the material match the request?','Can you supply the requested size mix?'];
export const clarificationAnswers=['Yes, confirmed','No, not included','Please review my revised offer'];
const fail=(message,status=400)=>{throw Object.assign(new Error(message),{status})};
const validDate=(v,now)=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v&&Date.parse(v)+86400000>now;
export const latestOffer=(q,r)=>q.offers?.at(-1)||{revision:0,by:q.owner,side:'supplier',price:q.price,qty:r.qty,dispatchFrom:q.dispatchFrom,dispatchTo:q.dispatchTo,terms:[],at:q.at,expiresAt:Math.min((q.at||0)+7*86400000,Date.parse(r.neededBy)+86400000,Date.parse(q.dispatchTo)+86400000)};
export function checkRevision(q,r,c){if(c.revision!==latestOffer(q,r).revision)fail('This offer changed. Refresh and review the latest terms.',409);}
export function checkLive(q,r,now){if(r.status!=='open'||['accepted','declined'].includes(q.state))fail('This negotiation is closed.');if(latestOffer(q,r).expiresAt<=now)fail('This offer has expired. Ask for a new offer.');}
export function makeOffer(c,u,r,revision,now){
 if(!Number.isSafeInteger(c.price)||c.price<100||c.price>100000000||!Number.isSafeInteger(c.qty)||c.qty<1||c.qty>10000)fail('Check the quantity or amount.');
 if(!validDate(c.dispatchFrom,now)||!validDate(c.dispatchTo,now)||c.dispatchFrom>c.dispatchTo||c.dispatchTo>r.neededBy)fail('The dispatch window must fit the requested date.');
 if(!Array.isArray(c.terms)||new Set(c.terms).size!==c.terms.length||c.terms.some(x=>!offerTerms.includes(x))||c.note||c.message||c.contact||c.attachments)fail('Use the listed terms only. Contact details and free-text messages are not allowed.');
 const hours=c.expiresHours??48;if(![24,48,72].includes(hours))fail('Choose an offer validity of 24, 48 or 72 hours.');
 return {revision,by:u.id,side:u.id===r.owner?'requester':'supplier',price:c.price,qty:c.qty,dispatchFrom:c.dispatchFrom,dispatchTo:c.dispatchTo,terms:[...c.terms],at:now,expiresAt:Math.min(now+hours*3600000,Date.parse(c.dispatchTo)+86400000)};
}
export function addOffer(q,r,offer){if(!q.offers)q.offers=[latestOffer(q,r)];q.offers.push(offer);q.state='active';q.price=offer.price;q.dispatchFrom=offer.dispatchFrom;q.dispatchTo=offer.dispatchTo;}
export function negotiate(w,u,c,now){
 const r=w.rfqs.find(x=>x.id===c.id),q=r?.quotes.find(x=>x.id===c.quoteId);
 if(!q||![r.owner,q.owner].includes(u.id))fail('This negotiation belongs to other accounts.',403);
 checkRevision(q,r,c);const current=latestOffer(q,r),recipient=current.by!==u.id;
 if(c.type==='quote.counter'){
  if(r.status!=='open'||['accepted','declined'].includes(q.state)||(!recipient&&current.expiresAt>now))fail('Wait for the other party to respond.');
  if((q.offers?.length||1)>=20)fail('This negotiation has reached its offer limit.');
  const offer=makeOffer(c,u,r,current.revision+1,now);addOffer(q,r,offer);
 }else if(c.type==='quote.agree'){
  checkLive(q,r,now);if(u.id!==q.owner||current.side!=='requester'||!recipient)fail('Only the supplier can agree to this counteroffer.',403);q.state='agreed';q.agreedRevision=current.revision;
 }else if(c.type==='quote.decline'){
  checkLive(q,r,now);if(!recipient)fail('Only the recipient can decline this offer.',403);q.state='declined';q.declinedAt=now;
 }else if(c.type==='quote.clarify'){
  checkLive(q,r,now);if(c.note||c.message||c.contact||c.attachments)fail('Use the listed terms only. Contact details and free-text messages are not allowed.');
  q.clarifications??=[];if(q.clarifications.length>=20)fail('This negotiation has reached its clarification limit.');
  if(u.id===r.owner){if(!clarificationQuestions.includes(c.code)||c.questionId)fail('Choose a listed clarification.');q.clarifications.push({id:crypto.randomUUID(),by:u.id,code:c.code,at:now});}
  else{const question=q.clarifications.find(x=>x.id===c.questionId&&x.by===r.owner);if(!question||!clarificationAnswers.includes(c.code)||q.clarifications.some(x=>x.questionId===question.id))fail('Choose an unanswered clarification and a listed response.');q.clarifications.push({id:crypto.randomUUID(),questionId:question.id,by:u.id,code:c.code,at:now});}
 }
 return {request:r,quote:q,audience:[r.owner,q.owner]};
}
