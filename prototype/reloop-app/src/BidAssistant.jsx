import React, { useState } from "react";
import { Calculator, ArrowDown, ShieldCheck } from "lucide-react";
import { bidBudget } from "./bid-math.mjs";
const money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(n / 100);
export default function BidAssistant({ lot, onUse, demo }) {
  const [resale, setResale] = useState(""),
    [repair, setRepair] = useState("0"),
    [other, setOther] = useState("0"),
    [saleable, setSaleable] = useState("85"),
    [margin, setMargin] = useState("20");
  const qty = lot.members.reduce((s, m) => s + m.qty, 0),
    min = Math.max(lot.highestBid + 1, ...lot.members.map((m) => m.reserve)),
    b = bidBudget({
      resale: Number(resale) * 100,
      repair: Number(repair) * 100,
      other: Number(other) * 100,
      saleable: Number(saleable),
      margin: Number(margin),
      qty,
    }),
    e = lot.priceEvidence;
  const input = (label, v, set, { max, step = "1" } = {}) => (
    <label className="field">
      <span>{label}</span>
      <input
        type="number"
        min="0"
        max={max}
        step={step}
        value={v}
        onChange={(ev) => set(ev.target.value)}
      />
    </label>
  );
  return (
    <details className="bid-assistant">
      <summary>
        <Calculator size={19} />
        Set a bid limit that works for you
      </summary>
      <p>
        Start with your resale economics. We include the proposed 12.5% premium
        and ₹8 delivery per purchased unit.
      </p>
      <div className="bid-input-grid">
        {input("Resale price / saleable unit (₹)", resale, setResale, {
          step: ".01",
        })}
        {input("Repair / purchased unit (₹)", repair, setRepair, {
          step: ".01",
        })}
        {input("Other costs / purchased unit (₹)", other, setOther, {
          step: ".01",
        })}
        {input("Saleable units (%)", saleable, setSaleable, { max: 100 })}
        {input("Target margin on resale revenue (%)", margin, setMargin, {
          max: 99,
        })}
      </div>
      {b ? (
        <div className="bid-budget-result">
          <span>Your maximum affordable bid / unit</span>
          <strong>{money(b.ceiling)}</strong>
          {b.ceiling >= min ? (
            <>
              <p>
                Stay at or below this limit to meet your target under these
                assumptions.
              </p>
              <button
                type="button"
                className="button secondary"
                onClick={() => onUse(b.ceiling)}
              >
                Use this limit in my bid <ArrowDown size={16} />
              </button>
            </>
          ) : (
            <p className="bid-walk-away">
              <ShieldCheck size={18} />
              The next valid bid is {money(min)}. This lot does not meet your
              target; consider skipping it.
            </p>
          )}
          <div className="bid-stress">
            <b>If 10 percentage points fewer units sell</b>
            <span>
              Maximum affordable bid falls to {money(b.stressCeiling)} / unit.
            </span>
          </div>
        </div>
      ) : (
        <p className="subtle">
          Enter a resale price and valid costs to calculate your limit.
        </p>
      )}
      <div className="bid-comparables">
        <h3>What comparable lots settled for</h3>
        {e?.ready ? (
          <>
            <strong>
              {money(e.low)}–{money(e.high)} <small>/ unit</small>
            </strong>
            <p>
              Middle 50% of {e.count} settled lots · median {money(e.median)}.
            </p>
          </>
        ) : (
          <p>
            Not enough comparable settlements yet ({e?.count || 0}/5 minimum).
            No market price range is shown.
          </p>
        )}
        <small>
          Same category and condition, overlapping product terms, ½–2× this
          lot’s quantity, last 90 days. Product price only; delivery and premium
          excluded. {demo ? "These are illustrative demo sales. " : ""}A
          historical range is not a valuation or a guarantee.
        </small>
      </div>
      <p className="subtle">
        Your limit uses your assumptions, not a trained price forecast. Nothing
        is submitted until you review and place the bid below.
      </p>
    </details>
  );
}
