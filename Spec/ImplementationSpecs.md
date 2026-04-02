# Implementation Specs: KODA BNPL Solution (Mockup Focused)

Technical logic and UI requirements prioritized for building a high-fidelity BNPL mockup.

## [PRIORITY 1: Core Calculation]
### 1. Installment & Progress Logic
- **Calculation (Pay in 4):** `Total / 4` across 4 months.
- **Progress Calculation:** `(Paid_Amount / Total_Order_Amount) * 100` (e.g., $250 / $1,000 = 25%).
- **UI Progress Component:** Use a flex-based segmented bar with states: `paid`, `remaining`, `refunded`.
## [PRIORITY 1.5: Merchant Storefront]
### 1.5 Pre-Checkout Validation Logic
Before opening the Checkout Modal (M-01) for a selected item:
- **KYC Check:** If `user.verified === false`, redirect to **ID Verify Modal (M-03)**.
- **Lock Check:** If `user.status === 'Locked'`, show **403 Locked State** alert.
- **Credit Limit Check:** Calculate `Available = Limit - Used`. If `Price > Available`, show **"Insufficient Credit" Error**.
- **Mock Items:** Store at least 3 items with prices: $2,499, $2,199, and $1,199.

## [PRIORITY 2: Dynamic Slicing UI]
### 2. Multi-Term Calculation Logic
- **Terms (N):** 4, 6, 8, 10, 12, 18, 24.
- **Interest Free:** If N=4, `Interest = 0, Fee = 0`.
- **Fee Structure:** Fee is a one-time charge added to the **first installment only**. Monthly payment = `Principal / N`. First payment = `(Principal / N) + fee`.
- **Fee Rates:** `{ 4: 0%, 6: 3.98%, 8: 6.22%, 10: 7.997%, 12: 11.18%, 18: 17.25%, 24: 23.38% }`
- **Duration:** `N - 1` months (first payment at checkout, then N-1 monthly payments).
- **Interactive State:** React-like state management to update `MonthlyPayment` on-the-fly when term toggled.

### 2.1 Plan Selector UI (Design Alignment)
- **Layout:** Vertical stack of radio-style buttons (white rounded rows, full width).
- **Primary Terms:** 4, 10, 18, 24 shown by default.
- **Secondary Terms:** 6, 8, 12 hidden behind a "+ other options!" expandable link. Inserted in numeric order when expanded.
- **Badges:** Purple pill "free" on term 4. Purple pill "most flexible" on term 24.
- **Selected State:** Filled purple radio circle, subtle purple background tint on the row.
- **Disabled State:** Grayed out row with threshold label (e.g., "$5,000+") when purchase price is below `TERM_THRESHOLDS[term]`.

### 2.2 Payment Schedule Timeline UI (Design Alignment)
- **Layout:** Vertical stack of white rounded cards (one per installment). No connecting line.
- **Card Content:**
  - Left: SVG circular progress ring with installment number centered inside. Green stroke = paid, gray stroke = upcoming.
  - Right: Bold date label + "Due" subtitle. First installment labeled "Upon checkout" with purple ring.
- **Amount:** Right-aligned. First card includes "(incl. $X fee)" if fee > 0.
- **Overflow:** Scrollable container with `max-height` for terms 18 and 24.

## [PRIORITY 3: Adjustment Logic]
### 3. Refund Reconciliation
- **Algorithm:**
    1. Subtract refund amount from the *last* installment (Installment N) first.
    2. If N balance reaches 0, subtract from N-1.
- **UI Update:** Show original price struck through, e.g., `~~$1,000~~ $820`.

## [PRIORITY 3.5: Flexible Payment Logic]
### 3.5 Flexible Payment Actions
**Goal:** Allow users to choose between 3 payment types instead of only paying the next installment.

#### Store Actions (`useStore.ts`):
- **`paySpecificAmount(orderId: string, amount: number)`:**
  1. Find next unpaid installment.
  2. Apply `amount` starting from next unpaid, moving forward.
  3. If amount fully covers an installment, mark it as `paid` and apply remainder to next.
  4. If amount partially covers an installment, reduce that installment's remaining amount.
  5. Recalculate `paidCount` and order status.
- **`payFullBalance(orderId: string)`:**
  1. Mark all remaining unpaid installments as `paid`.
  2. Set `order.status = 'completed'`.
  3. Recalculate `paidCount`.

#### Payment Modal (`PaymentModal.tsx`):
- **Trigger:** "Pay" button on OrderCard (replaces direct `payInstallment()` call).
- **Header:** Merchant name + remaining balance.
- **Radio Options:**
  1. "Pay my next installment" — shows next unpaid amount. Default selected.
  2. "Pay specific amount" — reveals number input. Validation: min `$1`, max = remaining balance. Inline error for out-of-range.
  3. "Pay off my balance in full" — shows total remaining balance.
- **Confirm:** "Confirm Payment" button. Disabled until valid selection. Calls the appropriate store action.
- **Cancel:** X button or "Cancel" link closes modal.

#### Validation Rules:
- Specific amount input: integer or 2-decimal float, min 1, max = sum of all unpaid installment amounts.
- Full balance: no input needed, amount is calculated automatically.
- After any payment, if all installments are paid, order status transitions to `completed`.

## [PRIORITY 4: Error & Failure Logic]
### 4. Overdue Account Status
- **Locked State:** If `Current_Date > Due_Date` and `Status != Paid`, set `Account_Status = Locked`.
- **Locked Restrictions:** All `POST /checkout` calls return `403 Forbidden` with a message "Pay overdue installments to unlock".
- **Declined UI Component:** A high-contrast alert card (Red/Yellow) with a call-to-action button "Update Card".

## [PRIORITY 5: Card Data Mocking]
### 5. Payment Tokenization
- **Database Schema:** Store `last_4`, `brand`, `expiry_month`, `expiry_year`.
- **Primary Flag:** Only one card can be `is_primary = true`.

## [PRIORITY 7: QA & Testability]
### 7. QA Scenario Generators
**Goal:** Enable on-demand state transitions for live demos and E2E testing.

#### **ID Verification Simulator (T-10)**
- **Logic:** `Transition(User.verified: false -> true)`.
- **UI Interaction:** Slide-up modal with 2s "Scanning ID..." progress bar.
- **Side Effects:** Updates `User.accountStatus` to `Active` and grants `$8,000` base credit limit.

#### **Manual Overdue Simulator**
- **Logic:** `Trigger(Order.id, 'overdue')`.
- **UI Interaction:** "Simulate Payment Failure" action on an active `OrderCard`.
- **Side Effects:** 
    1. Sets `Order.status = 'overdue'`.
    2. Sets `User.accountStatus = 'Locked'`.
    3. Triggers dashboard alerts and blocks future checkouts (403 Simulation).
