# Phase 0 Documentation — Backend Setup & Foundation

## Purpose
Phase 0 establishes the engineering foundation for the **LearnHub** API backend. It provides:
1. The **Modular Monolith** structure under `app/Domain/<Module>` with strict domain isolation.
2. The core containerized development environment (Docker Compose with PHP 8.4, Nginx, PostgreSQL 16, Redis 7, Meilisearch, MinIO, and Mailpit).
3. The unified API error schema complying with SRS `API-05`.
4. The immutable integer `Money` Value Object (minor units, ISO currency).
5. The idempotency middleware and database schema preventing double mutations.
6. Foundational migrations: users, cache, jobs, idempotency keys, deduplicated webhook events, append-only audit logs, settings, and feature flags.
7. Pluggable payment and video pipeline abstraction interfaces (`PaymentGateway`, `VideoPipeline`, `TaxCalculator`) with fake drivers for local/testing execution.
8. Static analysis (Larastan Level 8), code styling (Laravel Pint), Pest testing framework, and GitHub Actions CI.

---

## Deliverables & Directory Layout

```
y:/app/LMS_Laraval/
├── docker-compose.yml                          # Full dev environment stack
├── .github/workflows/backend-ci.yml            # CI: Pint, Larastan, Pest, Composer Audit
├── docs/
│   ├── DECISIONS.md                            # Architecture Decision Records (ADRs 001-005)
│   ├── erd.md                                  # High-level Mermaid ERD
│   └── backend-phase-0.md                      # Phase 0 documentation
└── backend/
    ├── Dockerfile                              # PHP 8.4 Alpine + extensions
    ├── docker/nginx/default.conf               # Nginx reverse proxy
    ├── .env.example                            # Exhaustive environment documentation
    ├── composer.json                           # Fixed dependencies & scripts
    ├── Makefile                                # Setup & test workflow tasks
    ├── phpstan.neon                            # Larastan Level 8 configuration
    ├── pint.json                               # Strict code formatting rules
    ├── phpunit.xml                             # Test configuration with in-memory DB
    ├── artisan                                 # CLI entry point
    ├── bootstrap/
    │   ├── app.php                             # Middleware stack & API-05 error envelope
    │   └── providers.php
    ├── config/
    │   ├── cors.php                            # Next.js SPA origin configuration
    │   ├── sanctum.php                         # Stateful domains & tokens
    │   ├── services.php                        # Stripe, AWS, OAuth credentials
    │   └── learnhub.php                        # Platform fee, hold period, money rules
    ├── app/
    │   ├── Domain/
    │   │   └── Identity/Models/User.php        # User model with ULID & encrypted casts
    │   └── Infrastructure/
    │       ├── Gateways/
    │       │   ├── Payment/                    # PaymentGateway + Stripe + Fake drivers
    │       │   ├── Video/                      # VideoPipeline + MediaConvert + Fake drivers
    │       │   └── Tax/                        # TaxCalculator + StandardTaxCalculator
    │       ├── Middleware/
    │       │   ├── CorrelationId.php           # Injects X-Correlation-ID
    │       │   ├── ForceJson.php               # Enforces JSON responses
    │       │   ├── SecurityHeaders.php         # OWASP security headers
    │       │   ├── SetLocale.php               # Multilingual headers (en, bn)
    │       │   └── Idempotency.php             # Replay protection & caching
    │       ├── Models/
    │       │   ├── IdempotencyKey.php
    │       │   ├── WebhookEvent.php
    │       │   ├── AuditLog.php
    │       │   ├── Setting.php
    │       │   └── FeatureFlag.php
    │       └── Support/
    │           ├── Providers/                  # AppServiceProvider, GatewaysServiceProvider
    │           └── ValueObjects/Money.php      # Immutable minor unit Money VO
    ├── database/migrations/
    │   ├── 0001_01_01_000000_create_users_table.php
    │   ├── 0001_01_01_000001_create_cache_table.php
    │   ├── 0001_01_01_000002_create_jobs_table.php
    │   ├── 0001_01_01_000003_create_idempotency_keys_table.php
    │   ├── 0001_01_01_000004_create_webhook_events_table.php
    │   ├── 0001_01_01_000005_create_audit_logs_table.php
    │   └── 0001_01_01_000006_create_settings_and_feature_flags_tables.php
    ├── routes/
    │   ├── api.php                             # /api/v1/health & /api/v1/version
    │   ├── web.php
    │   └── console.php
    └── tests/
        ├── Architecture/LayeringTest.php       # Layering & strict typing
        ├── Feature/HealthCheckTest.php         # Error envelope & health checks
        └── Unit/MoneyTest.php                  # Money math & rounding tests
```

---

## State Machines & Contracts Initiated

### Money Value Object Contract
```php
$price = Money::fromCents(4999, 'USD'); // $49.99
$discount = $price->percentage(20);     // $10.00 (1000 cents)
$total = $price->subtract($discount);   // $39.99 (3999 cents)
```

### Idempotency Lifecycle
1. Client issues `POST` with `Idempotency-Key: <UUID>`.
2. `Idempotency` middleware checks `idempotency_keys` table:
   - If missing: records entry in state `in_progress`, executes request, stores response JSON body and status, sets state to `completed`.
   - If present in state `in_progress`: responds with `409 Conflict`.
   - If present in state `completed`: immediately returns cached response with `X-Idempotent-Replay: true`.

---

## What Was Built
- Full container infrastructure ready for `docker compose up -d`.
- Core application skeleton with Laravel 12 configuration standards.
- Global exception handler strictly transforming all API exceptions into the SRS `API-05` error format (`code`, `message`, `details`, `correlation_id`).
- Security middleware applying OWASP ASVS headers.
- Money Value Object protecting all financial math from floating-point inaccuracy.
- Gateway abstractions allowing seamless swapping between fake test drivers and production AWS/Stripe drivers.
- Complete documentation suite (`DECISIONS.md`, `erd.md`, `backend-phase-0.md`).

---

## What's Next: Phase 1 — Identity & Access (AUTH-*)
Upon your confirmation ("go"), we will construct:
1. Migrations for OAuth social accounts (`user_social_accounts`), active device sessions, and login attempts.
2. Models, Enums (`UserRole`, `AccountStatus`), and Spatie role/permission seeding (`learner`, `instructor`, `ta`, `moderator`, `support`, `finance`, `super_admin`).
3. Authentication Actions: Register, Login (with 5-failure lockout notification), Logout, Password Reset, Email Verification.
4. Social Login Action & Controller (Google, Apple, Facebook via Socialite).
5. Two-Factor Authentication (TOTP MFA enable/confirm/disable/recovery codes) with mandatory enforcement on admin/finance roles.
6. Profile CRUD, avatar upload, and account deletion request job (`PRV-02`).
7. Comprehensive Pest feature tests covering all authentication flows, rate limits, lockouts, and permissions.
