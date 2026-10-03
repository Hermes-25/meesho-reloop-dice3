# Voice, operations and demo-entry release

Live application: https://reloop-source.vercel.app/

Released on 27 September 2026. This release extends the existing app; no paid infrastructure or BharatMLStack service was added.

## Shipped

- Four isolated demo personas, explained as a proposed Meesho extension. Private operator credentials remain private. The same room survives persona switches for up to 24 hours.
- English/Hindi/Hinglish voice controls, browser speech, editable transcripts and a local Whisper-base fallback. Cancel, retry, timeout and microphone cleanup paths are implemented.
- Operations home with four primary metrics, actionable queue, city filters, Survey of India outline and concentration bubbles, stage distribution, daily settlement chart and KPI definitions.
- Optional bid guide with margin-aware ceiling, stress scenario and aggregate historical quartiles with a five-comparable minimum. This is transparent economic guidance, not a trained price forecast.

Research and measurement definitions: [OPERATIONS-VOICE-BIDDING.md](OPERATIONS-VOICE-BIDDING.md).

## Verification

- Backend: 9 automated tests passed. Frontend utilities: 6 passed.
- Independent functional/source reviewer: **ship**. Three findings resolved: microphone release after recorder startup failure; old transcription attempts no longer terminating new workers/timers; map copy distinguishes recovery pickup city from Source delivery city.
- Reviewer independently exercised failed recorder construction/start and overlapping transcription attempts; cleanup passed.
- Browser: entry popup, operations, city drill-down, role switches, wholesale bidding and supplier view checked. A calculated ₹100.44 bid limit was filled explicitly and saved in the isolated local demo.
- Layout: full desktop capture at 1280, 1440 iframe layout, and 390 phone iframe (375px content width) inspected. Phone document scroll width matched its content width. Mobile persona popup scrolls vertically.
- Actual local Whisper inference transcribed the public Transformers.js JFK audio sample and inserted the transcript into editable search. Physical microphone capture and Hindi/Hinglish accent accuracy on intended phones remain unverified.
- Browser screenshots were returned inline. The browser API did not expose supported local screenshot export, so the independent reviewer did not issue a visual approval. The optional design detector was unavailable because its engine was not installed; no installation or permission change was attempted.
- Live smoke check passed: demo start/switch, isolated order update, rejected cross-room command, saved-account authentication requirement, published speech worker and microphone permission header.
- All **20 existing review comments/replies** matched their pre-release rows exactly after backend deployment. No comment schema or data was changed.

## Deployment provenance

- Vercel production: `dpl_3hZ3Jrhm7CxtkoudFKgo8MszBKgH`, READY; public alias unchanged.
- Backend source: `4600178b830d611916bd3cee7f0f7e1ae2d2fdca`.
- Backend saved version 7: `appgprj_6ab54a00bcfc8191a872203ce6536594~appgver_97e6dc60ab3c819191c79f57fcbbd8c6`.
- Backend deployment: `appgdep_6ab8757163d48191a96f7ed4d8516b69`, succeeded, environment revision 2, public audience preserved.
- Additive migration `0004_steady_leo.sql` adds isolated demo session/photo tables. Earlier migrations were unchanged.
- The bundled publishing workflow did not recognize the Windows checkout. The existing Windows-safe helper verified the prior source, unchanged applied migrations, exact pushed commit and matching archive before native save/deploy.

For an actual commercial pilot, calibrate costs and operating thresholds from real data. Demo fixtures are illustrative and must not be used to claim trained-model accuracy or revenue validation.
