# User Stories: Anyway BNPL Solution (Mockup Focused)

These stories are prioritized for building a functional mockup that demonstrates AI-powered product development.

## [PRIORITY 1: Core Dashboard]
### US.1: Visualize Installment Progress
**As a user,** I want to see a segmented progress bar for each order **so that** I know exactly how much I have paid (e.g., 25%, 50%, 75%, 100%).
- **AC1:** Use a green segment for paid and a light blue/gray for remaining.
- **AC2:** Show merchant logo, order date, and total amount prominently.

## [PRIORITY 1.5: Product Browsing]
### US.1.5: Browse & Select Products
**As a customer,** I want to browse high-value items in a merchant store and select "Buy with Anyway" **so that** I can start the checkout process for a specific purchase.
- **AC1:** Display at least 3 items > $500 (MacBook, Camera, Phone).
- **AC2:** Validate KYC status and credit limit before opening the checkout modal.
- **AC3:** Show an error if the item price exceeds the available credit limit.

## [PRIORITY 2: Checkout Selection]
### US.2: Select Payment Plan
**As a customer,** I want to toggle between 4, 6, 8, 10, 12, 18, and 24 payments **so that** I can see the monthly cost and fees change dynamically.
- **AC1:** 4-payment plan is clearly labeled as "0% / Free".
- **AC2:** 24-payment plan is clearly labeled as "Most Flexible".

## [PRIORITY 3: Dynamic Adjustment]
### US.3: Handle Partial Refund
**As a customer,** I want my order card to show "$180 refunded" and adjust the total **so that** I can see the impact of my return on my debt.
- **AC1:** Total amount owed is subtracted from future installments.
- **AC2:** Visual indicator (orange) for the refunded segment of the bar.

## [PRIORITY 4: Edge Cases & Trust]
### US.4: Identity Verification (KYC)
**As a new user,** I want to verify my identity via ID Verify during my first checkout **so that** my credit limit can be established securely.
- **AC1:** Mock a popup/redirect screen for ID Verify.
- **AC2:** Store a "Verified" flag in the user profile state.

### US.5: Handle Declined Payment
**As a user,** I want to see an "Upcoming Payment: Action Required" alert if my card is expired or declined **so that** I can fix the issue before I am charged a late fee.
- **AC1:** Error message explicitly states "Payment failed on [Date] - Update Card".

## [PRIORITY 5: Card Management]
### US.6: Manage Saved Cards
**As a user,** I want to add a new Visa/Mastercard and set it as my primary payment method **so that** my next installment is charged to the correct card.
- **AC1:** CRUD interface for card tokens (last 4 digits only).

## [PRIORITY 6: Back-Office]
### US.7: View Settlement (Merchant)
**As a merchant,** I want to see that Anyway has "settled" the $1,000 order to my bank account **so that** I can ship the product.
- **AC1:** Simple table showing Order ID, Amount, Commission, and Payout Status.
