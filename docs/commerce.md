# Commerce & Payments Module (`PAY-*`)

## 1. Purpose
The Commerce module handles cart persistence, coupon stacking & discount validation, sales tax calculation via configurable tax adapters, checkout orders, payment intent coordination, idempotent webhook handling, course enrollment activation, and self-service refund requests governed by strict eligibility thresholds.

---

## 2. Endpoints Table

| Method | Endpoint | Description | Auth Required | Idempotent |
|---|---|---|---|---|
| `GET` | `/api/v1/cart` | Get current user's cart summary with tax and discounts | Bearer / Cookie | Safe |
| `POST` | `/api/v1/cart/items` | Add a course to the shopping cart | Bearer / Cookie | Yes |
| `DELETE` | `/api/v1/cart/items/{courseUlid}` | Remove a course from the cart | Bearer / Cookie | Safe |
| `POST` | `/api/v1/cart/coupon` | Apply coupon code to cart items | Bearer / Cookie | Safe |
| `DELETE` | `/api/v1/cart/coupon` | Remove applied coupon from cart | Bearer / Cookie | Safe |
| `POST` | `/api/v1/checkout` | Create order and return Stripe client secret | Bearer / Cookie | **Mandatory** (`Idempotency-Key`) |
| `POST` | `/api/v1/commerce/webhooks/stripe` | Stripe payment gateway webhook receiver | Signature Verified | **Mandatory** (Deduplicated) |
| `GET` | `/api/v1/orders` | Customer order and purchase history | Bearer / Cookie | Safe |
| `GET` | `/api/v1/orders/{orderUlid}` | Detailed order invoice breakdown | Bearer / Cookie | Safe |
| `POST` | `/api/v1/orders/{orderUlid}/refund` | Request refund for purchased course | Bearer / Cookie | **Mandatory** (`Idempotency-Key`) |

---

## 3. Financial Invariants & Double-Entry Ledger (`ADR 003`)
All payments and refunds post balanced debits and credits into `ledger_entries`.

### Payment Succeeded Booking
| Account Type | Entry Type | Amount Formula |
|---|---|---|
| `cash_clearing` | **Debit** | Full order total amount |
| `platform_revenue` | **Credit** | Platform commission (default: 20%) |
| `instructor_earnings` | **Credit** | Net instructor share (default: 80%) |
| `tax_payable` | **Credit** | Collected VAT/GST |

$$\sum \text{Debits} \equiv \sum \text{Credits}$$

### Refund Reversal Booking
| Account Type | Entry Type | Amount Formula |
|---|---|---|
| `cash_clearing` | **Credit** | Refunded amount paid back to customer |
| `platform_revenue` | **Debit** | Reversed platform commission |
| `instructor_earnings` | **Debit** | Clawback of unearned instructor share |

---

## 4. Refund Policy Rules
1. Orders must be paid and non-disputed.
2. Days since payment must be $\le 30$ days (`config('learnhub.refund_window_days')`).
3. Student's course progress must be $\le 10\%$ (`config('learnhub.max_progress_for_refund_percent')`). Requests beyond 10% are rejected with an explicit validation error.
4. Approved refunds immediately set `enrollments.status = 'refunded'`, revoking video and resource access.
