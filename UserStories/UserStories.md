# User Stories: KODA BNPL Solution (Mockup Focused)

These stories are prioritized for building a functional mockup that demonstrates AI-powered product development.

## [PRIORITY 1: Core Dashboard]
### US.1: Visualize Installment Progress
**As a user,** I want to see a segmented progress bar for each order **so that** I know exactly how much I have paid (e.g., 25%, 50%, 75%, 100%).
- **AC1:** Use a green segment for paid and a light blue/gray for remaining.
- **AC2:** Show merchant logo, order date, and total amount prominently.
- **AC3:** Status alert banners render at the top of the dashboard based on account state — locked (red + "Pay Now"), action_required (amber + "Update Card"), unverified (indigo + "Verify").
- **AC4:** Active/overdue orders appear in an "Active" section; completed orders appear in a separate "Completed" section below.
- **AC5:** Progress bar segments are hoverable — a tooltip shows the dollar amount for Paid, Refunded, and Remaining segments.

## [PRIORITY 1.5: Product Browsing]
### US.1.5: Browse & Select Products
**As a customer,** I want to browse high-value items in a merchant store and select "Buy with KODA" **so that** I can start the checkout process for a specific purchase.
- **AC1:** Display at least 3 items > $500 (MacBook, Camera, Phone).
- **AC2:** Pre-checkout guard runs 4 checks in order: (1) KYC → opens IDVerifyModal, (2) locked → RiskAlertModal "Account Locked", (3) action_required → RiskAlertModal "Payment Issue", (4) price > available credit → RiskAlertModal "Insufficient Credit".
- **AC3:** Show an error if the item price exceeds the available credit limit.

## [PRIORITY 2: Checkout Selection]
### US.2: Select Payment Plan
**As a customer,** I want to toggle between 4, 6, 8, 10, 12, 18, and 24 payments **so that** I can see the monthly cost and fees change dynamically.
- **AC1:** 4-payment plan is clearly labeled as "0% / Free" with a purple "free" badge.
- **AC2:** 24-payment plan is clearly labeled as "Most Flexible" with a purple "most flexible" badge.
- **AC3:** Primary terms (4, 10, 18, 24) are shown as vertical radio-style buttons by default.
- **AC4:** A "+ other options!" link expands to reveal additional terms (6, 8, 12).
- **AC5:** Selected term shows a filled purple radio circle with subtle background tint.
- **AC6:** Terms unavailable due to purchase price threshold are grayed out with a minimum price label.

### US.2.1: View Payment Schedule
**As a customer,** I want to see my scheduled payments as distinct cards with due dates **so that** I can understand exactly when each installment is due.
- **AC1:** Each installment is shown as a white rounded card with a circular progress ring containing the installment number.
- **AC2:** The first installment is labeled "Upon checkout" with a purple ring; subsequent installments show the due date with "Due" subtitle.
- **AC3:** Payment amounts are right-aligned on each card, with fee note on the first installment if applicable.
- **AC4:** For high term counts (18, 24), the timeline is scrollable with a max-height container.
- **AC5:** On the Dashboard, each OrderCard has a "View Schedule" / "Hide Schedule" toggle that expands the payment timeline inline.

## [PRIORITY 3: Dynamic Adjustment]
### US.3: Handle Partial Refund
**As a customer,** I want my order card to show "$180 refunded" and adjust the total **so that** I can see the impact of my return on my debt.
- **AC1:** Total amount owed is subtracted from future installments.
- **AC2:** Visual indicator (orange) for the refunded segment of the bar.
- **AC3:** Refund is initiated from a "Refund" button on the OrderCard; the button is only visible when `paidCount > 0` and unpaid balance > 0.
- **AC4:** RefundModal provides a free-form amount input and 25% / 50% / 100% quick-select shortcuts; max refundable = sum of unpaid installments only.
- **AC5:** A 1.2s simulated processing animation plays before a success screen; modal is labeled "Simulation only · No real funds moved".

## [PRIORITY 4: Edge Cases & Trust]
### US.4: Identity Verification (KYC)
**As a new user,** I want to verify my identity via ID Verify during my first checkout **so that** my credit limit can be established securely.
- **AC1:** Mock a popup/redirect screen for ID Verify.
- **AC2:** Store a "Verified" flag in the user profile state.
- **AC3:** An indigo "Identity Verification" banner appears on the Dashboard for unverified users with a "Verify" button that opens IDVerifyModal directly (not only triggered during checkout).

### US.5: Handle Declined Payment
**As a user,** I want to see an "Upcoming Payment: Action Required" alert if my card is expired or declined **so that** I can fix the issue before I am charged a late fee.
- **AC1:** Error message on dashboard banner explicitly states "Payment failed on [Date] - Update Card".
- **AC2:** "Update Card" CTA on the dashboard banner navigates to `/settings/cards`.
- **AC3:** Checkout is blocked at guard step 3 (action_required); RiskAlertModal shows title "Payment Issue" and CTA "Manage Cards" which navigates to `/settings/cards`.

## [PRIORITY 4.5: Flexible Payments]
### US.5.1: Choose Payment Type
**As a user,** I want to choose how I pay — next installment, a specific amount, or full balance — **so that** I can pay off my purchases on my own terms.
- **AC1:** Clicking "Pay" on an order card opens a Payment Modal with 3 radio options: "Pay my next installment", "Pay specific amount", "Pay off my balance in full".
- **AC2:** "Pay my next installment" is selected by default and shows the next unpaid amount.
- **AC3:** "Pay specific amount" reveals a number input field validated between $1 and the remaining balance.
- **AC4:** "Pay off my balance in full" shows the total remaining balance.
- **AC5:** A "Confirm Payment" button executes the selected payment type. It is disabled until a valid option is selected.
- **AC6:** After payment, the order card updates immediately (progress bar, paid count, amounts).
- **AC7:** Payment Modal header shows merchant name and remaining balance.
- **AC8:** X button and "Cancel" link dismiss the modal without executing any payment.

## [PRIORITY 5: Card Management]
### US.6: Manage Saved Cards
**As a user,** I want to add a new Visa/Mastercard and set it as my primary payment method **so that** my next installment is charged to the correct card.
- **AC1:** CRUD interface for card tokens (last 4 digits only).

## [PRIORITY 7: Merchant Portal]
### US.7: Manage Merchant Orders
**As a merchant,** I want to see all KODA customer orders and settle pending payouts **so that** I can track revenue and manage receivables.
- **AC1:** Merchant dashboard lists all associated orders with status badges: Pending (amber), Settled (green), Held (red).
- **AC2:** Each row shows the original purchase amount, 2.5% commission deducted, and net payout amount.
- **AC3:** "Settle" button on a Pending order transitions it to Settled; total settled amount in the header updates immediately.
- **AC4:** Business name is displayed in the merchant portal navigation.
- **AC5:** Merchant view is restricted to `merchant` role accounts; customer accounts are not routed to `/merchant`.

## [PRIORITY 7: QA & Demo Automation]
### US.8: Simulate Edge Case Scenarios
**As a QA Tester or Demo Presenter,** I want to trigger state changes like "Verify ID" or "Mark Overdue" on-demand **so that** I can demonstrate how the system handles different user lifecycles and error states.
- **AC1:** "Verify" button transitions a new user to active status with a realistic mock delay.
- **AC2:** "Simulate Failure" button on an active order instantly locks the account and updates all dashboard banners. The button is only visible on orders with `status === 'active'`.
- **AC3:** Checkout is immediately blocked (403 Simulation) once an account is locked.
- **AC4:** On the Merchant Portal, a "Settle" button on a Pending MerchantOrder transitions its status to `settled` and updates the total settled aggregation in the header immediately.
