# Frontend Build Prompt — Next.js (LearnHub LMS Marketplace Web App)

> Paste this whole prompt into your AI coding assistant together with `srs.md` and the backend's OpenAPI spec (`docs/openapi.json`).
> Build **phase by phase**. Each phase must run, lint, type-check, and pass tests before the next one starts.

---

## 1. Role and Goal

You are a senior frontend engineer and UI/UX-minded architect. Build the **web application** for **LearnHub**, a Udemy-style course marketplace and LMS, following the attached `srs.md` (requirement IDs like `CAT-06`, `LRN-02` are the source of truth). The app consumes the Laravel REST API (`/api/v1`) and serves four audiences in one codebase:

1. **Public visitors/learners** (storefront + learning player)
2. **Instructors** (studio: course builder, analytics, earnings)
3. **Staff** (admin console: moderation, finance, support)
4. **Organizations** (later phase)

Deliver a fast, accessible, SEO-friendly, polished product — not a prototype.

---

## 2. Tech Stack (fixed)

- **Next.js 15+ (App Router)**, **React 19**, **TypeScript (strict)**
- **Styling:** Tailwind CSS v4 + **shadcn/ui** (Radix primitives) + `lucide-react` icons; CSS variables for theming (light/dark)
- **Data fetching/caching:** Server Components + `fetch` with cache tags for public pages; **TanStack Query v5** for authenticated/interactive client data
- **Forms & validation:** React Hook Form + **Zod** (shared schemas, typed API payloads)
- **API client:** typed client generated from OpenAPI (`openapi-typescript` + `openapi-fetch`); one wrapper handling base URL, CSRF cookie (Sanctum SPA), error schema, retries, and `Idempotency-Key`
- **Auth:** Laravel Sanctum **cookie-based SPA auth** (no tokens in localStorage). Next.js middleware for route protection; role-aware layouts
- **State:** URL state first (`nuqs` for filters/search), React context only for session/theme, `zustand` for player/cart UI state if needed
- **Video:** `hls.js` wrapped in a custom accessible player component (or Vidstack); captions (VTT), speed control, quality selection, keyboard shortcuts, PiP, resume position
- **Payments:** Stripe Elements (`@stripe/react-stripe-js`) with hosted fields; never touch raw card data
- **Rich text / authoring:** Tiptap editor for article lectures and course descriptions; `dnd-kit` for drag-and-drop curriculum ordering; `tus`/S3 multipart uploader with progress/resume
- **Charts:** Recharts (instructor/admin analytics)
- **Tables:** TanStack Table
- **i18n:** `next-intl` (English + Bangla at launch; RTL-ready using logical CSS properties)
- **Real-time:** Laravel Reverb via `laravel-echo` + `pusher-js` (notifications, Q&A)
- **Testing:** Vitest + React Testing Library (unit/component), **Playwright** (E2E), `axe-core` (a11y), MSW for API mocking
- **Quality:** ESLint (strict), Prettier, `tsc --noEmit`, Husky + lint-staged, Storybook for shared UI
- **Monitoring:** Sentry, Web Vitals reporting, Vercel/analytics-agnostic event layer
- **Package manager:** pnpm

Do not substitute libraries without asking.

---

## 3. Architecture Rules

1. **Feature-based structure:**
   ```
   src/
     app/                      # routes only (thin)
       (public)/               # storefront: home, search, course, cart, checkout
       (auth)/                 # login, register, reset, verify, mfa
       (learner)/              # my-learning, learn/[course]/[lecture], profile, purchases
       (instructor)/instructor # studio
       (admin)/admin           # staff console
       api/                    # only BFF helpers if truly needed (e.g., revalidate webhook)
     features/<feature>/       # components, hooks, api, schemas, types, utils
     components/ui/            # shadcn primitives
     components/shared/        # layout, navbars, empty states, skeletons
     lib/                      # api client, auth, i18n, utils, constants
     styles/
   ```
2. **Server Components by default;** add `"use client"` only for interactivity. Keep client bundles small; dynamic-import heavy modules (player, editor, charts).
3. **Public pages (home, category, search, course detail, instructor profile, verify-certificate) are SSR/ISR** with tagged revalidation for SEO and speed. Authenticated areas are client-driven with TanStack Query and server-side session checks in layouts/middleware.
4. **Never put business rules in the UI** (pricing, refund eligibility, access control). Render what the API returns; the UI only guards UX, the API enforces security.
5. **Type safety end to end:** API types generated from OpenAPI; Zod schemas mirror request payloads; no `any`.
6. **Error handling:** consistent handling of the API error envelope (`code`, `message`, `details`, `correlation_id`); map `details` to form field errors; global error boundaries (`error.tsx`, `not-found.tsx`), toast for transient errors, show correlation ID on fatal errors.
7. **Loading states:** `loading.tsx` + skeletons for every route; optimistic updates only for safe actions (wishlist, notes, votes).
8. **Accessibility is a requirement (WCAG 2.2 AA):** semantic HTML, focus management, visible focus rings, keyboard-operable player and menus, ARIA labels, color contrast, reduced-motion support, captions.
9. **Performance budgets:** LCP ≤ 2.5s (p75, mid-range mobile 4G), CLS < 0.1, INP < 200ms; use `next/image` with proper sizes, `next/font`, route-level code splitting, prefetch on hover for course cards.
10. **Security:** no secrets in client; strict CSP and security headers in `next.config`; sanitize rich text (DOMPurify) before render; never render unsanitized HTML; validate file types/sizes client-side (but assume server re-validates); protect against open redirects in login `?next=`.
11. **Design system first:** build tokens (color, spacing, radius, typography), then primitives, then composites. Support dark mode and RTL via logical properties (`ms-*`, `ps-*`, `start/end`).
12. **Environment config** via typed `env.ts` (Zod-validated): `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PK`, `NEXT_PUBLIC_REVERB_*`, `REVALIDATE_SECRET`, etc.

---

## 4. Phase 0 — Project Setup

1. Scaffold Next.js (App Router, TS, Tailwind, ESLint, `src/` dir), install and configure everything in section 2.
2. Configure shadcn/ui, theme tokens (brand color placeholders), dark mode, fonts (`next/font`), and base layout.
3. Set up the **API client** with Sanctum CSRF handling (`/sanctum/csrf-cookie`), credentials: `include`, typed errors, and OpenAPI type generation script (`pnpm gen:api`).
4. Auth session helpers: server-side `getSession()` (reads cookie, calls `/api/v1/me`), client `useSession()`, middleware route guards by role.
5. i18n setup (`en`, `bn`), locale routing strategy, message files structure per feature.
6. Global providers (Query, Theme, Intl, Toaster), error boundaries, 404 page.
7. Tooling: Vitest, Playwright, MSW, Storybook, Husky, CI (GitHub Actions: lint, typecheck, unit, build, e2e smoke).
8. Create the layout shells: public header (search, categories mega-menu, cart, auth), footer, learner dashboard shell, instructor studio shell (sidebar), admin shell.

---

## 5. Phase-by-Phase Build Plan

For each phase deliver: routes, components, hooks, schemas, tests, Storybook stories for shared components, and responsive + accessible UI. Show file paths above each file.

### Phase 1 — Auth & Account (AUTH-*)
- Pages: register, login (email + social buttons), forgot/reset password, email verification notice/confirm, MFA challenge, MFA setup (QR + recovery codes).
- Account settings: profile (avatar upload, headline, bio, links, language, timezone), password change, active sessions/devices with revoke, notification preferences, delete account flow with confirmation.
- Handle lockout and throttling messages gracefully; preserve `next` redirect safely.
- Role-aware navigation (learner ↔ instructor switch; "Become an instructor" CTA).

### Phase 2 — Storefront: Catalog, Search, Course Page (CAT-*)
- **Home:** hero, category chips, rails (featured, trending, new, recommended for logged-in users), instructor spotlight, learning paths.
- **Search & listing:** instant autocomplete (debounced), results page with URL-synced filters (category, price, rating, level, language, duration, subtitles, updated), sort, pagination/infinite scroll, active-filter chips, empty states.
- **Category pages** with SEO metadata.
- **Course detail page** (SSR/ISR): title, subtitle, rating, enrollments, instructors, last updated, language, what you'll learn, sticky purchase card (price, coupon, add to cart/buy now/wishlist), curriculum accordion with preview lectures (playable in modal), requirements, description, reviews summary + list, Q&A teaser, related courses.
- SEO: `generateMetadata`, canonical URLs, Open Graph/Twitter cards, JSON-LD `Course` structured data, `sitemap.ts`, `robots.ts`.
- Instructor public profile page.
- Wishlist (optimistic toggle).

### Phase 3 — Cart & Checkout (PAY-*)
- Cart page (guest + authenticated, merges on login), coupon input with validation feedback, price breakdown (subtotal, discount, tax, total) exactly as returned by the API.
- Checkout page: billing country/address for tax, Stripe Payment Element, 3-D Secure handling, loading/processing states, clear failure/retry UX.
- Idempotent submit (disable button, send `Idempotency-Key`).
- Post-payment: success page that **polls enrollment status** until the webhook-created enrollment appears (with timeout + fallback message), then CTA "Start learning".
- Purchase history, invoice download, refund request flow with eligibility info from API.
- Gift purchase and redeem pages.

### Phase 4 — Learning Experience (LRN-*)
- **My Learning:** enrolled courses grid/list, progress bars, "Continue" button, archive/favorite, search within library.
- **Course player page** (`/learn/[courseSlug]/[lectureId]`):
  - Custom accessible HLS player: adaptive streaming, quality menu, speed (0.5–2×), captions with language selection, keyboard shortcuts, PiP, fullscreen, theater mode, resume from last position, progress heartbeat every ≤10s (throttled, flushed on pause/unload).
  - Fetch signed URL from the API just-in-time; refresh before expiry; handle 403/concurrent-stream-limit errors with a friendly modal.
  - Sidebar curriculum with completion checkmarks, durations, section collapse, auto-advance to next lecture with cancelable countdown.
  - Tabs: Overview, Q&A, Notes, Announcements, Reviews, Resources (downloads).
  - Timestamped notes/bookmarks (create at current time, click to seek, export).
  - Article lecture renderer (sanitized rich text) and external-link lecture type.
  - Mobile-friendly layout (stacked player, bottom sheet curriculum).
- Learning reminders/goals UI.

### Phase 5 — Assessments & Certificates (ASM-*, CRT-*)
- Quiz runner: one-question-at-a-time or all-at-once (per quiz setting), timer synced with server deadline, autosave answers, confirmation on submit, results screen with explanations per settings, attempts remaining.
- Assignment submission UI (text/file/link), status, grade + feedback display.
- Certificate page: preview, download PDF/PNG, share to LinkedIn, copy verification link.
- **Public certificate verification page** (`/verify/[code]`) showing valid/revoked status.

### Phase 6 — Community & Notifications (COM-*, NTF-*)
- Reviews: write/edit/delete (eligibility messaging), star distribution chart, filter/sort, instructor replies, report button.
- Q&A: ask, answer, upvote, best-answer, link to lecture timestamp, real-time updates.
- Notification center (bell dropdown + full page), unread counts via Reverb, mark read, preference management.
- Direct messaging UI (inbox, thread, block/report) with rate-limit feedback.

### Phase 7 — Instructor Studio (INS-*, EAR-*, ANL-*)
- Onboarding wizard to become an instructor (profile, agreements).
- **Course creation wizard + editor:** basics, landing page content (objectives, requirements, audience, thumbnail, promo video), pricing (tier select), settings; autosave with "saved" indicator; unsaved-changes guard.
- **Curriculum builder:** drag-and-drop sections/lectures (dnd-kit), inline rename, add lecture by type, mark free preview, resumable video upload with progress and processing status polling (uploading → scanning → transcoding → ready/failed with retry), caption upload, resource attachments, quiz/assignment builders.
- **Publish checklist** panel (from API validation response), submit for review, show reviewer feedback on rejection, status badges.
- Coupons manager, announcements composer, co-instructor invites with revenue split.
- Q&A inbox, reviews management (reply, report), student list.
- **Analytics dashboard:** KPI cards, revenue/enrollment charts, traffic sources, geography, ratings trend, completion rate, lecture drop-off heatmap, date-range filters, CSV export.
- **Earnings:** gross/net/pending/available/paid, per-course breakdown, payout methods + KYC/tax status, payout statements download.

### Phase 8 — Admin Console (ADM-*)
- Protected `/admin` with MFA-required indicator and role-based menu.
- Data tables (server-side pagination, sorting, filters, saved views) for users, courses, orders, refunds, payouts, reports.
- Course review queue with checklist + structured feedback form; report/moderation queue with SLA timers; DMCA/strike management.
- User detail page (profile, enrollments, orders, audit trail), suspend/ban actions, audited impersonation banner.
- Finance: ledger explorer, payout batch review/approve/hold/adjust, refunds management.
- Settings: commission, refund policy, price tiers, currencies, feature flags, banners/featured collections, homepage layout, static pages CMS, localization strings.
- KPI dashboard (GMV, revenue, signups, conversion funnel, refund rate, top courses) and audit log viewer.

### Phase 9 — Business/Org & Extras (ORG-*, later)
- Seat management, learner groups, assigned courses with deadlines, team progress reports, SSO entry points.
- Subscriptions UI (plans, upgrade/downgrade, billing portal link) behind feature flags.
- Affiliate dashboard.

### Phase 10 — Hardening & Launch Readiness
- Lighthouse and Web Vitals pass against budgets; bundle analysis; image/font optimization; route prefetch tuning.
- Full a11y audit (axe automated + manual keyboard/screen-reader checks on checkout, player, quiz).
- Cookie consent banner with granular categories gating analytics/marketing scripts (PRV-01).
- Security headers/CSP verified; dependency audit.
- Sentry source maps, error budgets, uptime/health pings.
- Playwright E2E suite for critical journeys (see section 8).
- Documentation: `README`, `docs/architecture.md`, `docs/design-system.md`, component catalog in Storybook.

---

## 6. UI/UX Requirements

- **Visual direction:** clean, modern, trustworthy marketplace; generous whitespace; strong typographic hierarchy; consistent card patterns; subtle motion (respect `prefers-reduced-motion`).
- **Responsive:** mobile-first; breakpoints ~360 / 768 / 1024 / 1440; touch targets ≥ 44px; the player and checkout must be excellent on mobile.
- **Dark/light mode** with system default; persisted choice.
- **Empty, loading, and error states** designed for every list and page; skeletons match final layout to avoid CLS.
- **Microcopy:** clear, friendly, non-technical error messages with next steps.
- **Navigation:** persistent search, category mega-menu, cart badge, notification bell, user menu with role switch.
- **Forms:** inline validation on blur, accessible error summaries, disabled-while-submitting buttons, preserved input on failure.
- **Trust signals:** ratings, enrollments, last updated, refund guarantee badge, secure-checkout indicators.
- Provide a reusable component library: Button, Input, Select, Combobox, Dialog, Sheet, Tabs, Accordion, Toast, DataTable, Rating, ProgressBar, CourseCard, PriceTag, Avatar, Badge, Skeleton, EmptyState, FileUploader, RichTextEditor, VideoPlayer, Stepper.

---

## 7. API Integration Rules

- Use only endpoints defined in `docs/openapi.json`; if something is missing, **list the gap and a proposed endpoint shape instead of inventing it silently**.
- Single typed client; all calls go through it. Query keys follow a consistent factory pattern (`queryKeys.courses.detail(slug)`).
- Public SSR fetches use cache tags (e.g., `course:{slug}`, `catalog`), with an authenticated `POST /api/revalidate` route (secret-protected) that the backend can call on publish/update.
- Handle 401 (redirect to login with safe `next`), 403 (permission screen), 404, 409/422 (form errors), 429 (retry-after UX), 5xx (retry + friendly error with correlation ID).
- Money is always displayed from API-provided minor units + currency using `Intl.NumberFormat` — never recompute totals/taxes client-side.
- Dates arrive in UTC; display in the user's timezone/locale.

---

## 8. Testing Requirements

- **Unit/component (Vitest + RTL):** forms, price/progress display components, filters ↔ URL sync, player controls logic (mock `hls.js`), error mapping from API envelope to form fields.
- **API mocking with MSW** for deterministic tests and Storybook.
- **E2E (Playwright)** for critical journeys:
  1. Register → verify → login
  2. Search → filter → course page → add to cart → coupon → checkout (Stripe test mode) → enrollment appears
  3. Watch a lecture, leave and resume on reload at the same position
  4. Complete a quiz and receive a certificate; verify it publicly
  5. Instructor: create course → upload video → publish checklist → submit for review
  6. Refund request flow
  7. Admin: approve a course, process a report
- **Accessibility:** `axe` checks in CI on key pages; manual keyboard-only run-throughs.
- **Visual regression** (Playwright screenshots or Chromatic) for core components.
- Coverage targets: ≥ 80% on `features/*` logic utilities and hooks.

---

## 9. Deliverables Per Phase

1. Complete files with paths (no partial snippets), compiling with `tsc --noEmit` and passing ESLint.
2. Tests passing (`pnpm test`, `pnpm e2e` for the phase's journeys).
3. Storybook stories for new shared components.
4. A short "What was built / what's next / API gaps / assumptions" summary at the end of each phase.
5. Updated `README.md` and `.env.example`.

---

## 10. Working Instructions for You (the AI)

1. **Ask at most 5 clarifying questions** only if something truly blocks you (e.g., brand colors, API base URL, locale strategy); otherwise state assumptions and proceed.
2. Start with **Phase 0** and a proposed folder tree; wait for my "go", then proceed phase by phase.
3. Prefer Server Components, minimal client JS, and accessibility-first markup. Do not over-engineer, but never skip loading/error/empty states, a11y, or tests.
4. Keep UI text in message files (`next-intl`), not hardcoded.
5. If `srs.md` conflicts with this prompt or the OpenAPI spec, flag it and propose a resolution before coding.
6. Maintain `docs/DECISIONS.md` (short ADRs) for notable choices (state management, caching strategy, player library, etc.).
7. Keep the frontend and backend contracts in sync: any new data need becomes an explicit "API request" note for the backend prompt rather than a client-side workaround.