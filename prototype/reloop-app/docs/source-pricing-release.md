# Source pricing release — 29 September 2026

Production: https://reloop-source.vercel.app — READY.

Source now charges the supplier 4.5% of goods value on a completed order. The buyer's sourcing fee is zero; the existing ₹8/unit test delivery estimate is separate. Supplier net payout equals goods value minus the rounded supplier fee. Amounts remain integer paise. ReLoop retains its existing 12.5% buyer premium and seller payout calculation.

Quote/counteroffer previews, buyer checkout, order records, supplier payout disclosures, settlement and operations fee totals use the new model. English and Hindi labels are included. Operations outstanding value is net of the Source supplier fee.

Existing unpaid Source orders are upgraded in place using the existing version check. Already-paid and cancelled records retain their original pricing and payment history and are labelled as earlier Source pricing. No records are deleted or reset. Old paid orders are not charged a second supplier fee.

Validation: 22 backend and 20 frontend tests passed. Includes paise rounding, quote-to-checkout consistency, Source settlement with issue hold and idempotent replay, preservation of legacy paid/cancelled orders, unchanged ReLoop economics, Hindi labels and operations fee/net payout totals. Browser checks confirmed buyer review/order/payment ₹16,600 for goods ₹15,000 plus delivery ₹1,600, and supplier fee ₹675/net payout ₹14,325. Those transaction checks used the isolated local database; live quote review is read-only.

Backend source: 45be8d279d1d4f07066957563e3489ead5665aed; Sites version 12; deployment appgdep_6abb45e8a4408191b7f970134a207e04 succeeded.

Frontend: React/esbuild; Vercel production deployment dpl_6Dhqts7W6FYxMZm7xtrovDXRHoFo READY and aliased to the production URL. Cloud build output reported 2 seconds. The initial CLI authorization mismatch was resolved by explicitly selecting the verified team and project; no access permissions were changed.

All 20 review comments matched the pre-release backup exactly after backend publication. The Vercel error-log query for the final deployment returned no logs; this is limited observation, not a claim of continuous monitoring. Drain configuration was not changed or audited.

Payments, delivery and settlements remain test events. No paid hosting services were enabled.
