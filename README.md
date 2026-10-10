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
