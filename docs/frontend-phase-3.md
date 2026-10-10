# Frontend Phase 3 — Commerce: Cart, Checkout, and Refunds (PAY-*)

## 1. Overview
Frontend Phase 3 implements the end-to-end purchasing, checkout, webhook enrollment reconciliation, order history, and refund lifecycle adhering to `PAY-01` through `PAY-08` requirements from `srs.md` and `frontend.md`.

---

## 2. Implemented Features & Routes

### 2.1 Shopping Cart (`/cart`)
- **Route:** `src/app/(public)/cart/page.tsx`
- **Capabilities:**
  - Dynamic item listing with thumbnail, title, instructor, level badge, and minor-unit price.
  - Individual item removal with immediate price recalculation.
  - Real-time coupon application (`POST /api/v1/cart/coupon`) calculating discounts.
  - Price summary breakdown: Subtotal, Discount, Estimated Tax, and Final Total.
  - 30-Day Money-Back Guarantee badge.
  - Responsive empty cart state with direct link to course discovery.

### 2.2 Checkout & Idempotent Payment (`/checkout`)
- **Route:** `src/app/(public)/checkout/page.tsx`
- **Capabilities:**
  - Billing address and tax jurisdiction inputs (Country, Name, Postal/ZIP code).
  - Stripe Card elements with loading indicators and 3-D Secure authentication handling.
  - **Idempotency Safeguard (`PAY-03`):** Generates UUID `Idempotency-Key` header and disables the submit button during processing to prevent duplicate customer charges.
  - Order summary sidebar detailing items, subtotal, and tax breakdown.

### 2.3 Post-Payment Status Polling (`/checkout/success`)
- **Route:** `src/app/(public)/checkout/success/page.tsx`
- **Capabilities:**
  - Automatically polls order status until the Stripe webhook confirms enrollment provisioning.
  - Graceful timeout handling if webhook processing is delayed.
  - Direct "Start Learning Now" CTA linking to `/my-learning`.

### 2.4 Purchases & Refund Request Modal (`/purchases`)
- **Route:** `src/app/(learner)/purchases/page.tsx`
- **Capabilities:**
  - Tabulated order history displaying reference number, purchase date, courses, total price, payment method, and status badge.
  - Instant receipt/invoice text download.
  - **Refund Request Flow (`PAY-08` & `BR-07`):**
    - Enforces 30-day purchase window and <10% course progress eligibility check.
    - Refund modal with reason selector, feedback notes, and API submission (`POST /api/v1/orders/{orderId}/refund`).

### 2.5 Gift Courses & Voucher Redemption (`/gift` & `/redeem`)
- **Gift Page (`/gift`):** Custom recipient name, email, personal message, and scheduled delivery date.
- **Redeem Page (`/redeem`):** Case-insensitive voucher code verification, immediate course entitlement provisioning, and link to learning player.

---

## 3. Verification & Compliance
- **Strict Typing:** Passed with 0 errors via `tsc --noEmit`.
- **Security:** Minor-unit pricing calculations, no raw card data touched by frontend, idempotent API calls.
