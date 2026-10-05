# Final release — 3 October 2026

The owner designated the **current live application** as the final product baseline. This release organises and documents that implementation; it does not change the application experience or deploy a new backend.

## Live baseline

- Application: https://reloop-source.vercel.app
- Vercel deployment: `dpl_7U8TYKHSQ6bpDiZKpq3eMC6rEFMR`
- Deployment target: production; READY when published.
- Final UI change: removed the “Team feedback” sidebar link. Existing review comments remain preserved on their separate service.
- Finalisation check: the public `/assets/app.js` returned HTTP 200 and matched the local production build byte-for-byte.
- Repository: `Hermes-25/meesho-reloop-dice3`; private at the original 3 October release, made public at the owner's request on 5 October 2026.

## Scope frozen for this release

Three workspaces, seller-owned stock, the combined buying/supplying partner, role-specific bill and payout summaries, ReLoop buyer premium of 12.5%, Source supplier fee of 4.5%, coordinated pickup availability, order timelines, business dashboards, operations oversight, structured bargaining, semantic/photo/voice discovery, and transparent bid assistance.

No BharatMLStack, live Meesho integration, live commercial payments or courier booking is claimed. Source is an RFQ-and-quote workflow, not a supplier-stock catalogue. Learned price prediction and dynamic fees remain outside the final scope.

## Reproducibility

`source-snapshot-sha256.json` identifies final app/backend source and asset files copied from the working implementation. `.env.example` adds an empty speech-key setting for setup documentation; no credential value is included. The application source and gateway behaviour are unchanged.

The repository root offers `npm run build`, `npm test` and `npm run preview`. Use the current Node 24 runtime. The in-memory preview does not touch production records. CI repeats the build and tests on pushes and pull requests.

## Repository preservation

The previous default-branch prototype has been moved to `legacy/round-1/` rather than overwritten. Existing derived competition material remains available at its original repository path. Dated implementation notes are historical records and may describe superseded choices; the root README is authoritative for the final state.

This commit contains code, migrations, illustrative assets and documentation. It does not contain production databases, account passwords, recovery codes, API keys, raw interview recordings or exports of reviewer comments.

## Verification

- Clean locked frontend dependency installation: successful, no reported vulnerabilities.
- Production frontend build: passed.
- Frontend/gateway suite: **28 passed, 0 failed**.
- Backend/domain/review suite: **28 passed, 0 failed**.
- Total: **56 passing tests** in the packaged repository.
- Live frontend bundle was byte-identical to the approved local build at finalisation.

These checks verify software behaviour. They are not evidence of real-world model accuracy, commercial payment processing, courier performance or production-scale capacity.

## Public release — 5 October 2026

The final application code is unchanged. The owner's README demo-video link is retained, and repository visibility wording is updated. The final frontend bundle again matched the public live site's JavaScript byte-for-byte. The existing automated build and all 56 tests passed on the latest pre-publication commit. The original `final-demo-2026-10-03` tag remains available as the approved application snapshot.
