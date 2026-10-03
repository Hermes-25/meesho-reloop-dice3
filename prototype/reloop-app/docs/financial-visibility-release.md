# Financial visibility release — 29 September 2026

Each party sees its own bill or earnings. Rates, authoritative order records and existing paid-order pricing are unchanged.

| Transaction role | Visible summary |
| --- | --- |
| Recovery buyer | Item subtotal, 12.5% service premium, estimated delivery, total and own refund |
| Recovery seller | Own accepted contribution, free selling fee, own net payout |
| Source purchasing seller | Item subtotal, own sourcing fee, delivery and total; no supplier deductions |
| Source supplier | Own goods value, 4.5% fee and net payout; no buyer fee, delivery or bill |
| Operations | Separate buyer bill and each contributing business’s payout |

Quote creation, counteroffers, acceptance review, order details, order lists, inspection review, settlement rows, event messages and downloaded JSON follow these scopes. The API also projects the response per user instead of returning counterparty charges. Frontend and backend share a parity-tested financial projection, copied into each independently deployed package. Backend records are never mutated by this projection.

Pooled recovery sellers receive only their own inspected quantities and payout. Cancelled orders show no payout; issue holds and provisional inspection decisions are labelled. Earlier paid Source orders retain their recorded economics.

## References and design decisions

- [Zomato’s dedicated partner Payout section](https://www.zomato.com/blog/turbocharging-restaurant-partners-with-daily-payouts/) informed separating merchant earnings from buyer checkout.
- [Uber Eats checkout fee explanation](https://help.uber.com/ubereats/restaurants/article/how-do-consumer-fees-work?nodeId=9e028052-ce30-4e57-b1cb-f36b8e0e9d82) informed showing the customer’s applicable charges before confirmation.
- These are published patterns, not a claim to have inspected every current Zomato or Swiggy checkout variant.

## Validation

- Backend: 26 tests passed, including projection privacy, pooled contribution allocation, exact rounding, legacy pricing, cancellations and unchanged authoritative records.
- Frontend: 22 tests passed, including API/UI projection parity and Hindi labels.
- Browser checks: supplier quote, purchasing seller review and order creation, recovery seller settled order and list, operations reconciliation, Hindi and phone-width financial panels with no horizontal overflow.
- The download button serializes the same scoped order and scoped event history; a browser download-event check timed out, so successful file delivery through the in-app browser was not independently verified.
- All 20 existing review comments compared equal before and after the backend release.

## Deployment

Backend commit: ad58e60de73da4704f9583ac5d47e4fb5c1d2a60.

Sites version 13: appgprj_6ab54a00bcfc8191a872203ce6536594~appgver_9bd08ee88d708191ac73d4c2277e06d3.

Backend deployment: appgdep_6abb4c5ca8948191bd4b6fc04adf378f — succeeded, existing public audience preserved.

Frontend: https://reloop-source.vercel.app.

Final Vercel deployment: dpl_6e2nuLLGYTucF57TMtSZU9AK7NYm — READY and aliased to the live application. Live supplier quote and recovery buyer order were checked after publication. The deployment error-log query returned no records.
