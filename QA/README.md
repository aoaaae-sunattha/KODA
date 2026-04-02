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
    TC-DASH-01-credit-gauge.md   6 test cases (gauge states, colors, counters)
    TC-DASH-07-alerts.md         7 test cases (locked, action required, KYC, success)
    TC-DASH-14-order-cards.md   10 test cases (progress bar, pay, refund, failure)
    TC-DASH-24-empty-states.md   3 test cases (zero orders, new user)
    TC-DASH-27-animations.md     6 test cases (stagger, counters, transitions)
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
  REPORTS/
    YYYY-MM-DD/             # Everything tested on this day
      vX.X.X-FULL_REGRESSION.md  # The "All-in-one" loop report
      vX.X.X-[feature].md        # Individual feature report
    LATEST_REPORT.md        # A copy of the absolute latest run
```

## Test Reports

Automated test results are stored in `QA/REPORTS/[Date]/` to provide a timeline of testing:

Current reports:
- [v0.0.0-login.md](./REPORTS/2026-04-01/v0.0.0-login.md) (April 1, 2026)
- [v0.0.0-dashboard-credit-gauge.md](./REPORTS/2026-04-01/v0.0.0-dashboard-credit-gauge.md) (April 1, 2026)
- [LATEST_REPORT.md](./REPORTS/LATEST_REPORT.md) (Most Recent)

## Total: 80 manual test cases across 7 features

## How to Use

1. Start the app: `cd app && npm run dev`
2. Open http://localhost:5173
3. Log in with the test account specified in each test case
4. Follow the step-by-step table
5. Mark pass/fail for each expected result

## E2E Automation (Playwright)

Automated E2E tests live in `playwright/` at the repo root, using the Page Object Model (POM) pattern for maintainability.

```
playwright/
  tests/
    login.spec.ts        # 11 automated tests mapped to TC-LOGIN
  pages/
    LoginPage.ts         # Page Object for /login
```

### Run locally

```bash
# Run all E2E tests
npx playwright test

# Run with visible browser
npx playwright test --headed

# View HTML report
npx playwright show-report
```

### CI Pipeline

Every PR to `main` triggers 3 parallel jobs via GitHub Actions:

1. **Lint & Type Check** -- `npm run lint` + `tsc -b`
2. **Unit Tests** -- `npm run test` (Vitest, 6 test suites)
3. **E2E Tests** -- Playwright against dev server (Chromium)

**Test results appear as:**
- Green/red status checks on the PR
- Bot comment with pass/fail summary table
- Downloadable HTML report in Actions artifacts
- Auto-committed markdown report in `QA/REPORTS/`

### Test case mapping

Each Playwright test is named after its manual TC-ID (e.g., `TC-LOGIN-01`) for traceability between manual and automated test plans.
