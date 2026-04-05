# QA How-To Guide — KODA E2E Tests

**For:** QA agents, developers, and CI pipelines running Playwright E2E tests.
**Covers:** Running individual scripts, smoke tests, regression tests, domain-targeted tests, and CI/CD.

---

## Prerequisites

Before running any test, complete these steps once per machine/environment.

### 1. Set Node version

```bash
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22
```

**Why:** The project requires Node 22. System Node may be a different version that causes compatibility errors.

### 2. Install app dependencies

```bash
cd app && npm install && cd ..
```

**Why:** The dev server (`localhost:5173`) must be able to start. Playwright auto-starts it before tests run, but it needs its dependencies installed first.

### 3. Install Playwright and its browser

```bash
npm install
npx playwright install chromium
```

**Why:** The first `npm install` gets the Playwright CLI. The second downloads the Chromium binary Playwright controls. Tests will fail with "browser not found" if you skip this.

### 4. Verify the app starts

```bash
cd app && npm run dev &
# wait 3 seconds, then open http://localhost:5173 in a browser
# Ctrl+C to stop
```

**Why:** Confirms the dev server works before handing control to Playwright. Skip this if you're confident the environment is clean.

---

## Test Structure Overview

```
tests/e2e/
  auth/           Login flows, session, form validation
  credit/         Credit gauge states (healthy, near-limit, zero, full)
  checkout/       Plan selector, payment timeline
  payment/        Payment modal (next, specific, full, cancel)
  smoke/          Critical path — the single most important end-to-end journey
  kyc/            (stubs) KYC/ID verification flows
  risk/           (stubs) Locked account, insufficient credit
  cards/          (stubs) Card management
  merchant/       (stubs) Merchant back-office
  dashboard/      (stubs) View schedule modal
  pages/          Page Object Models (POMs) — not test files
  helpers/        Auth setup, date utilities, report generator
```

**What "stubs" means:** Stub files exist with `.skip` so they appear as "pending" in reports. They have no implementation yet — they mark known gaps.

---

## Tags Reference

Every test has exactly two tags embedded in its title:

| Tag | Tier | What it selects |
|-----|------|-----------------|
| `@smoke` | Execution | Fast gate — run on every push (~30s, 4 tests) |
| `@regression` | Execution | Full suite — run on every PR (~2min, 22+ tests) |
| `@auth` | Domain | Login, session, form validation |
| `@credit` | Domain | Credit gauge, available credit display |
| `@checkout` | Domain | Plan selector, payment timeline |
| `@payment` | Domain | Payment modal actions |
| `@kyc` | Domain | KYC / ID verify flows |
| `@risk` | Domain | Locked account, insufficient credit guards |
| `@cards` | Domain | Card management settings |
| `@merchant` | Domain | Merchant back-office |
| `@dashboard` | Domain | Dashboard-specific features |

**Usage:** `--grep "@tag"` filters by tag. Combine with `--grep-invert` to exclude.

---

## How to Run Tests

### Run a single test file

**When to use:** You changed one component and want to verify only its tests pass fast.

```bash
# From repo root
npx playwright test tests/e2e/auth/login-valid-email.spec.ts
```

```bash
# Run with visible browser (useful for debugging)
npx playwright test tests/e2e/auth/login-valid-email.spec.ts --headed
```

```bash
# Run with step-by-step trace (useful when a test fails and you want to see what happened)
npx playwright test tests/e2e/auth/login-valid-email.spec.ts --trace on
```

**Expected output:** 1 test, pass or fail, duration ~3s.

**After a failure:** Run `npx playwright show-report` to open the HTML report with screenshots and trace.

---

### Run all tests in a domain folder

**When to use:** You changed a feature area (e.g., checkout) and want to verify all tests in that area.

```bash
# All checkout tests
npx playwright test tests/e2e/checkout/

# All auth tests
npx playwright test tests/e2e/auth/

# All payment tests
npx playwright test tests/e2e/payment/
```

**Expected output:** All files in the folder run in parallel. Duration ~10-15s per folder.

---

### Run smoke tests

**When to use:** Quick sanity check. Run this first after any code change to confirm the app is not broken. If smoke fails, stop — nothing else matters.

**What it tests (4 tests):**
- TC-LOGIN-01: Login page renders correctly
- TC-SMOKE-01: Full critical path — Login → Store → BNPL checkout → Dashboard confirmation
- TC-SMOKE-02: Auth guard blocks unauthenticated access to `/dashboard` and `/store`
- TC-SMOKE-03: Merchant guard blocks shoppers from `/merchant`

```bash
npx playwright test --project=smoke
```

Or by tag (same result):

```bash
npx playwright test --grep "@smoke"
```

**Expected output:** 4 tests, ~30s. All must pass before continuing.

---

### Run regression tests

**When to use:** Before creating a PR, or after merging to verify nothing regressed. Covers all implemented features.

**What it tests (~22 tests):**
- All auth flows (8 login scenarios)
- All credit gauge states (4 scenarios)
- All checkout flows (5 scenarios)
- All payment modal actions (4 scenarios)

```bash
npx playwright test --project=regression
```

Or by tag:

```bash
npx playwright test --grep "@regression"
```

**Expected output:** ~22 tests, ~2min. Stubs show as "skipped" — that is normal.

---

### Run a specific domain by tag

**When to use:** You made a targeted change and want to run only the relevant domain without running everything.

```bash
# Only checkout tests (after changing PlanSelector or PaymentTimeline)
npx playwright test --grep "@checkout"

# Only payment tests (after changing PaymentModal)
npx playwright test --grep "@payment"

# Only auth tests (after changing login page)
npx playwright test --grep "@auth"

# Only credit tests (after changing CreditGauge)
npx playwright test --grep "@credit"
```

**Combine tier + domain** (smoke tests in auth only):

```bash
npx playwright test --grep "@smoke" --grep "@auth"
```

**Exclude stubs** (run regression but skip not-yet-implemented tests):

```bash
npx playwright test --grep "@regression" --grep-invert "TODO"
```

---

### Run all tests

**When to use:** Full verification before a release, or after a large refactor.

```bash
npx playwright test
```

**Expected output:** All ~37 entries (26 implemented + 11 stubs as skipped), ~2-3min.

---

### Run with a visible browser (headed mode)

**When to use:** Debugging a test — you want to watch what Playwright is doing on screen.

```bash
npx playwright test --headed

# Slow it down to watch each step
npx playwright test --headed --slow-mo 500
```

---

### View the HTML test report

**When to use:** After any test run, especially after failures. The HTML report shows pass/fail per test, screenshots on failure, and step-by-step traces.

```bash
npx playwright show-report
```

Opens `http://localhost:9323` in your browser. The report from the last run is always available.

---

## CI/CD Pipeline

### What the pipeline does

Every PR to `main` triggers a GitHub Actions workflow with 3 parallel jobs:

```
Open/Update PR → main
      │
      ├── Job 1: lint-typecheck   (~20s)
      │     eslint + tsc -b
      │
      ├── Job 2: unit-tests       (~30s)
      │     Vitest (6 test files)
      │
      └── Job 3: e2e-tests        (~2min)
            Playwright (all tests)
            ├── Uploads HTML report → GitHub Artifacts (7-day retention)
            ├── Posts pass/fail summary as PR comment
            └── Commits markdown report to QA/REPORTS/
```

All 3 jobs run in parallel. A lint failure does not block E2E results from running.

---

### How to trigger CI

**Automatic:** Push any commit to a branch that has an open PR targeting `main`. CI runs automatically.

**Manual (simulate CI locally):**

```bash
# Run with CI environment variables active
CI=1 npx playwright test
```

**What `CI=1` changes:**
- Adds JSON reporter output (needed for report generation)
- Sets `forbidOnly: true` (any `test.only` in code causes a failure — catches accidental test isolation)
- Sets `retries: 2` (flaky tests get 2 retries before marking as failed)
- Sets `workers: 1` (serial execution — slower but avoids race conditions on CI machines)

```bash
# After CI=1 run, generate the markdown report
node tests/e2e/helpers/generate-e2e-report.mjs

# View the generated report
cat QA/REPORTS/LATEST_REPORT.md
```

---

### Reading CI results on a PR

After CI runs, check three places:

1. **GitHub Checks (green/red badges):** Under the PR, in the "Checks" section. Three badges: `Lint & Type Check`, `Unit Tests`, `E2E Tests (Playwright)`.

2. **Bot comment on the PR:** A comment appears (or updates) with a pass/fail table listing every test. Expand the `<details>` block for per-test results.

3. **Artifacts:** Click "Actions" tab → latest workflow run → "playwright-report" artifact. Download and open `index.html` for the full Playwright HTML report with screenshots and traces.

---

### What to do when CI fails

**Lint or type error:**
```bash
cd app && npm run lint
cd app && npx tsc -b
# Fix the reported errors, push again
```

**Unit test failure:**
```bash
cd app && npm run test
# Read the Vitest output to find the failing assertion
```

**E2E failure:**
```bash
# Reproduce locally first
npx playwright test --headed

# Check the failure with trace
npx playwright test --trace on
npx playwright show-report
# Open the failing test → click "Trace" to see each step
```

Common E2E failure causes:
- Dev server not starting in time (transient — retry the CI job)
- `data-testid` changed in a component but not updated in the test/POM
- A different mock account needed (check which account the test logs in as)
- State mutation from a previous test (shouldn't happen — each file gets its own browser context)

---

## Page Object Models (POMs)

POMs live in `tests/e2e/pages/`. They are not test files — they are helpers that wrap common UI interactions so tests stay readable.

| POM | Wraps |
|-----|-------|
| `LoginPage.ts` | `/login` page — `login()`, `clickShortcut()` |
| `CheckoutPage.ts` | Checkout modal — `openCheckout()`, `selectTerm()`, `confirmPurchase()` |
| `BNPLPage.ts` | BNPL flow helpers |
| `PaymentPage.ts` | Payment modal helpers |

**When you add a new test:** Prefer using a POM method over writing raw `page.getByTestId(...)` calls directly in the test. If no POM method exists for what you need, add it to the POM first.

**When a test breaks after a UI change:**
- If `data-testid` changed → update the POM (one change heals all tests using it)
- If behavior changed → update the test assertion

---

## Mock Accounts Reference

All tests use email-only login (any password works).

| Email | Account state | Use for |
|-------|--------------|---------|
| `active@koda.test` | Healthy, 3 active orders | General dashboard tests |
| `fresh@koda.test` | Verified, 0 orders | Checkout tests (clean state) |
| `new@koda.test` | Unverified (KYC pending) | KYC flow tests |
| `overdue@koda.test` | Locked account | Locked/risk tests |
| `maxed@koda.test` | 99% credit used | Insufficient credit tests |
| `declined@koda.test` | Expired card | Card error tests |
| `power@koda.test` | Power user, 2 cards | Payment mutation tests |
| `merchant@koda.test` | Merchant back-office | Merchant tests |

**Important:** `fresh@koda.test` starts with zero orders. Use this for checkout tests so the expected order count after purchase is predictable. Do not use `active@koda.test` for checkout tests — it already has 3 orders.

---

## Quick Reference Card

| Goal | Command |
|------|---------|
| Single file | `npx playwright test tests/e2e/auth/login-valid-email.spec.ts` |
| Single domain folder | `npx playwright test tests/e2e/checkout/` |
| Smoke only | `npx playwright test --project=smoke` |
| Regression only | `npx playwright test --project=regression` |
| Domain tag | `npx playwright test --grep "@checkout"` |
| All tests | `npx playwright test` |
| Headed (watch) | `npx playwright test --headed` |
| Simulate CI | `CI=1 npx playwright test` |
| View report | `npx playwright show-report` |
| Generate markdown report | `node tests/e2e/helpers/generate-e2e-report.mjs` |
