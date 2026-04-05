# Credit Gauge Manual Test Cases (TC-CRDT)

These cases cover the visual and logical states of the Credit Gauge on the Dashboard, ensuring it accurately reflects user credit utilization and limits.

**Note for Automation:** Use the following mock user mappings:
- TC-CRDT-001: `fresh@koda.test` ($8,000, 0%)
- TC-CRDT-002: (Not currently mapped, use active@koda.test and calculate)
- TC-CRDT-003: `active@koda.test` ($10,000, 22% used, but can be scaled for test)
- TC-CRDT-004: `maxed@koda.test` ($10,000, 99%)

## [TC-CRDT-001] Gauge - Initial/Full Available State
**Description:** Verify the gauge shows 100% available credit for a new or zero-balance user.
- **Preconditions:** User logged in with `totalLimit: 5000` and `usedCredit: 0`.
- **Steps:**
  1. Navigate to Dashboard.
  2. Observe the Credit Gauge.
- **Expected:** 
  - Gauge fill is at 100%.
  - Text displays "$5,000 available".
  - Color is Primary Purple (Success/Default).

## [TC-CRDT-002] Gauge - Partial Utilization (Safe Range)
**Description:** Verify the gauge reflects 50% utilization correctly.
- **Preconditions:** User logged in with `totalLimit: 5000` and `usedCredit: 2500`.
- **Steps:**
  1. Navigate to Dashboard.
  2. Observe the Credit Gauge.
- **Expected:** 
  - Gauge fill is at 50%.
  - Text displays "$2,500 available".
  - Color remains Primary Purple.

## [TC-CRDT-003] Gauge - Warning Threshold (60% Utilization)
**Description:** Verify the gauge color/status changes at exactly 60% utilization.
- **Preconditions:** User logged in with `totalLimit: 5000` and `usedCredit: 3000`.
- **Steps:**
  1. Navigate to Dashboard.
  2. Observe the Credit Gauge color and label.
- **Expected:** 
  - Gauge fill is at 40% (Available).
  - Text displays "$2,000 available".
  - [BVA] Gauge color shifts to Amber (60-89% utilization).

## [TC-CRDT-004] Gauge - Near Limit (90% Utilization)
**Description:** Verify the gauge reflects "Near Limit" state at 90% utilization.
- **Preconditions:** User logged in with `totalLimit: 5000` and `usedCredit: 4500`.
- **Steps:**
  1. Navigate to Dashboard.
  2. Observe the Credit Gauge.
- **Expected:** 
  - Gauge fill is at 10% (Available).
  - Text displays "$500 available".
  - [BVA] Gauge color shifts to RED (#EF4444) at >=90% utilization.

## [TC-CRDT-005] Gauge - Fully Exhausted Limit
**Description:** Verify the gauge shows 0% available when limit is reached.
- **Preconditions:** User logged in with `totalLimit: 5000` and `usedCredit: 5000`.
- **Steps:**
  1. Navigate to Dashboard.
  2. Observe the Credit Gauge.
- **Expected:** 
  - Gauge fill is at 0%.
  - Text displays "$0 available".
  - Gauge displays "Limit Reached" status.

## [TC-CRDT-006] Gauge - Real-time Update after Checkout
**Description:** Verify the gauge updates immediately after a successful checkout.
- **Preconditions:** User logged in with $5,000 available.
- **Steps:**
  1. Note current gauge value.
  2. Complete a checkout for a $400 item.
  3. Return to Dashboard.
- **Expected:** 
  - Gauge immediately reflects $4,600 available.
  - No page refresh required (Zustand state sync).
