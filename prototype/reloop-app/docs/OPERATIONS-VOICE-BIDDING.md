# Meesho extension: operations, voice and bidding

Release design, 27 September 2026. These are proposed challenge features, not Meesho's existing systems or published KPIs. Demo data is illustrative.

## Entry and personas

The entry popup explains where this proposal sits: ReLoop and Source extend Meesho's seller panel and internal operations console. Wholesale buyers and fresh-stock suppliers have their own onboarding views. One click opens an isolated, server-backed demo. Switching roles preserves that visitor's journey. No private operator credentials are published. Existing saved accounts remain available.

Demo sessions last up to 24 hours. Public demo operators can only act within their own room. Test orders, photographs and activity cannot cross into saved-account records or another visitor's room. Expired demo rooms are cleaned up in bounded batches; there is a room capacity and upload limit to protect free hosting. Existing review comments use their original tables and remain untouched.

## Operations information hierarchy

The first screen answers **what is blocked, what can I do now, and how much seller value is involved?** The next section explains where work is concentrated and where it is waiting. Detailed business metrics sit behind a disclosure. This uses [progressive disclosure](https://www.nngroup.com/articles/progressive-disclosure/) to keep secondary measures available without making every number equally prominent.

| Priority | KPI | Definition / next action |
|---|---|---|
| First | Exceptions to resolve | Active orders with an unresolved issue or a quantity mismatch still awaiting acceptance. Count each order once. Open its decision record. |
| First | Next operations actions | Inspections with pickup slots booked, dispatches with acceptance complete, delivered orders ready for settlement, and open auctions with bids. Excludes exceptions. |
| First | Value awaiting settlement | Product value of paid, non-cancelled, unsettled orders. A working-capital backlog, not platform revenue. |
| First | Recovery value settled | ReLoop product value settled during the selected 7 or 30 calendar dates in India time. Excludes delivery and premium. |
| Second | India concentration | Active orders by ReLoop pickup city or Source delivery city; bubble size follows volume. Red: exception; amber: ready ops action; purple: awaiting another handoff. Click to filter; exact city table includes unmapped locations. |
| Second | Stage distribution | Current active-order count at each stage. A snapshot, not a conversion funnel. |
| Second | Daily recovery settlements | Recorded product value by actual settlement date, including zero-value dates. Older records without settlement timestamps are explicitly excluded. |
| Detail | Bid coverage | Open lots with at least one bid / all open lots. Forming lots excluded. |
| Detail | Inspection acceptance | Accepted units / original declared units among inspected, non-cancelled orders. |
| Detail | Open issue share | Paid non-cancelled orders with a current unresolved issue / all paid non-cancelled orders. Not lifetime issue incidence. |
| Detail | Settlement cycle | Median time from payment to settlement among orders settled in the selected period. |
| Detail | Recorded premium | Premium associated with settled test orders. Operating costs are not captured, so no profit claim is made. |

Location and flow filters affect KPIs and queues. The national map keeps its country context. Completed-results dates do not filter the live backlog. Queue age means time since latest recorded update, not a contractual SLA. Physical inspection and explicit acceptance remain mandatory; a model never approves dispatch or releases funds.

Map provenance: [Survey of India national outline](https://surveyofindia.gov.in/pages/outline-maps-of-india), generalized 1:16m vector, LCC WGS84. City points use the same projection. The outline is used for this educational challenge according to [SOI's vector-use terms](https://www.surveyofindia.gov.in/documents/ibd-vectorformat.pdf). Commercial reuse requires checking the applicable permission; the educational-use notice stays with this asset.

## Voice search

- English uses en-IN; Hindi uses hi-IN. Hinglish is a mixed-language experience, not a universally supported browser locale. Recognition is editable before the user starts semantic matching.
- Browser speech offers a quick path where supported. Its speech service may process audio remotely; the UI explains this before listening. [MDN documents both limited browser support and server-based engines](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition).
- The fallback uses the multilingual [Whisper base ONNX model](https://huggingface.co/Xenova/whisper-base) through Transformers.js. After a model download, transcription runs locally in a worker. Audio is not uploaded to this application. English/Hindi can be selected; mixed speech uses automatic language detection. Accuracy is not guaranteed.
- Recording is user-triggered, capped at 25 seconds, cancellable, and microphone tracks stop on completion or navigation. Short audio files are also accepted. Quiet/long/unsupported recordings give a recovery path. Typed search always remains available.
- E5 semantic retrieval then matches the reviewed text against eligible inventory. Condition, city and quantity constraints still apply. Voice output is never treated as permission to bid or transact.

## Smart bidding: useful assistance before a trained predictor

Two distinct questions need two distinct answers: **what did similar stock sell for?** and **what can this buyer afford?** A market estimate cannot answer both.

Implemented now:

1. **Margin-aware bid ceiling.** Buyer enters resale price, saleable share, repair cost, other costs and desired margin. The ceiling includes 12.5% premium and the challenge's ₹8/unit delivery assumption. Integer-paise rounding is conservative. A stress scenario reduces the saleable share by ten percentage points. If the next valid bid exceeds the ceiling, the app suggests skipping the lot. It never increases the budget to beat a competitor.
2. **Completed-sale evidence with abstention.** Same category and condition, product-term overlap, half to twice the quantity, and settlements within 90 days. At least five comparable settlements are required. Only count and quartiles/median leave the server; no counterparties or private individual prices are exposed. This simple baseline is not an embedding-based valuation model. Demo ranges are explicitly illustrative.
3. **Explicit buyer control.** “Use this limit” only fills the bid field. The buyer must review costs, acknowledge condition and submit separately. No autonomous bidding, false confidence score or price manipulation.

Ceiling per purchased unit:

`(resale price × saleable fraction × (1 − target margin) − repair − other costs − delivery) / (1 + premium rate)`

Why this approach: [eBay's product research](https://www.ebay.com/sellercenter/growth/ebay-research-tools) uses completed sales and condition-aware comparisons rather than relying on asking prices. [Google's Rules of ML](https://developers.google.com/machine-learning/guides/rules-of-ml) recommends starting with a simple, measurable baseline and establishing data before adding learned complexity.

### Most useful ML next, once real pilot data exists

| Candidate | User benefit | Evidence needed before launch |
|---|---|---|
| Semantic comparable retrieval using E5 | Match differently worded but genuinely similar lots before comparing prices | Human-labelled comparable pairs; hold category/condition/quantity constraints fixed; beat product-term baseline on retrieval precision. |
| Calibrated quantile price model | Suggest a range with uncertainty, rather than a single authoritative number | Real settled **and unsold** auctions, reserve, bid history, condition, quantity, region, seasonality; time-based validation; measured interval coverage. Demo fixtures must never be training/evaluation evidence. |
| Inspection mismatch prioritisation | Help ops decide which lots need an earlier physical check | Recorded declarations and inspection outcomes; precision at available inspection capacity, subgroup checks and operator override. Never automatic grading from photos. |

Recommended next pilot: semantic comparable retrieval first, because multilingual descriptions are already a demonstrated problem and E5 is already available. A learned price forecaster comes only after sufficient market outcomes can outperform the transparent historical baseline. Do not train on these illustrative demo prices and call it validation. No BharatMLStack or paid model service is claimed or required.

## Verification scope

Automated checks cover demo-room isolation, role tampering, photo isolation, expiry cleanup, unchanged real workspace/comments, bid-cost rounding, sparse-data abstention, KPI cohort boundaries and cancellation handling. Desktop and narrow phone CSS are checked in a browser. On-device speech is tested with a public recorded clip; physical microphone and Hindi/Hinglish accent accuracy require human testing on the intended phones. A successful model load alone is not evidence of accuracy across these languages.
