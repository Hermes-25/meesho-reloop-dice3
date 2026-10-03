# Three-persona release — 28 September 2026

The approved workspaces replace the earlier four-entry demo:

| Business | Workspace |
| --- | --- |
| Meesho seller | My stock; Recovery orders; Source fresh stock, including procurement orders |
| Wholesaler / supply partner | Buy surplus; Supply fresh stock; Orders; Business capabilities |
| Meesho operations | Dashboard; Lots & auctions; Procurement oversight; Issues & settlements |

Buying and supplying use one partner account, with independently enabled capabilities. Supplier matching checks category, delivery state and capacity. Existing real account identities remain intact; legacy buyer/supplier accounts can configure their capabilities without merging accounts.

Only illustrative demo inventory is redistributed to sample seller businesses by city. Aarohi Retail is based in Jaipur. Custom uploads, record IDs, historical transactions and comments are retained. Active stock and stock history are separated. The ownership upgrade is idempotent and uses the existing optimistic concurrency mechanism.

Source offers support structured counteroffers, supplier agreement, recipient decline, expiry, a private version history and preset clarifications. Price, quantity, dispatch dates and listed terms are reviewable before checkout. Latest-version checks prevent accepting stale offers; an immutable agreed-offer snapshot is saved with the order. Competing suppliers cannot read each other's offers or negotiation events. Negotiation offers do not support free text, contact details or attachments.

Operations uses searchable management tables and review actions, rather than buyer shopping cards. The dashboard remains the operations landing page. Seller and partner access is enforced by the server as well as navigation.

Validation: 18 frontend and 19 backend tests passed. Local browser checks covered three-role navigation, Jaipur ownership, supplier matching and history, seller counteroffer → supplier agreement → exact checkout amount → test payment, operations tables, Hindi, and 390px responsive layout without page overflow. The automated lifecycle test continues through dispatch, receipt and settlement. A backup of all 20 existing review comments was saved locally before deployment.

Payments, delivery and settlement remain test events. Business capability settings are demo onboarding information, not a claim of verified supplier certification. Hosting stays on the existing free services.

Published server version 11: source commit `01d58e154f3b4cd8579a4c7012e69b72bd33f929`, deployment `appgdep_6aba89d68db8819199255c7782473904` succeeded. Vercel deployment `dpl_5t2CiiuwFV6iNRpgyt6nd6izk6FW` is READY and aliased to https://reloop-source.vercel.app. The final compatibility fix caps legacy offer validity at its dispatch deadline; its focused regression checks passed. All 20 review-comment rows matched the pre-deployment backup exactly after the final publication; no rows changed or disappeared. Live browser verification confirmed the three-entry chooser, seller ownership, unified partner navigation, supply coverage matching and counteroffer controls.
