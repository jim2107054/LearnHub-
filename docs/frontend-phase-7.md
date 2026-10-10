# Frontend Phase 7 — Instructor Studio (INS-*, EAR-*, ANL-*)

## 1. Overview
Frontend Phase 7 delivers the comprehensive Instructor Studio authoring, curriculum building, analytics, earnings management, and promotional coupon suite adhering to `INS-*`, `EAR-*`, and `ANL-*` specifications from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 Studio Shell & Dashboard (`/instructor`)
- **Layout:** `src/app/(instructor)/instructor/layout.tsx`
- **Dashboard:** `src/app/(instructor)/instructor/page.tsx`
- **Capabilities:**
  - Dedicated Studio sidebar with quick links to Courses, Analytics, Earnings, and Coupons.
  - Seamless "Switch to Learner" mode toggle.
  - KPI overview metrics: Total Revenue ($24,890.00), Active Students (8,900), Average Instructor Rating (4.8★), and Published Course counts.
  - Course status cards detailing lectures count, enrollments, and status badges (Draft, Under Review, Published, Changes Requested).

### 2.2 Course Creation Wizard & Editor (`/instructor/courses/...`)
- **Creation Wizard:** `src/app/(instructor)/instructor/courses/create/page.tsx`
- **Course Editor:** `src/app/(instructor)/instructor/courses/[courseId]/edit/page.tsx`
- **Capabilities:**
  - **Curriculum Builder:** Add sections and lectures, select lecture types (video, quiz, article), inline title editing, and toggle free preview access.
  - **Resumable Video Upload Simulation:** Simulates direct multipart upload and transcode polling from uploading to ready 1080p HLS.
  - **Landing Page Authoring:** Course title, subtitle, comprehensive rich description, and 16:9 thumbnail upload.
  - **Pricing Tier Selector:** Standard pricing tiers ranging from $19.99 to $99.99 USD.
  - **Pre-Publish Checklist (BR-03):** Dynamic automated checklist verifying:
    - Minimum 5 lectures present.
    - Minimum 30 minutes of total video length.
    - Promotional thumbnail uploaded.
    - Pricing tier selected.
    - Complete landing page description.
  - Submit for Administrative Review button disabled until 100% of validation rules pass.

### 2.3 Student Retention & Drop-Off Heatmap (`/instructor/analytics`)
- **Route:** `src/app/(instructor)/instructor/analytics/page.tsx`
- **Capabilities:**
  - Metrics: Completion rate (65.2%), average watch time (53.4 mins), daily active learners.
  - **Lecture Drop-Off Heatmap (ANL-03):** Tabular heatmap analyzing retention percentage and drop-off rates across individual lectures to isolate learning drop-off points.
  - Date range filters (7d, 30d, 90d, 1y) and one-click CSV report export.

### 2.4 Earnings, Payouts & Tax Compliance (`/instructor/earnings`)
- **Route:** `src/app/(instructor)/instructor/earnings/page.tsx`
- **Capabilities:**
  - Double-entry ledger reconciliation breakdown: Available for Payout, Lifetime Paid Out, and 30-Day Refund Hold Reserve.
  - Form W-9 / W-8BEN compliance badge and verified withholding status.
  - Connected Stripe Express bank account configuration.
  - Monthly payout statements table with PDF statement downloads.

### 2.5 Instructor Promotional Coupons (`/instructor/coupons`)
- **Route:** `src/app/(instructor)/instructor/coupons/page.tsx`
- **Capabilities:**
  - 97% instructor net revenue share callout.
  - Modal to create custom codes with discount percentages, maximum uses, and expiration dates.
  - Usage tracker table with copy-to-clipboard actions and activate/deactivate toggles.

---

## 3. Verification & Compliance
- **Strict Typing:** 100% TypeScript compilation verified via `tsc --noEmit`.
- **Architectural Rules:** Strictly adheres to pre-publish validation rule `BR-03` and instructor revenue models.
