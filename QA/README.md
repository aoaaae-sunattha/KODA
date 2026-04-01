# QA Test Plan -- KODA BNPL

Manual test cases organized by feature. Each folder contains step-by-step test scenarios for QA engineers.

## Test Accounts

All accounts use any password. Email determines the loaded state.

| Email | Scenario |
|-------|----------|
| `active@koda.test` | Default -- 3 active orders |
| `new@koda.test` | Pre-KYC, no orders, no cards |
| `fresh@koda.test` | Verified, zero orders |
| `overdue@koda.test` | Locked account |
| `declined@koda.test` | Expired card |
| `maxed@koda.test` | 99% credit used |
| `power@koda.test` | Power user, 2 cards, completed orders |
| `merchant@koda.test` | Merchant back-office |

## Test Plan Structure

```
QA/
  01-login/
    TC-LOGIN.md           8 test cases (auth, guards, routing)
  02-dashboard/
    TC-DASH-credit-gauge.md   6 test cases (gauge states, colors, counters)
    TC-DASH-alerts.md         7 test cases (locked, action required, KYC, success)
    TC-DASH-order-cards.md   10 test cases (progress bar, pay, refund, failure)
    TC-DASH-empty-states.md   3 test cases (zero orders, new user)
    TC-DASH-animations.md     6 test cases (stagger, counters, transitions)
  03-store-checkout/
    TC-STORE.md              12 test cases (grid, checkout, plan selector, blocking)
  04-refunds/
    TC-REFUND.md             10 test cases (modal, reconciliation, validation)
  05-risk-kyc/
    TC-RISK.md                8 test cases (guard order, KYC flow, locking)
  06-card-management/
    TC-CARDS.md              10 test cases (CRUD, primary, expired, empty state)
  07-merchant/
    TC-MERCHANT.md           10 test cases (table, commission, settle, cross-role)
```

## Total: 80 manual test cases across 7 features

## How to Use

1. Start the app: `cd app && npm run dev`
2. Open http://localhost:5173
3. Log in with the test account specified in each test case
4. Follow the step-by-step table
5. Mark pass/fail for each expected result
