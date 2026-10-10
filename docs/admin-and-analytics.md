# Admin, Moderation & Analytics Module (`ADM-*`, `ANL-*`)

## 1. Purpose
The Admin & Analytics module delivers administrative console operations, user management and audited impersonation (`ADM-01`), course review workflows and publishing transitions (`ADM-02`), moderation reports queues (`ADM-03`), platform settings store and dynamic feature flags (`ADM-05`), content protection and 3-strike copyright takedowns (`ADM-08`, `BR-08`), immutable audit logging (`ADM-09`), behavioral event ingestion pipeline with consent privacy controls (`ANL-05`), instructor drop-off heatmap analytics (`ANL-01`), platform KPI dashboards (`ADM-10`), and CSV report exports (`ANL-04`).

---

## 2. Endpoints Table

### User Management (`ADM-01`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/users` | Search and filter users by role, status, name, and email | Admin |
| `POST` | `/api/v1/admin/users/{ulid}/suspend` | Suspend user account and revoke access tokens | Admin |
| `POST` | `/api/v1/admin/users/{ulid}/ban` | Permanently ban user account | Admin |
| `POST` | `/api/v1/admin/users/{ulid}/impersonate` | Issue audited impersonation session token | Admin |
| `DELETE` | `/api/v1/admin/users/{ulid}` | Delete user account (soft delete) | Admin |

### Moderation & Quality Workflows (`ADM-02`, `ADM-03`, `ADM-08`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/moderation/courses` | Course review submission queue | Admin / Moderator |
| `POST` | `/api/v1/admin/moderation/courses/{submissionUlid}` | Approve (publishes course) or reject submission with feedback | Admin / Moderator |
| `GET` | `/api/v1/admin/moderation/reports` | User reports queue with SLA timestamps | Admin / Moderator |
| `POST` | `/api/v1/admin/moderation/reports/{reportUlid}/resolve` | Resolve or dismiss report with moderator notes | Admin / Moderator |
| `GET` | `/api/v1/admin/dmca` | List DMCA takedown claims | Admin / Legal |
| `POST` | `/api/v1/admin/dmca` | Ingest DMCA copyright claim | Admin / Legal |
| `POST` | `/api/v1/admin/dmca/{noticeUlid}/strike` | Issue copyright strike against instructor (unpublishes course, suspends on 3 strikes) | Admin / Legal |

### Platform Settings & Audit (`ADM-05`, `ADM-09`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/settings` | List all cached platform settings and feature flags | Admin |
| `POST` | `/api/v1/admin/settings` | Update or create typed platform setting (e.g. commission model, refund window) | Admin |
| `POST` | `/api/v1/admin/settings/flags/{key}` | Toggle feature flag and configure percentage rollout rules | Admin |
| `GET` | `/api/v1/admin/audit-logs` | Immutable audit log viewer (tracks action, actor, impersonator, ip, correlation id) | Admin |

### Analytics & Reporting (`ANL-*`, `ADM-10`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/analytics/events` | High-throughput event ingestion (consent-aware) | Public / Bearer |
| `GET` | `/api/v1/instructor/analytics` | Instructor dashboard: page views, enrollments, completion %, lecture drop-off | Instructor |
| `GET` | `/api/v1/admin/analytics/kpis` | Platform KPIs: GMV, platform net revenue, enrollments, signups, refund rate | Admin |
| `GET` | `/api/v1/admin/analytics/export/courses` | Download CSV course performance report | Admin |

---

## 3. Business Rules Implemented
- **Audited Impersonation (`ADM-01`, `ADM-09`):** When an administrator impersonates a user, an immutable `AuditLog` record is written with `impersonator_id`, `user_id`, client IP, user agent, and correlation ID.
- **Copyright Strike Policy (`BR-08`):** When a DMCA claim is substantiated and a strike is issued, the course is immediately unpublished. Accumulating 3 strikes automatically transitions the instructor account status to `suspended`.
- **Privacy Consent (`ANL-05`):** If a user opts out of telemetry (`consent_given = false`), IP address, user agent, and user identity are stripped from the analytics payload before storage.
