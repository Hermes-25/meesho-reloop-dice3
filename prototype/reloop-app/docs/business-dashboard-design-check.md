# Business dashboard design check

29 September 2026 · Operate extension · Documentation pass

The seller and combined wholesaler/supply-partner dashboards extend the incumbent application system. This pass preserves `DESIGN.md` and `.impeccable/design.json`; it introduces no design tokens or replacement visual direction.

## Evidence checked

- Existing `DESIGN.md`, the sidecar metadata and `src/style.css` establish Jamuni actions (`#9f2089`), deep brand text (`#481441`), the pale canvas (`#f7f6f8`), white bordered surfaces and the Inter/Segoe UI/Arial stack.
- Read `BusinessDashboard.jsx`, `business-dashboard.css`, `OrderJourney.jsx`, `order-journey.mjs`, `business-metrics.mjs`, the dashboard tests and the comparison command's quantity check.
- Inspected saved captures in `.impeccable/review/`: `desktop.png`, `partner-desktop-full.png`, `mobile.png`, `seller-order.png`, `order-mobile.png` and `order-hindi-mobile.png`.

## Fit with the incumbent system

The dashboards retain the existing shell, Jamuni primary actions, text-labelled states, flat white panels and restrained line icons. Tabular monetary values keep completed recovery, purchase spend, supplier earnings and pending payouts distinct. Supporting explanations and calculation disclosures supply context without displacing the next action.

The extension uses the established 12px operational-panel radius and 24px panel padding. Four desktop metrics become two columns at or below 1100px; paired panels stack at the same breakpoint. At or below 600px, panel padding reduces to 18px and the horizontal timeline becomes vertical. The inspected phone captures retain readable labels and the incumbent bottom navigation; the Hindi timeline also fits the captured viewport. Surface-specific chart colours and spacing remain implementation details rather than new system tokens.

The timeline names each stage and responsible actor. Recovery pickup availability belongs to the seller; collection, inspection coordination and dispatch belong to Meesho operations. Buyer waiting states do not assign a pickup-booking task. The saved desktop seller capture explicitly identifies Meesho operations as the next owner after availability is saved.

Savings remain qualified comparisons. Missing references display a dash; comparable delivered purchases use the reference landed price less the complete purchase cost, and negative differences remain possible. Source negotiation savings require a matching original-offer quantity and completed order. Quantity-mismatched purchase references are excluded until reconfirmed. The chart exposes each week's amount and date as list content rather than hiding those values inside a single image role.

## Review status and limits

The independent reviewer reported **ship** after the quantity-reference and chart-accessibility fixes. The implementation agent reports 56 passing tests after those fixes. This documentation pass checked the source and saved visual evidence; it did not rerun tests, exercise the browser, or perform a screen-reader session. The context launcher and optional detector were attempted by the implementation agent but unavailable; no detector success is claimed.

Pre-existing documentation drift remains recorded, not repaired: the project has no `PRODUCT.md`; `DESIGN.md` still describes separate buyer/supplier views and a four-role demo chooser; the sidecar is dated 27 September 2026. Those older descriptions and validation counts should not be read as this extension's current role model or verification record.
