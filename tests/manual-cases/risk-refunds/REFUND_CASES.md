# Manual Test Cases: Risk & Refunds (KODA BNPL)

## TC-RISK-001: Locked Account Checkout (Negative)
- **Priority:** P0
- **User:** `overdue@koda.test`
- **Steps:**
  1. Log in.
  2. Attempt to click "Buy with KODA" on any product.
- **Expected:**
  - Checkout is blocked immediately.
  - Warning: "Account Locked. Please pay your overdue balance."

## TC-RISK-002: Pay Overdue Balance (Happy Path)
- **Priority:** P1
- **User:** `overdue@koda.test`
- **Steps:**
  1. Navigate to Dashboard.
  2. Locate the "Action Required" banner.
  3. Click "Pay Overdue".
- **Expected:**
  - Account state changes to "Active".
  - Overdue banners disappear.
  - Checkout is now unlocked.

## TC-RFND-001: Backward Reconciliation (BVA)
- **Priority:** P1
- **Context:** Order has 4 installments ($100 each). #1 is paid.
- **Steps:**
  1. Open Refund Modal.
  2. Enter **$150**.
  3. Confirm.
- **Expected:**
  - Installment #4 (Last) is reduced to **$0** (hidden/removed).
  - Installment #3 is reduced to **$50**.
  - Installment #2 remains **$100**.
  - Installment #1 (Paid) remains **$100** (Refunds do not affect already paid cash unless total is exceeded).

## TC-RFND-002: Full Refund (Happy Path)
- **Priority:** P1
- **Steps:**
  1. Refund the full remaining balance.
- **Expected:**
  - Order status changes to "Completed".
  - Dashboard progress bar shows "Refunded" (Orange) segment.
