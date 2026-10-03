import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";
const roles = [
  {
    id: "seller",
    title: "Meesho seller",
    subtitle: "Inside the seller panel",
    description:
      "Recover value from leftover stock, then source fresh inventory.",
    Icon: Package,
  },
  {id:"partner",title:"Wholesaler / supply partner",subtitle:"One business account",description:"Buy surplus lots and supply fresh stock, with separate capabilities.",Icon:ShoppingBag},
  {
    id: "ops",
    title: "Meesho operations",
    subtitle: "Inside the operations console",
    description: "Resolve holds, inspect stock and release test settlements.",
    Icon: ShieldCheck,
  },
];
export default function DemoEntry({ api, onDone, onClose, active }) {
  const ref = useRef(null),
    errorRef = useRef(null),
    [busy, setBusy] = useState(""),
    [error, setError] = useState("");
  useEffect(() => {
    const before = document.activeElement;
    ref.current.showModal();
    return () => before?.focus();
  }, []);
  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);
  async function enter(role) {
    setBusy(role);
    setError("");
    try {
      await api(active ? "demo/role" : "demo/start", { role });
      await onDone();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  return (
    <dialog
      ref={ref}
      className="demo-dialog"
      aria-labelledby="demo-title"
      onCancel={(e) => {
        e.preventDefault();
        if (!busy) onClose();
      }}
    >
      <button
        className="demo-close icon-button"
        aria-label="Close demo chooser"
        disabled={!!busy}
        onClick={onClose}
      >
        <X />
      </button>
      <div className="demo-dialog-header">
        <div className="meesho-wordmark">
          meesho <span>ReLoop + Source</span>
        </div>
        <h1 id="demo-title">
          One extension.
          <br />
          Three workspaces. One connected journey.
        </h1>
        <p>
          ReLoop + Source is our proposed addition to Meesho. Seller and
          operations views belong within Meesho’s existing software. Wholesalers use one account to buy surplus and supply fresh stock.
        </p>
      </div>
      {error && (
        <p ref={errorRef} className="error" role="alert" tabIndex={-1}>
          {error}
        </p>
      )}
      <div className="demo-role-grid">
        {roles.map(({ id, title, subtitle, description, Icon }) => (
          <button
            className={"demo-role " + (active === id ? "selected" : "")}
            key={id}
            disabled={!!busy}
            onClick={() => enter(id)}
          >
            <Icon size={23} />
            <span>
              <b>{title}</b>
              <small>{subtitle}</small>
              <p>{description}</p>
            </span>
            <ArrowRight size={20} />
            <strong>
              {busy === id
                ? "Opening…"
                : active === id
                  ? "Continue this view"
                  : "Enter demo"}
            </strong>
          </button>
        ))}
      </div>
      <div className="demo-explainer">
        <b>No ID or password needed for these demo views.</b>
        <p>
          Try the same journey from each side. Your demo changes are isolated
          from other visitors and saved for up to 24 hours in this browser. Data
          and sample images are illustrative; payments and delivery are test
          events.
        </p>
        <small>
          DICE concept demo · not an official Meesho service or live
          integration.
        </small>
      </div>
      <button className="text-button" disabled={!!busy} onClick={onClose}>
        {active ? "Back to my workspace" : "I have a saved account — sign in"}
      </button>
    </dialog>
  );
}
