# Finance: Earnings & Payouts Module (`EAR-*`)

## 1. Purpose
The Finance module administers instructor monetization workflows: revenue share calculations (37% platform organic vs 97% instructor referral/coupon), itemized earnings with a 30-day refund hold period (`EAR-02`), instructor earnings dashboard and course breakdowns (`EAR-03`), multichannel payout methods (PayPal, Stripe Connect, Bank Transfer), W-9/W-8BEN tax profile compliance gating (`EAR-05`), scheduled monthly payout batches exceeding the $50 threshold (`EAR-06`), admin payment holds (`EAR-08`), and strict double-entry ledger balancing (`ADR 003`).

---

## 2. Endpoints Table

### Instructor Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/instructor/earnings` | Dashboard summary (gross, net, pending, available, paid, per-course breakdown) | Bearer / Cookie |
| `GET` | `/api/v1/instructor/earnings/history` | Itemized earnings transaction history | Bearer / Cookie |
| `GET` | `/api/v1/instructor/payout-methods` | List configured payout methods | Bearer / Cookie |
| `POST` | `/api/v1/instructor/payout-methods` | Add payout method (PayPal, Stripe, Bank) | Bearer / Cookie |
| `POST` | `/api/v1/instructor/payout-methods/{ulid}/default` | Set default payout method | Bearer / Cookie |
| `DELETE` | `/api/v1/instructor/payout-methods/{ulid}` | Remove payout method | Bearer / Cookie |
| `GET` | `/api/v1/instructor/tax-profile` | View tax form status (W-9 / W-8BEN) | Bearer / Cookie |
| `POST` | `/api/v1/instructor/tax-profile` | Submit tax profile and legal info | Bearer / Cookie |

### Admin Finance Endpoints
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/v1/admin/finance/payout-batches` | List monthly payout batches | Admin |
| `POST` | `/api/v1/admin/finance/payout-batches` | Generate monthly payout batch for review | Admin |
| `POST` | `/api/v1/admin/finance/payout-batches/{batchUlid}/approve` | Approve and execute disbursements with double-entry ledger | Admin |
| `POST` | `/api/v1/admin/finance/earnings/{earningUlid}/hold` | Place admin hold on suspicious or investigated earning | Admin |
| `POST` | `/api/v1/admin/finance/earnings/{earningUlid}/release` | Release administrative hold | Admin |

---

## 3. Revenue Share Rules (`EAR-01`)
- **Instructor Coupon / Referral:** 97% Instructor Net, 3% Platform Fee.
- **Platform Organic Sale:** 37% Instructor Net, 63% Platform Fee.

---

## 4. Double-Entry Accounting on Disbursements (`ADR 003`)
When a monthly payout batch is approved and processed:
1. **Debit:** `instructor_earnings` account (clearing accrued instructor payable liability).
2. **Credit:** `cash_clearing` account (cash outflow representation).
3. Sum of debits strictly equals sum of credits ($\Delta = 0$).
