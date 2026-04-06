# Manual Test Cases: Risk, Refunds & Account States (KODA BNPL)

This document contains comprehensive manual test cases for Risk Management, Refund Reconciliation, and Risk-based Account States in the KODA BNPL mockup.

## 📋 Table of Contents
1. [Risk-based Account States & Guards](#1-risk-based-account-states--guards)
2. [Refund Reconciliation (Backward Reconciliation)](#2-refund-reconciliation-backward-reconciliation)
3. [Flexible Payments (Next, Specific, Full)](#3-flexible-payments-next-specific-full)
4. [Credit Limit & Available Credit](#4-credit-limit--available-credit)
5. [Merchant Risk & Reconciliation](#5-merchant-risk--reconciliation)

---

## 1. Risk-based Account States & Guards

### TC-RISK-001: Locked Account Checkout Blocking (Critical)
**Priority:** P0 (Critical) | **Type:** Negative/Security
**Objective:** Verify that users with a `Locked` account status are prohibited from starting a new checkout.
**Preconditions:**
- User logged in as `overdue@koda.test` (Account Status: `Locked`).
**Test Steps:**
1. Navigate to the Merchant Storefront.
2. Select any product (e.g., "MacBook Pro").
3. Click "Buy with KODA".
**Expected Results:**
- Checkout Modal DOES NOT open.
- A "403 Locked State" alert or `RiskAlertModal` is displayed.
- Message: "Account Locked. Please pay your overdue balance to unlock."

### TC-RISK-002: Unverified Account KYC Guard (Critical)
**Priority:** P0 (Critical) | **Type:** Negative/Functional
**Objective:** Verify that users with a `kyc_pending` status are redirected to identity verification.
**Preconditions:**
- User logged in as `new@koda.test` (Verified: `false`).
**Test Steps:**
1. Navigate to the Merchant Storefront.
2. Select any product and click "Buy with KODA".
**Expected Results:**
- `IDVerifyModal` opens automatically instead of the Checkout Modal.
- User is prompted to scan their ID.
- Checkout is blocked until verification is complete.

### TC-RISK-003: Action Required (Declined Card) Checkout Guard
**Priority:** P1 (High) | **Type:** Negative/Functional
**Objective:** Verify that users with `action_required` status (e.g., expired card) are blocked from checkout.
**Preconditions:**
- User logged in as `declined@koda.test` (Account Status: `action_required`).
**Test Steps:**
1. Navigate to the Merchant Storefront.
2. Select any product and click "Buy with KODA".
**Expected Results:**
- Checkout Modal DOES NOT open.
- `RiskAlertModal` displays with title: **"Payment Issue"**.
- A CTA button labeled **"Manage Cards"** is visible in the modal.
- Clicking "Manage Cards" navigates to `/settings/cards`.
- (Reference: US.5 AC3)

### TC-RISK-004: Unlock Account via Pay Overdue (Happy Path)
**Priority:** P0 (Critical) | **Type:** Functional/State Transition
**Objective:** Verify that paying the overdue balance successfully restores the account to `Active`.
**Preconditions:**
- User logged in as `overdue@koda.test`.
**Test Steps:**
1. On the Dashboard, click the "Pay Overdue" button in the warning banner.
2. Confirm the payment.
**Expected Results:**
- Account status transitions from `Locked` to `Active`.
- All "Locked" banners and warnings disappear.
- User can now successfully open the Checkout Modal on the Storefront.

### TC-RISK-005: Simulate Payment Failure (Happy Path)
**Priority:** P1 (High) | **Type:** Functional/State Transition
**Objective:** Verify that the "Simulate Failure" button correctly locks the account.
**Preconditions:**
- User logged in as `active@koda.test`.
- User has at least one active order.
**Test Steps:**
1. On the Dashboard, find an active order card.
2. Click the "Simulate Failure" (or "Simulate Payment Failure") button.
**Expected Results:**
- Order status changes to "Overdue" (Red badge).
- Account status banner appears: "Account Locked: Overdue Balance".
- Global `accountStatus` transitions to `Locked`.
- Attempting to checkout on the Storefront is now blocked (TC-RISK-001).

### TC-RISK-006: ID Verification Simulator (Happy Path)
**Priority:** P1 (High) | **Type:** Functional/State Transition
**Objective:** Verify that the KYC simulator correctly transitions a user to "Active".
**Preconditions:**
- User logged in as `new@koda.test` (Verified: `false`).
**Test Steps:**
1. Navigate to the Storefront and click "Buy with KODA" on any product.
2. When the `IDVerifyModal` (M-03) appears, click the "Start Verification" (or "Verify ID") button.
**Expected Results:**
- A "Scanning ID..." progress bar appears for ~2s.
- After completion, a "Verification Successful" message is shown.
- User is automatically transitioned to `verified: true` and `accountStatus: 'active'`.
- The Checkout Modal for the original product opens automatically.

### TC-RISK-007: KYC Credit Limit Grant Verification
**Priority:** P2 (Medium) | **Type:** Functional
**Objective:** Verify that the KYC simulator correctly grants the base credit limit of $8,000.
**Preconditions:**
- User logged in as `new@koda.test` (Initial Credit Limit: $0).
**Test Steps:**
1. Complete the ID Verification Simulator (follow TC-RISK-006 steps).
2. Navigate to the Dashboard.
3. Observe the "Available Credit" or "Total Limit" displayed in the Credit Gauge.
**Expected Results:**
- Total Credit Limit is displayed as **$8,000**.
- Available Credit is **$8,000** (assuming no immediate purchase).

### TC-RISK-008: Action Required Banner & Navigation
**Priority:** P1 (High) | **Type:** Functional
**Objective:** Verify the dashboard banner for declined status and its call-to-action navigation.
**Preconditions:**
- User logged in as `declined@koda.test`.
**Test Steps:**
1. Navigate to the Dashboard.
2. Verify banner text.
3. Click the "Update Card" (or equivalent) button in the banner.
**Expected Results:**
- Banner title: "Action Required"
- Banner body: **"Payment failed on 2026-03-01 - Update Card"** (matches US.5 AC1; date sourced from `declineReason` in `mockUsers.ts`)
- CTA "Update Card" navigates to `/settings/cards` (matches US.5 AC2)

### TC-RISK-009: Dashboard KYC Banner for Unverified User
**Priority:** P1 (High) | **Type:** Visual/Functional
**Objective:** Verify that unverified users see a prominent KYC banner on the dashboard.
**Preconditions:**
- Logged in as `new@koda.test` (verified: false).
**Test Steps:**
1. Navigate to the Dashboard (`/dashboard`).
2. Observe the top of the page.
**Expected Results:**
- An indigo "Identity Verification" banner is visible.
- The banner contains a clear call-to-action (CTA) button labeled "Verify".
- (Reference: US.4 AC3)

---

## 2. Refund Reconciliation (Backward Reconciliation)

### TC-RFND-001: Partial Refund - Backward Allocation (BVA)
**Priority:** P1 (High) | **Type:** Functional/Boundary
**Objective:** Verify that refunds are subtracted from the LAST unpaid installment first.
**Preconditions:**
- Order exists with 4 installments of $250 each.
- Installment #1 is PAID. Installments #2, #3, #4 are UPCOMING ($250 each).
**Test Steps:**
1. Apply a refund of **$300**.
**Expected Results:**
- Installment #4 (Last) is reduced to **$0** (balance cleared).
- Installment #3 is reduced to **$200** ($250 - $50 remaining from refund).
- Installment #2 remains **$250**.
- Order total is reduced by $300.

### TC-RFND-002: Refund Matching Multiple Installments
**Priority:** P2 (Medium) | **Type:** Functional/Edge
**Objective:** Verify refund correctly clears multiple installments in reverse order.
**Preconditions:**
- Order with 6 installments of $100 each. #1 is paid.
**Test Steps:**
1. Apply a refund of **$250**.
**Expected Results:**
- Installment #6 is $0.
- Installment #5 is $0.
- Installment #4 is $50.
- Installments #3, #2, #1 remain unchanged.

### TC-RFND-003: Full Refund (All Unpaid)
**Priority:** P1 (High) | **Type:** Functional/Happy Path
**Objective:** Verify that refunding the entire remaining balance completes the order.
**Preconditions:**
- Order with $1000 total, $250 paid (1st installment). $750 unpaid.
**Test Steps:**
1. Apply a refund of **$750**.
**Expected Results:**
- All unpaid installments (#2, #3, #4) are reduced to $0.
- Order status transitions to `completed`.
- Dashboard progress bar shows orange "Refunded" segment.

### TC-RFND-004: Refund > Unpaid Balance (Negative/Mock Behavior)
**Priority:** P2 (Medium) | **Type:** Negative/Mock behavior
**Objective:** Verify system behavior when refund exceeds the unpaid balance.
**Preconditions:**
- Order total $1000. $750 already paid. $250 unpaid (Installment #4).
**Test Steps:**
1. Apply a refund of **$400**.
**Expected Results:**
- Installment #4 is reduced to $0.
- Order total is reduced to $750 (Original $1000 - $250 cap).
- **MOCK BEHAVIOR:** Refund is capped at the remaining unpaid balance ($250). The excess $150 is ignored by the reconciliation logic.
- UI shows "Refunded: $250".

### TC-RFND-005: Refund UI Price Strikethrough (Visual)
**Priority:** P2 (Medium) | **Type:** UI/Visual
**Objective:** Verify that the order card shows the original price struck through after a refund.
**Preconditions:**
- Order exists with $1000 principal.
**Test Steps:**
1. Apply a refund of $200.
2. View the Order Card on the Dashboard.
**Expected Results:**
- Price display shows: `~~$1,000~~ $800`.
- Visual indicator (orange) appears on the progress bar for the $200 segment.

### TC-RFND-006: Refund Skipping Paid Installments (Logic/Edge)
**Priority:** P1 (High) | **Type:** Functional/Logic (Unit only)
**Objective:** Verify that refunds skip installments that have already been paid.
**Preconditions:**
- Order with 4 installments of $250.
- Installments #1, #2, and #4 (Last) are PAID (e.g., user paid #4 early).
- Installment #3 is UPCOMING ($250).
**Test Steps:**
1. Apply a refund of **$300**.
**Expected Results:**
- Installment #4 is SKIPPED (remains $250, status `paid`).
- Installment #3 is reduced to **$0** (balance cleared).
- Remaining $50 of refund is ignored/capped (as #1 and #2 are paid).
- Order total reduces by $250.

### TC-RFND-007: Refund Button Visibility
**Priority:** P1 (High) | **Type:** UI/Functional
**Objective:** Verify that the "Refund" button is only visible on eligible orders.
**Preconditions:**
- Logged in as `active@koda.test`.
- Have one active order with `paidCount > 0` AND remaining unpaid balance.
- Have one completed order (all paid).
**Test Steps:**
1. Navigate to the "Orders" page.
2. Observe the action buttons for the active order.
3. Observe the action buttons for the completed order.
**Expected Results:**
- "Refund" button is PRESENT on orders with paid installments and unpaid balance.
- "Refund" button is ABSENT on fully completed orders.
- (Reference: US.3 AC3)

### TC-RFND-008: RefundModal Input + Quick-Select
**Priority:** P2 (Medium) | **Type:** UI/Functional
**Objective:** Verify that the Refund Modal supports both free-form input and quick-select options.
**Preconditions:**
- Logged in as `active@koda.test`.
- Open an order details view and click "Refund".
**Test Steps:**
1. Observe the Refund Modal.
2. Enter a value in the free-form refund input field.
3. Click the 25%, 50%, and 100% quick-select buttons.
4. Try to enter a value higher than the total unpaid balance.
**Expected Results:**
- Free-form input field is present and functional.
- 25%, 50%, and 100% buttons correctly calculate and populate the input field.
- The input is capped at the total amount of unpaid installments (max cap).
- (Reference: US.3 AC4)

### TC-RFND-009: RefundModal Processing + Simulation Label
**Priority:** P2 (Medium) | **Type:** Functional/Visual
**Objective:** Verify the refund submission flow, including animation and the "simulation only" disclaimer.
**Preconditions:**
- Refund Modal is open with a valid amount entered.
**Test Steps:**
1. Click the "Submit Refund" button.
2. Observe the UI during and after submission.
**Expected Results:**
- A loading spinner is visible for approximately 1.2 seconds.
- A success screen or confirmation message is displayed after processing.
- A disclaimer label "Simulation only · No real funds moved" is clearly visible on the success screen.
- (Reference: US.3 AC5)

---

## 3. Flexible Payments (Next, Specific, Full)

### TC-PAY-001: Pay Specific Amount - Exact Installment Match
**Priority:** P1 (High) | **Type:** Functional/Happy Path
**Objective:** Verify that paying the exact amount of the next installment marks it as paid.
**Preconditions:**
- Next installment is $250.
**Test Steps:**
1. Select "Pay Specific Amount".
2. Enter **$250**.
3. Confirm payment.
**Expected Results:**
- Next installment status changes to `paid`.
- `paidCount` increases by 1.

### TC-PAY-002: Pay Specific Amount - Partial Installment
**Priority:** P1 (High) | **Type:** Functional/Edge
**Objective:** Verify that paying less than the full installment amount reduces the installment's balance.
**Preconditions:**
- Next installment is $250.
**Test Steps:**
1. Select "Pay Specific Amount".
2. Enter **$100**.
3. Confirm payment.
**Expected Results:**
- Next installment status remains `upcoming`.
- Next installment amount is reduced to **$150**.
- **Validation:** Total order balance is reduced by $100.

### TC-PAY-003: Pay Specific Amount - Multi-Installment Overflow
**Priority:** P2 (Medium) | **Type:** Functional/Edge
**Objective:** Verify that a large payment clears multiple installments.
**Preconditions:**
- Next 3 installments are $250 each.
**Test Steps:**
1. Select "Pay Specific Amount".
2. Enter **$600**.
3. Confirm payment.
**Expected Results:**
- Next 2 installments (#2, #3) are marked `paid`.
- Installment #4 is reduced by $100 (Remaining: $150).
- `paidCount` increases by 2.

### TC-PAY-004: Pay Full Balance
**Priority:** P1 (High) | **Type:** Functional/Happy Path
**Objective:** Verify that paying the full balance completes the order.
**Test Steps:**
1. Select "Pay off my balance in full".
2. Confirm payment.
**Expected Results:**
- All installments marked `paid`.
- Order status becomes `completed`.
- Credit limit available amount increases by the full remaining balance.

### TC-PAY-005: Flexible Payment Input Validation (Negative)
**Priority:** P2 (Medium) | **Type:** Negative/Boundary
**Objective:** Verify that the "Pay Specific Amount" field rejects invalid inputs.
**Preconditions:**
- Order remaining balance is $500.
**Test Steps:**
1. Select "Pay Specific Amount".
2. Enter **$0**.
3. Enter **-50**.
4. Enter **600** (exceeds balance).
**Expected Results:**
- "Confirm Payment" button remains disabled for $0 and negative values.
- Inline error message for $600: "Amount cannot exceed remaining balance".

### TC-PAY-006: Partial Payment UI Update (Visual)
**Priority:** P2 (Medium) | **Type:** UI/Visual
**Objective:** Verify that the UI correctly displays the remaining balance of a partially paid installment.
**Preconditions:**
- Next installment is $250.
**Test Steps:**
1. Select "Pay Specific Amount" and enter **$100**.
2. Confirm payment and view the "Payment Schedule" / "Timeline".
**Expected Results:**
- The installment card for the current term now displays **$150** as the amount due.
- Progress ring remains gray (upcoming) but may show partial fill (optional depending on design).

### TC-PAY-007: Payment Modal Default Selection
**Priority:** P1 (High) | **Type:** Functional/Happy Path
**Objective:** Verify that the "Pay my next installment" option is selected by default when opening the Payment Modal.
**Preconditions:**
- User has an active order with unpaid installments.
**Test Steps:**
1. On the Dashboard, click the "Pay" button on an active Order Card.
**Expected Results:**
- Payment Modal opens.
- The radio option **"Pay my next installment"** is pre-selected.
- The "Confirm Payment" button is enabled.

### TC-PAY-008: Pay Next Installment (Happy Path)
**Priority:** P1 (High) | **Type:** Functional/Happy Path
**Objective:** Verify that the "Pay my next installment" radio option correctly pays the single next installment.
**Preconditions:**
- User has an active order with next installment amount $250.
**Test Steps:**
1. On the Dashboard, click "Pay" on the order.
2. Select "Pay my next installment" (should be selected by default).
3. Click "Confirm Payment".
**Expected Results:**
- Next installment status changes to `paid`.
- Order balance reduces by exactly $250.
- `paidCount` increases by 1.

### TC-PAY-009: Payment Modal Shows All 3 Options
**Priority:** P1 (High) | **Type:** Functional/Visual
**Objective:** Verify that the payment modal provides three distinct payment options.
**Preconditions:**
- Logged in as `active@koda.test`.
- Open an order details view and click "Pay".
**Test Steps:**
1. Observe the radio options in the Payment Modal.
**Expected Results:**
- All 3 radio labels are present and correctly worded:
  1. "Pay my next installment"
  2. "Pay specific amount"
  3. "Pay off my balance in full"
- (Reference: US.5.1 AC1)

### TC-PAY-010: Payment Modal Header Shows Merchant Name and Balance
**Priority:** P2 (Medium) | **Type:** Visual/UI
**Objective:** Verify the content of the Payment Modal header.
**Preconditions:**
- Logged in as `active@koda.test`.
- Click "Pay" for an active order.
**Test Steps:**
1. Observe the header of the Payment Modal.
**Expected Results:**
- The merchant's name is correctly displayed in the modal header.
- The total remaining balance for the order is displayed correctly.
- (Reference: US.5.1 AC7)

### TC-PAY-011: Payment Modal Cancel Dismisses Without Payment
**Priority:** P2 (Medium) | **Type:** Functional
**Objective:** Verify that the Payment Modal can be cancelled without triggering a payment.
**Preconditions:**
- Logged in as `active@koda.test`.
- Click "Pay" to open the Payment Modal.
**Test Steps:**
1. Click the "X" (close) icon or the "Cancel" button.
2. Verify that the modal closes.
3. Check the order status and paidCount.
**Expected Results:**
- The Payment Modal closes immediately.
- The `paidCount` for the order remains unchanged.
- No payment is processed.
- (Reference: US.5.1 AC8)

---

## 4. Credit Limit & Available Credit

### TC-CRED-001: Insufficient Credit Guard (Critical)
**Priority:** P0 (Critical) | **Type:** Negative/Boundary
**Objective:** Verify that users cannot purchase items exceeding their available credit.
**Preconditions:**
- User `maxed@koda.test` with $5000 limit and $4850 used credit (Available: $150).
**Test Steps:**
1. Attempt to purchase an item priced at **$199**.
**Expected Results:**
- Checkout is blocked.
- Error message: "Insufficient Credit Limit".

### TC-CRED-002: Available Credit Calculation Consistency
**Priority:** P1 (High) | **Type:** Validation/Logic
**Objective:** Verify available credit updates correctly after a partial refund and a partial payment.
**Preconditions:**
- User logged in as `power@koda.test`.
- Note initial "Available Credit" value (e.g., $15,000).
**Test Steps:**
1. Apply a **$200** refund on one order.
2. Apply a **$100** partial payment on a different order.
**Expected Results:**
- Available credit increases by exactly **$300** from the initial noted value.

### TC-CRED-003: Exact Credit Limit Purchase (BVA)
**Priority:** P3 (Low) | **Type:** Boundary
**Objective:** Verify that a purchase matching the EXACT remaining credit is allowed.
**Preconditions:**
- User available credit is exactly **$500**.
**Test Steps:**
1. Attempt to purchase an item priced at **$500**.
**Expected Results:**
- Checkout Modal opens successfully.
- Final confirmation is allowed.
- After purchase, Available Credit is **$0**.

---

## 5. Merchant Risk & Reconciliation

### TC-MRCH-004: Refund Impact on Merchant Payout (Happy Path)
**Priority:** P1 (High) | **Type:** Functional/Logic
**Objective:** Verify that a customer refund correctly adjusts the merchant's pending payout.
**Preconditions:**
- User has an order from "ILLUM" for $1000.
- Merchant `merchant@koda.test` has a `pending` MerchantOrder for $1000.
**Test Steps:**
1. Apply a **$500** refund to the customer's order.
2. Log in as `merchant@koda.test` and view the "Payouts" or "Orders" tab.
**Expected Results:**
- The `MerchantOrder` principal amount is reduced to **$500**.
- The 2.5% commission is recalculated based on the new principal ($12.50).
- The final payout amount is updated correctly ($487.50).

### TC-MRCH-005: Merchant Settle Button (Happy Path)
**Priority:** P1 (High) | **Type:** Functional
**Objective:** Verify that a merchant can settle a "Pending" order and receive funds.
**Preconditions:**
- Merchant logged in as `merchant@koda.test`.
- At least one `pending` MerchantOrder exists.
**Test Steps:**
1. Navigate to the Merchant "Orders" or "Payouts" tab.
2. Locate a "Pending" order.
3. Click the "Settle" button.
**Expected Results:**
- Order status transitions from `pending` to `settled`.
- Order amount is added to the "Total Settled" balance on the merchant dashboard.
- Button is disabled or replaced with "Settled" badge.

### TC-MRCH-006: Merchant Portal Nav Shows Business Name
**Priority:** P3 (Low) | **Type:** UI/Visual
**Objective:** Verify that the merchant portal navigation includes the business name.
**Preconditions:**
- Logged in as `merchant@koda.test` (Business Name: "Copenhagen Concept Store").
**Test Steps:**
1. Navigate to the Merchant Portal.
2. Observe the sidebar or top navigation bar.
**Expected Results:**
- "Copenhagen Concept Store" is visible in the navigation area.
- Link or icon for the merchant portal is correctly labeled.
---

