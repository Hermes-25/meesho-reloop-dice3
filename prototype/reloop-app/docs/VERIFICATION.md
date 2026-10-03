# Release verification — 27 September 2026

Live app: https://reloop-source.vercel.app

Vercel production deployment: dpl_6SKYSpb1HKE34868Ft7x4oLvuBK6, READY. Hobby plan confirmed active, without a trial or paid upgrade. Backend source: 1b88f2bb6da7a786e828bc25b9d2ec90c4452ffd; Sites version 6 deployed successfully with environment revision 2. Temporary operator setup secret removed after authorized provisioning.

## Executed checks

- Application and backend builds passed.
- Eight backend tests plus one photo-ranking regression passed. These cover multi-party recovery, Source quotation and order flow, inspection acceptance, issue holds, settlement, access boundaries, concurrency, preserved comments, complete pooled disclosures, cancellation/refund idempotency, reviewed relisting and repeated photo labels.
- Live Vercel checks passed: registration, HttpOnly sessions, JPEG upload/read through the gateway, private-photo denial for a different account, saved and edited inventory draft, logout and fresh sign-in. QA stock remained unpublished and private. Test accounts contain synthetic data only.
- Actual pretrained model execution in the browser: Hindi schoolbook-bag query ranked school backpacks first among five isolated lots; Hindi cotton-kurta query ranked cotton kurtas first; reference bag image ranked the crossbody-bag description first. City filtering excluded four lots before ranking. These are small functional examples, not an accuracy evaluation.
- Desktop app and true 390px iframe viewport inspected in CUA. Mobile seller Hindi labels, upload controls and navigation were exercised. Closed sidebar disappeared from the accessibility tree; opening focused the drawer; Escape closed it and restored focus to the opener. A physical Android/iPhone camera was not tested.
- Final public sign-in page rendered with no captured JavaScript errors. Health and ML asset endpoints returned 200. Vercel CLI returned no error-level logs for the final deployment during the checked window; this is not continuous monitoring.
- All 20 existing review rows, including replies and their fields, compared equal before and after both backend releases. A local pre-release backup is stored outside the deployed app folder.

## Independent review scope

A fresh read-only code reviewer identified four blockers: pooled disclosure loss, duplicate photo-label mapping, cancelled inventory lockup and offscreen mobile keyboard focus. The reviewer subsequently scored all four resolved after the fix batch and regression evidence. It did not independently inspect screenshots. The design detector could not run because its engine was not installed and its cache was unwritable. Primary-agent screenshots were inspected through the browser tool; no screenshot files were exported.

## Operational limits

Payments, logistics, refunds and settlements remain test records. Models require a first-use download and enough device memory; basic search remains available. Accounts are not KYC-verified. This is a persistent judge-ready application, not a validated commercial marketplace or a Meesho-integrated service.

Private operator credentials are outside the deployment at output/private/reloop-operator-access.txt. Never include that file in public source, a slide deck or a shared link.
