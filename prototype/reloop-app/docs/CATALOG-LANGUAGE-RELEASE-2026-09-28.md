# Catalogue and Hindi release — 28 September 2026

Live app: https://reloop-source.vercel.app

## Changes

- Twelve original generated product photographs replace the reserved demo stock placeholders. Each product has its own photograph; multiple regional lots share the same product photo. Real uploaded photos are unchanged. Lot detail identifies generated sample photos.
- Fresh demo: 36 open recovery lots, 12 product types, six populated categories, 18 cities across 18 state/UT labels. Seven Source requests, two initial supplier quotations, 26 active recovery orders and 94 settled sample orders support the operational and pricing demonstrations.
- New categories: Kitchen, Footwear and Accessories. Other remains available. State/UT filtering and Hindi catalogue keyword matching are supported.
- Hindi presentation covers the main content, forms, validation messages, catalogue, dashboard, bidding helper, role chooser and order stages. Canonical form values, financial records, IDs, API payloads and user-entered descriptions are preserved. Custom seller descriptions are not automatically translated.
- Speech and matching progress uses ordinary task language. Audio privacy is available in a short expandable explanation. Provider and model-loading details are not exposed in the customer journey.
- Existing demo worlds upgrade additively once. No migration, resets or replacement of real markets, accounts, bids, photos, comments or orders.

## Verification

- 17 frontend and 14 backend automated checks passed, including roles, demo isolation, comment persistence, catalogue diversity, image files, map coverage, pricing evidence, Hindi strings and upload preservation.
- Rendered 91 combinations of routes, personas and order stages for Hindi coverage review.
- Browser: Hindi category/state filters and keyword search; language toggle retains selection and query; supplier quotation saved in Hindi; operations shows 18 cities; seller add-stock form fits the phone layout without horizontal overflow.
- Meaning search over the expanded catalogue ranked school backpacks first for both “school bags for students” and “स्कूल के बच्चों के लिए बैग”.
- Packaging verified: deployed server catalogue produces 36 open lots.
- All 20 existing comment rows compared exactly unchanged after backend publication.

## Deployments

- Backend source: `030d47e4e4fef1f45cd003f4e9b527821b9ccaa9`.
- Sites version 9: `appgprj_6ab54a00bcfc8191a872203ce6536594~appgver_aa4f401497608191ae272db0de9cea11`.
- Sites deployment: `appgdep_6ab9b9aecb1881918861ce2b4f1cb435`, succeeded.
- Vercel production: `dpl_EdGeaodetcy3GZ6bSu7t3a1Gs69Y`, READY and aliased to the existing app URL. This final build serves 12 optimized JPEGs (2.52 MB total) instead of the large source PNGs. Source PNGs remain local and are excluded from deployment.

## Implementation notes

The presentation layer uses a React language context and an esbuild JSX factory for native-element string translation. Native select options retain their original values. Explicitly bilingual copy remains supported. Unknown user text is left verbatim. Avoid translating data in the database or rewriting the DOM after React renders.

Keep `src/catalog.mjs` identical to the backend `demo-catalog.mjs`; a test enforces this. Future catalogue revisions need a new additive upgrade version. New backend modules must also be copied by the backend build script.
