# Identity & Access Module (`AUTH-*`)

## 1. Purpose
The Identity & Access module governs user authentication, authorization, session management, multi-factor authentication (TOTP MFA), social logins, profile settings, and privacy compliance (GDPR deletion requests pursuant to `PRV-02`).

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required | Rate Limit |
|---|---|---|---|---|
| `POST` | `/api/v1/auth/register` | Register new user account (defaults to `learner` role) | No | Standard |
| `POST` | `/api/v1/auth/login` | Authenticate user; returns Bearer token or MFA prompt | No | 10/min (5 fails = 15m lockout) |
| `GET` | `/api/v1/me` | Retrieve authenticated user profile | Bearer token / Cookie | Standard |
| `POST` | `/api/v1/auth/logout` | Revoke active access token | Bearer token / Cookie | Standard |
| `POST` | `/api/v1/auth/forgot-password` | Request password reset token | No | 5/min |
| `POST` | `/api/v1/auth/reset-password` | Reset password with token | No | Standard |
| `GET` | `/api/v1/auth/social/{provider}/redirect` | Get OAuth redirect URI (Google, Apple, Facebook) | No | Standard |
| `POST` | `/api/v1/auth/social/{provider}/callback` | Exchange OAuth token and authenticate | No | Standard |
| `POST` | `/api/v1/auth/mfa/enable` | Initiate TOTP MFA (generates secret & recovery codes) | Bearer token / Cookie | Standard |
| `POST` | `/api/v1/auth/mfa/confirm` | Verify 6-digit TOTP code and activate MFA | Bearer token / Cookie | Standard |
| `POST` | `/api/v1/auth/mfa/disable` | Disable TOTP MFA (requires password confirmation) | Bearer token / Cookie | Standard |
| `GET` | `/api/v1/profile` | Get detailed user profile | Bearer token / Cookie | Standard |
| `PATCH` | `/api/v1/profile` | Update profile attributes (name, headline, bio, avatar) | Bearer token / Cookie | Standard |
| `DELETE` | `/api/v1/profile` | Request permanent account erasure (`PRV-02`) | Bearer token / Cookie | Standard |
| `GET` | `/api/v1/profile/sessions` | List active device sessions | Bearer token / Cookie | Standard |
| `DELETE` | `/api/v1/profile/sessions/{id}` | Revoke specific device session | Bearer token / Cookie | Standard |

---

## 3. Events Emitted & Consumed

- `UserRegistered`: Dispatched on registration. Queued listener sends email verification notification.
- `UserLoggedIn`: Dispatched on successful authentication. Records security audit log.
- `UserLockedOut`: Dispatched after 5 consecutive failed login attempts. Triggers security alert email.
- `MfaEnabled`: Dispatched when TOTP MFA is confirmed.
- `MfaDisabled`: Dispatched when MFA is deactivated.
- `AccountDeletionRequested`: Dispatched on account deletion. Triggers asynchronous privacy erasure job (`PRV-02`).

---

## 4. State Machines & Security Rules

### Account Status Lifecycle
`active` $\rightarrow$ `deactivated` | `suspended` | `banned` | `deletion_pending`

### Multi-Factor Authentication (MFA)
- TOTP adheres to standard RFC 6238 (SHA1, 6-digit code, 30-second window, 1-step window tolerance).
- 8 cryptographically secure single-use recovery codes are provisioned and stored in encrypted form.
- MFA is **mandatory** for `super_admin` and `finance` roles; attempts to disable MFA for these roles will be rejected with an error.

### Lockout Rules (`AUTH-07`)
- 5 consecutive failed login attempts trigger an immediate 15-minute temporary lockout (`locked_until`).
- Subsequent requests within the lockout window receive HTTP `423 Locked`.
- Successful authentication resets `failed_login_attempts` to 0.
