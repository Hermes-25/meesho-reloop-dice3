'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LucideIcon } from 'lucide-react';
import {
  AlertTriangle, ArrowLeft, ArrowRight, BadgeCheck, Banknote, Bell, Box, Boxes,
  Building2, CalendarDays, Camera, Check, CheckCircle2, ChevronDown, CircleHelp,
  Clock3, FileCheck2, Filter, Gavel, IndianRupee, LayoutDashboard, LifeBuoy,
  MapPin, PackageCheck, PackageOpen, ScanLine, Search, ShieldCheck, ShoppingBag,
  SlidersHorizontal, Sparkles, Store, Truck, UploadCloud, Users, WalletCards,
  Warehouse, XCircle,
} from 'lucide-react';

type Role = 'seller' | 'buyer' | 'ops';

type NavItem = { id: string; label: string; icon: LucideIcon; badge?: string };

const roleMeta: Record<Role, { label: string; account: string; initials: string; nav: NavItem[] }> = {
  seller: {
    label: 'Seller view', account: 'Aarohi Retail', initials: 'AR',
    nav: [
      { id: 'seller-home', label: 'Recovery home', icon: LayoutDashboard, badge: '3' },
      { id: 'seller-return', label: 'Returned item', icon: PackageOpen },
      { id: 'seller-capture', label: 'Add recovery stock', icon: Camera },
      { id: 'seller-grade', label: 'Grade & value', icon: ScanLine },
      { id: 'seller-pool', label: 'Pools & auctions', icon: Boxes },
      { id: 'seller-pickup', label: 'Pickup & payout', icon: Truck, badge: '1' },
      { id: 'seller-source', label: 'Meesho Source', icon: Box },
    ],
  },
  buyer: {
    label: 'Recovery buyer', account: 'Rajasthan Recommerce', initials: 'RR',
    nav: [
      { id: 'buyer-home', label: 'Buyer home', icon: LayoutDashboard, badge: '2' },
      { id: 'buyer-market', label: 'Recovery lots', icon: Warehouse },
      { id: 'buyer-lot', label: 'Lot passport', icon: FileCheck2 },
      { id: 'buyer-bid', label: 'Auction console', icon: Gavel, badge: 'LIVE' },
      { id: 'buyer-checkout', label: 'Won lot & checkout', icon: WalletCards },
      { id: 'buyer-track', label: 'Orders & tracking', icon: Truck },
      { id: 'buyer-source', label: 'Source RFQs', icon: ShoppingBag },
    ],
  },
  ops: {
    label: 'Meesho internal', account: 'ReLoop Operations', initials: 'MO',
    nav: [
      { id: 'ops-control', label: 'Network control tower', icon: LayoutDashboard },
      { id: 'ops-trust', label: 'Trust & exceptions', icon: ShieldCheck, badge: '18' },
    ],
  },
};

const roleStart: Record<Role, string> = { seller: 'seller-home', buyer: 'buyer-market', ops: 'ops-control' };

function Header({ title, subtitle, back, onBack, action }: { title: string; subtitle: string; back?: string; onBack?: () => void; action?: React.ReactNode }) {
  return <div className="page-heading">
    <div className="heading-copy">
      {back && <button className="back-link" onClick={onBack}><ArrowLeft size={15} /> {back}</button>}
      <h1>{title}</h1><p>{subtitle}</p>
    </div>{action}
  </div>;
}

function ProductThumb({ kind = 'bag', size = 'md' }: { kind?: 'bag' | 'kurti' | 'storage'; size?: 'sm' | 'md' | 'lg' }) {
  return <div className={`product-thumb ${kind} ${size}`} aria-label={`${kind} product preview`}>
    {kind === 'bag' ? <ShoppingBag /> : kind === 'kurti' ? <Sparkles /> : <Box />}
  </div>;
}

function Meter({ value, className = '' }: { value: number; className?: string }) {
  return <div className={`meter ${className}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}><i style={{ transform: `scaleX(${Math.max(0, Math.min(value, 100)) / 100})` }} /></div>;
}

function StepRail({ active }: { active: number }) {
  const steps = ['Identify', 'Grade', 'Pool', 'Sell', 'Pickup & payout'];
  return <div className="compact-rail">{steps.map((step, index) => <div className={`compact-step ${index <= active ? 'complete' : ''}`} key={step}>
    <div className="compact-dot">{index < active ? <Check size={13} /> : index + 1}</div><span>{step}</span>{index < steps.length - 1 && <i />}
  </div>)}</div>;
}

function SellerHome({ go }: { go: (screen: string) => void }) {
  const actions = [
    ['urgent', 'RET-842196', 'Women’s sling bag · Tan', 'RTO received today · 12 units', '₹1,440–₹1,920', 'Inspect by 11 Sep', 'Inspect item', 'seller-return'],
    ['suggested', 'SKU-MK-043', 'Printed cotton kurti · Mixed sizes', 'Low sales for 92 days · 38 units', '₹3,040–₹4,180', 'Recovery suggested', 'Review stock', 'seller-capture'],
    ['progress', 'POOL-2308', 'Fashion accessories · Grade B', 'Your 24 units joined a 416-unit pool', '₹2,160 expected', '84% buyer-ready', 'View pool', 'seller-pool'],
  ];
  return <>
    <Header title="Recover stock" subtitle="Turn returned and ageing inventory into cash—without moving it until a buyer is confirmed."
      action={<button className="primary-action" onClick={() => go('seller-capture')}><PackageOpen size={18} /> Add stock for recovery</button>} />
    <section className="recovery-rail">
      <div className="rail-intro"><span className="rail-icon"><IndianRupee size={21} /></span><div><strong>₹8,860</strong><span>potential recovery</span></div></div>
      {[
        ['Stock identified', '74 units', true], ['Meesho graded', '62 units', true], ['Pooled nearby', '3 active pools', true], ['Buyer confirmed', '1 lot sold', false], ['Pickup & payout', '₹1,780 due', false],
      ].map(([step, note, active], index) => <div className={`rail-step ${active ? 'done' : ''}`} key={step as string}>
        <div className="rail-dot">{active ? '✓' : index + 1}</div><div><strong>{step}</strong><span>{note}</span></div>{index < 4 && <div className="rail-line" />}
      </div>)}
    </section>
    <div className="dashboard-grid">
      <section className="action-section">
        <div className="section-heading"><div><h2>Needs your attention</h2><span>3 actions</span></div><button>View all <ArrowRight size={15} /></button></div>
        {actions.map((item, index) => <article className="action-row" key={item[1]}>
          <div className={`action-symbol ${item[0]}`}>{index === 0 ? <PackageOpen /> : index === 1 ? <Clock3 /> : <Boxes />}</div>
          <div className="action-main"><div className="item-id">{item[1]}</div><h3>{item[2]}</h3><p>{item[3]}</p></div>
          <div className="action-value"><span>RECOVERY VALUE</span><strong>{item[4]}</strong></div><div className={`status ${item[0]}`}>{item[5]}</div>
          <button className={index === 0 ? 'row-primary' : 'row-action'} onClick={() => go(item[7])}>{item[6]}</button>
        </article>)}
      </section>
      <aside className="side-summary">
        <div className="summary-head"><span>THIS MONTH</span><button>View payouts</button></div>
        <div className="money"><span>Recovered</span><strong>₹12,460</strong><small>from 146 units</small></div>
        <div className="money-row"><span>Ready for payout</span><strong>₹1,780</strong></div><div className="money-row"><span>In active pools</span><strong>₹7,080 est.</strong></div>
        <div className="zero-fee"><PackageCheck size={20} /><div><strong>₹0 seller fee</strong><span>You receive the complete winning bid.</span></div></div>
      </aside>
    </div>
    <PoolTable onOpen={() => go('seller-pool')} />
  </>;
}

function PoolTable({ onOpen }: { onOpen: () => void }) {
  const rows = [
    ['RL-2308','Fashion accessories','Grade B','416 / 500 units','Buyer matching','₹2,160'],
    ['RL-2264','Women’s ethnic wear','Grade A–B','640 units','Auction live','₹4,920'],
    ['RL-2197','Home storage','Grade C','310 units','Pickup booked','₹1,780'],
  ];
  return <section className="pool-section"><div className="section-heading"><div><h2>Your recovery pools</h2><span>Stock stays with you until a buyer is confirmed</span></div><button onClick={onOpen}>See marketplace activity <ArrowRight size={15} /></button></div>
    <table><thead><tr><th>POOL</th><th>CATEGORY</th><th>CONDITION</th><th>LOT PROGRESS</th><th>STATUS</th><th>YOUR VALUE</th><th /></tr></thead>
      <tbody>{rows.map((row,index)=><tr key={row[0]}><td><strong>{row[0]}</strong></td><td>{row[1]}</td><td><span className="grade-chip">{row[2]}</span></td>
        <td><Meter value={index === 0 ? 84 : 100} className="table-progress" /><span>{row[3]}</span></td><td><span className={`table-status status-${index}`}>{row[4]}</span></td><td><strong>{row[5]}</strong></td><td><button className="table-open" onClick={onOpen}><ArrowRight size={16}/></button></td></tr>)}</tbody>
    </table></section>;
}

function SellerReturn({ go }: { go: (screen: string) => void }) {
  return <>
    <Header back="Recovery home" onBack={() => go('seller-home')} title="Review returned item" subtitle="RET-842196 · Received today at your Jaipur pickup address" />
    <StepRail active={0} />
    <div className="three-col detail-layout">
      <section className="panel item-snapshot"><div className="panel-title"><h2>What came back</h2><span className="status urgent">Action due in 2 days</span></div>
        <div className="product-line"><ProductThumb kind="bag" size="lg"/><div><span className="eyebrow">ORDER 684219613</span><h3>Women’s sling bag · Tan</h3><p>SKU BAG-TAN-04 · Qty 12</p><div className="tag-row"><span>₹399 selling price</span><span>COD order</span></div></div></div>
        <div className="mini-timeline"><div className="done"><i/><span><strong>Shipped</strong><small>29 Aug</small></span></div><div className="done"><i/><span><strong>Delivery attempted</strong><small>2 attempts</small></span></div><div className="current"><i/><span><strong>Returned to you</strong><small>9 Sep · 11:42 AM</small></span></div></div>
      </section>
      <section className="panel protection-check"><div className="panel-title"><h2>Meesho protection check</h2><ShieldCheck size={21}/></div>
        <div className="check-result"><CheckCircle2 size={23}/><div><strong>No package mismatch detected</strong><p>Return checkpoints match the original shipment. You can still raise an issue if the item received is wrong.</p></div></div>
        <div className="signal-row"><span>Package ID match</span><strong>Confirmed</strong></div><div className="signal-row"><span>Reverse-leg images</span><strong>3 checkpoints</strong></div><div className="signal-row"><span>Compensation route</span><strong>Not triggered</strong></div>
        <button className="quiet-action">Something is wrong with this return</button>
      </section>
      <section className="panel next-decision"><div className="panel-title"><h2>Choose what happens next</h2></div>
        <button className="decision-card"><Store/><div><strong>Return to normal inventory</strong><span>Use if all units can still be sold as new.</span></div><ArrowRight/></button>
        <button className="decision-card recommended" onClick={() => go('seller-capture')}><Sparkles/><div><strong>Recover value through ReLoop</strong><span>Best for damaged packaging, minor defects or mixed condition.</span><em>Estimated recovery ₹1,440–₹1,920</em></div><ArrowRight/></button>
        <button className="decision-card"><XCircle/><div><strong>Discard from inventory</strong><span>Use only when products have no recoverable value.</span></div><ArrowRight/></button>
      </section>
    </div>
    <div className="explain-strip"><AlertTriangle size={18}/><strong>Important:</strong><span>ReLoop begins only after Meesho’s return-protection check. It does not replace a valid wrong-return or fraud claim.</span></div>
  </>;
}

function SellerCapture({ go }: { go: (screen: string) => void }) {
  const [selectedReason,setSelectedReason]=useState('Returned / RTO');
  const reasons=['Returned / RTO','Ageing stock','Excess inventory','Damaged stock'];
  return <>
    <Header back="Recovery home" onBack={() => go('seller-home')} title="Add stock for recovery" subtitle="Describe the stock honestly. Better evidence attracts more buyers and stronger bids." />
    <StepRail active={0}/>
    <div className="form-grid">
      <section className="panel form-panel"><div className="form-section"><span className="form-number">1</span><div className="form-body"><h2>Select stock</h2><p>Linked returns are pre-filled; ageing or excess inventory can be added manually.</p>
        <div className="selected-product"><ProductThumb kind="bag"/><div><strong>Women’s sling bag · Tan</strong><span>SKU BAG-TAN-04 · 12 units available</span></div><button>Change</button></div>
        <label className="field-label">Why are you recovering this stock?</label><div className="reason-grid">{reasons.map(reason=><button key={reason} className={selectedReason===reason?'selected':''} onClick={()=>setSelectedReason(reason)}>{selectedReason===reason&&<Check size={14}/>} {reason}</button>)}</div>
        <div className="two-fields"><label>Quantity<input defaultValue="12" /></label><label>Inventory age<select defaultValue="0–30 days"><option>0–30 days</option><option>31–90 days</option><option>90+ days</option></select></label></div>
      </div></div></section>
      <section className="panel evidence-panel"><div className="form-section"><span className="form-number">2</span><div className="form-body"><h2>Add evidence</h2><p>Use natural light and show the same units you are declaring.</p>
        <div className="upload-grid"><button className="upload-tile filled"><ProductThumb kind="bag"/><span><CheckCircle2/>Front view added</span></button><button className="upload-tile filled defect"><ProductThumb kind="bag"/><span><CheckCircle2/>Defect view added</span></button><button className="upload-tile"><UploadCloud/><strong>Package label</strong><span>JPG/PNG · up to 10 MB</span></button></div>
        <button className="phone-handoff"><Camera size={19}/><div><strong>Take clearer photos on your phone</strong><span>Scan a QR code and continue without losing this form.</span></div><ArrowRight size={17}/></button>
        <label className="declaration"><input type="checkbox" defaultChecked/><span>I confirm that the quantity and condition shown are accurate and will remain available until the pool closes.</span></label>
      </div></div></section>
      <aside className="review-aside"><div className="aside-title">READY TO CHECK</div><div className="completion-item complete"><Check/>SKU and quantity</div><div className="completion-item complete"><Check/>Recovery reason</div><div className="completion-item complete"><Check/>2 product photos</div><div className="completion-item pending"><Clock3/>Package label missing</div>
        <div className="why-box"><Sparkles/><div><strong>Why Meesho asks</strong><span>Evidence is compared with catalogue and return signals to estimate condition before buyer review.</span></div></div>
        <button className="primary-action full" onClick={()=>go('seller-grade')}>Check grade and value <ArrowRight size={17}/></button><small className="fineprint">Uploading does not commit you to a sale.</small>
      </aside>
    </div>
  </>;
}

function SellerGrade({ go }: { go: (screen: string) => void }) {
  return <>
    <Header back="Edit evidence" onBack={()=>go('seller-capture')} title="Review grade and expected value" subtitle="Meesho has checked your photos against catalogue, return and local market signals." />
    <StepRail active={1}/>
    <div className="grade-layout">
      <section className="panel grade-evidence"><div className="panel-title"><h2>Evidence reviewed</h2><span className="verified-label"><BadgeCheck/>3 signals matched</span></div>
        <div className="evidence-compare"><div><span>CATALOGUE</span><ProductThumb kind="bag" size="lg"/></div><div><span>RETURNED ITEM</span><ProductThumb kind="bag" size="lg"/></div><div className="comparison-arrow"><ArrowRight/></div></div>
        <div className="signal-list"><div><CheckCircle2/><span><strong>Product identity</strong>Catalogue colour and shape match</span><em>High confidence</em></div><div><CheckCircle2/><span><strong>Usability</strong>Zips and straps appear intact</span><em>High confidence</em></div><div><AlertTriangle/><span><strong>Visible condition</strong>Scuffed packaging; minor surface marks</span><em>Review at hub</em></div></div>
      </section>
      <section className="panel grade-result"><div className="grade-hero"><div className="grade-letter">B</div><div><span>PROVISIONAL GRADE</span><h2>Resellable with minor wear</h2><p>Suitable for discount resale after basic cleaning or repacking.</p></div></div>
        <div className="confidence"><div><span>Grade confidence</span><strong>86%</strong></div><Meter value={86}/></div>
        <div className="condition-grid"><div><span>Function</span><strong>Working</strong></div><div><span>Packaging</span><strong>Damaged</strong></div><div><span>Repair</span><strong>Not required</strong></div><div><span>Hub sample</span><strong>10%</strong></div></div>
        <button className="quiet-action">See grade definitions</button>
      </section>
      <aside className="value-panel"><span className="aside-title">EXPECTED SELLER RECOVERY</span><strong className="value-range">₹1,440–₹1,920</strong><small>₹120–₹160 per unit · 12 units</small>
        <div className="value-rule"><span>Indicative floor</span><strong>₹1,320</strong></div><div className="value-rule"><span>Seller fee</span><strong className="green">₹0</strong></div><div className="value-rule"><span>Buyer pays</span><strong>Bid + Trust Premium</strong></div>
        <div className="caution-note">Final payout depends on the winning bid and hub-verified quantity and grade.</div>
        <button className="primary-action full" onClick={()=>go('seller-pool')}>Add 12 units to pool <ArrowRight size={17}/></button><button className="quiet-action full">Save as draft</button>
      </aside>
    </div>
  </>;
}

function SellerPool({ go }: { go: (screen: string) => void }) {
  return <>
    <Header back="Recovery home" onBack={()=>go('seller-home')} title="Pool RL-2308" subtitle="Fashion accessories · Grade B · Jaipur recovery zone" action={<span className="status progress">Buyer matching</span>}/>
    <StepRail active={2}/>
    <div className="pool-hero panel"><div className="pool-ring"><strong>416</strong><span>of 500 units</span></div><div className="pool-hero-copy"><span className="eyebrow">BUYER-READY AT 500 UNITS</span><h2>84 units more needed to open this lot</h2><Meter value={84}/><div className="pool-stats"><span><strong>24</strong>Your units</span><span><strong>9</strong>Nearby sellers</span><span><strong>12</strong>Interested buyers</span><span><strong>2–4 days</strong>Expected listing</span></div></div><div className="pool-value"><span>Your expected recovery</span><strong>₹2,160</strong><small>Quantity confirmed 9 Sep</small><button>Reconfirm stock</button></div></div>
    <div className="two-col lower-grid"><section className="panel"><div className="panel-title"><h2>Where the lot is forming</h2><span>Within Valmo pickup radius</span></div><div className="cluster-map"><div className="zone core">JAIPUR HUB<span>416</span></div><div className="zone z1">Sanganer<span>112</span></div><div className="zone z2">Mansarovar<span>86</span></div><div className="zone z3">Sitapura<span>134</span></div><div className="zone z4">Jhotwara<span>84</span></div></div></section>
      <section className="panel"><div className="panel-title"><h2>Pool activity</h2><button>Alert settings</button></div><div className="event-list"><div><i className="green"/><span><strong>24 units added by you</strong><small>9 Sep · 2:18 PM</small></span></div><div><i/><span><strong>Grade B demand increased</strong><small>4 new buyers watching this category</small></span></div><div><i/><span><strong>72 units joined from Sanganer</strong><small>Today · 10:06 AM</small></span></div><div><i className="yellow"/><span><strong>Next quantity check</strong><small>Confirm your stock by 12 Sep</small></span></div></div></section></div>
    <div className="footer-action-bar"><div><ShieldCheck/><span><strong>Your inventory stays with you.</strong> Pickup is scheduled only after a buyer pays for the lot.</span></div><button className="row-action" onClick={()=>go('seller-pickup')}>Preview sold-lot state</button></div>
  </>;
}

function SellerPickup({ go }: { go: (screen: string) => void }) {
  const [slot,setSlot]=useState('Tomorrow · 2–5 PM');
  return <>
    <Header back="Pools & auctions" onBack={()=>go('seller-pool')} title="Your stock has been sold" subtitle="Pool RL-2197 · Home storage · 18 of your units accepted" action={<span className="status success">Buyer paid</span>}/>
    <StepRail active={4}/>
    <div className="success-banner"><CheckCircle2/><div><strong>₹1,780 confirmed for payout</strong><span>You receive the complete winning bid after pickup scan. The buyer pays Meesho’s Trust Premium separately.</span></div><div><span>Expected in bank</span><strong>13–14 Sep</strong></div></div>
    <div className="pickup-grid"><section className="panel"><div className="panel-title"><h2>Choose a pickup slot</h2><Truck/></div>{['Tomorrow · 2–5 PM','12 Sep · 10 AM–1 PM','12 Sep · 2–5 PM'].map(s=><button key={s} className={`slot ${slot===s?'selected':''}`} onClick={()=>setSlot(s)}><span className="radio">{slot===s&&<i/>}</span><CalendarDays/><div><strong>{s}</strong><small>Valmo route JPR-18 · Free aggregation pickup</small></div>{s.startsWith('Tomorrow')&&<em>Recommended</em>}</button>)}</section>
      <section className="panel"><div className="panel-title"><h2>Prepare 18 units</h2><span>Handover checklist</span></div><div className="checklist"><label><input type="checkbox" defaultChecked/><span>Keep all accepted units together</span></label><label><input type="checkbox"/><span>Use one sealed outer package</span></label><label><input type="checkbox"/><span>Paste the recovery manifest outside</span></label><label><input type="checkbox"/><span>Keep QR/OTP ready for the rider</span></label></div><button className="quiet-action full">Download manifest</button></section>
      <aside className="pickup-aside"><span className="aside-title">HANDOVER</span><div className="qr-box"><ScanLine/><strong>RL2197-AR18</strong><span>Rider scans this code</span></div><div className="value-rule"><span>Units</span><strong>18</strong></div><div className="value-rule"><span>Hub sample</span><strong>3 units</strong></div><div className="value-rule"><span>Payout</span><strong>₹1,780</strong></div><button className="primary-action full">Confirm pickup slot</button></aside></div>
  </>;
}

function SellerSource() {
  const quotes=[['Vardhman Traders','₹118','100','98%','2 days','₹11,800'],['Saanvi Wholesale','₹114','250','94%','4 days','₹28,500'],['NK Fashions','₹121','80','99%','Next day','₹9,680']];
  return <><Header title="Meesho Source" subtitle="Request fresh inventory from verified wholesalers and compare the complete landed cost." action={<button className="primary-action"><ShoppingBag size={18}/>Create RFQ</button>}/>
    <div className="phase-note"><Sparkles/><div><strong>Phase 2 preview</strong><span>Source activates after ReLoop builds reliable buyer identities, grading history and local price signals.</span></div></div>
    <div className="source-grid"><section className="panel rfq-card"><div className="panel-title"><h2>RFQ MS-1048</h2><span className="status progress">3 quotes received</span></div><div className="rfq-product"><ProductThumb kind="kurti" size="lg"/><div><span className="eyebrow">WOMEN'S ETHNIC WEAR</span><h3>Printed cotton kurtis · Assorted designs</h3><p>100–150 units · Jaipur · Required by 20 Sep</p></div></div><div className="rfq-targets"><span><small>Target landed price</small><strong>≤ ₹120/unit</strong></span><span><small>GST invoice</small><strong>Required</strong></span><span><small>Minimum fill</small><strong>90%</strong></span></div></section>
      <aside className="source-insight"><span className="aside-title">MEESHO PRICE SIGNAL</span><strong>₹116–₹123</strong><p>Typical verified landed price for similar quality and quantity in your region.</p><div className="signal-band"><i/><em/></div><small>Based on completed protected orders—not visible supplier contacts.</small></aside></div>
    <section className="pool-section quote-table"><div className="section-heading"><div><h2>Compare verified quotes</h2><span>Sorted by best fit—not lowest unit price alone</span></div><button><SlidersHorizontal size={14}/>Change priorities</button></div><table><thead><tr><th>WHOLESALER</th><th>UNIT PRICE</th><th>MOQ</th><th>FILL RATE</th><th>DELIVERY</th><th>TOTAL</th><th /></tr></thead><tbody>{quotes.map((q,i)=><tr key={q[0]} className={i===0?'recommended-row':''}><td><strong>{q[0]}</strong>{i===0&&<span className="best-fit">BEST FIT</span>}</td><td>{q[1]}</td><td>{q[2]}</td><td>{q[3]}</td><td>{q[4]}</td><td><strong>{q[5]}</strong></td><td><button className={i===0?'row-primary':'row-action'}>View quote</button></td></tr>)}</tbody></table></section>
  </>;
}

const lots=[
  {id:'RL-2264',kind:'kurti' as const,title:'Women’s ethnic wear',grade:'A–B',units:'640',city:'Jaipur',price:'₹86,400',bid:'₹135/unit',time:'01h 42m',match:96},
  {id:'RL-2308',kind:'bag' as const,title:'Fashion accessories',grade:'B',units:'500',city:'Jaipur',price:'₹62,500',bid:'₹125/unit',time:'06h 18m',match:92},
  {id:'RL-2319',kind:'storage' as const,title:'Home storage',grade:'B–C',units:'310',city:'Ajmer',price:'₹29,450',bid:'₹95/unit',time:'Buy now',match:88},
];

function BuyerHome({ go }: { go:(s:string)=>void }) { return <><Header title="Recovery buyer home" subtitle="Prioritised around the lots and deadlines that need a procurement decision." action={<button className="primary-action" onClick={()=>go('buyer-market')}><Warehouse size={18}/>Browse lots</button>}/><div className="metric-strip"><div><span>Live buying capacity</span><strong>₹8.4L</strong><small>₹2.1L committed</small></div><div><span>Open bids</span><strong>4</strong><small>2 closing today</small></div><div><span>Lots in transit</span><strong>3</strong><small>1 at Jaipur hub</small></div><div><span>30-day claim rate</span><strong>1.8%</strong><small className="green">Within SLA</small></div></div><BuyerMarket go={go} compact/></>; }

function BuyerMarket({ go, compact=false }: { go:(s:string)=>void; compact?:boolean }) {
  return <>{!compact&&<Header title="Recovery marketplace" subtitle="Verified, condition-known lots pooled from nearby Meesho sellers." action={<button className="row-action"><Bell size={16}/>Create alert</button>}/>}<div className="market-layout">
    {!compact&&<aside className="filter-panel"><div className="filter-title"><Filter size={16}/><strong>Filters</strong><button>Reset</button></div><label>Search lots<div className="filter-search"><Search/><input placeholder="Category or lot ID"/></div></label><label>Condition grade<select defaultValue="A–C"><option>A–C</option><option>A only</option><option>B only</option></select></label><label>Pickup region<select defaultValue="Within 200 km"><option>Within 200 km</option><option>Within 500 km</option><option>All India</option></select></label><div className="filter-group"><span>Sale format</span><label><input type="checkbox" defaultChecked/>Live auction</label><label><input type="checkbox" defaultChecked/>Buy now</label><label><input type="checkbox"/>Make offer</label></div><div className="filter-group"><span>Verification</span><label><input type="checkbox" defaultChecked/>Hub sample available</label><label><input type="checkbox"/>Grade confidence ≥90%</label></div></aside>}
    <section className="market-results"><div className="market-toolbar"><div><strong>{compact?'Recommended for you':'48 verified lots'}</strong><span> · Updated 2 min ago</span></div><button><SlidersHorizontal/>Best match <ChevronDown/></button></div>{lots.map((lot,i)=><article className="lot-row" key={lot.id} onClick={()=>go('buyer-lot')}><ProductThumb kind={lot.kind} size="lg"/><div className="lot-main"><div><span className="verified-label"><BadgeCheck/>MEESHO VERIFIED</span><span className="match">{lot.match}% match</span></div><h3>{lot.title}</h3><p>{lot.id} · {lot.city} recovery zone</p><div className="tag-row"><span>Grade {lot.grade}</span><span>{lot.units} units</span><span>10% hub sample</span></div></div><div className="lot-price"><span>CURRENT LANDED BID</span><strong>{lot.bid}</strong><small>Lot value {lot.price}</small></div><div className="lot-time"><Clock3/><span>{lot.time}</span><small>{i<2?'left to bid':'fixed price'}</small></div><button className="row-primary" onClick={(e)=>{e.stopPropagation();go(i===0?'buyer-bid':'buyer-lot')}}>{i===0?'Bid now':'View lot'}</button></article>)}</section>
  </div></>;
}

function BuyerLot({ go }: { go:(s:string)=>void }) { return <><Header back="Recovery lots" onBack={()=>go('buyer-market')} title="Lot RL-2264" subtitle="Women’s ethnic wear · Jaipur recovery zone · Auction ends in 01h 42m" action={<button className="primary-action" onClick={()=>go('buyer-bid')}><Gavel size={17}/>Open auction</button>}/><div className="passport-banner"><BadgeCheck/><div><strong>Meesho Verified Lot Passport</strong><span>Identity, condition and quantity signals were checked before listing; 64 units were physically sampled at the hub.</span></div><span>Passport issued 9 Sep</span></div><div className="lot-detail-grid"><section className="panel lot-visual"><div className="visual-stage"><ProductThumb kind="kurti" size="lg"/><ProductThumb kind="kurti" size="lg"/><ProductThumb kind="kurti" size="lg"/></div><div className="thumb-strip"><button className="selected"><Camera/>Seller images · 18</button><button><ScanLine/>Hub sample · 12</button><button><Box/>Packaging · 6</button></div></section><section className="panel spec-panel"><div className="panel-title"><h2>Lot composition</h2><span>Manifest locked</span></div><div className="big-specs"><div><span>TOTAL UNITS</span><strong>640</strong></div><div><span>SELLER COUNT</span><strong>11</strong></div><div><span>CATALOGUES</span><strong>23</strong></div></div><h3>Grade distribution</h3><div className="stack-bar"><i style={{width:'28%'}}/><i style={{width:'54%'}}/><i style={{width:'18%'}}/></div><div className="legend"><span><i className="a"/>A · 28%</span><span><i className="b"/>B · 54%</span><span><i className="c"/>C · 18%</span></div><h3>Declared condition</h3><div className="condition-lines"><span><em>Minor packaging damage</em><strong>46%</strong></span><span><em>Ageing / excess stock</em><strong>31%</strong></span><span><em>Surface marks</em><strong>18%</strong></span><span><em>Repair required</em><strong>5%</strong></span></div></section><aside className="bid-summary"><span className="aside-title">LANDED-COST PREVIEW</span><div className="bid-number"><span>Current bid</span><strong>₹135/unit</strong><small>₹86,400 lot value</small></div><div className="value-rule"><span>Trust Premium · 12%</span><strong>₹10,368</strong></div><div className="value-rule"><span>Valmo linehaul</span><strong>₹4,480</strong></div><div className="value-rule total"><span>Current landed total</span><strong>₹1,01,248</strong></div><div className="protection-list"><span><ShieldCheck/>Manifest protection</span><span><BadgeCheck/>Grade variance cover</span><span><FileCheck2/>GST documentation</span></div><button className="primary-action full" onClick={()=>go('buyer-bid')}>Place a bid <ArrowRight size={17}/></button></aside></div></>; }

function BuyerBid({ go }: { go:(s:string)=>void }) { const [bid,setBid]=useState(138); const [placed,setPlaced]=useState(false); return <><Header back="Lot passport" onBack={()=>go('buyer-lot')} title="Auction console · RL-2264" subtitle="640 units · Grade A–B · Jaipur · Closes today at 5:30 PM" action={<span className="live-pill"><i/>LIVE · 01:42:16</span>}/><div className="auction-grid"><section className="panel bid-activity"><div className="panel-title"><h2>Bid movement</h2><span>18 bids · 7 verified buyers</span></div><div className="bid-chart">{[36,44,41,55,60,68,76,82].map((h,i)=><div key={i} style={{height:`${h}%`}}><span>{i===7?'₹135':''}</span></div>)}</div><div className="chart-axis"><span>4:02 PM</span><span>Now</span></div><div className="bid-feed"><span><i className="green"/>Current leader <strong>Buyer ••312</strong></span><span>Last bid <strong>₹135/unit</strong></span><span>Minimum next bid <strong>₹138/unit</strong></span></div></section><aside className="place-bid"><span className="aside-title">YOUR BID</span><div className="bid-input"><span>₹</span><input type="number" value={bid} onChange={e=>setBid(Number(e.target.value))}/><em>/ unit</em></div><div className="quick-bids">{[138,142,150].map(n=><button key={n} onClick={()=>setBid(n)}>₹{n}</button>)}</div><label className="field-label">Optional maximum proxy bid<input type="number" placeholder="Meesho bids up to this amount"/></label><div className="cost-preview"><span>Your lot bid<strong>₹{(bid*640).toLocaleString('en-IN')}</strong></span><span>Trust Premium · 12%<strong>₹{Math.round(bid*640*.12).toLocaleString('en-IN')}</strong></span><span>Estimated logistics<strong>₹4,480</strong></span><span className="total">Estimated landed total<strong>₹{Math.round(bid*640*1.12+4480).toLocaleString('en-IN')}</strong></span></div><button className="primary-action full" onClick={()=>setPlaced(true)}>{placed?<><CheckCircle2/>Bid placed at ₹{bid}</>:<>Review and place bid <Gavel size={17}/></>}</button><small className="fineprint">A winning bid becomes payable. Your full cost is shown before confirmation.</small></aside><section className="panel auction-rules"><div className="panel-title"><h2>Protection and rules</h2></div><div className="rule-list"><div><ShieldCheck/><span><strong>Grade variance protection</strong><small>Claim when verified variance exceeds the stated tolerance.</small></span></div><div><Clock3/><span><strong>5-minute anti-sniping window</strong><small>Late bids extend closing so every buyer gets a fair response window.</small></span></div><div><Banknote/><span><strong>Prepayment after winning</strong><small>Pay within 2 hours; funds stay protected until dispatch scan.</small></span></div></div><button className="quiet-action full" onClick={()=>go('buyer-checkout')}>Preview won-lot checkout</button></section></div></>; }

function BuyerCheckout({ go }: { go:(s:string)=>void }) { return <><Header back="Auction console" onBack={()=>go('buyer-bid')} title="You won lot RL-2264" subtitle="Complete payment by 7:45 PM to lock seller pickups." action={<span className="status urgent">01h 18m remaining</span>}/><div className="checkout-grid"><section className="panel invoice-panel"><div className="panel-title"><h2>Order summary</h2><span>640 verified units</span></div><div className="checkout-item"><ProductThumb kind="kurti"/><div><strong>Women’s ethnic wear · Grade A–B</strong><span>11 sellers · Jaipur recovery zone</span></div><strong>₹88,320</strong></div><div className="invoice-lines"><span><em>Winning bid · ₹138 × 640</em><strong>₹88,320</strong></span><span><em>Meesho Trust Premium · 12%</em><strong>₹10,598</strong></span><span><em>Valmo aggregation and linehaul</em><strong>₹4,480</strong></span><span><em>GST on applicable services</em><strong>₹2,714</strong></span><span className="grand"><em>Total payable</em><strong>₹1,06,112</strong></span></div></section><section className="panel payment-panel"><div className="panel-title"><h2>Payment method</h2><ShieldCheck/></div><button className="payment-choice selected"><span className="radio"><i/></span><Building2/><div><strong>Verified business account</strong><small>HDFC Bank · ending 4821</small></div></button><button className="payment-choice"><span className="radio"/><WalletCards/><div><strong>UPI / Net banking</strong><small>Instant confirmation</small></div></button><div className="escrow-note"><ShieldCheck/><div><strong>Protected settlement</strong><span>Funds release against pickup and dispatch scans. Permitted variance remains claimable after receipt.</span></div></div><label className="declaration"><input type="checkbox" defaultChecked/><span>I accept the lot manifest, grading tolerance and B2B purchase terms.</span></label><button className="primary-action full" onClick={()=>go('buyer-track')}>Pay ₹1,06,112 securely</button></section><aside className="protection-aside"><span className="aside-title">INCLUDED WITH TRUST PREMIUM</span>{['Verified seller identities','AI + hub sample grade','Quantity manifest lock','Grade variance claims','Valmo tracked movement','GST service invoice'].map(t=><span key={t}><CheckCircle2/>{t}</span>)}</aside></div></>; }

function BuyerTrack() { return <><Header title="Order RL-2264 is being aggregated" subtitle="Collection from 11 sellers · Expected delivery 15–16 Sep" action={<button className="row-action">Download manifest</button>}/><div className="tracking-hero"><Truck/><div><span>CURRENT STATUS</span><h2>7 of 11 seller pickups complete</h2><p>412 of 640 units scanned into the Jaipur consolidation route.</p><Meter value={64}/></div><strong>64%</strong></div><div className="tracking-grid"><section className="panel"><div className="panel-title"><h2>Aggregation progress</h2><span>Live from Valmo scans</span></div><div className="seller-pickups">{[['Aarohi Retail','24','Received at hub'],['MK Fashion','86','In transit'],['Avi Traders','112','Pickup complete'],['Naina Collection','64','Pickup tomorrow']].map((r,i)=><div key={r[0]}><span className={`seller-status s${i}`}><Check/></span><div><strong>{r[0]}</strong><small>{r[1]} units</small></div><span>{r[2]}</span></div>)}</div></section><section className="panel"><div className="panel-title"><h2>Order timeline</h2></div><div className="order-timeline"><div className="done"><i/><span><strong>Payment secured</strong><small>9 Sep · 6:31 PM</small></span></div><div className="current"><i/><span><strong>Seller aggregation</strong><small>7/11 pickups complete</small></span></div><div><i/><span><strong>Hub sample & manifest lock</strong><small>Expected 12 Sep</small></span></div><div><i/><span><strong>Linehaul to your warehouse</strong><small>Expected 13 Sep</small></span></div><div><i/><span><strong>Delivery and inspection</strong><small>15–16 Sep</small></span></div></div></section></div></>; }

function BuyerSource() { return <><Header title="Seller demand pools" subtitle="Quote on aggregated fresh-stock demand matched to your capacity and categories." action={<button className="row-action"><Bell size={16}/>RFQ alerts</button>}/><div className="phase-note"><Sparkles/><div><strong>Phase 2 preview</strong><span>Only verified wholesalers with completed ReLoop trades and strong fulfilment history enter early Source cohorts.</span></div></div><section className="pool-section source-rfqs"><div className="section-heading"><div><h2>Matched RFQs</h2><span>12 opportunities · ₹18.4L estimated demand</span></div><button><SlidersHorizontal/>Best fit</button></div><table><thead><tr><th>RFQ</th><th>PRODUCT</th><th>SELLER DEMAND</th><th>TARGET</th><th>DELIVER TO</th><th>DUE</th><th /></tr></thead><tbody>{[['MS-1048','Printed cotton kurtis','8 sellers · 640 units','≤ ₹120/unit','Jaipur','4h'],['MS-1052','Women’s sling bags','5 sellers · 380 units','≤ ₹155/unit','Ahmedabad','11h'],['MS-1061','Home storage sets','12 sellers · 920 units','≤ ₹92/unit','Delhi NCR','1d']].map((r,i)=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td>{r[2]}</td><td><strong>{r[3]}</strong></td><td>{r[4]}</td><td><span className={i===0?'status urgent':''}>{r[5]}</span></td><td><button className={i===0?'row-primary':'row-action'}>Build quote</button></td></tr>)}</tbody></table></section></>; }

function OpsControl({ go }: { go:(s:string)=>void }) { const funnel=[['Stock submitted','1.84L units',100],['Grade approved','1.62L',88],['Buyer-ready pools','1.14L',62],['Cleared lots','78K',42],['Picked up','69K',38]]; return <><Header title="ReLoop network control tower" subtitle="Marketplace health, liquidity and fulfilment across seller recovery zones." action={<div className="date-control"><CalendarDays/>Last 30 days <ChevronDown/></div>}/><div className="metric-strip ops-metrics"><div><span>Cleared lot value</span><strong>₹1.26 Cr</strong><small className="green">+18% vs prior period</small></div><div><span>Trust Premium revenue</span><strong>₹14.8L</strong><small>11.7% realised rate</small></div><div><span>Stock sell-through</span><strong>68.4%</strong><small className="green">+4.6 pp</small></div><div><span>Median time to cash</span><strong>8.2 days</strong><small className="red">0.8d above target</small></div><div><span>Open exceptions</span><strong>18</strong><small className="red">6 high priority</small></div></div><div className="ops-grid"><section className="panel funnel-panel"><div className="panel-title"><h2>Recovery conversion</h2><span>1 Sep–9 Sep cohort</span></div><div className="funnel">{funnel.map(([n,v,w])=><div key={n as string}><span>{n}<strong>{v}</strong></span><i style={{width:`${w}%`}}/></div>)}</div><div className="insight-line"><Sparkles/><span><strong>Largest controllable drop:</strong> pools below buyer-ready MOQ in home & kitchen.</span></div></section><section className="panel liquidity-panel"><div className="panel-title"><h2>Zone liquidity</h2><span>Bid depth × ageing</span></div><div className="heatmap"><div className="h1">Jaipur<strong>3.8×</strong><span>Healthy</span></div><div className="h2">Ahmedabad<strong>3.1×</strong><span>Healthy</span></div><div className="h3">Surat<strong>2.2×</strong><span>Watch</span></div><div className="h4">Delhi NCR<strong>2.9×</strong><span>Healthy</span></div><div className="h5">Lucknow<strong>1.4×</strong><span>Intervene</span></div><div className="h6">Indore<strong>1.8×</strong><span>Watch</span></div></div></section></div><section className="pool-section ops-table"><div className="section-heading"><div><h2>Live intervention queue</h2><span>Ranked by value at risk and time sensitivity</span></div><button onClick={()=>go('ops-trust')}>Open exception workbench <ArrowRight/></button></div><table><thead><tr><th>CASE</th><th>ZONE / CATEGORY</th><th>SIGNAL</th><th>VALUE AT RISK</th><th>OWNER</th><th>SLA</th><th /></tr></thead><tbody>{[['EX-1842','Lucknow · Home','Bid depth 1.1×','₹4.8L','Category ops','3h'],['EX-1838','Jaipur · Fashion','Grade drift +7.4pp','₹2.1L','Trust ops','5h'],['EX-1826','Surat · Accessories','Pickup completion 62%','₹1.6L','Valmo ops','8h']].map((r,i)=><tr key={r[0]}><td><strong>{r[0]}</strong></td><td>{r[1]}</td><td><span className={`risk-dot r${i}`}/>{r[2]}</td><td><strong>{r[3]}</strong></td><td>{r[4]}</td><td>{r[5]}</td><td><button className="table-open" onClick={()=>go('ops-trust')}><ArrowRight/></button></td></tr>)}</tbody></table></section></>; }

function OpsTrust() { const [selected,setSelected]=useState(0); const cases=[['EX-1842','Grade variance','RL-2264 · Jaipur','₹2.1L','High'],['EX-1840','Suspicious quantity','RL-2311 · Surat','₹84K','High'],['EX-1836','Pickup scan gap','RL-2294 · Lucknow','₹61K','Medium'],['EX-1829','Prohibited item signal','RL-2281 · Delhi','₹42K','Medium']]; return <><Header title="Trust & exception workbench" subtitle="Human review only where automated evidence is uncertain or value at risk is material." action={<div className="date-control"><Filter/>Priority: All <ChevronDown/></div>}/><div className="workbench"><section className="case-list"><div className="case-list-head"><strong>18 open cases</strong><span>6 high priority</span></div>{cases.map((c,i)=><button key={c[0]} className={selected===i?'active':''} onClick={()=>setSelected(i)}><div><span className={`risk-badge ${c[4].toLowerCase()}`}>{c[4]}</span><strong>{c[1]}</strong></div><p>{c[2]}</p><small>{c[0]} · {c[3]} at risk</small></button>)}</section><section className="case-detail"><div className="case-title"><div><span className="risk-badge high">HIGH</span><h2>Grade variance above tolerance</h2><p>EX-1842 · Lot RL-2264 · 64-unit hub sample</p></div><span className="status urgent">Resolve in 5h 12m</span></div><div className="evidence-grid"><div><span>PROVISIONAL GRADE</span><strong>B · 86% confidence</strong><ProductThumb kind="kurti" size="lg"/><small>Seller evidence · 9 Sep</small></div><div><span>HUB SAMPLE</span><strong>C · 92% confidence</strong><ProductThumb kind="kurti" size="lg"/><small>Hub scan JPR-04 · 10 Sep</small></div><div className="variance-card"><AlertTriangle/><strong>7.4 pp grade drift</strong><span>Threshold: 5 pp</span><p>Surface marks were under-detected in 9 of 64 sampled units.</p></div></div><div className="case-signals"><div><span>Seller concentration</span><strong>2 sellers drive 71% of variance</strong></div><div><span>Buyer exposure</span><strong>₹2.1L lot · unpaid</strong></div><div><span>Recommended action</span><strong>Regrade affected 112 units</strong></div></div><label className="field-label">Decision note<textarea defaultValue="Regrade the affected seller units to C; update manifest and extend the auction by 2 hours."/></label><div className="decision-actions"><button className="row-action">Request another sample</button><button className="row-action">Hold lot</button><button className="primary-action"><CheckCircle2/>Approve regrade</button></div></section><aside className="audit-trail"><span className="aside-title">AUDIT TRAIL</span><div><i/><span><strong>Model flag created</strong><small>10 Sep · 10:12 AM</small></span></div><div><i/><span><strong>Hub evidence attached</strong><small>10 Sep · 10:18 AM</small></span></div><div><i/><span><strong>Assigned to Trust Ops</strong><small>10 Sep · 10:21 AM</small></span></div><div><i/><span><strong>Buyer bid paused</strong><small>Automatic safeguard</small></span></div></aside></div></>; }

export default function Prototype() {
  const [role,setRole]=useState<Role>('seller');
  const [screen,setScreen]=useState('seller-home');
  const [notice,setNotice]=useState<string | null>(null);
  const meta=roleMeta[role];
  const title=useMemo(()=>meta.nav.find(n=>n.id===screen)?.label ?? meta.label,[meta,screen]);
  const switchRole=(next:Role)=>{setRole(next);setScreen(roleStart[next]);setNotice(`Switched to ${roleMeta[next].label}`);setTimeout(()=>setNotice(null),1800)};

  useEffect(()=>{
    const context=(document as Document & {modelContext?:{registerTool:(tool:unknown,options?:{signal?:AbortSignal})=>void|Promise<void>}}).modelContext;
    if(!context?.registerTool) return;
    const lifecycle=new AbortController();
    try { void Promise.resolve(context.registerTool({name:'navigate_reloop_prototype',title:'Navigate ReLoop prototype',description:'Open a role and screen in the visible Meesho ReLoop prototype.',inputSchema:{type:'object',properties:{role:{type:'string',enum:['seller','buyer','ops']},screen:{type:'string'}},required:['role'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input:unknown){const value=input as {role?:Role;screen?:string};if(!['seller','buyer','ops'].includes(value.role??'')) throw new Error('Invalid role');const nextRole=value.role as Role;const allowed=roleMeta[nextRole].nav.map(n=>n.id);const nextScreen=value.screen&&allowed.includes(value.screen)?value.screen:roleStart[nextRole];setRole(nextRole);setScreen(nextScreen);return {role:nextRole,screen:nextScreen,status:'opened'};}},{signal:lifecycle.signal})).catch(()=>undefined); } catch {}
    return ()=>lifecycle.abort();
  },[]);

  const view=(()=>{switch(screen){
    case 'seller-home': return <SellerHome go={setScreen}/>; case 'seller-return': return <SellerReturn go={setScreen}/>; case 'seller-capture': return <SellerCapture go={setScreen}/>; case 'seller-grade': return <SellerGrade go={setScreen}/>; case 'seller-pool': return <SellerPool go={setScreen}/>; case 'seller-pickup': return <SellerPickup go={setScreen}/>; case 'seller-source': return <SellerSource/>;
    case 'buyer-home': return <BuyerHome go={setScreen}/>; case 'buyer-market': return <BuyerMarket go={setScreen}/>; case 'buyer-lot': return <BuyerLot go={setScreen}/>; case 'buyer-bid': return <BuyerBid go={setScreen}/>; case 'buyer-checkout': return <BuyerCheckout go={setScreen}/>; case 'buyer-track': return <BuyerTrack/>; case 'buyer-source': return <BuyerSource/>;
    case 'ops-control': return <OpsControl go={setScreen}/>; case 'ops-trust': return <OpsTrust/>; default:return <SellerHome go={setScreen}/>;
  }})();

  return <main className={`app-shell role-${role}`}>
    {/*
    THESIS: ReLoop makes stranded stock feel like a visible route back to cash, refusing a generic KPI-card dashboard.
    OWN-WORLD: Meesho Jamuni and Aam accents, quiet neutral work surfaces, coloured task icons, disciplined tables and status chips.
    STORY: Each role sees the next money-relevant action, the evidence behind it, and a traceable cross-party handoff.
    FIRST VIEWPORT: Persistent role-aware navigation frames a dense operating surface; transaction state and the primary action lead every screen.
    FORM: Operational control desk, ranked first for recurring marketplace work; seed key direct-approved-flow.
    FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
    */}
    <aside className="sidebar"><div className="brand-row"><div className="brand-mark">m</div><div><div className="brand-name">meesho</div><div className="panel-name">{role==='seller'?'Supplier Panel':role==='buyer'?'Business Exchange':'Operations Console'}</div></div></div><button className="support-link"><LifeBuoy size={18}/>Support</button><button className="support-link"><Bell size={18}/>Notices<span className="notice-dot"/></button><div className="nav-label">{role==='ops'?'OPERATE NETWORK':role==='buyer'?'BUY & SOURCE':'RECOVER VALUE'}</div><nav aria-label={`${meta.label} navigation`}>{meta.nav.map(({id,label,icon:Icon,badge})=><button key={id} className={`nav-item ${screen===id?'active':''}`} onClick={()=>setScreen(id)}><Icon size={19}/><span>{label}</span>{badge&&<span className="nav-badge">{badge}</span>}</button>)}</nav>{role==='seller'&&<><div className="nav-label second">EXISTING TOOLS</div><button className="nav-item muted"><ShoppingBag size={19}/>Orders</button><button className="nav-item muted"><WalletCards size={19}/>Payments</button></>}<div className="sidebar-foot"><div className="seller-avatar">{meta.initials}</div><div className="seller-copy"><strong>{meta.account}</strong><span>{role==='seller'?'Supplier ID 781240':role==='buyer'?'GST verified buyer':'Internal access'}</span></div><ChevronDown size={16}/></div></aside>
    <section className="workspace"><header className="topbar"><div className="searchbox"><Search size={18}/><span>Search {role==='seller'?'return, SKU, pool or payout':role==='buyer'?'lot, category or order':'case, zone, lot or seller'}</span><kbd>⌘ K</kbd></div><div className="prototype-note">Interactive prototype · illustrative data</div><button className="icon-button" aria-label="Help"><CircleHelp size={20}/></button><button className="icon-button alert" aria-label="Open priority action" onClick={()=>setScreen(role==='seller'?'seller-return':role==='buyer'?'buyer-bid':'ops-trust')}><Bell size={20}/><span/></button><label className="role-switch native-role"><Users size={16}/><select aria-label="Prototype perspective" value={role} onChange={e=>switchRole(e.target.value as Role)}><option value="seller">Seller view</option><option value="buyer">Recovery buyer</option><option value="ops">Meesho internal</option></select><ChevronDown size={16}/></label></header><div className="breadcrumb-line"><span>ReLoop prototype</span><ArrowRight/><strong>{title}</strong></div><div className="content">{view}</div></section>{notice&&<div className="toast-message"><CheckCircle2/>{notice}</div>}
  </main>;
}
