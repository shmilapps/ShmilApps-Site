# ShmilApps — Research Intake Database Handoff

Date: 2026-10-24. This document exports **previously executed and observed results** only. No database changes, database reads, or retests were performed to produce this document.

## Project and migration

- **Only project:** ShmilApps, `ufolbezpnhyrsyuxuaox`.
- **Migration name:** `add_research_intake_sessions_and_rpc`.
- **Actual migration tool result:** `{"success":true}`.
- Previously existing migrations: `20261024103518_create_shmilapps_market_research_core`, `20261024103539_add_atomic_payment_confirmation`, `20261024104235_restrict_rls_auto_enable_execution`.
- New migration's numeric timestamp/version was not retrieved and is **not claimed**.
- Existing private bucket: `order-specifications`, `public=false`, file size limit `10485760` bytes, allowed MIME types `application/pdf`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `text/plain`.

## Created table

`public.research_intake_sessions`:

| Column | SQL type and constraints/default |
|---|---|
| `id` | `uuid PRIMARY KEY` (no default) |
| `request_hash` | `text NOT NULL CHECK (request_hash ~ '^[a-f0-9]{64}$')` |
| `ip_hash` | `text NOT NULL CHECK (ip_hash ~ '^[a-f0-9]{64}$')` |
| `object_path` | `text NOT NULL UNIQUE CHECK (length(btrim(object_path)) > 0)` |
| `order_id` | `uuid UNIQUE REFERENCES public.orders(id)` (nullable) |
| `created_at` | `timestamptz NOT NULL DEFAULT now()` |
| `expires_at` | `timestamptz NOT NULL DEFAULT (now() + interval '30 minutes')` |

Indexes created explicitly: `research_intake_sessions_rate_idx` on `(ip_hash, created_at)` and `research_intake_sessions_created_idx` on `(created_at)`. Primary-key and unique constraints create their corresponding indexes.

RLS was enabled. No public policies were added. `REVOKE ALL` on this table from `PUBLIC`, `anon`, `authenticated`; `GRANT SELECT, INSERT, UPDATE, DELETE` to `service_role`. No changes to any other project.

## RPC contracts — exact names and types

```sql
public.reserve_research_intake(
  p_id uuid,
  p_request_hash text,
  p_ip_hash text,
  p_object_path text
) RETURNS boolean

public.commit_research_intake(
  p_id uuid,
  p_request_hash text,
  p_payload jsonb,
  p_document jsonb
) RETURNS uuid
```

Both are `LANGUAGE plpgsql SECURITY INVOKER SET search_path=''`. Explicit `REVOKE ALL` from `PUBLIC`, `anon`, `authenticated`, and `GRANT EXECUTE` to `service_role`. Verification queried the PostgreSQL catalog and returned the exact argument and return types, `prosecdef=false`, `anon_exec=false`, `auth_exec=false`, `service_exec=true` for both functions.

### Reserve behavior

- Validates `p_id` is non-null and hashes match lowercase SHA-256-style 64-hex-character format.
- Requires object path prefix `intake/<p_id>/` and rejects paths containing `..`.
- Uses `pg_catalog.pg_advisory_xact_lock(20261024,1)` to serialize rate checks across server instances.
- **Modification versus submitted SQL:** checks for an existing session by `p_id` *before* rate limits. An exact retry matching `request_hash`, `ip_hash`, and `object_path` returns `true` without a duplicate; conflicting reuse raises `idempotency_conflict`. The original SQL would attempt an insert again.
- For a new session, returns `false` if there have been at least five reservations for the same `ip_hash` within one hour or at least 50 reservations overall within one day; otherwise inserts a session and returns `true`.
- Existing session retries can return `true` even after expiration; expiration is enforced by commit for sessions without an order.

### Commit behavior

- Locks the matching session row using `FOR UPDATE`; validates the request hash.
- If already committed, returns the original `order_id` even after session expiry (idempotency).
- Otherwise rejects expired sessions and mismatched document paths.
- **Modification versus submitted SQL:** validates `size_bytes` as 1–10485760 and MIME as one of the three permitted types before proceeding.
- Checks `storage.objects` for `bucket_id='order-specifications'` and the exact session `object_path`.
- **Modification versus submitted SQL:** compares claimed file size to `storage.objects.metadata->>'size'` and claimed MIME to `metadata->>'mimetype'`, **only when those metadata fields are present**. This is not binary content verification.
- Creates `customers` from `p_payload.full_name`, `email`, `phone`, optional `business`.
- Creates `orders` with `id=p_id`, `product_id='market-research-full'`, `currency='ILS'`, `regular_price_agorot=9900`, `final_price_agorot` from payload (existing DB constraints allow 9900 or 6900), `discount_decision` from payload (`none` or `approved`), `status='pending_payment'`, `terms_accepted` from payload, and fixed `terms_version='market-research-v1-2026-10-24'`; other fields include `description`, `market`, `report_language`, optional `audience` and `links`.
- Creates `order_documents` using the session object path, original filename, MIME, and size; sets session `order_id=p_id`; returns the order UUID.
- All steps are within one database function call/transaction. **No payment confirmation is performed.**

## Storage permissions and security verification

Before migration, checks confirmed `has_table_privilege('service_role','storage.objects','SELECT') = true` and `has_schema_privilege('service_role','storage','USAGE') = true`. No storage grants or public policies were added. Storage bucket remains private. The new table appeared in `list_tables` with `rls_enabled=true`, `rows=0`; five original tables were also still RLS-enabled and empty.

Security advisor after migration reported six `INFO` findings of `rls_enabled_no_policy` (the intended server-only access model), and **no warning-level findings**. The earlier public execution warning for `rls_auto_enable()` did not recur. No public access was expanded.

## Synthetic tests actually performed

One SQL call executed `BEGIN; ... DO $$ ... $$; SELECT 'assertions_executed_before_rollback' AS test_marker; ROLLBACK;`.

Within the DO block, assertions tested:

1. A new synthetic session reservation returned `true`.
2. Exact retry returned `true`.
3. The session count for that UUID remained exactly one.
4. `commit_research_intake` with matching synthetic document metadata but **no real Storage object** raised exactly `missing_storage_object`.

The tool returned an explicit row: `test_marker = assertions_executed_before_rollback`. Since the marker statement follows the DO block, its return supports that the assertions completed without an uncaught exception. A subsequent separate read returned `sessions=0`, `customers=0`, `orders=0`, `documents=0`, consistent with rollback. No persistent synthetic data or actual Storage object was created.

## Not tested or not implemented

- No real signed upload, real Storage object, binary file inspection, or successful `commit_research_intake` with an existing object was tested.
- No load/concurrency stress test of the advisory-lock rate limiter or the global/hourly limits was performed.
- No test of conflicting idempotency keys, expiration, mismatched metadata, or every existing database CHECK constraint was performed.
- No end-to-end website API integration, server-side file content verification, or authenticated payment-provider callback was implemented here.
- No charges or emails were sent. No keys, secrets, passwords, or customer data are included.
- **Security caveat:** the server must authenticate and validate the user-facing request, compute trustworthy request/IP hashes, verify actual file content, and ensure any signed-upload flow is tightly scoped to the private bucket and session path. This RPC itself does not inspect file bytes.
- **Operational caveat:** rate limiting is based on persisted session records and a global advisory lock. Plan for cleanup/retention and account for expired reservations in production design.

This is an export of prior results, not a new database audit.
