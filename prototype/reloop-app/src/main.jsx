import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import {
  Package,
  Search,
  ShoppingBag,
  ArrowUpRight,
  ArrowLeft,
  Plus,
  Camera,
  Check,
  ChevronRight,
  Menu,
  X,
  LogOut,
  Truck,
  ShieldCheck,
  Clock,
  Image,
  RefreshCw,
  Languages,
  Inbox,
  ClipboardList,
  AlertCircle,
  SlidersHorizontal,
  ArrowRight,
  Download,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import "./style.css";
import "./features.css";
import DemoEntry from "./DemoEntry.jsx";
import {SourceHub,SourceDetail,PartnerPreferences} from "./SourceWorkspace.jsx";
import {BillSummary,OrderFinancialSummary} from './FinancialSummary.jsx';
import {orderFinancialView,financialEventView} from './order-financials.mjs';
import {OpsLots,OpsProcurement,OpsSettlements} from "./OpsManagement.jsx";
import {workspaceLinks,homePath,routeAllowed} from "./workspace-model.mjs";
import "./personas.css";
import OpsDashboard from "./OpsDashboard.jsx";
import BusinessDashboard from './BusinessDashboard.jsx';
import {OrderJourney,PickupAvailability} from './OrderJourney.jsx';
import {orderStageLabel} from './order-journey.mjs';
import VoiceSearch from "./VoiceSearch.jsx";
import BidAssistant from "./BidAssistant.jsx";
import { api, readWorkspace } from "./api-client.mjs";
import { LanguageProvider, useLanguage } from './i18n.jsx';
import { categories, catalogPhoto, productForTitle, stateForCity, catalogCities } from './catalog.mjs';
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format((n || 0) / 100);
const photo = (id) =>
  catalogPhoto(id)?.replace(/\.png$/, '.jpg') || (/^00000000-0000-4000-8000-00000000000[123]$/.test(id)
    ? "/assets/demo-stock-" + Number(id.slice(-1)) + ".svg"
    : "/api/photos/" + id);
const qty = (l) => l.members.reduce((n, m) => n + m.qty, 0);
const floor = (l) => Math.max(...l.members.map((m) => m.reserve));
const total = (q, p) => ({
  goods: q * p,
  premium: Math.round(q * p * 0.125),
  logistics: q * 800,
  total: q * p + Math.round(q * p * 0.125) + q * 800,
});
const names = {
  draft: "Draft",
  published: "Published",
  withdrawn: "Withdrawn",
  forming: "Gathering stock",
  open: "Open for bids",
  awarded: "Buyer selected",
  awaiting_payment: "Awaiting payment",
  pickup: "Pickup coordination",
  review: "Review inspection",
  ready_dispatch: "Ready to dispatch",
  fulfilment: "Preparing order",
  shipped: "On the way",
  delivered: "Delivered",
  settled: "Settled",
  cancelled: "Cancelled",
  ordered: "Order placed",
};
const download = (text, name) => {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type: "text/plain" }));
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
};
function Button({ children, secondary = false, quiet = false, ...p }) {
  return (
    <button
      className={
        "button " + (quiet ? "quiet" : secondary ? "secondary" : "primary")
      }
      {...p}
    >
      {children}
    </button>
  );
}
function Field({ label, as = "input", options, children, ...p }) {
  return (
    <label className="field">
      <span>{label}</span>
      {as === "select" ? (
        <select {...p}>
          {options.map((o) => (
            <option key={o.value ?? o} value={o.value ?? o}>
              {o.label ?? o}
            </option>
          ))}
        </select>
      ) : as === "textarea" ? (
        <textarea rows="3" {...p} />
      ) : (
        <input {...p} />
      )}
      {children}
    </label>
  );
}
function Badge({ status, children }) {
  return (
    <span className={"badge " + (status || "")}>
      {children || names[status] || status}
    </span>
  );
}
function Empty({ title, children, action }) {
  return (
    <div className="empty">
      <Inbox size={36} />
      <h2>{title}</h2>
      <p>{children}</p>
      {action}
    </div>
  );
}
function SubmitForm({
  onSubmit,
  children,
  label = "Save",
  secondary = false,
  className = "",
}) {
  const [busy, setBusy] = useState(false),
    [err, setErr] = useState("");
  return (
    <form
      className={"form " + className}
      onSubmit={async (e) => {
        e.preventDefault();
        const v = Object.fromEntries(new FormData(e.currentTarget));
        setBusy(true);
        setErr("");
        try {
          await onSubmit(v);
        } catch (x) {
          setErr(x.message);
        } finally {
          setBusy(false);
        }
      }}
    >
      <fieldset disabled={busy}>
        {children}
        {err && (
          <p className="error" role="alert">
            <AlertCircle size={18} />
            {err}
          </p>
        )}
        <Button type="submit" disabled={busy} secondary={secondary}>
          {busy ? "Saving…" : label}
          <ArrowRight size={17} />
        </Button>
      </fieldset>
    </form>
  );
}
function Auth({ onDone, t }) {
  const {lang,setLang}=useLanguage();
  const [demoOpen, setDemoOpen] = useState(true);
  const [tab, setTab] = useState("login"),
    [recovery, setRecovery] = useState(""),
    [entryError, setEntryError] = useState("");
  return (
    <div className="auth-layout">
      {demoOpen && (
        <DemoEntry
          api={api}
          onDone={onDone}
          onClose={() => setDemoOpen(false)}
        />
      )}
      <aside className="auth-story">
        <a className="brand" href="/">
          meesho<span>ReLoop + Source</span>
        </a>
        <div>
          <h1>
            Good stock.
            <br />A fresh start.
          </h1>
          <p>
            Find a buyer for leftover inventory, or find the stock your business
            needs next.
          </p>
          <div className="auth-proof">
            <CheckCircle2 />
            Your stock stays with you until a buyer pays.
          </div>
          <div className="auth-proof">
            <ShieldCheck />
            Photos, prices and decisions stay together.
          </div>
        </div>
        <small>
          Proposed Meesho extension · DICE concept demo, not a live integration
        </small>
      </aside>
      <main className="auth-main">
        <div className="auth-box">
          <button className="text-button auth-language" aria-label="Change language" onClick={()=>setLang(lang==='hi'?'en':'hi')}>{lang==='hi'?'English':'हिन्दी'}</button>
          <button
            className="button secondary auth-demo-launch"
            onClick={() => setDemoOpen(true)}
          >
            Explore the three workspaces
            <ArrowRight size={18} />
          </button>
          {recovery ? (
            <>
              <Badge>Keep this safe</Badge>
              <h1>Your recovery code</h1>
              <p>
                This is the only time we display it. You can use it to reset
                your password without email.
              </p>
              <code className="recovery-code">{recovery}</code>
              <Button
                onClick={() => download(recovery, "reloop-recovery-code.txt")}
              >
                <Download size={18} />
                Save recovery code
              </Button>
              {entryError && (
                <p className="error" role="alert">
                  {entryError}
                </p>
              )}
              <Button
                secondary
                onClick={async () => {
                  try {
                    await onDone();
                  } catch (e) {
                    setEntryError(e.message);
                  }
                }}
              >
                I saved it — open my workspace
              </Button>
            </>
          ) : (
            <>
              <div className="tabs">
                {[
                  ["login", "Sign in"],
                  ["signup", "Create account"],
                ].map(([key, label]) => (
                  <button
                    className={tab === key ? "active" : ""}
                    key={key}
                    onClick={() => setTab(key)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <h1>
                {tab === "signup"
                  ? "Your business, connected."
                  : tab === "recover"
                    ? "Get back to your work."
                    : "Welcome back."}
              </h1>
              <p className="muted">
                {tab === "signup"
                  ? "Create a workspace for your business."
                  : "Pick up where you left off, on any device."}
              </p>
              <SubmitForm
                key={tab}
                label={
                  tab === "signup"
                    ? "Create account"
                    : tab === "recover"
                      ? "Reset password"
                      : "Sign in"
                }
                onSubmit={async (v) => {
                  const r = await api(tab, v);
                  if (r.recoveryCode) setRecovery(r.recoveryCode);
                  else await onDone();
                }}
              >
                {tab === "signup" && (
                  <>
                    <Field
                      label="I want to"
                      name="role"
                      as="select"
                      options={[
                        {
                          value: "seller",
                          label: "Sell leftover stock and source new stock",
                        },
                        { value: "partner", label: "Wholesaler / supply partner" },
                      ]}
                    />
                    <Field
                      label="Business name"
                      name="business"
                      minLength="2"
                      maxLength="90"
                      required
                    />
                    <Field
                      label="City"
                      name="city"
                      minLength="2"
                      maxLength="60"
                      required
                    />
                  </>
                )}
                <Field
                  label="Username"
                  name="username"
                  autoComplete="username"
                  pattern="[a-zA-Z0-9_.\-]{3,32}"
                  required
                  placeholder="e.g. aarohi_retail"
                />
                {tab === "recover" && (
                  <Field label="Recovery code" name="recoveryCode" required />
                )}
                <Field
                  label={tab === "recover" ? "New password" : "Password"}
                  name="password"
                  type="password"
                  autoComplete={
                    tab === "login" ? "current-password" : "new-password"
                  }
                  minLength={tab === "login" ? 1 : 12}
                  maxLength="128"
                  required
                >
                  {tab !== "login" && (
                    <small>Use at least 12 characters.</small>
                  )}
                </Field>
              </SubmitForm>
              {tab === "login" && (
                <button
                  className="text-button"
                  onClick={() => setTab("recover")}
                >
                  Use a recovery code
                </button>
              )}
              <p className="auth-foot">
                Judge-ready test environment. Accounts and stock are saved;
                payments and courier events use test mode.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
function App({initialData=null,initialPath}={}) {
  const [data, setData] = useState(initialData),
    [loading, setLoading] = useState(!initialData),
    [path, setPath] = useState(initialPath||location.pathname),
    [error, setError] = useState(""),
    [menu, setMenu] = useState(false),
    [busy, setBusy] = useState(false);
  const {lang,setLang,t}=useLanguage();
  const drawerRef = useRef(null);
  const [demoPicker, setDemoPicker] = useState(false);
  const [stockTab,setStockTab]=useState("active"),[orderKind,setOrderKind]=useState("all");
  useEffect(() => {
    if (!menu) return;
    const prior = document.activeElement,
      drawer = drawerRef.current;
    const targets = () =>
      Array.from(drawer.querySelectorAll("button,a[href]")).filter(
        (x) => !x.disabled,
      );
    targets()[0]?.focus();
    const key = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setMenu(false);
      }
      if (e.key === "Tab") {
        const a = targets(),
          first = a[0],
          last = a.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      prior?.focus();
    };
  }, [menu]);
  const nav = (p) => {
    history.pushState(null, "", p);
    setPath(p);
    setMenu(false);
    window.scrollTo(0, 0);
  };
  async function refresh() {
    try {
      setData(await api("state"));
      setError("");
    } catch (e) {
      if (e.status === 401) setData(null);
      else setError(e.message);
    } finally {
      setLoading(false);
    }
  }
  async function enterWorkspace() {
    const next = await readWorkspace();
    setData(next);
    setError("");
    setDemoPicker(false);
    nav("/");
  }
  useEffect(() => {
    refresh();
    const pop = () => setPath(location.pathname);
    window.addEventListener("popstate", pop);
    return () => window.removeEventListener("popstate", pop);
  }, []);
  useEffect(() => {
    if (!data) return;
    const timer = setInterval(() => {
      if (
        !document.hidden &&
        !["INPUT", "TEXTAREA", "SELECT"].includes(
          document.activeElement?.tagName,
        )
      )
        refresh();
    }, 20000);
    return () => clearInterval(timer);
  }, [!!data]);
  const command = async (c) => {
    try {
      const r = await api("command", {
        command: c,
        version: data.version,
        requestId: crypto.randomUUID(),
      });
      setData(r);
      return r.result;
    } catch (e) {
      if (e.status === 409) await refresh();
      throw e;
    }
  };
  const act = async (c, after) => {
    setBusy(true);
    setError("");
    try {
      const r = await command(c);
      after?.(r);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  if (loading)
    return (
      <main className="initial">
        <div className="brand">
          ReLoop<span>+ Source</span>
        </div>
        <div className="skeleton" />
        <div className="skeleton" />
        <p>Opening your workspace…</p>
      </main>
    );
  if (!data)
    return (
      <>
        {error && (
          <div className="error">
            {error}
            <button onClick={refresh}>Retry</button>
          </div>
        )}
        <Auth onDone={enterWorkspace} t={t} />
      </>
    );
  const me = data.me,
    role = me.role;
  const current = path === "/" ? homePath(me) : path;
  const icons={Package,Truck,ShoppingBag,ShieldCheck,ClipboardList,AlertCircle,Search,Clock,Dashboard:LayoutDashboard,Settings:SlidersHorizontal};
  const links=workspaceLinks(me).map(([url,label,icon])=>[url,icons[icon],t(label)]);
  const pickStock = (id) => data.stocks.find((x) => x.id === id),
    pickLot = (id) => data.lots.find((x) => x.id === id),
    pickOrder = (id) => data.orders.find((x) => x.id === id),
    pickRfq = (id) => data.rfqs.find((x) => x.id === id);
  const goOrder = (o) => nav("/orders/" + o.id);
  const title = (a, b, action) => (
    <div className="page-heading">
      <div>
        <h1>{a}</h1>
        {b && <p>{b}</p>}
      </div>
      {action}
    </div>
  );
  const lotTitle = (o) => o.title || pickLot(o.ref)?.title || "Recovery order";
  const stockStatus=s=>{const l=pickLot(s.lotId),o=data.orders.find(o=>o.id===l?.orderId);return o?.status||s.status};
  const stockOrder=s=>data.orders.find(o=>o.id===pickLot(s.lotId)?.orderId);
  const stockActive=s=>s.status==="draft"||s.status==="published"&&["open","forming",undefined].includes(pickLot(s.lotId)?.status);
  const inventory=data.stocks.filter(s=>stockTab==="active"?stockActive(s):!stockActive(s));
  const orderRows=data.orders.filter(o=>current==="/supply-orders"?o.kind==="source":role==="seller"?o.kind==="recovery":orderKind==="all"||o.kind===orderKind);
  const content = () => {
    if(!routeAllowed(me,current))return <Empty title="This page is outside your workspace." action={<Button onClick={()=>nav(homePath(me))}>Open my workspace</Button>}>Use your workspace navigation to continue.</Empty>;
    if(current==="/partner")return <PartnerPreferences me={me} command={command}/>;
    if(current==="/dashboard")return <BusinessDashboard data={data} nav={nav} command={command}/>;
    if(current==="/issues")return <OpsSettlements data={data} nav={nav}/>;
    if (current === "/inventory/new")
      return (
        <StockForm
          t={t}
          city={me.city}
          command={command}
          onDone={() => nav("/inventory")}
        />
      );
    if (current.startsWith("/inventory/")) {
      const stock = pickStock(current.split("/")[2]);
      return stock?.status === "draft" ? (
        <StockForm
          key={stock.id}
          existing={stock}
          t={t}
          city={me.city}
          command={command}
          onDone={() => nav("/inventory")}
        />
      ) : (
        <Empty title="Draft not found">Only your drafts can be edited.</Empty>
      );
    }
    if (current === "/inventory")
      return (
        <>
          {title(
            t("Your stock, ready for what’s next.", "आपके स्टॉक का अगला कदम।"),
            t(
              "Manage your stock and follow each recovery order.",
              "अपना स्टॉक सँभालें और हर रिकवरी ऑर्डर की स्थिति देखें।",
            ),
            <Button onClick={() => nav("/inventory/new")}>
              <Plus size={18} />
              {t("Add stock", "स्टॉक जोड़ें")}
            </Button>,
          )}
          <button className="text-link" onClick={()=>nav('/dashboard')}>View recovery performance<ArrowRight size={16}/></button>
          <div className="workspace-tabs"><button aria-pressed={stockTab==="active"} onClick={()=>setStockTab("active")}>Active stock</button><button aria-pressed={stockTab==="history"} onClick={()=>setStockTab("history")}>Stock history</button></div>
          {!inventory.length ? (
            <Empty
              title={t(
                "Give leftover stock another chance.",
                "बचे स्टॉक को एक और मौका दें।",
              )}
              action={
                <Button onClick={() => nav("/inventory/new")}>
                  <Camera size={18} />
                  {t("Add your first stock", "पहला स्टॉक जोड़ें")}
                </Button>
              }
            >
              {t(
                "Start with three photos, the quantity and the minimum you want per unit.",
                "तीन फ़ोटो, संख्या और हर सामान की न्यूनतम कीमत जोड़ें।",
              )}
            </Empty>
          ) : (
            <div className="record-list">
              {inventory.map((s) => (
                <article className="stock-row" key={s.id}>
                  <img loading="lazy" decoding="async" src={photo(s.photos[0])} alt={s.title} />
                  <div className="row-main">
                    <Badge status={stockStatus(s)}>{stockOrder(s)?orderStageLabel(stockOrder(s),me):null}</Badge>
                    <h2>{s.title}</h2>
                    <p>
                      {s.qty} units · {s.condition} · {s.city}
                    </p>
                    <small>
                      Minimum recovery {money(s.qty * s.reserve)} ·{" "}
                      {money(s.reserve)} / unit
                    </small>
                  </div>
                  <div className="row-actions">
                    {s.status === "draft" ? (
                      <>
                        <Button
                          secondary
                          onClick={() => nav("/inventory/" + s.id)}
                        >
                          {s.reviewAfterCancellation
                            ? t(
                                "Review returned stock",
                                "वापस आए स्टॉक की जाँच करें",
                              )
                            : t("Edit draft", "ड्राफ़्ट बदलें")}
                        </Button>
                        {!s.reviewAfterCancellation && (
                          <Button
                            disabled={busy}
                            onClick={() =>
                              act({ type: "stock.publish", id: s.id })
                            }
                          >
                            {t("Publish stock", "स्टॉक लिस्ट करें")}
                            <ArrowUpRight size={17} />
                          </Button>
                        )}
                      </>
                    ) : (
                      s.lotId && (
                        <Button
                          secondary
                          onClick={() => nav(stockOrder(s)?'/orders/'+stockOrder(s).id:"/market/" + s.lotId)}
                        >
                          {stockOrder(s)?t('Track recovery order'):t("View my lot", "मेरा लॉट देखें")}
                          <ChevronRight size={17} />
                        </Button>
                      )
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      );
    if (current === "/market")
      return role==="ops"?<OpsLots data={data} nav={nav}/>:<Marketplace data={data} nav={nav} t={t}/>;
    if (current.startsWith("/market/")) {
      const l = pickLot(current.split("/")[2]);
      if (!l)
        return (
          <Empty title="Lot not found">
            Refresh the workspace to see the latest stock.
          </Empty>
        );
      const q = qty(l),
        min = floor(l),
        isSeller = l.members.some((m) => m.owner === me.id);
      return (
        <>
          <button className="back" onClick={() => nav(role==="seller"?"/inventory":"/market")}>
            <ArrowLeft size={17} />
            {role==="seller"?"My stock":role==="ops"?"Lots & auctions":"Buy surplus"}
          </button>
          {title(
            l.title,
            l.city + " · " + l.category,
            <Badge status={l.status} />,
          )}
          <div className="detail-grid">
            <section>
              {l.sampleImage&&<p className="subtle">Generated sample photos; inspect actual stock before buying.</p>}
              <div className="photo-grid">
                {l.members
                  .flatMap((m) => m.photos)
                  .slice(0, 6)
                  .map((p, i) => (
                    <img
                      src={photo(p)}
                      key={p + i}
                      alt={
                        (me.demo
                          ? "Illustrative sample view "
                          : "Stock evidence ") +
                        (i + 1)
                      }
                    />
                  ))}
              </div>
              <div className="section">
                <h2>{role==="ops"?"Lot details and declared condition":role==="seller"?"Your listed stock":"Know what you’re buying."}</h2>
                <p>{l.description}</p>
                <dl className="facts">
                  <div>
                    <dt>Seller-declared condition</dt>
                    <dd>{l.condition}</dd>
                  </div>
                  <div>
                    <dt>Available quantity</dt>
                    <dd>{q} units</dd>
                  </div>
                  <div>
                    <dt>Minimum lot size</dt>
                    <dd>{l.moq} units</dd>
                  </div>
                  <div>
                    <dt>Contributions</dt>
                    <dd>{l.members.length} seller listings</dd>
                  </div>
                </dl>
                <p className="subtle">
                  Photos support a buying decision; they cannot verify hidden
                  damage. Physical inspection comes before dispatch.
                </p>
              </div>
              <section className="section">
                <h2>One compatible lot, traceable contributions.</h2>
                {l.members.map((m, i) => (
                  <article className="contribution" key={m.stockId}>
                    <div className="line-row">
                      <b>
                        {m.owner === me.id
                          ? "Your stock"
                          : m.business || "Seller contribution " + (i + 1)}
                      </b>
                      <span>
                        {m.qty} units · minimum {money(m.reserve)}
                      </span>
                    </div>
                    <p>
                      <b>Declared details: </b>
                      {m.description || l.description}
                    </p>
                    <div className="photo-grid">
                      {m.photos.map((p, n) => (
                        <a
                          key={p}
                          href={photo(p)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img
                            loading="lazy"
                            src={photo(p)}
                            alt={"Seller " + (i + 1) + " evidence " + (n + 1)}
                          />
                        </a>
                      ))}
                    </div>
                  </article>
                ))}
                <p className="subtle">
                  Contributions join only when the product title, category,
                  condition, city and minimum lot size match. Similar-looking
                  products are not automatically combined.
                </p>
                {isSeller &&
                  !l.bids.length &&
                  ["forming", "open"].includes(l.status) &&
                  l.members
                    .filter((m) => m.owner === me.id)
                    .map((m) => (
                      <Button
                        key={m.stockId}
                        quiet
                        disabled={busy}
                        onClick={() =>
                          act({ type: "stock.withdraw", id: m.stockId })
                        }
                      >
                        Withdraw my uncommitted stock
                      </Button>
                    ))}
              </section>
            </section>
            <aside className="buy-panel">
              <span className="muted">
                {l.highestBid ? "Highest bid / unit" : "Minimum bid / unit"}
              </span>
              <strong className="amount">{money(l.highestBid || min)}</strong>
              <p>
                {l.bidCount} {t(l.bidCount===1?'bid':'bids')} · full lot of {q}{" "}
                units
              </p>
              {role === "partner" && me.capabilities?.buy && l.status === "open" ? (
                <BidForm lot={l} command={command} demo={me.demo} />
              ) : l.status === "forming" ? (
                <div className="notice">
                  {Math.max(0, l.moq - q)} more compatible units needed before
                  bidding opens.
                </div>
              ) : isSeller ? (
                <div className="notice">
                  Your stock stays with you. Pickup becomes available after the
                  buyer pays.
                </div>
              ) : null}
              {role === "ops" && l.status === "open" && l.bidCount > 0 && (
                <Button
                  disabled={busy}
                  onClick={() =>
                    act({ type: "auction.close", id: l.id }, (r) =>
                      nav("/orders/" + r.id),
                    )
                  }
                >
                  Close auction & award highest bid
                </Button>
              )}
              {l.orderId && data.orders.some((o) => o.id === l.orderId) && (
                <Button secondary onClick={() => nav("/orders/" + l.orderId)}>
                  Open order
                  <ArrowRight size={17} />
                </Button>
              )}
              <div className="small-rule">
                <ShieldCheck size={18} />
                <span>
                  Quantity changes require explicit buyer and seller acceptance.
                </span>
              </div>
            </aside>
          </div>
        </>
      );
    }
    if (current === "/orders"||current==="/supply-orders")
      return (
        <>
          {title(
            current==="/supply-orders"?(role==="seller"?"Fresh-stock orders":"Supply orders"):role==="seller"?"Recovery orders":"Orders",
            "Track payment, inspection, delivery and settlement.",
          )}
          {role==="partner"&&current==="/orders"&&<div className="workspace-tabs">{[["all","All orders"],["recovery","Surplus purchases"],["source","Supply orders"]].map(([v,label])=><button key={v} aria-pressed={orderKind===v} onClick={()=>setOrderKind(v)}>{label}</button>)}</div>}
          {!orderRows.length ? (
            <Empty title="Your orders will appear here.">
              A winning recovery bid or accepted supplier quote starts an order.
            </Empty>
          ) : (
            <div className="record-list">
              {[...orderRows].reverse().map(o=>orderFinancialView(o,data.me)).map((o) => (
                <button
                  className="order-row"
                  key={o.id}
                  onClick={() => goOrder(o)}
                >
                  <div className="order-icon">
                    <Truck />
                  </div>
                  <div className="row-main">
                    <Badge status={o.status}>{orderStageLabel(o,me)}</Badge>
                    <h2>{lotTitle(o)}</h2>
                    <p>
                      {o.qty} units ·{" "}
                      {o.kind === "source" ? "Fresh stock" : "Recovery"} ·{" "}
                      {new Date(o.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <div className="order-money"><strong>{money(o.financialView==='earnings'?o.payout.net:o.cost.total)}</strong><small>{o.financialView==='earnings'?(o.status==='cancelled'?'No payout':o.status==='settled'?'Net payout recorded':'You receive'):(o.status==='cancelled'?'Cancelled order total':o.payment?'Order total':'Total payable')}</small></div>
                  <ChevronRight size={20} />
                </button>
              ))}
            </div>
          )}
        </>
      );
    if (current.startsWith("/orders/")) {
      const o = pickOrder(current.split("/")[2]);
      if (!o)
        return (
          <Empty title="Order not found">
            This account may not be part of this order.
          </Empty>
        );
      return (
        <OrderDetail
          o={o}
          me={me}
          title={lotTitle(o)}
          events={data.events.filter((e) => e.entity === o.id)}
          command={command}
          act={act}
          busy={busy}
          nav={nav}
        />
      );
    }
    if (current === "/source/new")
      return (
        <>
          <button className="back" onClick={() => nav("/source")}>
            <ArrowLeft size={17} />
            {t("All requests", "सभी ज़रूरतें")}
          </button>
          {title(
            t("Tell suppliers what you need.", "सप्लायर को अपनी ज़रूरत बताएँ।"),
            t(
              "Compare clear quotes before you commit.",
              "ऑर्डर से पहले कीमत और समय की तुलना करें।",
            ),
          )}
          <div className="narrow">
            <SubmitForm
              label={t("Publish request", "ज़रूरत पोस्ट करें")}
              onSubmit={async (v) => {
                const r = await command({
                  type: "rfq.create",
                  ...v,
                  qty: Number(v.qty),
                });
                nav("/source/" + r.id);
              }}
            >
              <Field
                label={t("Product", "सामान")}
                name="title"
                required
                minLength="3"
                maxLength="100"
              />
              <div className="form-grid">
                <Field
                  label={t("Category", "श्रेणी")}
                  name="category"
                  as="select"
                  options={categories}
                />
                <Field
                  label={t("Quantity", "संख्या")}
                  name="qty"
                  type="number"
                  min="1"
                  max="10000"
                  required
                />
              </div>
              <Field
                label={t(
                  "Specification, size and material",
                  "माप, कपड़ा और पूरी जानकारी",
                )}
                name="description"
                as="textarea"
                minLength="10"
                maxLength="1000"
                required
              />
              <div className="form-grid">
                <Field
                  label={t("Delivery city", "डिलीवरी शहर")}
                  name="city"
                  defaultValue={me.city}
                  required
                />
                <Field
                  label={t("Needed by", "कब तक चाहिए")}
                  name="neededBy"
                  type="date"
                  min={new Date().toISOString().slice(0, 10)}
                  required
                />
              </div>
            </SubmitForm>
          </div>
        </>
      );
    if(current==="/source")return role==="ops"?<OpsProcurement data={data} nav={nav}/>:role==="partner"&&!me.capabilities?.supply?<><Empty title="Enable supplying to receive matching requests." action={<Button onClick={()=>nav('/partner')}>Set supply capabilities</Button>}>Add your product categories, delivery coverage and capacity.</Empty><SourceHub data={{...data,rfqs:data.rfqs.filter(r=>r.quotes.some(q=>q.owner===me.id))}} nav={nav}/></>:<SourceHub data={data} nav={nav}/>;
    if(current.startsWith('/source/'))return <SourceDetail key={current} r={pickRfq(current.split('/')[2])} me={me} command={command} nav={nav}/>;
    if (current === "/operations")
      return role === "ops" ? (
        <OpsDashboard data={data} nav={nav} />
      ) : (
        <Empty title="Operations access required">
          Use your assigned operator account or the isolated operations demo.
        </Empty>
      );
    if (current === "/activity")
      return (
        <>
          {title(
            "A record you can return to.",
            "Saved actions from the lots, requests and orders available to your account.",
          )}
          <Activity events={data.events} />
        </>
      );
    return (
      <Empty
        title="This page was not found."
        action={<Button onClick={() => nav("/")}>Open workspace</Button>}
      />
    );
  };
  return (
    <div className="app-layout">
      {demoPicker && (
        <DemoEntry
          api={api}
          active={me.demo ? role : undefined}
          onClose={() => setDemoPicker(false)}
          onDone={enterWorkspace}
        />
      )}
      <a className="skip" href="#main">
        Skip to content
      </a>
      <aside ref={drawerRef} className={"sidebar " + (menu ? "open" : "")}>
        <button className="brand" onClick={() => nav("/")}>
          meesho<span>ReLoop + Source</span>
        </button>
        <div className="business-label">
          <span className="avatar">
            {me.business.slice(0, 2).toUpperCase()}
          </span>
          <div>
            <b>{me.business}</b>
            <small>
              {role === "ops"
                ? "Operations"
                : role === "partner" ? "Supply partner" : "Seller"}{" "}
              workspace
            </small>
          </div>
        </div>
        <nav aria-label="Main navigation">
          {links.map(([url, Icon, label]) => (
            <button
              key={url}
              className={current.startsWith(url) ? "active" : ""}
              onClick={() => nav(url)}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <p>
            Proposed Meesho extension
            <br />
            Payments and logistics in test mode
          </p>
        </div>
      </aside>
      {menu && (
        <button
          className="menu-scrim"
          aria-label="Close navigation"
          onClick={() => setMenu(false)}
        />
      )}
      <div className="workspace">
        <header className="topbar">
          <button
            className="icon-button mobile-menu"
            onClick={() => setMenu(!menu)}
            aria-label="Open navigation"
            aria-expanded={menu}
          >
            <Menu />
          </button>
          <span className="topbar-title">
            {current.startsWith("/orders/") && pickOrder(current.split("/")[2])?.kind === "source" ? t(role === "seller" ? "Fresh-stock orders" : "Supply orders") : current === "/supply-orders" ? t(role === "seller" ? "Fresh-stock orders" : "Supply orders") : links.find(([p]) => current.startsWith(p))?.[2] || t("Workspace")}
          </span>
          <div className="topbar-actions">
            <button className="demo-switch" onClick={() => setDemoPicker(true)}>
              {me.demo ? "Switch demo view" : "Explore demo"}
            </button>
            <button
              className="icon-button language-button"
              onClick={() => {
                const v = lang === "hi" ? "en" : "hi";
                setLang(v);
                localStorage.setItem("reloop-app-language", v);
              }}
              aria-label="Change language"
            >
              <Languages size={19} />
              {lang === "hi" ? "English" : "हिन्दी"}
            </button>
            <button
              className="icon-button"
              aria-label="Refresh records"
              onClick={refresh}
            >
              <RefreshCw size={18} />
            </button>
            <button
              className="icon-button"
              aria-label="Sign out"
              onClick={async () => {
                await api(me.demo ? "demo/end" : "logout", {});
                setData(null);
                nav("/");
                await refresh();
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>
        <main id="main" className="main">
          {me.demo && (
            <div className="demo-workspace-note">
              <span>
                <b>Meesho concept demo</b> ·{" "}
                {role === "ops"
                  ? "Operations"
                  : role === "partner" ? "Wholesaler / supply partner" : "Seller"}{" "}
                view · illustrative data
              </span>
              <small>Only your demo changes here.</small>
            </div>
          )}
          {error && (
            <div className="error global-error" role="alert">
              <AlertCircle size={18} />
              {error}
              <button aria-label="Dismiss error" onClick={() => setError("")}>
                <X size={16} />
              </button>
            </div>
          )}
          {content()}
        </main>
        <nav className="bottom-nav" aria-label="Mobile navigation">
          {links.slice(0, 4).map(([url, Icon, label]) => (
            <button
              className={current.startsWith(url) ? "active" : ""}
              key={url}
              onClick={() => nav(url)}
            >
              <Icon size={21} />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
function Activity({ events }) {
  return events.length ? (
    <ol className="activity">
      {[...events].reverse().map((e) => (
        <li key={e.id}>
          <span className="activity-dot">
            <Check size={13} />
          </span>
          <div>
            <b>{e.message}</b>
            <small>
              {e.role} · {new Date(e.at).toLocaleString("en-IN")}
            </small>
          </div>
        </li>
      ))}
    </ol>
  ) : (
    <Empty title="No actions yet.">
      Your saved decisions will appear here.
    </Empty>
  );
}
function Breakdown({ value }) {
  return <BillSummary value={value}/>;
}
function BidForm({ lot, command, demo }) {
  const [price, setPrice] = useState(
      Math.max(lot.highestBid + 100, floor(lot)) / 100,
    ),
    [done, setDone] = useState(false),
    c = total(qty(lot), Math.round(price * 100));
  return (
    <>
      <BidAssistant
        lot={lot}
        demo={demo}
        onUse={(p) => {
          setPrice(p / 100);
          setDone(false);
        }}
      />
      <SubmitForm
        label="Place my bid"
        onSubmit={async () => {
          await command({
            type: "bid.place",
            id: lot.id,
            price: Math.round(price * 100),
          });
          setDone(true);
        }}
      >
        <Field
          label="Your bid / unit (₹)"
          type="number"
          min={Math.max(lot.highestBid + 1, floor(lot)) / 100}
          step="0.01"
          value={price}
          onChange={(e) => {
            setPrice(Number(e.target.value));
            setDone(false);
          }}
          required
        />
        <Breakdown value={c} />
        <label className="checkbox">
          <input type="checkbox" required />I reviewed the condition, quantity
          and complete test cost.
        </label>
      </SubmitForm>
      {done && (
        <p className="success">
          <CheckCircle2 size={18} />
          Your bid is saved.
        </p>
      )}
    </>
  );
}
async function preparePhoto(file) {
  if (file.size > 20000000)
    throw new Error("Choose an image smaller than 20 MB.");
  const bitmap = await createImageBitmap(file),
    c = document.createElement("canvas"),
    scale = Math.min(1, 1400 / Math.max(bitmap.width, bitmap.height));
  c.width = Math.round(bitmap.width * scale);
  c.height = Math.round(bitmap.height * scale);
  c.getContext("2d").drawImage(bitmap, 0, 0, c.width, c.height);
  bitmap.close();
  const thumb = document.createElement("canvas");
  thumb.width = 32;
  thumb.height = 32;
  const cx = thumb.getContext("2d");
  cx.drawImage(c, 0, 0, 32, 32);
  const d = cx.getImageData(0, 0, 32, 32).data,
    gray = Array.from(
      { length: 1024 },
      (_, i) => (d[i * 4] + d[i * 4 + 1] + d[i * 4 + 2]) / 3,
    ),
    light = gray.reduce((a, b) => a + b, 0) / 1024;
  let edge = 0;
  for (let y = 1; y < 31; y++)
    for (let x = 1; x < 31; x++) {
      const i = y * 32 + x;
      edge += Math.abs(
        4 * gray[i] - gray[i - 1] - gray[i + 1] - gray[i - 32] - gray[i + 32],
      );
    }
  const sharp = edge / 900;
  thumb.width = 9;
  thumb.height = 8;
  cx.drawImage(c, 0, 0, 9, 8);
  const p = cx.getImageData(0, 0, 9, 8).data;
  let signature = "";
  for (let y = 0; y < 8; y++)
    for (let x = 0; x < 8; x++) {
      const a = (y * 9 + x) * 4,
        b = a + 4;
      signature +=
        p[a] + p[a + 1] + p[a + 2] > p[b] + p[b + 1] + p[b + 2] ? "1" : "0";
    }
  let blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.8));
  if (blob.size > 780000)
    blob = await new Promise((r) => c.toBlob(r, "image/jpeg", 0.55));
  if (blob.size > 800000)
    throw new Error(
      "This image is too detailed. Please choose a smaller photo.",
    );
  return {
    blob,
    signature,
    warning:
      light < 45
        ? "This photo looks dark. Try brighter light."
        : light > 235
          ? "This photo may be overexposed."
          : sharp < 5
            ? "This photo may lack detail. Check focus before continuing."
            : "",
  };
}
function StockForm({ t, city, command, onDone, existing }) {
  const [photos, setPhotos] = useState(
      existing
        ? Array.from({length:3},(_,i)=>existing.photos[i]?{id:existing.photos[i],signature:null,warning:""}:null)
        : [null, null, null],
    ),
    [uploading, setUploading] = useState(-1),
    [error, setError] = useState("");
  async function upload(f, i) {
    if (!f) return;
    setUploading(i);
    setError("");
    try {
      const v = await preparePhoto(f);
      const similar = photos.some(
        (p) =>
          p?.signature &&
          [...p.signature].filter((a, n) => a !== v.signature[n]).length < 5,
      );
      const response = await fetch("/api/photos", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "image/jpeg" },
        body: v.blob,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (photos.some((p) => p?.id === result.id))
        throw new Error(
          "That exact photo is already attached. Add another view.",
        );
      setPhotos((old) =>
        old.map((p, n) =>
          n === i
            ? {
                id: result.id,
                signature: v.signature,
                warning:
                  v.warning ||
                  (similar
                    ? "This looks similar to another view. Make sure it shows different evidence."
                    : ""),
              }
            : p,
        ),
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setUploading(-1);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {t("Give buyers a clear picture.", "खरीदार को सामान साफ़ दिखाएँ।")}
          </h1>
          <p>
            {t(
              "Three photos. An honest description. Your minimum price.",
              "तीन फ़ोटो। सही जानकारी। आपकी न्यूनतम कीमत।",
            )}
          </p>
        </div>
        <Badge>₹0 listing fee</Badge>
      </div>
      {existing?.reviewAfterCancellation && (
        <p className="notice warning">
          This order was cancelled. Review the inspection history, then correct
          the quantity, condition and defect details before saving and
          publishing again.
        </p>
      )}
      <div className="create-layout">
        <section>
          <h2>{t("Show the actual stock", "असली सामान दिखाएँ")}</h2>
          <div className="capture-grid">
            {[
              t("Front view", "सामने की फ़ोटो"),
              t("Defect or detail", "खराबी या बारीकी"),
              t("All units together", "सभी इकाइयाँ साथ"),
            ].map((label, i) => (
              <div key={label} className="capture-slot">
                <label>
                  {photos[i] ? (
                    <img loading="lazy" decoding="async" src={photo(photos[i].id)} alt={label} />
                  ) : (
                    <Camera size={28} />
                  )}
                  <b>
                    {uploading === i
                      ? t("Uploading…", "अपलोड हो रहा है…")
                      : label}
                  </b>
                  <span>
                    {photos[i]
                      ? t("Replace photo", "फ़ोटो बदलें")
                      : t("Take or choose a photo", "फ़ोटो लें या चुनें")}
                  </span>
                  <input
                    aria-label={label}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    capture="environment"
                    disabled={uploading >= 0}
                    onChange={(e) => upload(e.target.files[0], i)}
                  />
                </label>
                {photos[i]?.warning && (
                  <p className="photo-warning">{photos[i].warning}</p>
                )}
              </div>
            ))}
          </div>
          <p className="subtle">
            {t(
              "A local quality check flags dark or repeated photos. It does not certify authenticity or grade damage. Avoid faces and personal documents.",
              "फ़ोटो की गुणवत्ता की जाँच कम रोशनी या मिलती-जुलती फ़ोटो दिखाती है। इससे सामान की असलियत या खराबी तय नहीं होती।",
            )}
          </p>
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <SubmitForm
            label={t("Save stock draft", "स्टॉक ड्राफ़्ट सेव करें")}
            onSubmit={async (v) => {
              if (photos.some((p) => !p))
                throw new Error(
                  t(
                    "Please add all three photos.",
                    "कृपया तीनों फ़ोटो जोड़ें।",
                  ),
                );
              await command({
                type: existing ? "stock.update" : "stock.create",
                id: existing?.id,
                ...v,
                photos: photos.map((p) => p.id),
                qty: Number(v.qty),
                reserve: Math.round(Number(v.reserve) * 100),
                moq: Number(v.moq),
                ownership: v.ownership === "on",
                noOpenClaim: v.noOpenClaim === "on",
              });
              onDone();
            }}
          >
            <Field
              label={t("Product name and variant", "सामान का नाम और प्रकार")}
              name="title"
              defaultValue={existing?.title}
              placeholder={t(
                "Tan crossbody bag · 24 cm",
                "भूरा स्लिंग बैग · 24 सेमी",
              )}
              required
              minLength="3"
              maxLength="100"
            />
            <div className="form-grid">
              <Field
                label={t("Category", "श्रेणी")}
                name="category"
                defaultValue={existing?.category}
                as="select"
                options={categories}
              />
              <Field
                label={t("Actual condition", "वास्तविक हालत")}
                name="condition"
                defaultValue={existing?.condition}
                as="select"
                options={[
                  "Unused surplus",
                  "Minor visible wear",
                  "Repair required",
                ]}
              />
            </div>
            <Field
              label={t(
                "Describe the stock and every known defect",
                "सामान और हर ज्ञात खराबी बताएँ",
              )}
              name="description"
              defaultValue={existing?.description}
              as="textarea"
              required
              minLength="10"
              maxLength="1000"
            />
            <div className="form-grid">
              <Field
                label={t("Units you own", "आपके पास संख्या")}
                name="qty"
                defaultValue={existing?.qty}
                type="number"
                min="1"
                max="10000"
                required
              />
              <Field
                label={t(
                  "Minimum price per unit (₹)",
                  "हर इकाई की न्यूनतम कीमत (₹)",
                )}
                name="reserve"
                defaultValue={existing ? existing.reserve / 100 : undefined}
                type="number"
                min="1"
                max="1000000"
                step=".01"
                required
              />
            </div>
            <div className="form-grid">
              <Field
                label={t("Pickup city", "पिकअप शहर")}
                name="city"
                defaultValue={existing?.city || city}
                required
                minLength="2"
                maxLength="60"
              />
              <Field
                label={t("Minimum combined lot size", "समूह की न्यूनतम संख्या")}
                name="moq"
                type="number"
                min="1"
                max="10000"
                defaultValue={existing?.moq || 100}
                required
              />
            </div>
            <label className="checkbox">
              <input type="checkbox" name="ownership" required />
              {t(
                "I own this stock and the details are accurate.",
                "यह सामान मेरा है और जानकारी सही है।",
              )}
            </label>
            <label className="checkbox">
              <input type="checkbox" name="noOpenClaim" required />
              {t(
                "No return claim or compensation decision is pending for this stock.",
                "इस स्टॉक पर कोई रिटर्न क्लेम या मुआवज़े का निर्णय बाकी नहीं है।",
              )}
            </label>
          </SubmitForm>
        </section>
        <aside className="side-note">
          <ShieldCheck size={26} />
          <h2>
            {t("Your minimum stays yours.", "न्यूनतम कीमत आप तय करते हैं।")}
          </h2>
          <p>
            {t(
              "Compatible stock can form a bigger lot. A valid bid must meet every seller’s minimum price.",
              "मिलता-जुलता स्टॉक बड़ा समूह बना सकता है। बोली हर विक्रेता की न्यूनतम कीमत से कम नहीं हो सकती।",
            )}
          </p>
          <hr />
          <h3>{t("Keep your stock with you.", "सामान अपने पास रखें।")}</h3>
          <p>
            {t(
              "Pickup starts only after the winning buyer makes the test payment.",
              "खरीदार के टेस्ट भुगतान के बाद ही पिकअप शुरू होगा।",
            )}
          </p>
        </aside>
      </div>
    </>
  );
}
function Marketplace({ data, nav, t }) {
  const [query, setQuery] = useState(""),
    [category, setCategory] = useState(""),
    [city, setCity] = useState(""),
    [state, setState] = useState(""),
    [minimum, setMinimum] = useState(1),
    [unused, setUnused] = useState(false),
    [rank, setRank] = useState(null),
    [status, setStatus] = useState(""),
    [running, setRunning] = useState(false);
  const worker = useRef(null),
    pending = useRef(null);
  useEffect(() => () => worker.current?.terminate(), []);
  const lots = data.lots.filter((l) => ["forming", "open"].includes(l.status));
  const eligible = lots.filter(
    (l) =>
      (!category || l.category === category) &&
      (!state || (l.state||stateForCity(l.city))===state) &&
      (!city || [l.city,catalogCities.find(c=>c.city===l.city)?.cityHi].join(' ').toLowerCase().includes(city.toLowerCase())) &&
      qty(l) >= minimum &&
      (!unused || l.condition === "Unused surplus"),
  );
  const shown = rank
    ? eligible
        .filter((l) => rank.some((r) => r.id === l.id))
        .sort(
          (a, b) =>
            rank.findIndex((x) => x.id === a.id) -
            rank.findIndex((x) => x.id === b.id),
        )
    : eligible.filter(
        (l) =>
          !query ||
          [l.title, l.description, l.category, l.city, l.state, productForTitle(l.title)?.titleHi, productForTitle(l.title)?.descriptionHi, catalogCities.find(c=>c.city===l.city)?.cityHi]
            .join(" ")
            .toLowerCase()
            .includes(query.toLowerCase()),
      );
  async function match(mode, file) {
    if (!eligible.length) {
      setStatus("No lots meet these filters. Adjust them before matching.");
      return;
    }
    if (mode === "text" && !query.trim()) {
      setStatus("Describe the stock you want first.");
      return;
    }
    setRunning(true);
    setStatus(mode==='photo'?"Preparing photo search…":"Preparing your search…");
    try {
      if (!worker.current) {
        worker.current = new Worker("/ml-worker.js", { type: "module" });
        worker.current.onmessage = (e) => {
          if (e.data.status) {
            setStatus(e.data.status);
            return;
          }
          if (e.data.error) pending.current?.reject(new Error(e.data.error));
          else pending.current?.resolve(e.data.results);
        };
        worker.current.onerror = () =>
          pending.current?.reject(
            new Error(
              "Matching could not finish. Please try again or type a simpler search.",
            ),
          );
      }
      const image = file
        ? await new Promise((r, j) => {
            const reader = new FileReader();
            reader.onload = () => r(reader.result);
            reader.onerror = j;
            reader.readAsDataURL(file);
          })
        : null;
      const results = await new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
          worker.current?.terminate();
          worker.current = null;
          reject(
            new Error(
              "Matching could not finish. Please try again or type a simpler search.",
            ),
          );
        }, 240000);
        pending.current = {
          resolve: (v) => {
            clearTimeout(timer);
            resolve(v);
          },
          reject: (e) => {
            clearTimeout(timer);
            reject(e);
          },
        };
        worker.current.postMessage({
          mode,
          query,
          image,
          candidates: eligible.map((l) => ({
            id: l.id,
            text: l.title + ". " + l.description + ". " + l.category,
          })),
        });
      });
      setRank(results);
      setStatus(
        mode === "text"
          ? "Matched by meaning across languages. All results still meet your filters."
          : "Matched your photo to stock descriptions. Photo similarity does not verify condition.",
      );
    } catch (e) {
      setStatus(e.message);
      setRank(null);
    } finally {
      setRunning(false);
    }
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <h1>
            {t(
              "Find stock that fits your business.",
              "अपने कारोबार के लिए सही स्टॉक खोजें।",
            )}
          </h1>
          <p>
            {t(
              "Start with what you need. Keep condition and economics in view.",
              "अपनी ज़रूरत बताएँ। हालत और लागत का ध्यान रखें।",
            )}
          </p>
        </div>
        <Badge>{lots.length} recovery lots</Badge>
      </div>
      <section className="search-surface">
        <VoiceSearch
          disabled={running}
          onText={(text) => {
            setQuery(text);
            setRank(null);
            setStatus(
              "Review the recognised words, then select Match by meaning.",
            );
          }}
        />
        <div className="search-row">
          <div className="search-input">
            <Search size={20} />
            <input
              aria-label="Search stock"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setRank(null);
              }}
              placeholder={t(
                "Try “bags for school books” or “स्कूल के लिए बैग”",
                "जैसे “स्कूल के लिए बैग”",
              )}
            />
            {query && (
              <button
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  setRank(null);
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>
          <Button disabled={running} onClick={() => match("text")}>
            {running ? "Matching…" : t("Match by meaning", "मतलब से खोजें")}
            <ArrowRight size={17} />
          </Button>
          <label className="button secondary photo-search">
            <Camera size={18} />
            {t("Search by photo", "फ़ोटो से खोजें")}
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              disabled={running}
              onChange={(e) =>
                e.target.files[0] && match("photo", e.target.files[0])
              }
            />
          </label>
        </div>
        <div className="filters">
          <Field
            label="Category"
            as="select"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setRank(null);
            }}
            options={[
              { value: "", label: "Any category" },
              ...categories,
            ]}
          />
          <Field label="State / UT" as="select" value={state} onChange={e=>{setState(e.target.value);setRank(null)}} options={[{value:'',label:'All states'},...[...new Set(lots.map(l=>l.state||stateForCity(l.city)).filter(Boolean))].sort()]} />
          <Field
            label="City"
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setRank(null);
            }}
            placeholder="Any city"
          />
          <Field
            label="At least (units)"
            type="number"
            min="1"
            max="10000"
            value={minimum}
            onChange={(e) => {
              setMinimum(Number(e.target.value));
              setRank(null);
            }}
          />
          <label className="checkbox">
            <input
              type="checkbox"
              checked={unused}
              onChange={(e) => {
                setUnused(e.target.checked);
                setRank(null);
              }}
            />
            Unused stock only
          </label>
        </div>
        {status && (
          <p className="search-status" role="status">
            {status}
          </p>
        )}
        <details className="ml-explanation">
          <summary>How matching helps</summary>
          <p>
            Describe what you need in Hindi or English, or use a product photo. Results stay within your category, state, city, condition and quantity filters. A match is a suggestion; check the listing and actual condition before buying.
          </p>
          <button
            className="text-button"
            onClick={() => {
              setRank(null);
              setStatus("Basic text search is active.");
            }}
          >
            Use basic text search
          </button>
        </details>
      </section>
      <div className="results-count">
        <b>
          {running
            ? "Ranking eligible stock…"
            : shown.length + " matching lots"}
        </b>
        {lots.length !== eligible.length && (
          <span>{lots.length - eligible.length} outside your filters</span>
        )}
      </div>
      {running ? (
        <div className="skeleton" aria-label="Comparing eligible stock" />
      ) : shown.length ? (
        <div className="lot-grid">
          {shown.map((l) => (
            <button
              className="lot-card"
              key={l.id}
              onClick={() => nav("/market/" + l.id)}
            >
              <div className="lot-photo">
                <img loading="lazy" decoding="async" src={photo(l.members[0].photos[0])} alt={l.title} />
                <Badge status={l.status} />
              </div>
              <div className="lot-info">
                <span className="muted">
                  {l.city} · {l.state||stateForCity(l.city)} · {l.category}
                </span>
                <h2>{l.title}</h2>
                <p>{l.condition}</p>
                <div className="lot-bottom">
                  <span>
                    <b>{money(floor(l))}</b> / unit minimum
                  </span>
                  <strong>{qty(l)} units</strong>
                </div>
                <div className="match-reason">
                  <Check size={14} />
                  {rank
                    ? "Ranked by similarity · selected filters met"
                    : "Meets your selected filters"}
                </div>
              </div>
            </button>
          ))}
        </div>
      ) : (
        <Empty
          title={
            lots.length
              ? "No stock fits these filters yet."
              : "The marketplace is ready for its first stock."
          }
        >
          {lots.length
            ? "Try another city, quantity or description."
            : "Published seller stock will appear here, with its actual photos and minimum price."}
        </Empty>
      )}
    </>
  );
}
function OrderDetail({ o, me, title, events, command, act, busy, nav }) {
  o=orderFinancialView(o,me);
  events=events.map(e=>financialEventView(e,o,me));
  const buyer = o.buyer === me.id,
    contributor = o.members.some((m) => m.owner === me.id),
    ops = me.role === "ops";
  return (
    <>
      <button className="back" onClick={() => nav(o.kind === "source" && me.role === "seller" ? "/supply-orders" : "/orders")}>
        <ArrowLeft size={17} />
        All orders
      </button>
      <div className="page-heading">
        <div>
          <h1>{title}</h1>
          <p>
            {o.kind === "source" ? "Source" : "Recovery"} order ·{" "}
            {o.id.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <Badge status={o.status}>{orderStageLabel(o,me)}</Badge>
      </div>
      <OrderJourney order={o} me={me}/>
      <div className="detail-grid">
        <section id="order-next-action" tabIndex={-1}>
          {o.issue && (
            <div className="notice warning">
              <b>Open issue</b>
              <p>{o.issue}</p>
            </div>
          )}
          {buyer && o.status === "awaiting_payment" && (
            <section className="section">
              <h2>Review and pay in test mode.</h2>
              <p>
                No money will be charged. This creates a stored test payment
                record for this order.
              </p>
              <Button
                disabled={busy}
                onClick={() => act({ type: "order.pay", id: o.id })}
              >
                Pay {money(o.cost.total)} in test mode
                <ArrowRight size={17} />
              </Button>
            </section>
          )}
          {(buyer || ops) && o.status === "awaiting_payment" && (
            <Button
              quiet
              disabled={busy}
              onClick={() => act({ type: "order.cancel", id: o.id })}
            >
              Cancel unpaid order
            </Button>
          )}
          {o.status === "cancelled" && (
            <p className="notice">
              {o.kind === "recovery"
                ? "Stock is back in each seller’s drafts for review before relisting."
                : "The stock request is open again so another valid quote can be selected."}
            </p>
          )}
          {contributor && o.status === "pickup" && <PickupAvailability order={o} me={me} command={command}/>}
          {ops && o.status === "pickup" && (
            <section className="section">
              <h2>Record inspection findings.</h2>
              <p>Use inspected quantities. Do not infer a grade from photos.</p>
              <SubmitForm
                label="Send inspection for acceptance"
                onSubmit={(v) =>
                  command({
                    type: "inspection.submit",
                    id: o.id,
                    note: v.note,
                    accepted: o.members.map((m) => ({
                      stockId: m.stockId,
                      qty: Number(v[m.stockId]),
                    })),
                  })
                }
              >
                {o.members.map((m, i) => (
                  <Field
                    key={m.stockId}
                    label={
                      "Accepted units · seller " +
                      (i + 1) +
                      " (declared " +
                      m.qty +
                      ")"
                    }
                    name={m.stockId}
                    type="number"
                    min="0"
                    max={m.qty}
                    defaultValue={m.qty}
                    required
                  />
                ))}
                <Field
                  label="Inspection evidence and reason"
                  name="note"
                  as="textarea"
                  minLength="5"
                  required
                />
                {o.members.some((m) => !o.pickups?.[m.owner]) && (
                  <p className="notice">
                    Waiting for every seller to confirm stock availability.
                  </p>
                )}
              </SubmitForm>
            </section>
          )}
          {o.inspection && (
            <section className="section">
              <h2>Inspection decision</h2>
              <p>{o.inspectionNote}</p>
              <div className="line-row">
                <span>Proposed accepted quantity</span>
                <b>
                  {o.proposedQty} / {o.originalQty} units
                </b>
              </div>
              {o.inspection.map((m, i) => (
                <div className="line-row" key={m.stockId}>
                  <span>
                    {m.owner === me.id
                      ? "Your contribution"
                      : "Seller " + (i + 1)}
                  </span>
                  <b>{m.qty} units accepted</b>
                </div>
              ))}
              <div className="line-row">
                <span>{contributor&&!ops?'Your revised earnings':'Revised test total'}</span>
                <b>{money(contributor&&!ops?o.payout.net:total(o.proposedQty, o.unitPrice).total)}</b>
              </div>
              {o.status === "review" && (buyer || contributor) && (
                <>
                  {o.acceptances.includes(me.id) ? (
                    <p className="success">
                      <CheckCircle2 size={18} />
                      Your acceptance is saved. Waiting for the remaining
                      parties.
                    </p>
                  ) : (
                    <Button
                      disabled={busy || !o.proposedQty}
                      onClick={() =>
                        act({ type: "inspection.accept", id: o.id })
                      }
                    >
                      Accept revised quantity and amount
                    </Button>
                  )}
                  {buyer && (
                    <Button
                      quiet
                      disabled={busy}
                      onClick={() => act({ type: "order.cancel", id: o.id })}
                    >
                      Reject and cancel with a full test refund
                    </Button>
                  )}
                </>
              )}
            </section>
          )}
          {((ops && o.status === "ready_dispatch") ||
            (contributor &&
              o.kind === "source" &&
              o.status === "fulfilment")) && (
            <section className="section">
              <h2>Record dispatch.</h2>
              <SubmitForm
                label="Confirm test dispatch"
                onSubmit={(v) =>
                  command({ type: "order.dispatch", id: o.id, ...v })
                }
              >
                <Field
                  label="Test tracking reference"
                  name="tracking"
                  minLength="3"
                  maxLength="120"
                  required
                />
              </SubmitForm>
            </section>
          )}
          {o.tracking && (
            <section className="section">
              <h2>Delivery record</h2>
              <p>
                Test tracking reference: <b>{o.tracking}</b>
              </p>
              {buyer && o.status === "shipped" && (
                <Button
                  disabled={busy}
                  onClick={() => act({ type: "order.receive", id: o.id })}
                >
                  Confirm I received the stock
                  <Check size={18} />
                </Button>
              )}
            </section>
          )}
          {ops && o.issue && (
            <section className="section">
              <h2>Resolve the open issue.</h2>
              <SubmitForm
                label="Save resolution"
                onSubmit={(v) =>
                  command({ type: "order.resolve", id: o.id, ...v })
                }
              >
                <Field
                  label="Resolution and supporting reason"
                  name="note"
                  as="textarea"
                  minLength="5"
                  required
                />
              </SubmitForm>
            </section>
          )}
          {ops && o.status === "delivered" && (
            <section className="section">
              <h2>Release test settlement.</h2>
              <p>
                {o.cost.pricingModel==='source-supplier-4.5-v1' ? "The supplier receives goods value less the 4.5% supplier fee. An open issue blocks this action." : "The seller receives the cleared product value. An open issue blocks this action."}
              </p>
              <Button
                disabled={busy || !!o.issue}
                onClick={() => act({ type: "order.settle", id: o.id })}
              >
                Record settlement
                <Check size={18} />
              </Button>
            </section>
          )}
          {(ops || contributor) && o.settlements?.length>0 && (
            <section className="section">
              <h2>Settlement recorded.</h2>
              {o.settlements
                .filter((s) => ops || s.owner === me.id)
                .map((s, i) => (
                  <div className="line-row" key={s.owner + i}>
                    <span>
                      {s.owner === me.id
                        ? "Your test payout"
                        : "Seller " + (i + 1)}
                    </span>
                    <b>{money(s.amount)}</b>
                  </div>
                ))}
            </section>
          )}
          {(buyer || contributor) &&
            !["awaiting_payment", "settled", "cancelled"].includes(
              o.status,
            ) && (
              <details className="issue-form">
                <summary>Something needs attention</summary>
                <SubmitForm
                  label="Raise an issue"
                  secondary
                  onSubmit={(v) =>
                    command({ type: "order.issue", id: o.id, ...v })
                  }
                >
                  <Field
                    label="Describe the problem"
                    name="note"
                    as="textarea"
                    minLength="5"
                    required
                  />
                </SubmitForm>
              </details>
            )}
          <section className="section">
            <h2>Order history</h2>
            <Activity events={events} />
          </section>
        </section>
        <aside className="buy-panel">
          <h2>{ops?'Financial reconciliation':contributor?'Your payout summary':'Payment summary'}</h2>
          {o.agreedOffer && <div className="agreed-terms"><h3>Agreed terms</h3><p>Dispatch {o.agreedOffer.dispatchFrom} — {o.agreedOffer.dispatchTo}</p><ul className="term-pills">{(o.agreedOffer.terms || []).map(term => <li key={term}>{term}</li>)}</ul></div>}
          <p>
            {contributor&&!ops?o.payout.qty:o.qty} units × {money(o.unitPrice)}
          </p>
          <OrderFinancialSummary order={o} me={me}/>
          <p className="subtle">
            Proposed pricing for this challenge app. No live tax invoice,
            payment, courier booking or payout is issued.
          </p>
          <Button
            secondary
            onClick={() =>
              download(
                JSON.stringify({ ...o, history: events }, null, 2),
                "reloop-order-" + o.id.slice(0, 8) + ".json",
              )
            }
          >
            <Download size={17} />
            Download order record
          </Button>
        </aside>
      </div>
    </>
  );
}
if(typeof document!=='undefined')createRoot(document.getElementById("root")).render(<LanguageProvider><App /></LanguageProvider>);
export {App,Marketplace,StockForm,OrderDetail,Activity,Auth};
