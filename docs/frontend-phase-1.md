# Frontend Phase 1 — Authentication & Account Management (AUTH-*)

## 1. Overview
Frontend Phase 1 implements complete authentication, session lifecycle, security management, and profile customization workflows adhering to `AUTH-01` through `AUTH-10` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Routes & Features

### 2.1 Authentication (`src/app/(auth)/`)
- **Login (`/login`):**
  - Form validation with credentials submission to `/api/v1/auth/login`.
  - Account lockout detection (`account_locked` code from API) displaying a 15-minute wait notification after 5 failed attempts (`AUTH-04`).
  - Graceful transition to TOTP MFA verification modal when `mfa_required: true` is returned.
  - Safe post-login redirection preserving `?next=` parameter without open-redirect vulnerabilities.
  - Social login buttons for Google and GitHub.

- **Registration (`/register`):**
  - Form with full name, email, password (8+ chars), and confirmation.
  - Terms and privacy agreement checkbox.
  - Granular API validation error mapping to individual inputs.

- **Password Recovery (`/forgot-password` & `/reset-password`):**
  - Forgot password request with throttling support.
  - Reset password page parsing query token (`?token=...&email=...`) with confirmation verification.

- **Email Verification (`/verify-email`):**
  - Verification notice with resend link CTA.

### 2.2 Learner Profile & Security (`src/app/(learner)/profile/`)
- **Profile Tab (`AUTH-07`):**
  - Display and update of Name, Headline, Biography, Preferred Language, and Timezone.
  - Avatar placeholder and headline preview.

- **Security Tab (`AUTH-06`, `AUTH-08`):**
  - **Two-Factor Authentication (TOTP MFA):**
    - Step 1: Initiate setup (`POST /api/v1/auth/mfa/enable`) returning QR code SVG and text secret.
    - Step 2: Confirm with 6-digit authenticator code (`POST /api/v1/auth/mfa/confirm`).
    - Step 3: Secure display of 8 emergency backup recovery codes with copy-to-clipboard action.
    - Disabling MFA with current password verification.
  - **Device Sessions (`AUTH-08`):**
    - List active device sessions showing IP address, user-agent, last activity, and "Current Device" badge.
    - Individual session revocation (`DELETE /api/v1/profile/sessions/{id}`) with instant UI refresh.

- **Privacy & GDPR Data Portability (`srs.md 7.2`):**
  - One-click "Export My Data" triggering `POST /api/v1/profile/export-data` and initiating direct JSON download.
  - Danger zone account deletion modal with confirmation dialog.

---

## 3. Verification & Compliance
- **Type Safety:** 100% strict TypeScript compliance verified via `tsc --noEmit`.
- **API Client:** Uses universal `apiClient` with Sanctum cookie CSRF protection and correlation ID tracking.
