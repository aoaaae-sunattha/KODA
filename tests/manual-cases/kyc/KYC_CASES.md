# KYC Manual Test Cases (TC-KYC)

These cases cover the Identity Verification (KYC) flows required for BNPL checkouts.

## [TC-KYC-001] ID Verification Trigger
**Description:** Verify a user is prompted for KYC when their `verified` status is `false`.
- **Preconditions:** User `new@koda.test` is logged in.
- **Steps:**
  1. Navigate to Store.
  2. Select an item and click "Buy with Koda".
- **Expected:** 
  - ID Verification Modal appears instead of the Plan Selector.
  - User cannot proceed with the purchase without completing KYC.

## [TC-KYC-002] KYC Completion Flow
**Description:** Verify a user can complete ID Verification to unlock checkouts.
- **Preconditions:** ID Verification Modal is open.
- **Steps:**
  1. Click "Verify Identity".
  2. Observe simulated success state.
- **Expected:** 
  - User `verified` state updates to `true` (simulated).
  - Modal transitions to Success or returns to Plan Selector.

## [TC-KYC-003] KYC Blocks Checkout (Enforcement) [Manual only — not automated]
**Description:** Verify unverified accounts cannot complete checkout even if modal is bypassed.
- **Preconditions:** User `new@koda.test` logged in.
- **Steps:**
  1. Trigger checkout API call manually (bypass UI if possible).
- **Expected:** 
  - System returns 403 Forbidden or "Action Required: KYC Pending".
  - No new order is created in the database.
