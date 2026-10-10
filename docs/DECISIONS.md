# Architecture Decision Records (ADR) — LearnHub

## ADR 001: Modular Monolith Domain Structure
- **Status:** Accepted
- **Context:** LearnHub is an online course marketplace and LMS with multiple distinct subdomains (Identity, Catalog, Instructor, Media, Commerce, Finance, Learning, Assessment, Certificate, Community, Notification, Moderation, Analytics, Admin). A flat MVC structure risks coupling business rules, particularly around money and learning progression.
- **Decision:** Adopt a Domain-Driven Modular Monolith under `app/Domain/<Module>`. Each domain module encapsulates its own Http layer (Controllers, Requests, Resources), Actions, DTOs, Enums, Models, and Events. Cross-module business effects must be mediated via Domain Events or explicit Domain Services, never raw cross-domain model queries.
- **Consequences:** Clear encapsulation, independent unit testability, and clean migration paths if individual domains need extraction in the future.

---

## ADR 002: Monetary Values & Minor Units
- **Status:** Accepted
- **Context:** Float-based currency math introduces rounding bugs, non-deterministic ledger entries, and accounting discrepancies.
- **Decision:** All monetary values must be stored as integers representing minor units (e.g. cents, pence) accompanied by an ISO-4217 currency string (e.g. `USD`). All operations must use the immutable `Money` Value Object (`app/Infrastructure/Support/ValueObjects/Money.php`).
- **Consequences:** Float mathematics is prohibited across all Commerce and Finance domains. Zero rounding errors in order line items, discounts, taxes, and ledger balances.

---

## ADR 003: Double-Entry Ledger Bookkeeping
- **Status:** Accepted
- **Context:** SRS PAY-17 and EAR-* require strict accounting, auditability, and reconciliation for student payments, platform commissions, instructor earnings, withholdings, and payouts.
- **Decision:** Implement a double-entry financial ledger (`ledger_entries`) recording debits and credits for all economic events (`OrderPaid`, `RefundProcessed`, `PayoutSettled`). Earnings and payout balances are derived projections of the ledger.
- **Consequences:** Financial invariant: sum of debits must always equal sum of credits for every transaction group. Complete forensic auditability.

---

## ADR 004: Idempotency Enforcement for Mutations
- **Status:** Accepted
- **Context:** Network retries, duplicate webhook deliveries, and concurrent client requests can cause double charges, duplicate enrollments, or duplicate refunds.
- **Decision:** 
  1. Enforce `Idempotency-Key` headers on mutating financial endpoints (`POST /checkout`, `POST /refunds`).
  2. Implement an `idempotency_keys` table caching request checksums and responses for 24 hours.
  3. Deduplicate inbound payment webhooks using a unique constraint on `(gateway, gateway_event_id)` in `webhook_events`.
- **Consequences:** Guaranteed replay protection and exactly-once business side effects.

---

## ADR 005: Unified Error Envelope (SRS API-05)
- **Status:** Accepted
- **Context:** Multiple frontend consumers (Next.js web app, iOS, Android) require a predictable, machine-readable error format.
- **Decision:** Standardize all non-2xx responses to the envelope:
  ```json
  {
    "error": {
      "code": "validation_failed",
      "message": "Human readable summary",
      "details": {},
      "correlation_id": "01J..."
    }
  }
  ```
- **Consequences:** Seamless client-side form error mapping, consistent error boundaries, and trace correlation via `correlation_id`.
