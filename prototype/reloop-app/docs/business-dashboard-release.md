# Business dashboards and order coordination

Date: 29 September 2026

## Scope and design contract

Extend the existing ReLoop + Source application in Operate mode. Preserve the incumbent Jamuni palette, typography, sidebar, persona restrictions and private fee summaries. Replace the seller's promotional fee strip with meaningful business information, and give the combined wholesaler/supply partner one dashboard. No change to the proposed pricing or test-only payments and logistics.

The first view prioritises completed value, active work and outstanding payout. Supporting panels show next actions, order-stage counts, six weeks of dated settlements, stock/sourcing activity and recent active orders. Missing savings references remain unestimated rather than becoming invented gains.

## Metric definitions

- Seller cash recovered: own net payouts on settled recovery orders. Recovery value is not profit or assumed savings.
- Seller recovery orders: own recovery orders excluding cancellations; pending payout includes paid, unfinished recovery settlements.
- Seller Source negotiation savings: first supplier offer minus the final agreed goods price, for the same quantity on completed orders. Delivery is excluded from this specific comparison.
- Partner surplus purchases: paid recovery purchase totals including premium and delivery, with inspection adjustments reflected.
- Partner Source earnings/pending payout: own net supplier payouts, including the existing supplier fee rules.
- Partner estimated purchase savings: a private, user-entered comparable landed price multiplied by accepted quantity, less the complete order cost. Only delivered/settled purchases with a reference count. Negative differences remain visible; coverage is shown. References never alter prices, fees or orders.
- Charts count only settlements with recorded dates. All demo records remain illustrative.

## Order coordination

Recovery timeline: agreement → payment → pickup coordination → inspection agreement → dispatch → delivery → settlement. Source has supplier stock preparation instead of recovery pickup/inspection. The order stage identifies the next actor and links to an available action for that account.

The seller confirms ready-to-collect availability and may change it while the order is in pickup. A saved slot does not book a courier or advance inspection. Meesho operations owns collection/inspection coordination. The buyer has no pickup-booking task. Existing slots remain intact, including normalising the legacy afternoon-window spelling when edited.

The delivery estimate is the proposed buyer-funded logistics amount collected through the platform, separate from the service premium. The demo uses ₹8 per unit, so 80 units gives ₹640. It is not a real courier quotation, carrier payout, or an assertion that the whole amount is platform revenue.

## Verification

- 28 frontend tests and 28 backend tests passed after final review corrections.
- Local isolated browser: seller and partner dashboard, pickup change/save, buyer waiting state, comparison save, phone layout, Hindi timeline.
- Desktop width 1265 and phone width 390 were inspected; phone document had no horizontal overflow.
- Impeccable detector was attempted once but its optional engine was unavailable. Independent finish review is required; automated detector success is not claimed.
- Existing review comments were captured read-only before deployment. No reset, reseed or schema migration is needed.

## Release status

Published and verified at https://reloop-source.vercel.app/dashboard.

- Vercel deployment: `dpl_EN5ETgWvFHsY7moEeAd1hyeVajhK` (READY, production alias assigned).
- Sites backend: version 15, `appgprj_6ab54a00bcfc8191a872203ce6536594~appgver_ceff1961aa1c81919553fd814ac618cf`, commit `fd6e68fa9d7e9947848f29a2984b9b9778337fd6`; deployment succeeded.
- Independent reviewer disposition: **ship** for the two scored fixes (stale quantity comparison and accessible chart values), both resolved. This was a fix verdict, not a second whole-surface review.
- Comparison commands now validate the displayed quantity against the current order and persist it; references with changed or unknown quantities require reconfirmation and are excluded from savings.
- All 20 existing review-comment rows matched the pre-deployment snapshot exactly. No comment or order reset was performed.
- Live seller and partner dashboards loaded. Original order `25540861-8f81-4171-9bbb-58d9a7d619fd` retained the 29 September, 10 AM–1 PM pickup slot, now labelled confirmed with a Change pickup slot button. Buyer view names Meesho operations as next owner; the payment record remains intact.
- Vercel returned no error log entries for this deployment during the post-release check.
