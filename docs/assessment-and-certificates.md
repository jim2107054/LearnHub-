# Assessment & Certificate Module (`ASM-*`, `CRT-*`)

## 1. Purpose
The Assessment & Certificate module manages course evaluation workflows: quizzes, randomized question pools, server-side attempt timers, automatic scoring without answer leakage, assignment submissions, course completion validation, and unique verifiable completion certificates with public verification URLs.

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/v1/assessment/quizzes/{quizUlid}/start` | Start quiz attempt with server-side timer (sanitized questions) | Bearer / Cookie |
| `POST` | `/api/v1/assessment/quizzes/attempts/{attemptUlid}/submit` | Submit answers and receive auto-graded results and pass/fail | Bearer / Cookie |
| `POST` | `/api/v1/assessment/assignments/{assignmentUlid}/submit` | Submit project assignment (repo URL / attachment) | Bearer / Cookie |
| `POST` | `/api/v1/certificates/courses/{courseUlid}/issue` | Issue completion certificate (requires 100% course progress) | Bearer / Cookie |
| `GET` | `/api/v1/certificates/{certificateUlid}` | View issued certificate details | Bearer / Cookie |
| `GET` | `/api/v1/certificates/verify/{code}` | Public unauthenticated certificate verification endpoint | Public |

---

## 3. Quiz Lifecycle & Anti-Cheating Architecture
1. **Server-Side Timers:** When an attempt starts, `started_at` and `expires_at` are persisted in the database. Client clocks cannot bypass expiration; attempts submitted after expiry return HTTP `410 Gone`.
2. **Sanitized Payloads:** The `startQuiz` endpoint strips all `is_correct` flags and instructor explanations before serialization to prevent inspecting client network payloads.
3. **Attempt Restrictions:** Enforces `max_attempts` configured by instructors.
4. **Auto-Grading:** Multiple-choice, single-choice, and boolean questions are evaluated transactionally, persisting student answers in `quiz_attempt_answers` and comparing with configured pass marks (`pass_mark_percent`).

---

## 4. Certificates & Verification (`CRT-*`)
1. **Completion Gate:** `IssueCertificateAction` requires verified enrollment with `progress_percent == 100`.
2. **Unique Verification Codes:** Format `CRT-YYYYMMDD-XXXXXXXX` (e.g., `CRT-20261010-AB12CD34`).
3. **Public Verification:** Anyone can query `/api/v1/certificates/verify/{code}` to confirm student name, course title, instructor, issuance timestamp, and authenticity.
4. **Revocation Support:** If an enrollment is revoked due to refund or fraud, `certificates.status` transitions to `revoked`.
