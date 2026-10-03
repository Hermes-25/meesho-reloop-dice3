# ReLoop + Source shared review

## Working demonstration

The current build adds shared demo sessions, stored photo evidence, capture-only QR links, a guided recovery flow, clearer roles, Hindi Source screens, flexible quote dates and browser-based semantic/photo matching. Public comments stay in the original table and remain shared across sessions. Share this session grants access to that demo’s records and photos; phone links expire after 15 minutes and allow photo upload only.

MiniLM and CLIP execute on the visitor’s device after model download from Hugging Face. No reference photos or query descriptions are sent to an inference provider. Matching uses synthetic candidates and explicit eligibility rules. BharatMLStack is pending, as approved by the user; no private Meesho APIs or Meesho-trained models are claimed. See VERIFICATION.md for checks and limits.

Payments, logistics and inspection findings remain simulated. Do not enter private documents or real payment data. Demo reset creates another session instead of deleting saved records or comments.

Published companion to the Stage 2 clickable prototype. Product interactions use synthetic records saved to shared demo sessions. The Comments button saves real, shared feedback in the site's database, associated with a screen ID, display name and timestamp. No account is required to comment on the public review.

The original case PDFs, submission deck and research/interview files are not included. Hosting includes the prototype, synthetic reference image, browser inference assets, shared demo and comment services, and their source/schema.

Anyone can reply to a comment or another reply. Conversations show the original comment followed by replies in time order, with a link to the specific message each reply addresses. Replies inherit their original screen. Separate device-local drafts are kept for the new-comment composer and each reply target. Existing version-1 drafts migrate on first use.

Each comment and reply has a Go to screen action. It restores the original thread's screen, role, device preview and language, with Back to comment returning focus to that exact message. Drafts and simulated transaction progress are retained. Legacy comments did not record element anchors, scroll positions or transaction snapshots, so navigation cannot reconstruct those. This feature changes only client navigation; it does not modify any stored comments or the database schema.

The reply migration only adds nullable parent/thread references and an index. Existing comment IDs, authors, text, context and timestamps are preserved without backfill or table replacement. The same D1 binding and Site project remain in use. Read requests limit whole conversations rather than cutting a trail at 200 messages.

Comments use prepared statements, bounded input, same-origin posting checks, a basic posting rate limit and retry-safe IDs. Names are unverified display labels. The UI renders comment content as text. Drafts remain on the writer's device when posting fails. The prototype's transactional controls remain simulated.

Build: `npm run build`. Schema: `npm run db:generate`. Checks: `npm test`. Use the existing Site project ID in `.openai/hosting.json` for future publications. Preserve applied migrations and the existing database when updating the design.
