# Temporary SUMIT checkout update — 2026-10-24

By explicit user request, the Hebrew market research section now opens the fixed SUMIT 99/69 ILS checkout in an inline iframe only after required fields, a private specification upload and atomic order persistence succeed. The server recomputes coupon price and returns the matching configured URL in finalize (including retries). Invalid coupons block continuation. Coupon edits reset the displayed discount.

These static links cannot authoritatively correlate payment to an order. The order stays pending_payment, paymentEnabled stays false (meaning no automated payment verification), and paymentVerification is manual. Opening, iframe navigation or return does not mark paid or enqueue mail. Customer copy states manual verification. No receipt/email behavior has been newly verified or promised. No changes to English or other services.

The following is historical setup documentation; its statements that no checkout URL is released are superseded by this temporary integration.

# Research order intake: server setup and rollout

## State

Only the Hebrew market-research test section is wired to this intake. Payment always remains disabled. Successful intake means saved customer + pending order + private specification, never a charge, receipt or work email. No static SUMIT payment URL is returned by the intake API.

The database chat reported successful migration `add_research_intake_sessions_and_rpc` in project `ufolbezpnhyrsyuxuaox`, adding the private intake session table and server-only reserve/commit RPCs. Exact report is in `research-intake-db-handoff.md`. Prior security warning was fixed by `20261024104235_restrict_rls_auto_enable_execution`.

## Vercel environment (server only)

Set in the existing ShmilApps-Site Vercel project, preferably Production only for this pilot:

- `SUPABASE_URL` = `https://ufolbezpnhyrsyuxuaox.supabase.co`
- `SUPABASE_SECRET_KEY` = the secret key from THIS Supabase project (prefer `sb_secret_...`; the legacy service_role JWT also works). Never a publishable/anon key. Never paste into chat, commit, log or put under a VITE_/NEXT_PUBLIC_ name.
- `SHMILAPPS_ORDER_INTAKE_ENABLED` = `false` initially. Set to `true` only when the credentials and the private storage/data access are verified. A redeployment is required to apply environment changes.

The intake configuration rejects any project URL other than the allowed ShmilApps project. Neither the private key nor coupon digests are sent to the browser. HMAC session signatures and request fingerprints are derived server-side with domain separation from the server key; rotating this key invalidates unfinished sessions.

## Flow

GET `/api/research-orders`: only availability flags, no customer/order data.

POST `prepare`: validate required text fields, terms, file metadata and SHA-256; recompute coupon price in server; hash request/IP; reserve a 30-minute session with a global serialized quota (5 per IP/hour, 50 globally/day). Create a Supabase signed upload capability for one exact unpredictable private bucket/path, upsert=false. Supabase signed upload URLs last up to two hours. The HMAC ticket contains only ID, request fingerprint and expiry, not customer data.

Browser uploads bytes directly using PUT to that signed URL with the server's canonical MIME. This avoids Vercel's 4.5 MB function-body limit. The service key is never involved in the browser upload. Browser capability can only upload its exact file; it cannot list/read the private bucket.

POST `finalize`: verify ticket HMAC, request identity, session and expiry. Download the exact private object using the server key, check size and SHA-256, check PDF signatures/end marker, UTF-8 text or bounded DOCX ZIP/Word structure. ZIP traversal, encryption, macro payloads, embedded objects, duplicate entries and excessive decompression are rejected. This is file-type/structure verification, not antivirus scanning or a promise that arbitrary attachments are safe to execute.

Then invoke `commit_research_intake` to create customer/order/document and consume session atomically. The RPC verifies storage object presence and metadata when available. Retries return the original order. An ambiguous commit response does not delete the object; retry safely. Invalid file contents are removed from that unfinished session's exact path.

All APIs fail closed on missing credentials, bad requests or storage/database errors. They return generic errors, no internal provider response bodies or secrets. Origin allowlist includes the actual Vercel deployment hostname and the production domains; JSON POST required. IP quota assumes Vercel's forwarded-for header is platform-managed in production; local test servers use socket address.

## Retention / operations before broad rollout

Abandoned uploads may remain private after expiry. Before broad public rollout, configure cleanup for sessions with no order, created more than 48 hours ago (beyond signed-upload validity and rate window); remove only their exact object paths, then session rows. Do not delete successful orders/documents through this cleanup. No automatic deletion job was enabled without a defined retention policy. Keep daily storage/quota monitoring; quota denial is visible as retry-later message.

## Validation performed

- Production build succeeded; existing Hebrew/English isolation and mobile bounds checked.
- Server unit/contract tests cover disabled credentials, wrong project, origins, fields, coupons, quota denial, signed URL host, tampered and expired tickets, mismatched details, missing uploads, size/hash validation, TXT/PDF/DOCX structures, idempotent retry and lost commit response.
- Local browser simulation covers required fields, missing document, direct upload before finalize, content hash, completion receipt, locked form after success and absence of payment iframe/charge.
- Supabase chat rollback test confirmed reserve/retry stays one session and missing actual storage object rejects commit. Success with a real signed upload, live REST/storage access, and complete end-to-end integration are NOT yet verified because the server key is not configured here.

## Remaining beyond intake

Do not enable payment merely because intake works. Need verified SUMIT order-to-transaction correlation/callback (ordinary static links are insufficient evidence), corrected replay behavior, payment tests, receipt configuration and a reliable outbox mail sender. Existing SUMIT 99/69 links remain in server configuration only. Intake creates no payment events and no notification outbox item.

References checked 2026-10-24: https://supabase.com/docs/reference/javascript/storage-from-createsigneduploadurl ; https://supabase.com/docs/guides/getting-started/api-keys ; https://vercel.com/docs/functions/limitations . Changelog reviewed: relevant upcoming TLS cipher deprecation does not affect the current Node runtime using modern TLS.
