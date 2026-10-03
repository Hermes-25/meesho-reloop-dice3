import React, { useState } from "react";
import {
  ArrowRight,
  ChevronRight,
  MapPin,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { opsMetrics, DAY } from "./ops-metrics.mjs";
import map from "./data/india-map.json";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n / 100);
const count = (n) => n.toLocaleString("en-IN");
const tone = (r) => (r.issues ? "urgent" : r.actions ? "attention" : "normal");
const age = (now, t) => {
  const h = Math.max(0, Math.floor((now - t) / 3600000));
  return h < 1
    ? "Under 1h"
    : h < 24
      ? h + "h"
      : Math.floor(h / 24) + "d " + (h % 24) + "h";
};
const pct = (n) => (n == null ? "—" : Math.round(n * 100) + "%");
export default function OpsDashboard({ data, nav }) {
  const [city, setCity] = useState(""),
    [kind, setKind] = useState(""),
    [days, setDays] = useState(30),
    [queue, setQueue] = useState("all"),
    [expanded, setExpanded] = useState(false);
  const now = Date.now(),
    m = opsMetrics(data, { city, kind, days, now }),
    tasks = m.tasks.filter((t) => queue === "all" || t.tone === queue),
    cities = [
      ...new Set([...data.lots, ...data.rfqs].map((x) => x.city)),
    ].sort();
  const focusQueue = (v) => {
    setQueue(v);
    document
      .getElementById("ops-queue")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const maxBar = Math.max(1, ...m.pipeline.map((x) => x.count)),
    maxTrend = Math.max(1, ...m.trend.map((x) => x.value)),
    maxRegion = Math.max(1, ...m.regions.map((r) => r.orders));
  const namedPositions = (c) =>
    map.positions[c] ||
    map.positions[
      { "New Delhi": "Delhi", Bangalore: "Bengaluru", Cochin: "Kochi" }[c]
    ];
  return (
    <div className="ops-dashboard">
      <div className="page-heading">
        <div>
          <h1>Keep stock moving. Clear the holds first.</h1>
          <p>
            Meesho operations · ReLoop + Source
            {data.me.demo ? " · illustrative workspace" : ""}
          </p>
        </div>
        <span className="ops-updated">
          <span /> Updated with saved records
        </span>
      </div>
      <div className="ops-filterbar">
        <label>
          Location
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">All India</option>
            {cities.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </label>
        <label>
          Flow
          <select value={kind} onChange={(e) => setKind(e.target.value)}>
            <option value="">ReLoop + Source</option>
            <option value="recovery">ReLoop recovery</option>
            <option value="source">Source procurement</option>
          </select>
        </label>
        <label>
          Completed results
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
          </select>
        </label>
        {city && (
          <button className="text-button" onClick={() => setCity("")}>
            Clear city filter
          </button>
        )}
      </div>
      <section className="ops-primary" aria-label="Priority operations metrics">
        <button
          className={"ops-metric " + (m.exceptions.length ? "urgent" : "")}
          onClick={() => focusQueue("urgent")}
        >
          <span>
            Exceptions to resolve <AlertCircle size={17} />
          </span>
          <strong>{m.exceptions.length}</strong>
          <small>
            {money(m.exceptions.reduce((s, x) => s + x.value, 0))} product value
            affected
          </small>
          <b>
            Open priority queue <ArrowRight size={15} />
          </b>
        </button>
        <button className="ops-metric" onClick={() => focusQueue("attention")}>
          <span>
            Next operations actions <ArrowRight size={17} />
          </span>
          <strong>{m.tasks.length - m.exceptions.length}</strong>
          <small>Inspect, dispatch, settle or award</small>
          <b>
            See what is ready <ArrowRight size={15} />
          </b>
        </button>
        <div className="ops-metric">
          <span>
            Value awaiting settlement <Clock size={17} />
          </span>
          <strong>{money(m.awaitingValue)}</strong>
          <small>Paid, active orders · net seller / supplier payouts</small>
          <p>Backlog, not platform revenue</p>
        </div>
        <div className="ops-metric">
          <span>
            Recovery value settled <CheckCircle2 size={17} />
          </span>
          <strong>{money(m.recoveryValue)}</strong>
          <small>
            {m.recovery.length} ReLoop orders · last {days} days
          </small>
          <p>Test settlements to sellers</p>
        </div>
      </section>
      <section className="ops-panel ops-queue" id="ops-queue">
        <div className="ops-section-head">
          <div>
            <h2>What needs your decision</h2>
            <p>Issue holds first, then inspection mismatches and ready work.</p>
          </div>
          <div className="segmented" aria-label="Queue filter">
            {[
              ["all", "All"],
              ["urgent", "Exceptions"],
              ["attention", "Ready work"],
            ].map(([v, l]) => (
              <button
                key={v}
                aria-pressed={queue === v}
                onClick={() => {
                  setQueue(v);
                  setExpanded(false);
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
        {tasks.length ? (
          <div className="ops-task-list">
            {(expanded ? tasks : tasks.slice(0, 5)).map((t) => (
              <button
                key={t.id}
                className="ops-task"
                onClick={() => nav(t.href)}
              >
                <span className={"status-dot " + t.tone} />
                <span className="ops-task-main">
                  <b>{t.label}</b>
                  <span>
                    {t.title} · {t.city}
                  </span>
                </span>
                <span className="ops-task-age">
                  {age(now, t.at)}
                  <small>since update</small>
                </span>
                <span className="ops-task-value">
                  {money(t.value)}
                  <small>product value</small>
                </span>
                <ChevronRight size={18} />
              </button>
            ))}
          </div>
        ) : (
          <div className="ops-empty">
            <CheckCircle2 size={24} />
            <p>
              No {queue === "urgent" ? "exceptions" : "ready actions"} in this
              selection.
            </p>
          </div>
        )}
        {tasks.length > 5 && (
          <button
            className="text-button ops-more"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? "Show first five"
              : "Show all " + tasks.length + " actions"}
          </button>
        )}
      </section>
      <div className="ops-visual-grid">
        <section className="ops-panel">
          <div className="ops-section-head">
            <div>
              <h2>Where work is concentrated</h2>
              <p>
                Active orders: ReLoop pickup city, Source delivery city. Select
                a city to focus.
              </p>
            </div>
            <MapPin size={21} />
          </div>
          <div className="ops-map-wrap">
            <svg
              className="india-map"
              viewBox="0 0 500 520"
              aria-label="India map: active order concentration by city"
            >
              <path
                d={map.path}
                fill="#f1edf2"
                stroke="#b9adb9"
                strokeWidth="1"
                fillRule="evenodd"
              />
              {m.regions
                .filter((r) => namedPositions(r.city))
                .map((r) => {
                  const [x, y] = namedPositions(r.city),
                    radius = 5 + 13 * Math.sqrt(r.orders / maxRegion);
                  return (
                    <g
                      key={r.city}
                      className={
                        "map-node " +
                        tone(r) +
                        (city === r.city ? " selected" : "")
                      }
                      role="button"
                      tabIndex="0"
                      aria-label={`${r.city}: ${r.orders} active orders, ${r.issues} exceptions. Filter city.`}
                      onClick={() => setCity(city === r.city ? "" : r.city)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setCity(city === r.city ? "" : r.city);
                        }
                      }}
                    >
                      <title>
                        {r.city}: {r.orders} active orders · {r.units} units ·{" "}
                        {r.issues} exceptions
                      </title>
                      <circle cx={x} cy={y} r={radius} />
                      <text x={x} y={y + 4} textAnchor="middle">
                        {r.orders}
                      </text>
                      {[
                        "Guwahati",
                        "Jaipur",
                        "Mumbai",
                        "Chennai",
                        "Kolkata",
                        "Delhi",
                      ].includes(r.city) && (
                        <text
                          className="map-city"
                          x={
                            x +
                            (["Mumbai", "Jaipur"].includes(r.city)
                              ? -radius - 5
                              : radius + 5)
                          }
                          y={y + (r.city === "Delhi" ? -8 : 4)}
                          textAnchor={
                            ["Mumbai", "Jaipur"].includes(r.city)
                              ? "end"
                              : "start"
                          }
                        >
                          {r.city}
                        </text>
                      )}
                    </g>
                  );
                })}
            </svg>
            <div className="map-legend">
              <span>
                <i className="status-dot urgent" />
                Exception present
              </span>
              <span>
                <i className="status-dot attention" />
                Ops action ready
              </span>
              <span>
                <i className="status-dot normal" />
                Waiting on next handoff
              </span>
            </div>
            <p className="subtle">
              Bubble size follows order count. Colour reflects the
              highest-priority state.{" "}
              <a
                href="https://surveyofindia.gov.in/pages/outline-maps-of-india"
                target="_blank"
                rel="noreferrer"
              >
                Outline: Survey of India
              </a>{" "}
              · educational demo.
            </p>
          </div>
          <details className="ops-data-table">
            <summary>
              City totals, including locations not mapped ({m.regions.length})
            </summary>
            <table>
              <thead>
                <tr>
                  <th>City</th>
                  <th>Orders</th>
                  <th>Units</th>
                  <th>Exceptions</th>
                </tr>
              </thead>
              <tbody>
                {m.regions.map((r) => (
                  <tr key={r.city}>
                    <td>
                      <button
                        className="text-button"
                        onClick={() => setCity(r.city)}
                      >
                        {r.city}
                      </button>
                    </td>
                    <td>{r.orders}</td>
                    <td>{count(r.units)}</td>
                    <td>{r.issues}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        </section>
        <section className="ops-panel">
          <div className="ops-section-head">
            <div>
              <h2>Where orders are waiting</h2>
              <p>
                {m.active.length} active orders · current stage, not a
                conversion funnel.
              </p>
            </div>
          </div>
          <div className="pipeline-chart">
            {m.pipeline.map((s) => (
              <div className="pipeline-row" key={s.status}>
                <span>{s.label}</span>
                <div className="bar-track">
                  <div style={{ width: (s.count / maxBar) * 100 + "%" }} />
                </div>
                <b>{s.count}</b>
              </div>
            ))}
          </div>
          <div className="ops-flow-note">
            <h3>Inspection is a decision gate.</h3>
            <p>
              Quantity changes stay on hold until buyer and seller accept. Money
              remains blocked while an issue is open.
            </p>
          </div>
          <div className="ops-secondary-inline">
            <div>
              <strong>{pct(m.bidCoverage)}</strong>
              <span>Open lots with ≥1 bid</span>
              <small>
                {m.open.filter((l) => l.bidCount > 0).length} of {m.open.length}{" "}
                eligible lots
              </small>
            </div>
            <div>
              <strong>{m.declared ? pct(m.accepted / m.declared) : "—"}</strong>
              <span>Inspected units accepted</span>
              <small>
                {count(m.accepted)} of {count(m.declared)} declared units
              </small>
            </div>
          </div>
        </section>
      </div>
      <section className="ops-panel">
        <div className="ops-section-head">
          <div>
            <h2>Recovery reaching sellers</h2>
            <p>
              Daily product value settled · last {days} calendar dates in India
              time.
            </p>
          </div>
          <strong className="ops-trend-total">
            {money(m.trend.reduce((s, d) => s + d.value, 0))}
          </strong>
        </div>
        <div
          className="trend-chart"
          role="img"
          aria-label={`Daily recovery settlements, ${money(m.trend.reduce((s, d) => s + d.value, 0))} total. Exact values in table below.`}
        >
          {m.trend.map((d) => (
            <div className="trend-column" key={d.date}>
              <div
                style={{ height: (d.value / maxTrend) * 130 + "px" }}
                title={d.date + ": " + money(d.value)}
              />
            </div>
          ))}
        </div>
        <div className="trend-labels">
          <span>{m.trend[0].date}</span>
          <span>
            ₹0 baseline · bars scaled to {money(maxTrend === 1 ? 0 : maxTrend)}
          </span>
          <span>{m.trend.at(-1).date}</span>
        </div>
        <details className="ops-data-table">
          <summary>Daily settlement values</summary>
          <table>
            <thead>
              <tr>
                <th>Date (IST)</th>
                <th>Product value</th>
              </tr>
            </thead>
            <tbody>
              {m.trend.map((d) => (
                <tr key={d.date}>
                  <td>{d.date}</td>
                  <td>{money(d.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </details>
        {m.missingSettlementDates > 0 && (
          <p className="subtle">
            {m.missingSettlementDates} older settlements have no recorded
            settlement date and are excluded from dated results.
          </p>
        )}
      </section>
      <details className="ops-panel ops-definitions">
        <summary>Business health & KPI definitions</summary>
        <div className="ops-health-grid">
          <div>
            <h3>
              {m.medianDays == null ? "—" : m.medianDays.toFixed(1) + " days"}
            </h3>
            <p>Median payment → settlement</p>
            <small>
              Orders settled in the selected period; includes both flows.
            </small>
          </div>
          <div>
            <h3>{money(m.premium)}</h3>
            <p>Platform fees on settled orders</p>
            <small>
              ReLoop buyer premium + Source supplier fee. Test records before operating costs, not profit.
            </small>
          </div>
          <div>
            <h3>
              {m.paid.length
                ? pct(m.paid.filter((o) => o.issue).length / m.paid.length)
                : "—"}
            </h3>
            <p>Paid orders with an open issue</p>
            <small>
              Current unresolved issues / all non-cancelled paid orders in this
              selection.
            </small>
          </div>
        </div>
        <p className="subtle">
          Live backlog metrics ignore the completed-results time filter. City
          and flow filters apply to every metric except the national map, which
          keeps context for city switching. Age is time since the latest
          recorded update, not a promised SLA. Recovery values exclude service
          premiums and delivery. Accepted-unit ratio excludes cancelled orders;
          all recorded inspections are included. No invented growth rate,
          forecast or contribution margin.
        </p>
      </details>
    </div>
  );
}
