# Frontend Phase 6 — Community & Notifications (COM-*, NTF-*)

## 1. Overview
Frontend Phase 6 delivers the social and collaboration ecosystem for LearnHub, comprising verified course reviews, Q&A discussion forums, real-time notifications, notification preferences, and peer/instructor direct messaging adhering to `COM-*` and `NTF-*` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 Course Reviews & Rating Engine
- **Component:** `src/components/community/course-reviews.tsx`
- **Capabilities:**
  - **10% Progress Eligibility Gate (`BR-05`):** Restricts review posting until the learner reaches at least 10% course video progress, giving clear feedback.
  - Interactive star picker (1–5 stars) with constructive feedback guidelines.
  - Single instructor official reply display (`rev.instructor_reply`).
  - Report button opening a moderation flag modal (`POST /api/v1/moderation/reports`).

### 2.2 Course Q&A Discussion Forum
- **Component:** `src/components/community/qa-board.tsx`
- **Capabilities:**
  - Searchable question list with instant filter by query.
  - Ask a question form optionally linked to a specific lecture timestamp.
  - Community upvoting on questions and answers.
  - Highlighting verified **"Best Answer"** verified solutions.
  - Threaded replies accordion with real-time optimistic state.

### 2.3 Notification Center (`/notifications`)
- **Route:** `src/app/(learner)/notifications/page.tsx`
- **Capabilities:**
  - Unread notification count badge.
  - Categorized notification feed (Q&A replies, assignment grades, instructor announcements, review responses).
  - One-click "Mark all as read" action.
  - Direct links to relevant learning lessons or submissions.

### 2.4 Notification Preferences (`/notifications/preferences`)
- **Route:** `src/app/(learner)/notifications/preferences/page.tsx`
- **Capabilities:**
  - Granular control over email digests and real-time in-app alerts.
  - Toggles for instructor announcements, Q&A notifications, assignment evaluations, direct messages, and promotional discounts.

### 2.5 Direct Messaging (`/messages`)
- **Route:** `src/app/(learner)/messages/page.tsx`
- **Capabilities:**
  - Split-pane conversation layout: contact list on left with unread indicators, active chat bubble stream on right.
  - Real-time message compose box with 10 msgs/min rate-limiting feedback.
  - User safety actions: Block contact and Report inappropriate message.

---

## 3. Verification & Compliance
- **Strict Typing:** 100% TypeScript compliance verified via `tsc --noEmit`.
- **Safety & Moderation:** Integrated reporting hooks and eligibility safeguards.
