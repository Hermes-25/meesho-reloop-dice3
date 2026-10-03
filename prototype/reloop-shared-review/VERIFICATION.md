# Working build verification — 26 September 2026
## Implemented
- Shared D1-backed demo sessions, optimistic concurrency checks and separate additive tables. Existing comment table and applied migrations are unchanged.
- R2-backed photo storage, camera/gallery file input, image compression and 15-minute capture-only QR links.
- Explicit seller/recovery-buyer/supplier/operations selector; guided recovery actions; prominent ₹0 listing fee.
- Seller Source request, supplier quote with dispatch window, requester acceptance and simulated dispatch/delivery using one shared record. Seller-facing Source is available in Hindi.
- Live pooling rule demonstration with compatible/incompatible contributions and minimum buyer quantity enforcement.
- MiniLM semantic matching and CLIP photo-to-description matching run in a browser worker. Explicit category, quantity, city and condition filters are applied separately.
- Evidence passport and saved decision events; proposed auction pause/resume with a reason.
- Threaded comments and Go to screen remain intact.

## Checks completed
- All comment persistence and legacy-preservation tests pass.
- Shared API tests verify another visitor can read a saved session, stale versions cannot overwrite it, invalid tokens cannot read photos, capture links cannot edit prices/orders and expired capture links fail.
- Browser: Source request in Hindi → supplier quote at ₹118 → order total ₹14,160 for 120 units → accepted → dispatched.
- Browser: real image file through capture-only phone link appears in original desktop draft; three uploaded images persisted and appeared in buyer evidence.
- Browser: recovery quantity 240, winning product bid ₹90, original payable ₹25,919, revised payable ₹24,680, refund difference ₹1,239; seller accepted 22 units and demo settlement ₹1,980.
- Browser: semantic inference completed, first measured run 11.2 seconds including model load. CLIP completed in 66.4 seconds on the initial run and ranked the sample bag first.
- MiniLM first-result checks on five manually selected English queries: 5/5 expected candidates; keyword baseline 4/5. Tiny development check, not representative or independent accuracy validation.
- No test comments or demo transactions were written to production during QA.

## Limits
- BharatMLStack not active. Docker startup failed with a local socket access error. User explicitly approved publishing this working build and adding BharatMLStack later.
- Six synthetic matching candidates; one connected recovery transaction. Reference candidates are clearly labelled.
- Model downloads require connectivity and browser resources; basic matching remains available on failure.
- Uploaded images do not determine damage grades. Inspection findings, payments, logistics, tax and fee policies remain labelled demo assumptions.
- Camera/gallery upload and QR flow tested through desktop browser and a separate capture tab; physical Android/iPhone camera behavior still needs testing.
- Production authentication, KYC, payments, logistics and multi-tenant business permissions are outside this demonstration.
