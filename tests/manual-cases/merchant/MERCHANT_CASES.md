# Merchant Portal Manual Test Cases (TC-MRCH)

These cases cover the merchant-facing features of the BNPL solution.

## [TC-MRCH-001] Settle Order and Release Funds
**Description:** Verify a merchant can settle a pending order to release the payout.
- **Preconditions:** At least one order exists in "Pending Settlement" state.
- **Steps:**
  1. Navigate to the Merchant Dashboard.
  2. Select a pending order.
  3. Click "Settle Order".
- **Expected:** 
  - Order status changes to "Settled" or "Paid Out".
  - Settlement amount is added to the merchant's balance.

## [TC-MRCH-002] Payout Percentage and Fees Calculation
**Description:** Verify the correct payout amount is calculated after merchant fees.
- **Preconditions:** Merchant fee is set to 2.5% commission in the merchant profile.
- **Steps:**
  1. Settle a $100 order.
  2. View the payout details.
- **Expected:** 
  - Net payout shows $97.50.
  - Merchant fee of $2.50 is explicitly listed.

## [TC-MRCH-003] Merchant Guard - Restricted Actions
**Description:** Verify unauthorized users cannot access the Merchant Portal.
- **Preconditions:** User logged in as a standard customer (non-merchant role).
- **Steps:**
  1. Attempt to navigate directly to `/merchant` URL.
- **Expected:** 
  - User is redirected back to the Dashboard or shown a 403 Access Denied page.
  - Navigation menu does not show the "Merchant Portal" link for this user.
