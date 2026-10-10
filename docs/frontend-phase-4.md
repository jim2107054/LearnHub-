# Frontend Phase 4 — Learning Experience (LRN-*)

## 1. Overview
Frontend Phase 4 delivers the complete learning experience for enrolled students, featuring an accessible custom HLS video player, curriculum sidebar, timestamped notes, auto-advance, and progress tracking adhering to `LRN-01` through `LRN-12` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 My Learning Dashboard (`/my-learning`)
- **Route:** `src/app/(learner)/my-learning/page.tsx`
- **Capabilities:**
  - Enrolled courses grid with thumbnail, title, instructor name, and progress bar percentage.
  - Interactive status filter tabs: *All Courses*, *In Progress*, *Completed*, and *Favorites*.
  - Real-time client-side library search by title.
  - Direct "Continue Learning" button linking straight to the student's last active lecture.
  - Weekly learning goal tracker widget (minutes target vs watched).

### 2.2 Accessible Custom Video Player
- **Component:** `src/components/player/video-player.tsx`
- **Capabilities:**
  - Adaptive streaming powered by `hls.js` with fallback to native video elements.
  - Granular speed control selector (0.5x, 0.75x, 1x, 1.25x, 1.5x, 2x).
  - Time scrubber, volume slider, mute, 10-second rewind button, and fullscreen mode.
  - WCAG 2.2 AA keyboard shortcuts (`Space`/`K` play-pause, `ArrowLeft`/`Right` seek, `M` mute, `F` fullscreen).
  - **Progress Heartbeat (`LRN-09`):** Reports progress every 10 seconds and flushes on pause/end to `POST /api/v1/learning/lectures/{lectureId}/progress`.
  - **Concurrent Stream Limiter (`LRN-12`):** Intercepts 403 / `concurrent_stream_limit` responses and displays an overlay pausing playback with a "Resume here" takeover action.

### 2.3 Course Player & Curriculum Experience (`/learn/[courseSlug]/[lectureId]`)
- **Route:** `src/app/(learner)/learn/[courseSlug]/[lectureId]/page.tsx`
- **Redirect:** `src/app/(learner)/learn/[courseSlug]/page.tsx`
- **Capabilities:**
  - **Header Bar:** Navigation back to My Learning, course title, and live percentage progress bar with Certificate Ready indicator at ≥90% completion (`BR-04`).
  - **Dual Player Engine:** Seamlessly plays HLS video lectures and renders formatted rich-text article lectures.
  - **Auto-Advance Countdown:** On video finish, displays a 5-second cancelable overlay before navigating to the next lecture in the curriculum.
  - **Sidebar Curriculum:** Collapsible sections showing lecture types (video, quiz, article), runtimes, and completion checkmarks.
  - **Tabbed Bottom Drawer:**
    - **Overview:** Lecture description and instructor notes.
    - **Timestamped Notes:** Add notes tagged to current playback seconds; click timestamp to seek; one-click export as Markdown (`.md`).
    - **Q&A Discussion:** Search existing questions and submit new inquiries.
    - **Resources:** Downloadable cheat sheets and code attachments.

---

## 3. Verification & Compliance
- **Strict Typing:** 100% TypeScript compliance verified via `tsc --noEmit`.
- **Performance & Usability:** Lazy loading, smooth transitions, dark-mode aware video controls.
