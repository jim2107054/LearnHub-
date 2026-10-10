# Frontend Phase 5 — Assessments & Certificates (ASM-*, CRT-*)

## 1. Overview
Frontend Phase 5 delivers interactive quiz testing, project assignment submissions with grading rubrics, certificate generation, and cryptographic public certificate verification adhering to `ASM-*` and `CRT-*` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 Timed Quiz Runner (`/learn/[courseSlug]/quiz/[quizId]`)
- **Route:** `src/app/(learner)/learn/[courseSlug]/quiz/[quizId]/page.tsx`
- **Capabilities:**
  - Introductory assessment guidelines with time limits, passing scores (e.g. 80%), and attempt limits.
  - Synchronized countdown timer with automatic submission on expiration.
  - Question stepper with previous/next navigation and visual option selection.
  - Instant scoring screen displaying total score, pass/fail status, correct answer tally, and remaining attempts with retake capability.

### 2.2 Assignment Submissions (`/learn/[courseSlug]/assignment/[assignmentId]`)
- **Route:** `src/app/(learner)/learn/[courseSlug]/assignment/[assignmentId]/page.tsx`
- **Capabilities:**
  - Project specification and points rubric list.
  - Multi-input submission form: GitHub/GitLab repository URL, architecture notes textarea, and file attachment.
  - Submission status panel showing submission timestamp and grading status.
  - Instructor grading score card with direct feedback comments.

### 2.3 Learner Certificate Preview & Download (`/certificates/[certificateId]`)
- **Route:** `src/app/(learner)/certificates/[certificateId]/page.tsx`
- **Capabilities:**
  - High-resolution printable certificate design with security watermark, student name, course title, and verified code format (`CRT-YYYYMMDD-XXXXXXXX`).
  - Print / PDF export support via standard media print stylesheets.
  - One-click "Share on LinkedIn" social integration.
  - One-click copy verification link button.

### 2.4 Public Certificate Verification (`/verify/[code]`)
- **Route:** `src/app/(public)/verify/[code]/page.tsx`
- **Capabilities:**
  - Publicly accessible verification portal checking credential authenticity via `/api/v1/certificates/verify/{code}`.
  - Dynamic SEO metadata generation (`generateMetadata`).
  - Displays verified status badge, student name, course title, instructor, and issue date.

---

## 3. Verification & Compliance
- **Strict Typing:** 100% strict TypeScript validation verified via `tsc --noEmit`.
- **Accessibility:** Accessible keyboard navigation on quiz options and high-contrast certificate rendering.
