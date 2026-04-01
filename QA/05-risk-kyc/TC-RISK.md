# TC-RISK: Risk & KYC

## Components: `RiskAlertModal`, `IDVerifyModal`, `useCheckoutGuard`
Tests checkout blocking logic, KYC flow, account locking, and failure simulation.

---

### TC-RISK-01: Pre-checkout guard - validation order
The guard checks in this exact order. Verify each blocks correctly:

| Priority | Condition | Modal Shown | Test Account |
|----------|-----------|-------------|--------------|
| 1st | `!user.verified` | IDVerifyModal | `new@koda.test` |
| 2nd | `accountStatus === 'locked'` | RiskAlertModal | `overdue@koda.test` |
| 3rd | `availableCredit < price` | RiskAlertModal | `maxed@koda.test` |

---

### TC-RISK-02: KYC flow - full verification
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `new@koda.test` | Dashboard shows KYC alert |
| 2 | Click "Verify" | IDVerifyModal opens |
| 3 | Verify intro screen | Shield icon, "$8,000 credit limit" text |
| 4 | Click "Start Verification" | Scanning progress bar starts |
| 5 | Observe scanning animation | Scan line animates vertically, progress bar fills |
| 6 | Wait for completion | Success screen: green check, "Verified!" |
| 7 | Click "Go to Dashboard" | Modal closes, KYC alert disappears |
| 8 | Verify credit updated | Credit gauge now shows $8,000 available |
| 9 | Navigate to store, try to buy | Checkout modal opens (no longer blocked by KYC) |

---

### TC-RISK-03: Locked account - checkout blocked
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/store` | Store loads |
| 2 | Click "Buy with KODA" on any product | **RiskAlertModal** appears |
| 3 | Verify modal content | Account locked message |
| 4 | Dismiss modal | Returns to store, no order created |

---

### TC-RISK-04: Locked account - unlock via Pay Now
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Red "Account Locked" banner visible |
| 2 | Click "Pay Now" | Banner transitions to green "Payments Settled" |
| 3 | Navigate to `/store` | Store loads |
| 4 | Click "Buy with KODA" on affordable product | Checkout modal opens normally (no longer blocked) |

---

### TC-RISK-05: Insufficient credit - checkout blocked
**Account:** `maxed@koda.test` ($50 available)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/store` | Store loads |
| 2 | Click "Buy with KODA" on iPhone ($999) | **RiskAlertModal** appears |
| 3 | Verify error | Insufficient credit message |
| 4 | Dismiss and try cheapest product | If price > $50, still blocked |

---

### TC-RISK-06: Simulate Failure creates overdue state
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find active order on dashboard | "Simulate Failure" button visible |
| 2 | Click "Simulate Failure" | Order status changes to overdue |
| 3 | Observe order card | "Overdue" red badge appears |
| 4 | Observe dashboard | Red "Account Locked" alert appears |
| 5 | Navigate to store, try to buy | Checkout blocked (account now locked) |

---

### TC-RISK-07: Simulate Failure only available on active orders

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Check active order card | "Simulate Failure" text visible |
| 3 | Check completed order (if any) | No "Simulate Failure" button |
| 4 | Simulate failure on an order | Button disappears (status now overdue, not active) |

---

### TC-RISK-08: Action Required state (expired card)
**Account:** `declined@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Dashboard shows amber "Action Required" alert |
| 2 | Click "Update Card" | Navigates to `/settings/cards` |
| 3 | Verify card list | Shows expired card with "Expired" badge |
