# Implementation Specs: Anyway BNPL Solution (Mockup Focused)

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
...
- **Terms (N):** 4, 6, 8, 10, 12, 18, 24.
- **Interest Free:** If N=4, `Interest = 0, Fee = 0`.
- **Fee Structure:** Fee is a one-time charge added to the **first installment only**. Monthly payment = `Principal / N`. First payment = `(Principal / N) + fee`.
- **Fee Rates:** `{ 4: 0%, 6: 3.98%, 8: 6.22%, 10: 7.997%, 12: 11.18%, 18: 17.25%, 24: 23.38% }`
- **Duration:** `N - 1` months (first payment at checkout, then N-1 monthly payments).
- **Interactive State:** React-like state management to update `MonthlyPayment` on-the-fly when term toggled.

## [PRIORITY 3: Adjustment Logic]
### 3. Refund Reconciliation
- **Algorithm:**
    1. Subtract refund amount from the *last* installment (Installment N) first.
    2. If N balance reaches 0, subtract from N-1.
- **UI Update:** Show original price struck through, e.g., `~~$1,000~~ $820`.

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
