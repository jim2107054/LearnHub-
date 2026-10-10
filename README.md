# LearnHub — LMS Marketplace Platform

Welcome to LearnHub, a Udemy-style online course marketplace and Learning Management System (LMS).

## Repository Organization

This repository is organized as a unified monorepo:
- **`backend/`**: Laravel 12 REST API (`/api/v1`) built with a Domain-Driven Modular Monolith architecture, PostgreSQL 16, Redis, Laravel Sanctum, and Horizon.
- **`frontend/`**: Next.js 15+ App Router web application consuming the backend API (planned for initialization).
- **`docs/`**: Architecture decision records (`DECISIONS.md`), Entity-Relationship Diagrams (`erd.md`), and phase implementation reports.

---

## Completed Phases
- **Phase 0 — Project Setup & Architecture Foundation**: Monorepo, Docker Compose, clean exception handler, correlation IDs, security headers, money value object, fake drivers.
- **Phase 1 — Identity & Access (`AUTH-*`)**: Registration, authentication, account lockout, TOTP MFA, device session management, profile, social auth.
- **Phase 2 — Catalog & Search (`CAT-*`)**: Category hierarchy, course discovery, search filtering/sorting, schema.org JSON-LD SEO, wishlists.
- **Phase 3 — Instructor Studio & Media (`INS-*`)**: Course builder, pre-publish validation checklist (`BR-03`), coupons, multipart upload initiation.
- **Phase 4 — Commerce (`PAY-*`)**: Shopping cart, double-entry financial ledger (`ADR 003`), Stripe webhook handling, refunds.
- **Phase 5 — Learning Experience (`LRN-*`)**: "My Learning", signed HLS streaming, 90% completion threshold rule, concurrent stream limiter (`LRN-12`), timestamped notes.
- **Phase 6 — Assessments & Certificates (`ASM-*`, `CRT-*`)**: Timed quizzes, anti-cheating answer sanitization, auto-grading, assignment submissions, verifiable completion certificates (`CRT-YYYYMMDD-XXXXXXXX`).
- **Phase 7 — Community & Notifications (`COM-*`, `NTF-*`)**: Course reviews & rating distribution breakdown, single instructor review replies, Q&A discussion forums with upvoting & best answers, moderation flags, direct messages, and user notification preferences.
- **Phase 8 — Finance: Earnings & Payouts (`EAR-*`)**: Revenue share calculator (37% organic vs 97% coupon), 30-day refund hold period, instructor earnings dashboard & history, payout methods, W-9/W-8BEN tax profiles, scheduled monthly payout batches ($50 threshold), admin holds, and double-entry ledger balancing.
- **Phase 9 — Admin, Moderation, Analytics (`ADM-*`, `ANL-*`)**: User management & audited impersonation, course publishing review queue, user reports queue, platform settings store & dynamic feature flags, DMCA takedowns & 3-strike copyright enforcement, immutable audit logging, privacy-consent event pipeline, instructor drop-off heatmap analytics, and platform KPI reporting.
- **Phase 10 — Hardening & OpenAPI Specification**: OWASP ASVS L2 security headers, deep subsystem health probe (`/health/deep`), GDPR data portability package export, k6 load testing script (sub-500ms p95), Neon database restore runbook, and OpenAPI 3.1.0 specification committed to `docs/openapi.json`.
- **Frontend Phase 0 — Foundation & Architecture**: Next.js 15+ App Router, React 19, TypeScript, Tailwind CSS with dark/light mode tokens, Radix UI primitives, typed API client with Sanctum CSRF & error envelope unwrapping, RootProvider, Navbar, Footer, and edge middleware.
- **Frontend Phase 1 — Auth & Account (`AUTH-*`)**: Registration, login with 5-failure lockout handling, post-login redirection, TOTP MFA challenge & QR setup with recovery codes, forgot & reset password, email verification notice, profile management, active device sessions with revocation, and GDPR data portability export.
- **Frontend Phase 2 — Storefront: Catalog, Search, Course Page (`CAT-*`)**: Instant debounced search autocomplete, full faceted course listing with URL-synced filters, category hub pages with subcategories, course detail page with Schema.org JSON-LD structured data, curriculum accordion with free preview modal, sticky purchase card with coupon application, 5-star rating breakdown, instructor public profile, and XML sitemap/robots.txt.
- **Frontend Phase 3 — Commerce: Cart, Checkout, and Refunds (`PAY-*`)**: Shopping cart with coupon calculation, checkout with billing tax country and idempotent submission (`Idempotency-Key`), post-payment success page polling webhook enrollment status, purchase history with invoice download and 30-day/<10% progress refund modal (`BR-07`), gift course ordering and voucher redemption.
- **Frontend Phase 4 — Learning Experience (`LRN-*`)**: My Learning dashboard with progress tracking and weekly goals, accessible custom HLS video player with speed control/keyboard shortcuts/10s progress heartbeat and concurrent stream limit modal (`LRN-12`), curriculum sidebar with auto-advance countdown, and timestamped study notes with Markdown export.
- **Frontend Phase 5 — Assessments & Certificates (`ASM-*`, `CRT-*`)**: Timed quiz runner with autosave and scoring breakdown, assignment submission workflow with rubrics and instructor feedback, high-resolution verifiable completion certificate preview with PDF download and LinkedIn sharing, and public certificate verification portal (`/verify/[code]`).
- **Frontend Phase 6 — Community & Notifications (`COM-*`, `NTF-*`)**: Verified student reviews with 10% progress eligibility gating (`BR-05`) and single instructor replies, Q&A discussion board with upvoting and best answer marking, notification center with unread count and granular preferences, and peer/instructor direct messaging.
- **Frontend Phase 7 — Instructor Studio (`INS-*`, `EAR-*`, `ANL-*`)**: Instructor studio dashboard with KPIs, course creation wizard, curriculum builder with video transcode simulation, pre-publish validation checklist (`BR-03`), student retention and lecture drop-off heatmap (`ANL-03`), earnings reconciliation with 30-day refund hold reserve and W-9 tax profile, and 97% revenue share coupon manager.

---

## Backend Quick Start (Local Development)

### 1. Requirements
- Docker and Docker Compose (or native PHP 8.4 + PostgreSQL 16 + Redis)

### 2. Launch Services
From the root directory:
```bash
docker compose up -d
```
Services exposed:
- **API Server & Nginx**: `http://localhost:8000`
- **PostgreSQL**: `localhost:5432` (db: `learnhub`, user: `learnhub_user`, pass: `secret`)
- **Redis**: `localhost:6379`
- **Meilisearch**: `http://localhost:7700`
- **MinIO Storage & Console**: `http://localhost:9000` (Console: `http://localhost:9001`)
- **Mailpit Web UI**: `http://localhost:8025`

### 3. Initialize Application
Inside the backend container or locally:
```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
```

### 4. Quality & Testing Commands
```bash
cd backend
make test          # Run Pest test suite
make test-coverage # Run Pest with >= 80% coverage check
make lint          # Run Laravel Pint formatting
make analyse       # Run Larastan Level 8 static analysis
make audit         # Security vulnerability check
```
