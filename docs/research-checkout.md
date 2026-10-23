# Market research checkout pilot

Scope: only the existing Hebrew market research test section (`#market-payment`). English and other services keep their existing forms. Product `market-research-full`, regular price ILS 99, discounted price ILS 69. Use the approved Agri research artwork. Checkout should expand inline, never as a dialog. Start collapsed, without mounting a payment iframe.

## Implemented

- Product card, regular price, image, optional coupon, server-side coupon quote.
- Three approved coupons stored only as SHA-256 digests in the server function. No plaintext coupon list, coupon hashes, or discounted payment URL in frontend assets. A customer necessarily knows any coupon they enter and may share it; coupon redemption is not authentication.
- Optional coupon entry is case-insensitive and trimmed. An invalid or unchecked entered coupon must be cleared or verified before checkout. Price resets immediately on edits; stale network responses are ignored.
- Required contact fields, description, target market, report language, specification, and agreement to visible delivery/refund terms. File restricted on client to nonempty PDF/DOCX/TXT <=10 MiB. Current selection remains on device.
- Checkout deliberately stops after validation while order storage is unconfigured. No personal details/files are transmitted and no payment is possible through this pilot. The displayed availability notice states this explicitly.

## Required before enabling checkout

1. Choose/connect a database and private document storage. Use minimal customer/order data and a documented retention policy. No public file URLs or public customer reads. Supabase connector was unavailable during this implementation; no database was created.
2. Implement server-side order creation and validation, including real file content/type/size validation (not filename alone), whitespace-only text rejection, and abuse controls. Persist the complete order and document before allowing payment.
3. Revalidate the coupon server-side during order creation. Never trust a submitted amount, the displayed quote, local storage, or browser state. Store product, currency, gross amount, discount decision and a unique immutable order ID.
4. Current regular-price URL: https://pay.sumit.co.il/15ajtmv/15cgqv4/15cgqv6/payment/ . Obtain a verified 69 ILS URL or preferably server-generated per-order SUMIT payment sessions. A reusable static link by itself does not establish reliable order/payment correlation.
5. Verify SUMIT integration documentation and account capabilities. Establish a trustworthy provider transaction-to-order mapping and verified server callback/payment lookup. Verify merchant, paid amount, currency and final success state. Return a payment URL only after persistence succeeds; allowlist SUMIT host and HTTPS. Expand iframe inline only then. Do not infer success from iframe load or return-page navigation.
6. Atomically mark `pending_payment` -> `paid` exactly once per provider transaction; record durable notification work in the same transaction. Handle duplicates, retries and reconciliation. Never downgrade paid state on late pending/failure messages.
7. Configure a mail provider and authenticated sender. On verified payment send ShmilApps a structured work email: order number, service, customer contact, brief, scope/language, regular/discount/paid amounts, provider reference, and short-lived authorized document access. Do not expose sensitive document links in public logs. Retry failures without duplicate jobs. Confirm receipt delivery settings in SUMIT; do not issue a duplicate receipt from the site.
8. Verify desktop/mobile iframe display, required-field blocking, normal/coupon checkout, rejected payment, success, repeated callbacks, notification failure/retry, and absence of coupon secrets in built browser assets before enabling.

Reuse this contract and product configuration for other services after the Hebrew pilot works end-to-end.
