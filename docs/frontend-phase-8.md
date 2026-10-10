# Frontend Phase 8 — Admin Console, Moderation, & Governance (ADM-*)

## 1. Overview
Frontend Phase 8 delivers the administrative operations console for platform staff, enabling user governance, course quality review, content moderation, double-entry financial ledger auditing, runtime feature flags, and DMCA copyright enforcement adhering to `ADM-*` and `ANL-*` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 Admin Console Shell & Audited Impersonation
- **Layout:** `src/app/(admin)/admin/layout.tsx`
- **Capabilities:**
  - Role-gated administrative layout with staff navigation.
  - **Audited Impersonation Banner (`ADM-03`):** High-visibility banner when staff impersonate a student or instructor, indicating all actions are HMAC audit-logged, with a direct exit button.

### 2.2 Platform Overview & KPIs (`/admin`)
- **Dashboard:** `src/app/(admin)/admin/page.tsx`
- **Capabilities:**
  - Real-time marketplace GMV ($1,845,000.00), active learners (142,800), and approved instructors (2,450).
  - Triage summary counters: Pending course publishing reviews and open community reports.

### 2.3 User Accounts & Role Governance (`/admin/users`)
- **Route:** `src/app/(admin)/admin/users/page.tsx`
- **Capabilities:**
  - Searchable user table with role filters (instructor, learner) and status indicators (active, suspended, banned).
  - One-click account suspension and reactivation.
  - Audited impersonation trigger (`POST /api/v1/admin/users/{id}/impersonate`).

### 2.4 Course Review Queue (`/admin/course-reviews`)
- **Route:** `src/app/(admin)/admin/course-reviews/page.tsx`
- **Capabilities:**
  - Queue of courses submitted by instructors awaiting marketplace publication.
  - Inspection of lecture count, video durations, and curriculum structure.
  - One-click "Approve & Publish" action.
  - "Reject with Feedback" dialog providing structured feedback to guide instructor revisions.

### 2.5 Community Moderation Triage (`/admin/moderation`)
- **Route:** `src/app/(admin)/admin/moderation/page.tsx`
- **Capabilities:**
  - Triage queue for flagged reviews, comments, and Q&A questions.
  - Actions: "Dismiss Report" or "Remove Content & Warn Author".

### 2.6 Financial Ledger & Payout Dispatcher (`/admin/finance`)
- **Route:** `src/app/(admin)/admin/finance/page.tsx`
- **Capabilities:**
  - Double-entry accounting ledger audit trail (ADR 003) showing debit and credit entries.
  - Payout dispatcher button triggering monthly payouts to instructors exceeding the $50 threshold.
  - Escrow clearing and 30-day refund hold reserve reconciliation.

### 2.7 Platform Settings & Dynamic Flags (`/admin/settings`)
- **Route:** `src/app/(admin)/admin/settings/page.tsx`
- **Capabilities:**
  - Marketplace revenue share defaults (37% organic, 97% coupon).
  - Dynamic runtime feature flags (HLS streaming, instructor MFA, course gifting).
  - Global emergency maintenance mode toggle.

### 2.8 DMCA & 3-Strikes Enforcement (`/admin/dmca`)
- **Route:** `src/app/(admin)/admin/dmca/page.tsx`
- **Capabilities:**
  - Tracking of copyright takedown notices and counter-notices.
  - 3-strike enforcement workflow terminating accounts upon the 3rd verified strike.

---

## 3. Verification & Compliance
- **Strict Typing:** 100% TypeScript compilation verified via `tsc --noEmit`.
- **Security:** Strict staff role barriers, audited impersonation lifecycle, and double-entry financial controls.
