# Service ordering

The existing research intake, signed references, payment verifier, outbox and Gmail delivery now serve four products. No new payment scheduler or gateway was introduced.

| Product ID | Regular ILS | Approved coupon ILS | Quantity |
| --- | --- | --- | --- |
| market-research-full | 99 | 69 | 1 |
| asset-research-full | 99 | 69 | 1 |
| logo-full | 99 | 69 | 1 |
| advertising-video | 499 per minute | 349 per minute | Whole minutes, 1–60 |

The three existing discount hashes apply to all products. The 5 ILS test code remains market-research-only because its SUMIT page is a separate test product. Checkout URLs and coupon validation remain server-only. Client amount, is_test and request_details fields are ignored; the server normalizes the product, quantity, fields and price.

The user applied docs/migrations/enable-all-service-orders.sql to project ufolbezpnhyrsyuxuaox on 2026-10-26 and supplied the four RPC permission results (invoker; service_role only). The exact migration was separately exercised twice in an isolated local PostgreSQL fixture, with ten rollback price checks per run plus sixteen commit/revision/session/mail-context checks. No live DB connector was used.

Market research requires an uploaded brief. Other services accept PDF/DOCX/TXT, or generate a stable TXT specification from the submitted form. Every order retains one private specification, and the owner email attaches the file itself plus the existing receipt. Revised upload session paths must map to that same order before download.

Online order accordions are separate from Pricing. Hero and section CTAs expand and scroll to the accordion. Branding presents two product rows, with forms mounted while hidden so switching does not discard drafts. X unlocks request details for the same pending order; product, coupon, price and quantity stay frozen after checkout opens. Paid orders cannot be revised.

SUMIT quantity=2 was checked without payment: 998 ILS regular and 698 ILS discounted. The provider still allows changing quantity; the authoritative verifier refuses any amount that differs from the stored order. Changing the ordered quantity must happen before checkout opens.

The six new SUMIT catalogs have RedirectURL https://www.shmilapps.com/api/research-payment-return, saved and read back through their settings. Existing SUMIT receipt mail settings were preserved. The existing five-minute server reconciliation continues even without browser redirect, and notifications are deduplicated by the existing ledger. No new charge, receipt creation or real mail is required for automated tests.

Validation: service-orders tests cover eight full mock prepare/finalize/replay flows and exact checkout links/quantity; existing payment, edit, reconciliation and notification suites cover amount/currency/reference checks and duplicate suppression. These are not a claim of a new live paid transaction for every product.
