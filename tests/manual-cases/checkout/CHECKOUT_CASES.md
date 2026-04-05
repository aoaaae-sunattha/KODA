# Manual Test Cases: Checkout & Plan Selection (KODA BNPL)

## TC-CHKT-001: Unlock Terms via Purchase Amount (BVA)
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test` (verified, $0 balance).
- **Steps:**
  1. Find an item priced exactly **$299.99**.
  2. Click "Buy with KODA".
- **Expected:**
  - Plan Selector shows "4 payments" but it is **disabled** (Grayed out).
  - Label says "Minimum $300 required" (Verify logic against `TERM_THRESHOLDS`).

## TC-CHKT-002: Credit Limit Guard (Negative)
- **Priority:** P0
- **User:** `maxed@koda.test` (99% used)
- **Steps:**
  1. Attempt to buy a high-value item (e.g., $5,000 MacBook).
  2. Click "Buy with KODA".
- **Expected:**
  - Checkout does not open.
  - Risk Alert Modal displays: "Insufficient Credit" or similar warning.

## TC-CHKT-003: Fee Calculation Accuracy (BVA)
- **Priority:** P1
- **Item Price:** $1,000 | **Term:** 24 payments
- **Steps:**
  1. Select the "24 payments" plan.
  2. Review the "Upon checkout" payment amount.
- **Expected:**
  - Principal Monthly: $41 ($1000 / 24 = 41.66 -> base 41).
  - Fee (23.38%): $234.
  - First Payment: **$275** ($41 + $234).
  - Subsequent Payments: **$41**.
  - Final Payment: **$57** ($41 + $16 rounding remainder).
  - *Note: Verify these exact numbers match `feeRates.ts` logic.*

## TC-CHKT-004: Plan Selector "Other Options" (UI/UX)
- **Priority:** P2
- **Steps:**
  1. Open checkout for a $1,000 item.
  2. Observe default terms (4, 18, 24).
  3. Click "+ other options!".
- **Expected:**
  - Terms 6 and 8 expand into view.
  - Layout does not break on mobile (375px).
