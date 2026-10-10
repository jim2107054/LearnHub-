# Backend Build Prompt — Laravel (LearnHub LMS Marketplace API)

> Paste this whole prompt into your AI coding assistant (Claude Code, Cursor, etc.) together with `srs.md`.
> Build **phase by phase**. Do not move to the next phase until the current one passes its tests.

---

## 1. Role and Goal

You are a senior Laravel architect and engineer. Build the **backend API** for **LearnHub**, a Udemy-style online course marketplace and LMS, following the attached `srs.md` (treat requirement IDs like `AUTH-01`, `PAY-08` as the source of truth). The backend is **API-only** and will be consumed by a Next.js frontend and later by mobile apps.

Deliver production-quality code: clean architecture, tested, documented, secure, and easy to extend.

---

## 2. Tech Stack (fixed)

- **PHP 8.3+**, **Laravel 11/12**
- **Database:** **Neon (hosted serverless PostgreSQL 16+)** — see section 6.1 for Neon-specific rules. Do not use MySQL.
- **Cache / queue / sessions / rate limiting:** Redis
- **Queues:** Laravel Horizon
- **Auth:** Laravel Sanctum (SPA cookie auth for web, personal access tokens for mobile); Laravel Socialite for Google/Apple/Facebook
- **RBAC:** `spatie/laravel-permission`
- **Search:** Laravel Scout with Meilisearch (driver-swappable to OpenSearch)
- **Payments:** Stripe (via Laravel Cashier-style service abstraction, but build a custom `PaymentGateway` interface so PayPal and local gateways can be added)
- **Storage:** S3-compatible (`league/flysystem-aws-s3-v3`), presigned/multipart uploads
- **Video:** direct-to-S3 multipart upload + pluggable `VideoPipeline` interface (default driver: AWS MediaConvert; fake driver for local/tests); HLS output served via CDN with signed URLs
- **PDF:** `barryvdh/laravel-dompdf` or Browsershot (certificates, invoices)
- **API docs:** `dedoc/scramble` (OpenAPI auto-generation)
- **Static analysis / style:** Larastan (level 8), Laravel Pint
- **Testing:** Pest + Laravel testing helpers, `pestphp/pest-plugin-laravel`
- **Observability:** Sentry, structured JSON logs, Laravel Telescope (local only), OpenTelemetry-ready middleware
- **Dev environment:** Docker Compose (php-fpm, nginx, redis, meilisearch, mailpit, minio). The database is **Neon**, not a local container: use a dedicated Neon **dev branch** for local work (an optional local `postgres` service may be included behind a Compose profile for offline work).

Do not substitute libraries without asking.

---

## 3. Architecture Rules

1. **Modular monolith.** Organize by domain under `app/Domain/<Module>` (or `app/Modules/<Module>`), with a clear public surface per module. Modules:
   `Identity`, `Catalog`, `Instructor`, `Media`, `Learning`, `Assessment`, `Certificate`, `Commerce`, `Finance` (ledger + payouts), `Community`, `Notification`, `Moderation`, `Analytics`, `Admin`.
2. **Layering inside each module:**
   `Http (Controllers, Requests, Resources)` → `Actions / Services` → `Models / Repositories (only if useful)` → `Events / Listeners / Jobs`.
   - Controllers are thin: validate (FormRequest), authorize (Policy), call an **Action class** (single-purpose, invokable), return an **API Resource**.
   - Business logic lives in Actions/Services, never in controllers or models.
3. **DTOs** (readonly classes) for passing data between layers; no raw request arrays in services.
4. **Enums** (PHP backed enums) for every status/type (CourseStatus, OrderStatus, LectureType, PayoutStatus, etc.).
5. **Events-driven side effects.** Domain events (`OrderPaid`, `EnrollmentCreated`, `LectureCompleted`, `CourseSubmitted`, `RefundProcessed`...) with queued listeners. Follow the event catalog in SRS Appendix E.
6. **Idempotency everywhere money or enrollment is touched** (idempotency keys, unique DB constraints, webhook event de-duplication table).
7. **Money:** store integers in minor units + ISO currency code. Never floats. Use a small `Money` value object.
8. **Ledger-first finance:** double-entry `ledger_entries`; payouts derive from the ledger (SRS PAY-17, EAR-*).
9. **Authorization:** Policies for every model + permission checks via Spatie; never trust client input for ownership; enrollment checks before issuing media URLs.
10. **API design:** RESTful, versioned `/api/v1`, JSON:API-like consistent envelope, cursor/offset pagination, filtering and sorting via query params (use `spatie/laravel-query-builder`), consistent error schema with machine-readable `code` and `correlation_id` (SRS API-05).
11. **No N+1 queries** (enable `Model::preventLazyLoading()` in non-production), eager load deliberately, add DB indexes for every filter/sort column.
12. **Soft deletes** for user-generated content; hard-delete only for privacy erasure.
13. Use **UUIDs (ULIDs)** as public identifiers; keep bigints internal if desired.
14. All timestamps UTC.

---

## 4. Project Setup Tasks (Phase 0)

1. Scaffold Laravel, configure Docker Compose, `.env.example` with every variable documented.
2. Install and configure all packages above, and wire up **Neon** exactly as described in section 6.1 (pooled runtime connection, direct migration connection, SSL, retry on cold start).
3. Configure: CORS for the Next.js origin, Sanctum stateful domains, Horizon, Scout, Sentry, rate limiters (`auth`, `api`, `uploads`, `checkout`).
4. Set up CI (GitHub Actions): Pint, Larastan, Pest with coverage gate ≥ 80% on business modules, security audit (`composer audit`).
5. Add `Makefile`/composer scripts: `setup`, `test`, `lint`, `analyse`, `fresh`.
6. Global middleware: `CorrelationId`, `ForceJson`, `SecurityHeaders`, `SetLocale`.
7. Global exception handler producing the standard error schema.
8. Seeders/factories for every model (realistic fake data: 20 instructors, 200 courses, 1000 learners, reviews, orders).

---

## 5. Phase-by-Phase Build Plan

For each phase: migrations → models/enums → policies → actions/services → controllers/resources → events/jobs → tests → OpenAPI check → short `docs/<module>.md`.

### Phase 1 — Identity & Access (AUTH-*)
- Register, login, logout, email verification, forgot/reset password (hashed with Argon2id).
- Social login (Google, Apple, Facebook) via Socialite for SPA flow.
- TOTP MFA (enable/confirm/disable/recovery codes); mandatory for admin/finance roles.
- Login throttling + temporary lockout after 5 failures with notification.
- Session/device list and revoke; short-lived tokens for mobile with refresh rotation.
- Profile CRUD, avatar upload, account deactivation and deletion request (queued erasure job; PRV-02).
- Roles: `learner`, `instructor`, `ta`, `moderator`, `support`, `finance`, `super_admin`; users may hold multiple roles.
- Terms/privacy acceptance logging with version + timestamp.

### Phase 2 — Catalog & Search (CAT-*)
- Tables: categories (nested set or adjacency + materialized path), courses, sections, lectures, tags, course_tag, course_instructors, wishlists.
- Public endpoints: home rails (featured/trending/new), course list with filters (category, price, rating, level, language, duration, updated), sorting, course detail with curriculum outline (preview-only lecture data exposed), related courses.
- Scout/Meilisearch index with typo tolerance, synonyms, facets, autocomplete endpoint; reindex command; index on course publish/unpublish events.
- SEO data in responses: slug, meta title/description, JSON-LD payload for schema.org `Course`; sitemap endpoint/command.
- Cache hot endpoints (Redis, tag-based invalidation).

### Phase 3 — Instructor Studio & Media (INS-*)
- Instructor application/onboarding endpoint.
- Course CRUD with status machine: `draft → in_review → approved/rejected → published → unpublished/archived` (enforce transitions in one class; reject illegal ones).
- Curriculum builder endpoints: create/update/delete/reorder sections and lectures (single reorder endpoint accepting ordered IDs, transactional).
- Lecture types: video, article, resource, quiz, assignment, external link.
- **Media pipeline:**
  - Endpoint to initiate S3 multipart upload (returns presigned part URLs), complete, abort.
  - `MediaAsset` state machine: `uploading → uploaded → scanning → transcoding → ready | failed`.
  - Webhook/callback endpoint from the pipeline (signature verified) updates state, stores HLS manifest key, durations, thumbnails.
  - Captions upload (SRT/VTT) and storage.
  - `FakeVideoPipeline` driver for tests.
- Pre-publish validation action returning a checklist of failures (BR-03, INS-10).
- Submit for review; moderator approve/reject with structured feedback.
- Pricing from admin-defined price tiers; per-region override table.
- Coupons CRUD (percent/fixed, limits, expiry, scope) with validation rules (BR-10).
- Co-instructors/TAs invites with revenue split validation (sum to 100%).
- Course announcements.
- Block hard delete if enrollments exist (BR-09).

### Phase 4 — Commerce (PAY-*)
- Cart (DB-backed, persisted per user, guest cart merged on login).
- Coupon/promotion engine (stacking rules, floor price).
- Tax service interface (`TaxCalculator`) with a simple configurable driver now.
- Checkout flow: create `Order` (pending) → create gateway PaymentIntent via `PaymentGateway` interface → return client secret.
- **Webhook controller** (Stripe): verify signature, store raw event in `webhook_events` (unique on gateway event id), dispatch job; handler is idempotent.
- On `payment.succeeded`: mark order paid → create enrollments (unique `user_id+course_id`) → post ledger entries → dispatch `OrderPaid` → receipt email + invoice PDF.
- Refund flow: eligibility check (window + progress thresholds from settings), request/auto-approve/admin override, partial refund, gateway refund, access revoke, ledger reversal.
- Gifts (redeemable codes), purchase history, invoices.
- Chargeback/dispute webhook handling (freeze related earnings).
- Subscription plans scaffold (behind feature flag, Phase 2 item).

### Phase 5 — Learning Experience (LRN-*)
- Enrollment listing ("My Learning") with progress and last lecture.
- Lecture access endpoint: verifies enrollment/preview, returns **short-lived signed CDN URL** for HLS manifest + caption tracks; logs access.
- Progress API: heartbeat endpoint saving position (throttled, upsert), completion rules (≥90% watched), course percent recomputation via listener.
- Notes and bookmarks CRUD (timestamped).
- Concurrent stream limiter (Redis-based, default 3) (LRN-12).
- Resource download via signed URLs.
- Offline-download license endpoint (stub for mobile).

### Phase 6 — Assessments & Certificates (ASM-*, CRT-*)
- Quiz builder (question types: single, multiple, true/false, fill-blank, matching, short text), settings (pass mark, attempts, time limit, randomization, pools).
- Attempt lifecycle: start (server-side timer, shuffled questions persisted), save answers, submit, auto-grade, feedback per settings. Prevent answer leakage before submit.
- Assignments with submissions, rubric grading by instructor/TA, gradebook + CSV export.
- Certificate issuance on completion criteria (queued job), PDF generation, unique code + QR, public verification endpoint, revocation on refund/fraud.

### Phase 7 — Community & Notifications (COM-*, NTF-*)
- Reviews: eligibility (≥10% progress), one per user per course, edit/delete, instructor reply, rating aggregates (denormalized counters updated by listeners), distribution endpoint.
- Q&A: questions (optionally per lecture), answers, votes, best answer.
- Report/flag system feeding moderation queue; profanity filter with configurable severity.
- Direct messaging (rate-limited, block/report).
- Notifications: database + mail + push channels (FCM adapter interface); user preferences per category; digest option; unsubscribe tokens; localized templates.
- Real-time updates via Laravel Reverb (WebSockets) for notifications and Q&A.

### Phase 8 — Finance: Earnings & Payouts (EAR-*)
- Revenue-share calculator (configurable models; platform-sourced vs instructor-sourced/coupon/referral).
- Earnings records created from ledger events with hold period (default 30 days; configurable).
- Instructor earnings dashboard endpoints (gross, net, pending, available, paid, per course).
- Payout methods + KYC/tax-form status.
- Scheduled monthly payout batch command (threshold, statements, finance approval step, provider adapter interface, retries).
- Finance admin actions (hold/release/adjust/reverse) with audit logging.
- Affiliate/referral link tracking (Phase 2 flag).
- Reconciliation command comparing gateway reports to ledger.

### Phase 9 — Admin, Moderation, Analytics (ADM-*, ANL-*)
- User management (search, suspend, ban, audited impersonation, delete).
- Course review queue, report queue with SLA timestamps, DMCA intake and instructor strike tracking (BR-08).
- Platform settings store (typed, cached): commission, refund policy, price tiers, currencies, feature flags.
- Banners/featured collections/homepage layout, static pages CMS, localization strings.
- Immutable audit log (append-only table, DB-level protection, middleware + model observer).
- Analytics: instructor dashboard endpoints (impressions, visits, conversion, enrollments, revenue, geography, ratings trend, completion rate, drop-off per lecture) from an events table + scheduled aggregation jobs; admin KPIs (GMV, revenue, signups, conversion, refunds, top courses). Reports exportable to CSV.
- Behavior event ingestion endpoint with consent flag.

### Phase 10 — Hardening
- Security review against OWASP ASVS L2: mass assignment, IDOR tests for every resource, file upload validation + malware scan hook, security headers, CSP for API docs, rate limits.
- Performance: query audits, indexes, caching strategy, load-test scripts (k6).
- Data privacy: export-my-data job, erasure job, retention commands (SRS 7.2).
- Backups/restore documentation, runbooks, health endpoints (`/up`, `/health/deep`).
- Final OpenAPI spec export committed to `docs/openapi.json`.

---

## 6. Database Requirements

### 6.1 Neon (hosted serverless PostgreSQL) — mandatory rules

The database is hosted on **Neon**. Configure and code for it as follows:

1. **Two connections in `config/database.php`:**
   - `pgsql` (default, **runtime**): the **pooled** Neon connection string (host contains `-pooler`, PgBouncer in transaction mode). Used by the web app, queue workers, and Horizon.
   - `pgsql_direct` (**migrations and admin tasks**): the **direct/unpooled** connection string. Used for `php artisan migrate`, `db:seed`, schema dumps, and anything needing session-level features (advisory locks, `LISTEN/NOTIFY`, `SET` commands, long transactions).
   - Make migrations use the direct connection (e.g., `DB_MIGRATE_*` env vars or `--database=pgsql_direct` in deploy scripts and Composer scripts).
2. **Environment variables** in `.env.example` (documented, no real secrets):
   ```
   DB_CONNECTION=pgsql
   DB_URL=postgresql://USER:PASSWORD@ep-xxxx-pooler.REGION.aws.neon.tech/DBNAME?sslmode=require
   DB_URL_DIRECT=postgresql://USER:PASSWORD@ep-xxxx.REGION.aws.neon.tech/DBNAME?sslmode=require
   DB_SSLMODE=require
   ```
3. **SSL is required** (`sslmode=require`). Never disable it.
4. **PgBouncer (transaction pooling) compatibility:**
   - Do not rely on session state across queries on the pooled connection (no session-level `SET`, no session advisory locks, no `LISTEN/NOTIFY`).
   - Keep transactions short; never hold a transaction open across HTTP calls (e.g., payment gateway) — commit first, then call the gateway.
   - If prepared-statement errors occur with the pooler, set `PDO::ATTR_EMULATE_PREPARES => true` in the connection options and document it in `docs/DECISIONS.md`.
   - Use `Cache::lock` (Redis) for distributed locks, **not** Postgres advisory locks.
5. **Cold starts / autosuspend:** Neon may suspend idle compute. Add a small connection-retry wrapper (e.g., 3 attempts, short backoff) for the first query after idle, and document that **production should use a minimum compute size with autosuspend disabled (or a long timeout)** while dev/preview branches may scale to zero.
6. **Branching workflow:**
   - `main` branch = production, `staging` branch = pre-prod, `dev` branch = local development.
   - CI creates a **short-lived Neon branch per pipeline/PR** (via Neon API/GitHub Action), runs migrations + Pest on it, then deletes it.
   - Provide a script `scripts/neon-branch.sh` (or composer script) and document it in `README.md`.
7. **Region and latency:** host the Laravel app in the **same region as the Neon project** (recommended for Bangladesh-based users: AWS Singapore `ap-southeast-1`). Avoid chatty query patterns; batch and eager load (see no-N+1 rule).
8. **Extensions:** enable only what is needed via a migration using the direct connection: `pg_trgm` (fuzzy search fallback), `unaccent`, `citext` (case-insensitive emails/slugs). Verify each is supported on Neon before use.
9. **Do not use the database as a queue, cache, or session store.** Those stay on **Redis** (Horizon, cache, sessions) to protect connection counts and keep Neon compute cost low.
10. **Connection limits:** size queue workers and PHP-FPM children so total pooled client connections stay within the pooler's limit; document the calculation.
11. **Backups and recovery:** rely on Neon's point-in-time restore (history window depends on the plan). Document the restore procedure in `docs/runbooks/database-restore.md`, and add a scheduled logical backup (`pg_dump` via the direct connection to S3) for long-term retention of financial/ledger data (SRS 7.2).
12. **Security:** store connection strings only in the secrets manager / CI secrets; use a least-privilege database role for the app (no superuser, no `CREATE` on production at runtime) and a separate migration role; rotate credentials periodically; restrict access using Neon's IP allow-list where available.
13. **Observability:** log slow queries (>200 ms) at app level, and use Neon's monitoring dashboard to watch compute/connection usage; add a `/health/deep` check that runs `SELECT 1` against the pooled connection.

### 6.2 Schema requirements

- Follow entities in SRS section 7.1; produce migrations with foreign keys, unique constraints (e.g., one enrollment per user/course, one review per user/course), check constraints for enums where supported, and indexes on all lookup/filter columns.
- Include tables: `webhook_events`, `ledger_entries`, `idempotency_keys`, `audit_logs` (append-only), `settings`, `feature_flags`, `domain_events_outbox` (optional transactional outbox).
- Provide an ERD (Mermaid) in `docs/erd.md`.
- Use PostgreSQL-native features where helpful: `jsonb` columns (quiz settings, analytics payloads), partial/unique indexes, `CHECK` constraints, and `timestamptz` for all timestamps.

---

## 7. Security Requirements (non-negotiable)

- Never store card data; only gateway tokens/ids.
- Verify all webhook signatures; reject replays beyond tolerance.
- Encrypt sensitive columns (tax IDs, payout details) with Laravel encrypted casts.
- Enforce authorization in Policies; add automated tests that attempt cross-user access for each endpoint.
- Signed, expiring media URLs; never expose raw S3 keys or public buckets.
- Validate uploads (mime sniffing, size, extension), store outside web root, scan asynchronously.
- Rate limit auth, checkout, messaging, and uploads; add CAPTCHA/Turnstile verification hook for registration and password reset.
- Log security events (failed logins, MFA changes, role changes, impersonation) to the audit log.

---

## 8. Testing Requirements

- **Pest** feature tests for every endpoint: happy path, validation errors, unauthorized (401), forbidden (403), not found (404), and ownership/IDOR cases.
- Unit tests for: pricing/coupon engine, revenue share, refund eligibility, course status machine, progress completion rules, ledger balancing (debits = credits invariant).
- Integration tests for payment webhooks (duplicate delivery, out-of-order events) using fixture payloads.
- Use fakes: `Storage::fake`, `Queue::fake`, `Event::fake`, `Notification::fake`, fake `PaymentGateway`, fake `VideoPipeline`.
- Add architecture tests (`pest-plugin-arch`) enforcing layering rules (controllers don't use models' query builders directly for business logic, domain modules don't depend on each other's internals).
- Target ≥ 80% coverage on Commerce, Finance, Learning, Identity.

---

## 9. API Conventions

- Base: `/api/v1`. Public routes under `/public/*` where useful.
- Success: `{ "data": ..., "meta": { pagination... } }`.
- Error: `{ "error": { "code": "validation_failed", "message": "...", "details": {...}, "correlation_id": "..." } }`.
- Use API Resources for all outputs; never return Eloquent models directly.
- Use `Idempotency-Key` header on POST checkout/refund endpoints.
- Provide OpenAPI docs at `/docs/api` (disabled in production unless configured).
- Version-safe: additive changes only within v1.

---

## 10. Deliverables Per Phase

1. Code (migrations, models, actions, controllers, resources, policies, jobs, events, listeners).
2. Tests passing (`composer test`), Pint and Larastan clean.
3. `docs/<module>.md`: purpose, endpoints table, events emitted/consumed, state machines, config keys.
4. Updated `README.md` and `.env.example`.
5. A short "What was built / what's next / assumptions made" summary at the end of each phase.

---

## 11. Working Instructions for You (the AI)

1. **Start by asking me at most 5 clarifying questions** only if something blocks you; otherwise state assumptions and proceed.
2. Begin with **Phase 0** and the folder structure proposal; wait for my "go" after Phase 0, then continue phase by phase.
3. Write complete files, not snippets. Show the file path above every file.
4. Prefer Laravel conventions and first-party features; avoid over-engineering, but never skip security, idempotency, or tests.
5. If a requirement in `srs.md` conflicts with this prompt, flag it and propose a resolution.
6. Keep a running `docs/DECISIONS.md` (ADR-style) for every notable choice.
7. Do not invent endpoints the frontend can't use; keep naming consistent with the SRS domain language.