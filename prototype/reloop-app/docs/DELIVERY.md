# ReLoop + Source application

Persistent challenge application: real accounts, photographs, inventory, bids, quotes and order decisions. Payments, courier events, refunds and settlements use test mode. No Meesho affiliation or live integration is claimed.

## Free ML with a practical purpose

BharatMLStack is removed from scope at the owner's request. No paid plan, cloud trial, Docker server or inference endpoint is required.

- Multilingual E5 retrieves stock by meaning, including Hindi queries against English descriptions.
- CLIP matches a reference image against eligible stock descriptions. It does not compare against every seller photograph or certify authenticity.
- Category, city, quantity and condition filters run before ranking. Model similarity never overrides these requirements.
- Models run through Transformers.js and ONNX Runtime in the browser. Weights download from Hugging Face on first use. Query text and reference photos stay on-device. Low-memory devices can fall back to basic search. No custom training or calibrated marketplace accuracy is claimed.
- Photo-quality heuristics separately flag dark, low-detail or repeated views. These are not damage-grading models. Physical inspection remains necessary.

## Hosting and access

Vercel serves the React app and a server-side gateway. Existing Sites D1/R2 supplies persistent application data and photographs. Original review comments remain separate. Migrations only add application tables. Vercel Hobby was verified active with no trial on 27 September 2026.

Passwords are salted and hashed. Sessions use opaque HttpOnly cookies. Recovery uses a one-time displayed code, without an email provider. Roles and order permissions are checked by the server. The operator is provisioned privately. These accounts do not constitute business verification or KYC.

Version checks and atomic updates prevent concurrent writes from silently overwriting each other. Money uses integer paise. Draft photos are private; published photos are visible to signed-in accounts.

Judge-scale limits: 3 MB marketplace state, 100 listings and 300 photos per account. This is not a scale-tested commercial marketplace. Commercial launch needs separately stored entities, abuse monitoring, verified participants, real payments/tax/logistics, backups and domain-specific model evaluation.

## Safeguards and pricing

Pooling requires matching product title, category, declared condition, city and minimum lot size. Every seller's reserve is protected. Pickup follows test payment. Inspected quantities require each affected party's acceptance before dispatch. Open issues block settlement. Source orders start with an accepted supplier quote.

The 12.5% premium and ₹8/unit delivery charge are challenge assumptions, shown before bidding and payment. Margin estimates use buyer-entered resale and repair assumptions, not a prediction.

## Verification

Automated tests cover pooled recovery, inspection acceptance, issue holds and settlement, Source quotes, permissions, account sessions, photograph access and concurrent updates. Existing review-comment tests remain in the suite. Live browser and model checks are recorded separately after execution.

Sources: https://huggingface.co/Xenova/multilingual-e5-small ; https://huggingface.co/intfloat/multilingual-e5-small ; https://huggingface.co/Xenova/clip-vit-base-patch32 ; https://huggingface.co/docs/transformers.js
