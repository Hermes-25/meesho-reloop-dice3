import React from 'react';
import {payoutFor} from './order-financials.mjs';
import './financial-summary.css';
const money=n=>new Intl.NumberFormat('en-IN',{style:'currency',currency:'INR'}).format(n/100);
function Line({label,amount,free=false,deduction=false}){return <div className="financial-line"><dt>{label}</dt><dd>{free?'Free':`${deduction?'−':''}${money(amount)}`}</dd></div>}
export function BillSummary({value,source=false,ops=false,refund=0,cancelled=false,paid=false}){
 return <section className="financial-card" aria-label={ops?'Buyer payment summary':'Your payment summary'}>
  <h3>{ops?'Buyer payment summary':'Your payment summary'}</h3>
  <dl><Line label="Item subtotal" amount={value.goods}/>
   <Line label={source?'Sourcing fee':'Service premium · 12.5%'} amount={value.premium} free={!value.premium}/>
   <Line label="Delivery estimate" amount={value.logistics}/>
   <div className="financial-total"><dt>{cancelled?'Cancelled order total':ops?'Buyer total':paid?'Order total · payment recorded':'Total payable'}</dt><dd>{money(value.total)}</dd></div>
   {refund>0&&<Line label="Test refund" amount={refund}/>}
  </dl>
  <details className="financial-note"><summary>Fee details</summary><p>{source?(value.premium?'This earlier order keeps its recorded sourcing fee.':'There is no sourcing fee on this order.'):'The service premium is 12.5% of the item subtotal.'}</p><p>Delivery is a test estimate of ₹8 per unit.</p><p>The buyer pays the delivery charge through the platform. It covers proposed logistics costs and is separate from the platform service fee. No courier payment is made in this demo.</p>{!source&&<p>Meesho coordinates recovery pickup and delivery; you do not arrange a courier.</p>}</details>
 </section>
}
export function EarningsSummary({payout:p,heading='Your earnings',ops=false,ordinal}){
 const status=p.status==='cancelled'?'No payout — order cancelled':p.status==='recorded'?'Test payout recorded':p.status==='on_hold'?'Payout on hold':p.status==='provisional'?'Subject to inspection agreement':'Estimated payout on completion';
 return <section className="financial-card earnings-card" aria-label={heading}>
  <h3>{heading}{ordinal&&<> {ordinal}</>}</h3><p className="financial-status">{status}</p>
  <dl><Line label={ops?'Goods value':'Your goods value'} amount={p.goods}/><Line label={p.feeRate?'Supplier fee · 4.5%':'Selling fee'} amount={p.fee} free={!p.feeRate} deduction={!!p.fee}/>
  <div className="financial-total"><dt>{p.status==='recorded'?'Net payout recorded':ops?'Net payout':'You receive'}</dt><dd>{money(p.net)}</dd></div></dl>
  {p.status!=='cancelled'&&<details className="financial-note"><summary>Payout details</summary>{ops?<p>Only this business’s contribution is included. Release follows acceptance and resolution of any issues.</p>:<><p>{p.feeRate?'The 4.5% fee is deducted from your goods value when the order is completed.':'No selling fee is deducted from your goods value.'}</p><p>{p.status==='provisional'?'This amount uses your inspected quantity and still needs every affected party’s agreement.':'Only your contribution is included. Payout follows acceptance and resolution of any issues.'}</p></>}</details>}
 </section>
}
export function OrderFinancialSummary({order:o,me}){
 if(me.role==='ops')return <div className="financial-reconciliation"><BillSummary value={o.cost} source={o.kind==='source'} ops refund={o.refund} cancelled={o.status==='cancelled'}/>{[...new Set(o.members.map(m=>m.owner))].map((owner,i)=><EarningsSummary key={owner} ops ordinal={i+1} payout={payoutFor(o,owner)} heading={o.kind==='source'?'Supplier payout':'Seller payout'}/>)}</div>;
 return o.financialView==='earnings'?<EarningsSummary payout={o.payout}/>:<BillSummary value={o.cost} source={o.kind==='source'} refund={o.refund} cancelled={o.status==='cancelled'} paid={!!o.payment}/>;
}
