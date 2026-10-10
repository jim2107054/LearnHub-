# Software Requirements Specification (SRS)

## LearnHub — Online Course Marketplace & Learning Management Platform

| Field | Value |
|---|---|
| Document version | 1.0 |
| Status | Draft for review |
| Date | 2026-10-10 |
| Standard | Structured after IEEE 830 / ISO/IEC/IEEE 29148 |
| Product type | Web + mobile multi-sided marketplace and LMS |

> "LearnHub" is a placeholder product name. Replace it with your own brand.

---

## Table of Contents

1. [Introduction](#1-introduction)
2. [Overall Description](#2-overall-description)
3. [System Features and Functional Requirements](#3-system-features-and-functional-requirements)
4. [External Interface Requirements](#4-external-interface-requirements)
5. [Non-Functional Requirements](#5-non-functional-requirements)
6. [System Architecture (Proposed)](#6-system-architecture-proposed)
7. [Data Requirements](#7-data-requirements)
8. [Business Rules](#8-business-rules)
9. [Legal, Compliance and Policy Requirements](#9-legal-compliance-and-policy-requirements)
10. [Release Plan and Prioritization](#10-release-plan-and-prioritization)
11. [Acceptance Criteria and Testing Strategy](#11-acceptance-criteria-and-testing-strategy)
12. [Risks and Assumptions](#12-risks-and-assumptions)
13. [Appendices](#13-appendices)

---

## 1. Introduction

### 1.1 Purpose

This document specifies the functional and non-functional requirements for **LearnHub**, an online marketplace where independent instructors and organizations publish video-based courses and learners discover, purchase, and consume them. It is intended for product owners, designers, developers, QA engineers, DevOps, and stakeholders, and serves as the baseline for design, development, testing, and acceptance.

### 1.2 Scope

LearnHub will provide:

- A public storefront for browsing, searching, and purchasing courses.
- A learner experience for watching lectures, taking quizzes, completing assignments, tracking progress, and earning certificates.
- An instructor studio for creating, publishing, pricing, and analyzing courses, and receiving payouts.
- An administration console for moderation, user management, finance, support, and platform configuration.
- Supporting capabilities: payments, coupons, reviews, Q&A, notifications, analytics, and an API.

**Out of scope for v1.0:** live-classroom hardware integrations, proctored exams, native TV apps, offline DRM-grade downloads on desktop, and multi-tenant white-label deployments (see Section 10 for roadmap).

### 1.3 Definitions, Acronyms, Abbreviations

| Term | Definition |
|---|---|
| LMS | Learning Management System |
| Learner / Student | A user who enrolls in and consumes courses |
| Instructor | A user who creates and sells courses |
| Admin | Platform staff with elevated privileges |
| Course | A structured collection of sections, lectures, and assessments |
| Section | A grouping of lectures within a course (a "module") |
| Lecture | A single learning unit (video, article, file, quiz, or assignment) |
| Enrollment | The entitlement of a learner to access a course |
| Payout | Transfer of instructor earnings from the platform |
| GMV | Gross Merchandise Value |
| HLS / DASH | Adaptive bitrate streaming protocols |
| DRM | Digital Rights Management |
| CDN | Content Delivery Network |
| RBAC | Role-Based Access Control |
| MFA / 2FA | Multi-factor / two-factor authentication |
| SSO | Single Sign-On |
| PII | Personally Identifiable Information |
| WCAG | Web Content Accessibility Guidelines |
| SLA / SLO | Service Level Agreement / Objective |
| RPO / RTO | Recovery Point / Time Objective |
| PCI DSS | Payment Card Industry Data Security Standard |
| GDPR | General Data Protection Regulation |

### 1.4 References

- IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018 — Requirements engineering
- WCAG 2.2 — Web Content Accessibility Guidelines
- OWASP ASVS 4.0 and OWASP Top 10
- PCI DSS v4.0
- GDPR, CCPA/CPRA, and applicable local data-protection laws
- SCORM 1.2/2004, xAPI, and LTI 1.3 specifications (for future interoperability)

### 1.5 Document Conventions

- Requirement IDs follow the pattern `<AREA>-<NN>` (e.g., `AUTH-01`).
- Priority uses MoSCoW: **M**ust, **S**hould, **C**ould, **W**on't (this release).
- The words "shall" (mandatory), "should" (recommended), and "may" (optional) are used deliberately.

---

## 2. Overall Description

### 2.1 Product Perspective

LearnHub is a new, self-contained, cloud-hosted product. It is a **three-sided platform**:

```
 ┌───────────┐     buys / learns     ┌────────────────┐    publishes / earns    ┌─────────────┐
 │  Learner  │ ────────────────────► │    LearnHub    │ ◄────────────────────── │ Instructor  │
 └───────────┘                       │ (Marketplace + │                         └─────────────┘
                                     │      LMS)      │
 ┌───────────┐   moderates / runs    │                │    pays / settles       ┌─────────────┐
 │   Admin   │ ────────────────────► │                │ ◄──────────────────────►│  Payment    │
 └───────────┘                       └────────────────┘                         │  Gateways   │
                                                                                └─────────────┘
```

It integrates with external services: payment gateways, email/SMS providers, video transcoding and CDN, identity providers (Google, Apple, Facebook, GitHub), analytics, and tax/currency services.

### 2.2 Product Functions (High-Level)

1. Account & identity management with social login and MFA.
2. Course catalog, categories, search, filtering, recommendations.
3. Course authoring (video/article/quiz/assignment/resources) and publishing workflow with review.
4. Shopping cart, checkout, coupons, subscriptions, refunds, multi-currency.
5. Learning player with progress tracking, notes, bookmarks, speed control, captions.
6. Assessments: quizzes, coding exercises (could), assignments with grading.
7. Social learning: Q&A, reviews/ratings, announcements, direct messages.
8. Certificates of completion with public verification.
9. Instructor revenue share, analytics, and payouts.
10. Admin moderation, finance, reporting, and configuration.
11. Notifications (email, push, in-app).
12. Public REST/GraphQL API and webhooks.

### 2.3 User Classes and Characteristics

| User class | Description | Technical skill | Frequency |
|---|---|---|---|
| Visitor (anonymous) | Browses catalog and previews | Low–High | Occasional |
| Learner | Buys and consumes courses | Low–Medium | Daily/weekly |
| Instructor | Authors and manages courses | Medium | Weekly |
| Teaching Assistant (TA) | Helps instructor with Q&A and grading | Medium | Weekly |
| Organization Admin (Business) | Manages team licenses and learner groups | Medium | Weekly |
| Content Moderator | Reviews courses, reviews, reports | Medium | Daily |
| Support Agent | Handles tickets, refunds, account issues | Medium | Daily |
| Finance Admin | Manages payouts, taxes, reconciliation | Medium–High | Weekly/Monthly |
| Super Admin | Platform configuration, RBAC, audit | High | As needed |

### 2.4 Operating Environment

- **Client:** Latest two major versions of Chrome, Edge, Firefox, Safari; iOS 16+; Android 10+.
- **Server:** Linux containers on a managed Kubernetes cluster in a major cloud (AWS/GCP/Azure).
- **Data stores:** Relational DB (PostgreSQL), cache (Redis), search (Elasticsearch/OpenSearch), object storage (S3-compatible).
- **Connectivity:** Must degrade gracefully on 3G-class networks (adaptive streaming).

### 2.5 Design and Implementation Constraints

- Payment card data shall never be stored on LearnHub servers; tokenization via PCI-compliant gateways is mandatory.
- Video delivery shall use adaptive streaming via CDN.
- All user-facing text shall be externalized for localization (i18n).
- Open-source dependencies shall be license-compatible with commercial use.
- Must comply with data-residency requirements where legally required.

### 2.6 Assumptions and Dependencies

- Third-party gateways (e.g., Stripe, PayPal, SSLCommerz, bKash, Razorpay) are available in target regions.
- A managed video pipeline (e.g., AWS MediaConvert / Mux / Cloudflare Stream) is used instead of building transcoding from scratch.
- Instructors own or have rights to the content they upload.
- Email deliverability is maintained via authenticated domains (SPF/DKIM/DMARC).

---

## 3. System Features and Functional Requirements

### 3.1 Authentication and Account Management (AUTH)

| ID | Requirement | Priority |
|---|---|---|
| AUTH-01 | The system shall allow registration with email + password (min 8 chars, complexity enforced, breached-password check). | M |
| AUTH-02 | The system shall send an email verification link (expires in 24 h) and restrict purchasing/publishing until verified. | M |
| AUTH-03 | The system shall support social login via Google, Apple, and Facebook; GitHub/LinkedIn may be added. | S |
| AUTH-04 | The system shall support password reset via a single-use, time-limited (1 h) token. | M |
| AUTH-05 | The system shall support optional TOTP-based MFA and mandate MFA for Admin and Finance roles. | M |
| AUTH-06 | The system shall lock an account temporarily after 5 consecutive failed logins and notify the user. | M |
| AUTH-07 | The system shall let users view and revoke active sessions and devices. | S |
| AUTH-08 | The system shall support Enterprise SSO (SAML 2.0 / OIDC) for Organization accounts. | C |
| AUTH-09 | The system shall allow users to update profile (name, photo, headline, bio, links, language, timezone). | M |
| AUTH-10 | The system shall allow account deactivation and permanent deletion (with data-erasure workflow per Section 9). | M |
| AUTH-11 | The system shall allow a single user to hold both Learner and Instructor roles. | M |
| AUTH-12 | The system shall support RBAC with configurable permissions for staff roles. | M |
| AUTH-13 | Sessions shall use short-lived access tokens (≤15 min) and rotating refresh tokens. | M |

### 3.2 Course Catalog, Discovery, and Search (CAT)

| ID | Requirement | Priority |
|---|---|---|
| CAT-01 | The system shall organize courses in a hierarchical taxonomy (Category → Subcategory → Topic) managed by admins. | M |
| CAT-02 | The system shall provide a home page with featured, trending, new, and personalized recommendation rails. | M |
| CAT-03 | The system shall provide full-text search with typo tolerance, synonyms, and autocomplete suggestions. | M |
| CAT-04 | The system shall support filters: category, price (free/paid/range), rating, duration, level, language, subtitles, last updated, and features (quizzes, certificates). | M |
| CAT-05 | The system shall support sorting by relevance, popularity, rating, newest, and price. | M |
| CAT-06 | The course landing page shall display title, subtitle, instructor(s), rating, enrollments, last-updated date, language, learning objectives, curriculum outline, requirements, description, reviews, price, and promo video. | M |
| CAT-07 | The system shall allow visitors to watch free-preview lectures without login. | M |
| CAT-08 | The system shall provide learning paths / curated bundles of courses. | S |
| CAT-09 | The system shall provide a wishlist for authenticated learners. | S |
| CAT-10 | The system shall generate SEO-friendly URLs, meta tags, structured data (schema.org `Course`), and a sitemap. | M |
| CAT-11 | The system shall provide a "Customers also bought" / "Related courses" recommendation engine. | S |
| CAT-12 | Search results shall return within 500 ms at p95 for the top page. | M |

### 3.3 Instructor Studio — Course Authoring (INS)

| ID | Requirement | Priority |
|---|---|---|
| INS-01 | A user shall be able to apply to become an instructor by accepting the Instructor Terms and completing a profile (and tax/payout details before first payout). | M |
| INS-02 | The system shall provide a guided course creation wizard: title, category, level, language, learning objectives, prerequisites, target audience, thumbnail, promo video. | M |
| INS-03 | The curriculum builder shall allow creating, reordering (drag-and-drop), editing, and deleting sections and lectures. | M |
| INS-04 | Lecture types shall include: video, article (rich text/markdown), downloadable resource, quiz, assignment, and external link; coding exercise may be added. | M |
| INS-05 | Video uploads shall support resumable, chunked uploads up to 10 GB per file; accepted formats MP4, MOV, MKV, WebM. | M |
| INS-06 | The system shall transcode each video into an adaptive bitrate ladder (e.g., 240p–1080p, 4K optional) in HLS/DASH, and show processing status. | M |
| INS-07 | The system shall support caption/subtitle upload (SRT/VTT) and may offer auto-generated captions that instructors can edit. | M |
| INS-08 | Instructors shall be able to mark lectures as "free preview". | M |
| INS-09 | The system shall autosave drafts and maintain version history of course content metadata. | S |
| INS-10 | The system shall run pre-publish validation (minimum total video length, minimum lecture count, required fields, thumbnail quality, no copyright flag). | M |
| INS-11 | Instructors shall submit courses for review; the system shall track status: Draft → In Review → Approved/Rejected → Published → Unpublished/Archived. | M |
| INS-12 | Instructors shall set price from allowed price tiers (and per-region price overrides where enabled). | M |
| INS-13 | Instructors shall create coupons (percent/fixed, usage limits, expiry, targeted/untargeted) within platform policy. | M |
| INS-14 | Instructors shall be able to invite co-instructors and TAs with defined permissions and revenue split. | S |
| INS-15 | Instructors shall be able to post course announcements and send messages to enrolled learners (rate-limited). | M |
| INS-16 | Instructors shall be able to answer Q&A, reply to reviews, and request review removal for policy violations. | M |
| INS-17 | Updated content shall be re-published without affecting existing enrollments; major updates may trigger notifications. | M |
| INS-18 | Instructors shall be able to delete a course only if it has no enrollments; otherwise it can only be unpublished (existing learners retain access). | M |
| INS-19 | The system shall provide instructor analytics (see Section 3.12). | M |

### 3.4 Shopping Cart, Checkout, and Payments (PAY)

| ID | Requirement | Priority |
|---|---|---|
| PAY-01 | Learners shall add courses to a cart and wishlist; carts persist across sessions and devices. | M |
| PAY-02 | The system shall support coupon codes and automatic platform promotions, showing the discount before payment. | M |
| PAY-03 | The system shall support multiple currencies with display-currency localization and transparent conversion. | S |
| PAY-04 | The system shall integrate with at least one card gateway (e.g., Stripe) and one wallet/alternate method (e.g., PayPal); regional methods (e.g., bKash, Nagad, SSLCommerz, UPI) may be added. | M |
| PAY-05 | The system shall tokenize cards via gateway-hosted fields/redirect; raw card data shall never touch LearnHub servers. | M |
| PAY-06 | The system shall support 3-D Secure / SCA where required. | M |
| PAY-07 | The system shall compute and apply taxes (VAT/GST/sales tax) based on buyer location, and show tax-inclusive/exclusive pricing per region. | M |
| PAY-08 | On confirmed payment (via verified webhook), the system shall create enrollments idempotently and send a receipt/invoice email. | M |
| PAY-09 | The system shall ensure idempotent checkout: duplicate submissions or webhook replays shall not create duplicate charges or enrollments. | M |
| PAY-10 | The system shall support gift purchases (redeemable via link/code). | S |
| PAY-11 | The system shall support refunds: automatic eligibility within the refund window (default 30 days and <30% progress, configurable), admin override, and partial refunds. | M |
| PAY-12 | On refund, the system shall revoke access (configurable), reverse instructor earnings, and notify parties. | M |
| PAY-13 | The system shall support optional subscription plans (all-access or per-category) with recurring billing, trials, upgrades/downgrades, and dunning. | C |
| PAY-14 | The system shall support Business/Team licenses with seat management and bulk purchase. | C |
| PAY-15 | The system shall detect and mitigate fraud (velocity checks, risk scoring from gateway, manual review queue). | S |
| PAY-16 | The system shall generate downloadable invoices and a purchase history for learners. | M |
| PAY-17 | The system shall record all financial events in an immutable double-entry ledger. | M |
| PAY-18 | The system shall handle chargebacks/disputes, flagging the account and freezing related earnings. | S |

### 3.5 Learning Experience and Player (LRN)

| ID | Requirement | Priority |
|---|---|---|
| LRN-01 | Learners shall have a "My Learning" dashboard listing enrolled courses, progress, last-accessed lecture, and a "Continue" button. | M |
| LRN-02 | The video player shall support adaptive streaming, quality selection, playback speed (0.5×–2×), keyboard shortcuts, picture-in-picture, and fullscreen. | M |
| LRN-03 | The player shall support captions/subtitles, with language selection and style options. | M |
| LRN-04 | The system shall auto-resume at the last watched position and save progress at ≤10 s intervals. | M |
| LRN-05 | A lecture shall be marked complete when ≥90% watched, article opened/read, or quiz passed; learners may mark manually. | M |
| LRN-06 | The course sidebar shall show curriculum with completion state, durations, and resources. | M |
| LRN-07 | Learners shall create timestamped notes and bookmarks per lecture, exportable as PDF/Markdown. | S |
| LRN-08 | Learners shall download resources attached to lectures. | M |
| LRN-09 | The system shall provide a progress bar and completion percentage per course. | M |
| LRN-10 | The system shall provide learning reminders (scheduled study goals and notifications). | S |
| LRN-11 | Mobile apps shall support offline download of lectures for enrolled courses with expiry and license checks. | S |
| LRN-12 | The system shall restrict simultaneous concurrent streams per account (default 3) and detect credential sharing patterns. | S |
| LRN-13 | Video streams shall use signed, expiring URLs; DRM (Widevine/FairPlay/PlayReady) should be applied for premium content. | M / S |
| LRN-14 | The player shall be accessible (keyboard navigable, screen-reader labeled, WCAG 2.2 AA). | M |
| LRN-15 | Learners shall be able to archive/favorite courses in their library. | S |
| LRN-16 | Enrollment shall be lifetime by default; time-limited access may be configured for subscription/business plans. | M |

### 3.6 Assessments (ASM)

| ID | Requirement | Priority |
|---|---|---|
| ASM-01 | Instructors shall create quizzes with question types: single choice, multiple choice, true/false, fill-in-the-blank, matching, and short text; code/essay may be added. | M |
| ASM-02 | Quizzes shall support settings: pass mark, attempts, time limit, randomized order, question pools, and answer explanations. | M |
| ASM-03 | The system shall auto-grade objective questions and show immediate feedback per quiz settings. | M |
| ASM-04 | Instructors shall create assignments with instructions, attachments, due dates (optional), and rubrics. | S |
| ASM-05 | Learners shall submit assignments (file/text/link) and receive grades and feedback from instructors/TAs. | S |
| ASM-06 | Peer review of assignments may be supported. | C |
| ASM-07 | The system shall support in-browser coding exercises with sandboxed execution and automated tests for selected languages. | C |
| ASM-08 | The system shall maintain a gradebook per course for instructors, exportable to CSV. | S |
| ASM-09 | Final exams may gate certificate issuance (configurable per course). | S |
| ASM-10 | The system shall record all attempts and scores with timestamps for audit. | M |

### 3.7 Certificates (CRT)

| ID | Requirement | Priority |
|---|---|---|
| CRT-01 | The system shall issue a PDF certificate upon meeting completion criteria (100% required lectures + passing required assessments). | M |
| CRT-02 | Each certificate shall have a unique ID, QR code, and public verification URL showing learner name, course, instructor, date, and validity. | M |
| CRT-03 | Learners shall share certificates to LinkedIn and social platforms and download as PDF/PNG. | S |
| CRT-04 | Admins/instructors shall customize certificate templates (branding, signature) within platform policy. | S |
| CRT-05 | Certificates shall be revocable (e.g., on refund/fraud) with the verification page reflecting status. | M |
| CRT-06 | The system may issue Open Badges 3.0 / verifiable credentials. | C |

### 3.8 Community: Reviews, Q&A, and Messaging (COM)

| ID | Requirement | Priority |
|---|---|---|
| COM-01 | Only enrolled learners with ≥ a minimum progress threshold (default 10%) shall be able to leave a 1–5 star rating and a written review. | M |
| COM-02 | Learners shall edit/delete their own review; instructors shall reply once publicly. | M |
| COM-03 | The system shall compute course rating (weighted average) and display distribution. | M |
| COM-04 | Each course shall have a Q&A forum: learners ask questions (optionally tied to a lecture), instructors/TAs/learners answer, upvote, and mark best answer. | M |
| COM-05 | The system shall provide report/flag actions on reviews, questions, answers, and messages, feeding the moderation queue. | M |
| COM-06 | The system shall provide a profanity/spam filter with configurable severity and shadow-ban capability. | S |
| COM-07 | Instructors shall be able to broadcast announcements; learners shall control notification preferences. | M |
| COM-08 | The system shall provide direct messaging between learners and instructors, with rate limits and block/report options. | S |
| COM-09 | The system shall detect and flag fake/incentivized reviews using heuristics. | S |
| COM-10 | Discussion/community spaces and study groups may be added. | C |

### 3.9 Notifications (NTF)

| ID | Requirement | Priority |
|---|---|---|
| NTF-01 | The system shall deliver notifications through email, in-app, and mobile push (and SMS may be added). | M |
| NTF-02 | Users shall manage preferences per category (transactions, learning, promotions, social) and frequency (instant/digest). | M |
| NTF-03 | Transactional emails (receipt, password reset, refund, payout) shall not be suppressible except by legal opt-out rules. | M |
| NTF-04 | The system shall use templates with localization and variable substitution, and track delivery/open/click events. | S |
| NTF-05 | All marketing emails shall include one-click unsubscribe and comply with CAN-SPAM/GDPR. | M |
| NTF-06 | The system shall support abandoned-cart and course-recommendation campaigns. | S |

### 3.10 Instructor Earnings and Payouts (EAR)

| ID | Requirement | Priority |
|---|---|---|
| EAR-01 | The system shall calculate instructor revenue share per sale according to the configured model (e.g., 37% for platform-sourced sales, 97% for instructor-sourced via referral/coupon; values configurable). | M |
| EAR-02 | The system shall deduct taxes, gateway fees (if policy dictates), and refunds before computing net earnings. | M |
| EAR-03 | Instructors shall see an earnings dashboard: gross, net, pending, available, paid, and per-course breakdown. | M |
| EAR-04 | Earnings shall be held for a configurable period (default 30 days) before becoming payable, to cover refunds. | M |
| EAR-05 | Instructors shall configure payout methods (bank transfer, PayPal, Payoneer, mobile wallet) and complete KYC/tax forms. | M |
| EAR-06 | The system shall run scheduled monthly payouts above a minimum threshold, generating statements. | M |
| EAR-07 | Co-instructor revenue splits shall be honored automatically. | S |
| EAR-08 | Finance Admins shall be able to hold, release, adjust, and reverse payouts with audit logging. | M |
| EAR-09 | The system shall support affiliate/referral links with tracking cookies and commissions. | S |
| EAR-10 | The system shall produce tax documents (e.g., 1099-K/withholding reports) where required. | S |

### 3.11 Administration and Moderation (ADM)

| ID | Requirement | Priority |
|---|---|---|
| ADM-01 | Admin console shall provide user management: search, view, edit, suspend, ban, impersonate (audited, with consent policy), and delete. | M |
| ADM-02 | A course review workflow shall allow moderators to approve/reject with structured feedback and quality checklist. | M |
| ADM-03 | The system shall provide a moderation queue for reports (courses, reviews, Q&A, messages), with SLA timers. | M |
| ADM-04 | Admins shall manage categories, tags, featured collections, banners, homepage layout, and promotions. | M |
| ADM-05 | Admins shall configure platform settings: commission model, refund policy, price tiers, currencies, taxes, feature flags, and payment gateways. | M |
| ADM-06 | Admins shall manage coupons/campaigns globally (sitewide sales). | M |
| ADM-07 | The system shall provide a support/ticketing view (or integrate with Zendesk/Freshdesk) linked to user/order context. | S |
| ADM-08 | Content-protection workflow: DMCA/copyright takedown intake, strike tracking for instructors, and counter-notice handling. | M |
| ADM-09 | The system shall maintain an immutable audit log of all privileged actions (who, what, when, from where). | M |
| ADM-10 | Admin dashboards shall show KPIs: GMV, revenue, signups, conversion, active learners, refunds, top courses, system health. | M |
| ADM-11 | The system shall allow CMS-style management of static pages (About, Terms, Privacy, Help Center). | S |
| ADM-12 | The system shall support managing localization strings and enabling languages. | S |

### 3.12 Analytics and Reporting (ANL)

| ID | Requirement | Priority |
|---|---|---|
| ANL-01 | Instructor analytics: impressions, visits, conversion, enrollments, revenue, geography, traffic sources, ratings trend, completion rate, and lecture drop-off heatmap. | M |
| ANL-02 | Learner analytics: time spent, streaks, progress, and quiz performance. | S |
| ANL-03 | Admin analytics: cohort retention, funnel (visit→cart→purchase), LTV, CAC (with marketing integration), refund rate, and instructor leaderboard. | S |
| ANL-04 | All reports shall be filterable by date range and exportable (CSV/XLSX/PDF). | M |
| ANL-05 | The system shall collect behavioral events through an event pipeline (e.g., Kafka → data warehouse) respecting consent. | M |
| ANL-06 | Data freshness: instructor dashboards shall reflect events within 15 minutes; financial reports within 1 hour. | S |
| ANL-07 | Scheduled report emails may be configured. | C |

### 3.13 Business / Organization Features (ORG) — *Phase 2*

| ID | Requirement | Priority |
|---|---|---|
| ORG-01 | Organizations shall purchase seat licenses and assign/revoke seats for members. | S |
| ORG-02 | Org admins shall create learner groups, assign courses/learning paths with deadlines, and send reminders. | S |
| ORG-03 | Org admins shall view team progress and compliance reports. | S |
| ORG-04 | The system shall support SCIM user provisioning and SSO. | C |
| ORG-05 | The system shall support custom content upload visible only to the organization. | C |
| ORG-06 | The system shall support SCORM/xAPI/LTI integration for external LMS/HRIS. | C |

### 3.14 Public API and Integrations (API)

| ID | Requirement | Priority |
|---|---|---|
| API-01 | The platform shall expose a versioned REST API (OpenAPI 3.x documented) for all first-party clients. | M |
| API-02 | A public partner API shall expose catalog, enrollments, and progress (OAuth 2.0 scopes, rate-limited). | S |
| API-03 | The system shall support outgoing webhooks (enrollment.created, payment.succeeded, refund.created, course.published, certificate.issued) with signing, retries, and replay. | S |
| API-04 | Third-party integrations: Google Analytics/Tag Manager, Meta Pixel, CRM (HubSpot), email (SendGrid/SES/Mailchimp), Zoom (for live sessions), Slack. | C |
| API-05 | API errors shall use a consistent schema with machine-readable codes and correlation IDs. | M |

### 3.15 Live Sessions (LIV) — *Phase 3 (Could)*

| ID | Requirement | Priority |
|---|---|---|
| LIV-01 | Instructors shall schedule live classes (via Zoom/Meet/WebRTC integration) tied to a course. | C |
| LIV-02 | The system shall send calendar invites/reminders and store recordings as lectures. | C |
| LIV-03 | Live Q&A, polls, and attendance tracking shall be supported. | C |

### 3.16 Localization and Accessibility (LOC)

| ID | Requirement | Priority |
|---|---|---|
| LOC-01 | The UI shall be fully translatable; initial languages: English and Bangla, with architecture ready for RTL (Arabic/Urdu) and CJK. | M |
| LOC-02 | Dates, numbers, and currency shall follow user locale. | M |
| LOC-03 | Course content language shall be a filterable attribute; instructors may provide multi-language captions. | M |
| LOC-04 | The platform shall meet WCAG 2.2 Level AA (contrast, focus, labels, captions, reduced motion). | M |

---

## 4. External Interface Requirements

### 4.1 User Interfaces

- **Responsive web app** (mobile-first; breakpoints ≈ 360, 768, 1024, 1440 px).
- **Native/cross-platform mobile apps** (iOS/Android) for learners (Phase 2); instructor mobile app (Could).
- Design system with reusable components, dark/light themes, and consistent navigation.
- Key screens: Home, Search results, Course landing, Cart/Checkout, My Learning, Course player, Quiz, Certificate, Profile/Settings, Instructor Dashboard, Course Builder, Earnings, Admin Console.
- Performance: skeleton loaders, lazy-loaded media, optimistic UI where safe.
- Error messages shall be clear, actionable, and non-technical.

### 4.2 Hardware Interfaces

- No dedicated hardware. Supports standard cameras/microphones for live sessions (Phase 3) and standard audio output for video.

### 4.3 Software Interfaces

| Interface | Purpose | Protocol |
|---|---|---|
| Payment gateways (Stripe, PayPal, regional) | Charging, refunds, payouts, disputes | HTTPS REST + signed webhooks |
| Identity providers (Google/Apple/Facebook) | Social login | OAuth 2.0 / OIDC |
| Email (SES/SendGrid) | Transactional & marketing mail | SMTP/HTTPS API |
| SMS/Push (Twilio, FCM, APNs) | Notifications | HTTPS |
| Video pipeline (MediaConvert/Mux) | Transcoding, thumbnails, captions | HTTPS + events |
| CDN (CloudFront/Cloudflare) | Static & video delivery, signed URLs | HTTPS |
| Search (OpenSearch/Elasticsearch) | Catalog search | HTTPS |
| Tax service (TaxJar/Avalara or in-house) | Tax calculation | HTTPS |
| Currency rates provider | FX conversion | HTTPS |
| Analytics/Data warehouse (BigQuery/Redshift) | Reporting | Batch/stream |
| Zoom/Meet | Live classes (Phase 3) | OAuth + REST |

### 4.4 Communication Interfaces

- All client–server traffic over HTTPS (TLS 1.2+, TLS 1.3 preferred) with HSTS.
- Real-time features (notifications, Q&A updates) via WebSockets or Server-Sent Events.
- Internal service messaging via an asynchronous broker (Kafka/RabbitMQ/SQS).
- Webhooks use HMAC-SHA256 signatures with timestamp tolerance.

---

## 5. Non-Functional Requirements

### 5.1 Performance (PERF)

| ID | Requirement |
|---|---|
| PERF-01 | Page load (LCP) ≤ 2.5 s at p75 on a mid-range mobile device over 4G for catalog and course pages. |
| PERF-02 | API response time ≤ 300 ms at p95 for read endpoints, ≤ 800 ms for write endpoints under nominal load. |
| PERF-03 | Video start time ≤ 3 s at p95; rebuffering ratio < 1%. |
| PERF-04 | Search response ≤ 500 ms at p95. |
| PERF-05 | Checkout completion (excluding gateway time) ≤ 2 s at p95. |
| PERF-06 | Video transcoding turnaround: ≤ 2× media duration at p90 (e.g., 30-min video ready within 60 min). |

### 5.2 Scalability (SCAL)

| ID | Requirement |
|---|---|
| SCAL-01 | Support 100,000 registered users and 10,000 concurrent learners at launch, scaling horizontally to ≥ 5 million users and 250,000 concurrent without re-architecture. |
| SCAL-02 | Stateless application services with auto-scaling on CPU, memory, and queue depth. |
| SCAL-03 | Handle flash-sale spikes of 20× normal checkout traffic with graceful degradation (queueing, rate limiting). |
| SCAL-04 | Storage shall scale to petabytes using object storage with lifecycle tiering. |

### 5.3 Availability and Reliability (REL)

| ID | Requirement |
|---|---|
| REL-01 | Monthly uptime SLO ≥ 99.9% for the learner-facing platform; ≥ 99.95% for video playback via CDN. |
| REL-02 | RPO ≤ 15 minutes; RTO ≤ 1 hour for primary regions. |
| REL-03 | Multi-AZ deployment; automated failover for databases and caches. |
| REL-04 | Zero-downtime deployments (blue/green or canary) and instant rollback. |
| REL-05 | Payment and enrollment flows shall be fault-tolerant with retries and reconciliation jobs. |
| REL-06 | Daily backups retained for 35 days; quarterly restore drills. |
| REL-07 | Graceful degradation: if recommendations/search are down, core browsing and playback continue. |

### 5.4 Security (SEC)

| ID | Requirement |
|---|---|
| SEC-01 | Comply with OWASP ASVS Level 2; mitigate OWASP Top 10 (injection, XSS, CSRF, SSRF, broken access control, etc.). |
| SEC-02 | Passwords hashed with Argon2id (or bcrypt cost ≥ 12) with unique salts. |
| SEC-03 | Encrypt data in transit (TLS) and at rest (AES-256); manage keys via KMS with rotation. |
| SEC-04 | Enforce server-side authorization on every request; apply least privilege and RBAC. |
| SEC-05 | Protect against abuse: rate limiting, bot detection (CAPTCHA/Turnstile), WAF, DDoS protection. |
| SEC-06 | Secure file uploads: type/size validation, malware scanning, isolated storage, no direct execution. |
| SEC-07 | Content protection: signed URLs, token expiry, hotlink protection, optional DRM, and forensic watermarking (Could). |
| SEC-08 | Secrets are never in source control; use a secrets manager. |
| SEC-09 | Security headers (CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy). |
| SEC-10 | Regular SAST/DAST/dependency scans in CI; annual third-party penetration test; responsible-disclosure program. |
| SEC-11 | Security logging and alerting (SIEM) for anomalous behavior; immutable audit trails. |
| SEC-12 | PCI DSS SAQ-A scope maintained via hosted payment fields. |
| SEC-13 | Tenant/user data isolation tested via automated access-control tests. |

### 5.5 Privacy and Data Protection (PRV)

| ID | Requirement |
|---|---|
| PRV-01 | Provide consent management (cookies, marketing, analytics) with granular opt-in. |
| PRV-02 | Support data subject rights: access/export, rectification, deletion, restriction, and portability within statutory deadlines. |
| PRV-03 | Minimize PII collection; pseudonymize analytics data. |
| PRV-04 | Retain data only as long as needed; configurable retention schedules (e.g., financial records 7 years). |
| PRV-05 | Maintain a record of processing activities and sub-processor list. |
| PRV-06 | Age gate: users under 13 (or local threshold) shall not register without parental consent. |

### 5.6 Usability (USE)

| ID | Requirement |
|---|---|
| USE-01 | A new learner shall be able to find and purchase a course in ≤ 5 minutes without help (usability-test target ≥ 90% success). |
| USE-02 | An instructor shall be able to publish a first course draft with a video lecture in ≤ 60 minutes. |
| USE-03 | Consistent UI patterns, inline help, and onboarding tours for instructors. |
| USE-04 | System Usability Scale (SUS) score ≥ 80 in pre-launch testing. |

### 5.7 Maintainability and Observability (MNT)

| ID | Requirement |
|---|---|
| MNT-01 | Modular architecture with clear service boundaries and documented APIs. |
| MNT-02 | Automated test coverage ≥ 80% for business-critical modules; CI gate on tests, lint, and security scans. |
| MNT-03 | Infrastructure as Code (Terraform/Pulumi) and GitOps deployments. |
| MNT-04 | Centralized structured logging, metrics (Prometheus), tracing (OpenTelemetry), and dashboards/alerts (Grafana). |
| MNT-05 | Feature flags for safe rollouts and A/B testing. |
| MNT-06 | Documentation: architecture decision records (ADRs), runbooks, and API docs kept current. |

### 5.8 Portability and Compatibility (PORT)

| ID | Requirement |
|---|---|
| PORT-01 | Containerized (Docker) services deployable on any CNCF-compliant Kubernetes. |
| PORT-02 | Avoid hard vendor lock-in for core logic by using abstraction layers over cloud-specific services. |
| PORT-03 | Browser support: last 2 versions of Chrome, Edge, Firefox, Safari; graceful fallback otherwise. |

### 5.9 Cost Efficiency (COST)

| ID | Requirement |
|---|---|
| COST-01 | Use CDN caching, storage tiering, and per-resolution encoding policies to keep video delivery cost per learner-hour within budget thresholds defined by Finance. |
| COST-02 | Provide cost dashboards per service and alerts for anomalies. |

---

## 6. System Architecture (Proposed)

### 6.1 Architectural Style

A **modular monolith evolving to services** is recommended for MVP speed, with clear domain boundaries so that high-load domains (video, search, notifications, payments) can be extracted as independent services.

### 6.2 Logical Components

```
                     ┌───────────────────────────────────────────┐
                     │              Clients                       │
                     │  Web (SPA/SSR) | iOS | Android | Admin UI  │
                     └───────────────┬───────────────────────────┘
                                     │ HTTPS
                          ┌──────────▼──────────┐
                          │ CDN + WAF + API GW  │
                          └──────────┬──────────┘
        ┌────────────┬───────────────┼───────────────┬──────────────┐
        ▼            ▼               ▼               ▼              ▼
 ┌────────────┐┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐
 │ Identity & ││  Catalog & ││  Learning  │ │  Commerce  │ │ Community  │
 │   Access   ││   Search   ││ (progress, │ │ (cart,pay, │ │ (reviews,  │
 │            ││            ││ assess,cert)│ │ refunds)   │ │  Q&A, msg) │
 └─────┬──────┘└─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘
       │             │              │              │              │
 ┌─────▼─────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐
 │ Instructor│ │ Media      │ │ Notification│ │ Payouts &  │ │ Analytics  │
 │  Studio   │ │ Pipeline   │ │  Service    │ │ Ledger     │ │ & Reporting│
 └───────────┘ └────────────┘ └────────────┘ └────────────┘ └────────────┘
       │             │              │              │              │
       └─────────────┴──── Event Bus (Kafka/SQS) ──┴──────────────┘
                                     │
   ┌──────────────┬──────────────────┼──────────────────┬──────────────┐
   ▼              ▼                  ▼                  ▼              ▼
 PostgreSQL     Redis           OpenSearch        Object Storage    Data Warehouse
 (OLTP)        (cache/session)  (search)          (S3: video/files) (analytics)
```

### 6.3 Recommended Technology Stack (Indicative)

| Layer | Options |
|---|---|
| Frontend | React/Next.js (SSR for SEO) + TypeScript; Tailwind or a design system |
| Mobile | React Native or Flutter |
| Backend | Node.js (NestJS) / Java (Spring Boot) / Python (Django/FastAPI) / Laravel |
| API | REST (OpenAPI) with optional GraphQL for storefront |
| DB | PostgreSQL (primary), Redis (cache/queues), OpenSearch (search) |
| Media | S3 + MediaConvert/Mux/Cloudflare Stream, HLS, CDN with signed URLs |
| Messaging | Kafka / RabbitMQ / SQS |
| Infra | Docker, Kubernetes, Terraform, GitHub Actions/GitLab CI |
| Observability | OpenTelemetry, Prometheus, Grafana, ELK/Loki, Sentry |

### 6.4 Key Design Decisions

1. **Video pipeline is asynchronous:** upload → virus scan → transcode → package HLS → publish event → update lecture state.
2. **Enrollment is event-driven:** `payment.succeeded` → Enrollment service (idempotent) → notifications, ledger entries, analytics.
3. **Ledger-first finance:** every monetary change posts balanced entries; payouts derive from the ledger, never from mutable totals.
4. **Search is eventually consistent:** DB is the source of truth; indexing occurs via change events.
5. **Authorization:** centralized policy checks (RBAC + ownership/enrollment checks) at API and media-URL issuance.

---

## 7. Data Requirements

### 7.1 Core Entities

| Entity | Key attributes |
|---|---|
| User | id, email, password_hash, status, roles[], locale, timezone, created_at, verified_at |
| Profile | user_id, display_name, headline, bio, avatar_url, social_links |
| InstructorProfile | user_id, payout_methods[], kyc_status, tax_info_ref, revenue_share_tier |
| Category | id, parent_id, name, slug, order |
| Course | id, owner_id, title, subtitle, slug, description, level, language, price_tier, currency, status, rating_avg, rating_count, published_at, updated_at |
| CourseInstructor | course_id, user_id, role, revenue_share_pct |
| Section | id, course_id, title, position |
| Lecture | id, section_id, type, title, position, duration, is_preview, content_ref, status |
| MediaAsset | id, owner_id, storage_key, status, renditions[], captions[], size, duration |
| Resource | id, lecture_id, filename, storage_key, size |
| Quiz / Question / Option | quiz_id, type, text, options, correct_answers, explanation, points |
| Assignment / Submission | assignment_id, learner_id, content, grade, feedback, graded_by |
| Enrollment | id, user_id, course_id, source, order_id, status, enrolled_at, expires_at |
| Progress | enrollment_id, lecture_id, position_sec, completed_at, percent |
| QuizAttempt | id, quiz_id, user_id, score, answers, started_at, submitted_at |
| Certificate | id, enrollment_id, code, issued_at, status |
| Review | id, course_id, user_id, rating, text, status, reply |
| Question / Answer | id, course_id, lecture_id, author_id, body, votes, is_best |
| Cart / CartItem | user_id, course_id, price_snapshot, coupon_id |
| Order / OrderItem | id, user_id, totals, tax, currency, status, gateway_ref |
| Payment / Refund | id, order_id, amount, status, gateway_txn_id |
| Coupon | id, code, type, value, constraints, usage_count, expiry |
| LedgerEntry | id, account, debit/credit, amount, currency, ref_type, ref_id, created_at |
| Payout | id, instructor_id, period, amount, status, method, reference |
| Notification | id, user_id, channel, type, payload, status, sent_at |
| Report (Moderation) | id, target_type, target_id, reporter_id, reason, status, resolution |
| AuditLog | id, actor_id, action, target, ip, user_agent, timestamp, diff |

### 7.2 Data Retention

| Data | Retention |
|---|---|
| Financial/ledger/invoices | ≥ 7 years (jurisdiction-dependent) |
| Audit logs | ≥ 2 years (immutable storage) |
| Learning records | Life of account + 90 days after deletion request grace period |
| Deleted-user PII | Erased/anonymized within 30 days of confirmed deletion (subject to legal holds) |
| Raw video masters | Retained while course exists; deleted after course purge |
| Analytics events | 25 months raw; aggregated indefinitely |

### 7.3 Data Integrity Rules

- Monetary amounts stored as integers in minor units with ISO 4217 currency code.
- Soft-delete for user-generated content with recoverability window; hard-delete for PII per privacy requests.
- Foreign-key constraints and unique constraints (e.g., one enrollment per user per course).
- All timestamps stored in UTC (ISO 8601).

---

## 8. Business Rules

| ID | Rule |
|---|---|
| BR-01 | A learner can enroll in a given course only once; repurchase is blocked. |
| BR-02 | Free courses require login to enroll and may be limited to a maximum number per instructor/policy. |
| BR-03 | A course must have at least 30 minutes of video and 5 lectures to be published (configurable). |
| BR-04 | Prices must be selected from admin-defined tiers; free-to-paid conversion is allowed, subject to review. |
| BR-05 | Default refund window is 30 days from purchase and ≤ 30% of content consumed; fraud/abuse overrides apply. |
| BR-06 | Instructor earnings are held 30 days; refunded sales are excluded. |
| BR-07 | Instructors cannot self-review or self-purchase to inflate ratings; detection results in penalties. |
| BR-08 | Three valid copyright strikes result in instructor suspension and course takedown. |
| BR-09 | A course with enrollments cannot be hard-deleted; it can be unpublished or archived. |
| BR-10 | Coupons cannot reduce the price below the platform's minimum floor price (configurable) and cannot stack unless allowed. |
| BR-11 | Reviews require ≥ 10% progress; one review per learner per course. |
| BR-12 | Certificates are issued only for courses that opt into certificates and only after criteria are met. |
| BR-13 | Concurrent streaming limit per account is enforced to curb sharing. |
| BR-14 | Content must not include prohibited material (hate, sexual content, illegal activity, misinformation, malware); violations lead to removal. |

---

## 9. Legal, Compliance and Policy Requirements

| ID | Requirement |
|---|---|
| LEG-01 | Provide Terms of Use, Privacy Policy, Cookie Policy, Instructor Agreement, and Refund Policy; capture versioned acceptance with timestamp. |
| LEG-02 | Comply with GDPR, UK GDPR, CCPA/CPRA, and applicable local laws (e.g., Bangladesh Digital Security/Data Protection regulations as in force). |
| LEG-03 | Implement DMCA/notice-and-takedown with designated agent and counter-notice. |
| LEG-04 | Comply with tax regulations (VAT/GST collection and remittance, marketplace facilitator rules) and invoice requirements. |
| LEG-05 | Perform KYC/AML checks for payouts above thresholds as required by payment partners. |
| LEG-06 | Respect accessibility laws (ADA, EN 301 549) through WCAG 2.2 AA conformance and publish an accessibility statement. |
| LEG-07 | Maintain sanctions-screening on payouts and registrations where required. |
| LEG-08 | Provide transparent disclosures for affiliate/sponsored content. |
| LEG-09 | Retain evidence of consent and DPAs with sub-processors. |

---

## 10. Release Plan and Prioritization

### Phase 1 — MVP (Months 0–5)

- Auth (email + social), profiles, RBAC
- Catalog, search (basic), categories, course landing pages
- Instructor studio: course builder, video upload/transcode, publishing + review workflow
- Cart, checkout (one card gateway + PayPal), coupons, receipts, basic refunds
- Learning player, progress tracking, resources, basic quizzes
- Reviews & Q&A, notifications (email/in-app)
- Instructor earnings dashboard, manual/monthly payouts
- Admin console: users, courses, moderation, reports, basic analytics
- Security baseline, observability, CI/CD

### Phase 2 — Growth (Months 6–10)

- Mobile apps with offline downloads
- Certificates & verification, advanced assessments and assignments, gradebook
- Regional payments, multi-currency, tax automation
- Recommendations, learning paths, wishlist, advanced search/filters
- Subscription plans, gifting, affiliate program
- Advanced instructor analytics, announcements, messaging
- Business/Org accounts (seats, groups, reports), SSO

### Phase 3 — Scale and Differentiation (Months 11+)

- Live sessions, coding sandboxes, peer review
- DRM and forensic watermarking, anti-piracy tooling
- Open Badges/verifiable credentials, SCORM/xAPI/LTI
- AI features: auto-captions, course summaries, semantic search, personalized paths, AI tutor assistant
- Public partner API and marketplace integrations
- Multi-region active/active, additional languages/RTL

---

## 11. Acceptance Criteria and Testing Strategy

### 11.1 Sample Acceptance Criteria

**PAY-08 — Enrollment after payment**
- *Given* a learner completes checkout and the gateway confirms payment via a verified webhook,
  *When* the webhook is processed,
  *Then* an enrollment exists for each purchased course, a receipt email is sent within 60 s, ledger entries are posted, and the course appears in "My Learning" within 10 s.
- *Given* the same webhook is delivered twice,
  *Then* no duplicate enrollment, charge, or ledger entry is created.

**LRN-04 — Resume playback**
- *Given* a learner stops a video at 12:34 and returns on another device,
  *When* they open the lecture,
  *Then* playback resumes within ±10 s of 12:34.

**INS-06 — Video processing**
- *Given* an instructor uploads a valid 1080p MP4,
  *When* processing finishes,
  *Then* renditions (≥ 4 resolutions) are available, status shows "Ready", and a thumbnail is generated; failures show an actionable error and permit retry.

**SEC-04 — Access control**
- *Given* a learner not enrolled in a course,
  *When* they request a signed URL for a non-preview lecture,
  *Then* the system returns 403 and logs the attempt.

**EAR-04 — Hold period**
- *Given* a sale occurred 10 days ago,
  *Then* its earnings appear as "Pending" and are excluded from the next payout run.

### 11.2 Testing Strategy

| Level | Approach |
|---|---|
| Unit | ≥ 80% coverage on domain logic (pricing, refunds, revenue share, access control) |
| Integration | API + DB + queue tests; contract tests for gateway/webhook integrations using sandboxes |
| End-to-end | Playwright/Cypress for critical journeys: signup, purchase, learn, publish, refund, payout |
| Performance | k6/Gatling load tests: 10k concurrent learners, checkout spike, video start times |
| Security | SAST, DAST, dependency/license scanning, secrets scanning, annual pen test, abuse-case tests |
| Accessibility | Automated (axe) + manual screen-reader testing against WCAG 2.2 AA |
| Usability | Moderated tests with learners and instructors; SUS surveys |
| Resilience | Chaos experiments (AZ failure, queue lag), backup-restore drills |
| UAT | Stakeholder sign-off using acceptance criteria and a pilot with seed instructors |

### 11.3 Definition of Done

A requirement is Done when: code merged with review, automated tests pass, security checks clean, accessibility checked, documentation updated, telemetry added, feature flag configured, and acceptance criteria verified in staging.

---

## 12. Risks and Assumptions

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R1 | Cold-start: not enough quality courses or learners | High | High | Seed program with founding instructors, revenue-share incentives, curated launch categories |
| R2 | Content piracy and credential sharing | High | High | Signed URLs, DRM, concurrent-stream limits, watermarking, takedown process |
| R3 | Video costs (transcoding, storage, egress) exceed forecast | Medium | High | Encoding ladders by popularity, CDN caching, storage tiering, cost monitoring |
| R4 | Payment gateway limits/availability in target regions | Medium | High | Multiple gateways, local wallets, fallback routing |
| R5 | Fraudulent purchases/refund abuse | Medium | Medium | Risk scoring, velocity limits, refund policy guards |
| R6 | Low-quality or infringing content | Medium | High | Review workflow, quality checklist, reporting, strike system |
| R7 | Regulatory changes (privacy, tax, e-commerce) | Medium | Medium | Legal counsel, configurable policies, data-residency options |
| R8 | Scalability bottlenecks during peaks | Medium | High | Load testing, autoscaling, caching, queue-based buffering |
| R9 | Scope creep delaying MVP | High | Medium | Strict MoSCoW, phased roadmap, change-control board |
| R10 | Vendor lock-in with media/cloud providers | Low | Medium | Abstraction layers, exportable assets, multi-cloud-ready design |

---

## 13. Appendices

### Appendix A — Primary User Stories (Samples)

**Learner**
- As a learner, I want to preview a course before buying so I can judge its quality.
- As a learner, I want to resume exactly where I left off on any device.
- As a learner, I want a certificate when I finish so I can show my achievement.
- As a learner, I want a refund within 30 days if the course isn't right for me.

**Instructor**
- As an instructor, I want to upload videos once and have them play well on any connection.
- As an instructor, I want to see where learners drop off so I can improve my lectures.
- As an instructor, I want transparent earnings and reliable monthly payouts.
- As an instructor, I want to create coupons to promote my course to my audience.

**Admin**
- As a moderator, I want a queue of reported content with context so I can act quickly.
- As a finance admin, I want a reconciled ledger so payouts are accurate and auditable.
- As a super admin, I want audit logs of every privileged action for compliance.

### Appendix B — Key User Flows

**B.1 Purchase flow**
`Browse/Search → Course page → Add to cart → Apply coupon → Checkout (address/tax) → Pay (3DS if needed) → Webhook confirmed → Enrollment created → Receipt email → Start learning`

**B.2 Instructor publish flow**
`Become instructor → Create course → Build curriculum → Upload media → Processing complete → Set price & landing page → Pre-publish validation → Submit for review → Approve/Reject (with feedback) → Published`

**B.3 Refund flow**
`Learner requests refund → Eligibility check (window/progress) → Auto-approve or route to support → Gateway refund → Revoke access → Reverse ledger/earnings → Notify learner & instructor`

**B.4 Payout flow**
`Sales accrue → Hold period passes → Month-end cut-off → Compute net (minus refunds/fees/taxes) → Meets threshold? → Create payout batch → Finance approval → Transfer via payout provider → Statement emailed → Ledger reconciled`

### Appendix C — Sample State Machines

**Course status**
`Draft → In Review → (Approved → Published) | (Rejected → Draft)`; `Published → Unpublished → Published`; `Published/Unpublished → Archived`; `Published → Suspended (admin) → Published | Archived`

**Order status**
`Created → Pending Payment → Paid → (Partially Refunded | Refunded)`; `Pending Payment → Failed | Expired | Cancelled`

**Video asset status**
`Uploading → Uploaded → Scanning → Transcoding → Ready | Failed`

**Payout status**
`Scheduled → Pending Approval → Processing → Paid | Failed → Retry/Manual`

### Appendix D — Role–Permission Matrix (Summary)

| Capability | Visitor | Learner | Instructor | TA | Moderator | Support | Finance | Super Admin |
|---|:--:|:--:|:--:|:--:|:--:|:--:|:--:|:--:|
| Browse & preview | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ | ✔ |
| Purchase & learn | — | ✔ | ✔ | ✔ | — | — | — | — |
| Create/edit own course | — | — | ✔ | Limited | — | — | — | ✔ |
| Answer Q&A / grade | — | — | ✔ | ✔ | ✔ | — | — | ✔ |
| Approve/reject courses | — | — | — | — | ✔ | — | — | ✔ |
| Handle refunds/tickets | — | — | — | — | — | ✔ | ✔ | ✔ |
| Manage payouts/ledger | — | — | — | — | — | — | ✔ | ✔ |
| Manage users/roles | — | — | — | — | Limited | Limited | — | ✔ |
| System configuration | — | — | — | — | — | — | — | ✔ |
| View audit logs | — | — | — | — | — | — | ✔ | ✔ |

### Appendix E — Event Catalog (Excerpt)

| Event | Producer | Consumers |
|---|---|---|
| `user.registered` | Identity | Notifications, Analytics, CRM |
| `course.submitted` | Instructor Studio | Moderation, Notifications |
| `course.published` | Catalog | Search indexer, Notifications, Analytics |
| `media.ready` | Media Pipeline | Instructor Studio, Catalog |
| `order.paid` | Commerce | Enrollment, Ledger, Notifications, Analytics |
| `enrollment.created` | Learning | Notifications, Analytics, Instructor Dashboard |
| `lecture.completed` | Learning | Progress aggregator, Certificates, Analytics |
| `certificate.issued` | Certificates | Notifications, Analytics |
| `refund.processed` | Commerce | Enrollment, Ledger, Earnings, Notifications |
| `payout.paid` | Payouts | Notifications, Ledger |

### Appendix F — Traceability Overview

| Business goal | Related requirement groups |
|---|---|
| Acquire learners | CAT, PAY, NTF, LOC, SEO (CAT-10) |
| Attract & retain instructors | INS, EAR, ANL, COM |
| Deliver quality learning | LRN, ASM, CRT, COM |
| Protect revenue & content | PAY, SEC, LRN-12/13, ADM-08 |
| Operate safely at scale | NFR sections 5.1–5.9, Section 6 |
| Stay compliant | PRV, LEG, ADM-09 |

### Appendix G — Open Issues (To Be Resolved)

1. Final commission model and price tiers per region.
2. Target launch geographies and supported payment methods.
3. Build vs. buy for video pipeline, recommendation engine, and ticketing.
4. Initial supported languages and RTL timeline.
5. DRM requirement threshold (all courses vs. premium only).
6. Subscription model timing and revenue-sharing method (usage-based vs. pooled).
7. Data-residency requirements for target markets.

---

*End of document.*