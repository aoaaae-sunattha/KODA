# Manual Test Cases: Flexible Payments & Dashboard (KODA BNPL)

## TC-PYMT-001: Pay Next Installment (Happy Path)
- **Priority:** P0
- **Steps:**
  1. Click "Pay" on an active order card.
  2. Ensure "Pay my next installment" is selected by default.
  3. Click "Confirm Payment".
- **Expected:**
  - `paidCount` increases by 1.
  - Segmented Progress Bar updates one segment to Green.
  - "Upcoming Payment" date shifts to the next month.

## TC-PYMT-002: Pay Specific Amount - Exact (BVA)
- **Priority:** P1
- **Context:** Order has two installments of $100 left.
- **Steps:**
  1. Select "Pay specific amount".
  2. Enter exactly **$100**.
  3. Confirm.
- **Expected:**
  - One installment is marked paid.
  - `paidCount` increases by 1.

## TC-PYMT-003: Pay Specific Amount - Overlap (Edge Case)
- **Priority:** P1
- **Context:** Order has two installments of $100 left.
- **Steps:**
  1. Select "Pay specific amount".
  2. Enter **$150**.
  3. Confirm.
- **Expected:**
  - First installment is marked "Paid".
  - Second installment amount is **reduced to $50**.
  - `paidCount` increases by 1 (only fully paid ones count).

## TC-PYMT-004: Pay Full Balance (Happy Path)
- **Priority:** P0
- **Steps:**
  1. Select "Pay off my balance in full".
  2. Confirm.
- **Expected:**
  - Order status changes to "Completed".
  - Order card moves to "Completed" section (or shows completed state).
  - Credit Gauge (Header) reflects full principal return.

## TC-PYMT-005: Invalid Specific Amount (Negative)
- **Priority:** P1
- **Steps:**
  1. Select "Pay specific amount".
  2. Enter **$0** or a negative number.
  3. Click "Confirm".
- **Expected:**
  - "Confirm Payment" button is disabled OR an error message "Amount must be greater than 0" appears.
  - No payment is processed.

## TC-PYMT-006: Amount Exceeds Remaining Balance (Boundary)
- **Priority:** P1
- **Context:** Order has total remaining balance of $200.
- **Steps:**
  1. Select "Pay specific amount".
  2. Enter **$250**.
  3. Click "Confirm".
- **Expected:**
  - Error message "Amount cannot exceed remaining balance of $200".
  - "Confirm Payment" button is disabled.
  - No payment is processed.
