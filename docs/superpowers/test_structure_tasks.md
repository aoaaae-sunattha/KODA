# Atomic E2E Test Restructure — Task Log

**Goal:** Reorganize grouped E2E spec files into a 1-test-per-file atomic structure with domain-driven folders and tag-based execution.

**Spec:** `docs/superpowers/specs/2026-04-05-atomic-e2e-restructure.md`
**QA How-To:** `QA/qa_readme.md`
**Branch:** `e2e/atomic-restructure` (branch from `main`)

**Status legend:** `[ ]` todo · `[x]` done · `[-]` skipped/deferred

---

## Current State (before this work)

```
tests/e2e/
  regression/
    login.spec.ts            8 tests  — TC-LOGIN-01..17
    dashboard.spec.ts        4 tests  — TC-DASH-01..04
    design-alignment.spec.ts 9 tests  — plan selector, timeline, payment modal
  smoke/
    critical-path.spec.ts    3 tests  — TC-SMOKE-01..03  ← stays, already atomic
  pages/
    LoginPage.ts
    CheckoutPage.ts
    BNPLPage.ts
    PaymentPage.ts
  helpers/
    auth.setup.ts
    date-utils.ts
    generate-e2e-report.mjs
```

**Total: 24 tests across 4 files. 3 files need to be split. 6 coverage areas missing entirely.**

---

## Phase 1 — Update `playwright.config.ts`

The current config uses folder-based `testMatch` for project selection.
After restructure, folders change from `regression/` → domain dirs (`auth/`, `checkout/`, etc.).
The config must switch to tag-based `grep` so smoke/regression execution still works.

- [ ] **1.1** Update `playwright.config.ts` — change project definitions from `testMatch` to `grep`:

  **Before:**
  ```ts
  projects: [
    { name: 'smoke',      testMatch: '**/smoke/**/*.spec.ts', ... },
    { name: 'regression', testMatch: '**/regression/**/*.spec.ts', ... },
  ]
  ```

  **After:**
  ```ts
  projects: [
    { name: 'smoke',      grep: /@smoke/,      use: { ...devices['Desktop Chrome'] } },
    { name: 'regression', grep: /@regression/, use: { ...devices['Desktop Chrome'] } },
    { name: 'all',                             use: { ...devices['Desktop Chrome'] } },
  ]
  ```

- [ ] **1.2** Verify existing tests still run after config change:
  ```bash
  npx playwright test --project=smoke
  npx playwright test --project=regression
  ```
  Expected: smoke = 3 tests, regression = 0 (no tags on existing files yet — expected at this step).

- [ ] **1.3** Commit: `chore: switch playwright projects to grep-based tag selection`

---

## Phase 2 — Extract `login.spec.ts` → `tests/e2e/auth/` [x]

8 tests → 8 atomic files + 1 parametrized exception.

- [x] **2.1** Create `tests/e2e/auth/` directory
- [x] **2.2** Extract each test, adding tags to the `test()` call:

  | New file | TC | Tags |
  |---|---|---|
  | `auth/login-renders-correctly.spec.ts` | TC-LOGIN-01 | `@smoke @auth` |
  | `auth/login-valid-email.spec.ts` | TC-LOGIN-02 | `@regression @auth` |
  | `auth/login-mock-accounts.spec.ts` | TC-LOGIN-03 | `@regression @auth` (parametrized loop — 1 file, 3 cases) |
  | `auth/login-invalid-email.spec.ts` | TC-LOGIN-04 | `@regression @auth` |
  | `auth/login-enter-key.spec.ts` | TC-LOGIN-13 | `@regression @auth` |
  | `auth/login-session-persistence.spec.ts` | TC-LOGIN-14 | `@regression @auth` |
  | `auth/login-demo-shortcut.spec.ts` | TC-LOGIN-15 | `@regression @auth` |
  | `auth/login-field-attributes.spec.ts` | TC-LOGIN-16 | `@regression @auth` |
  | `auth/login-selector-verification.spec.ts` | TC-LOGIN-17 | `@regression @auth` |

  Tag format: add directly to `test()` title, e.g.:
  ```ts
  test('TC-LOGIN-01: Login page renders correctly @smoke @auth', async () => {
  ```

- [x] **2.3** Run `npx playwright test tests/e2e/auth/` — all 10 cases pass
- [x] **2.4** Commit: `test: extract login tests to atomic auth/ files`

---

## Phase 3 — Extract `dashboard.spec.ts` → `tests/e2e/credit/`

4 tests → 4 atomic files.

- [ ] **3.1** Create `tests/e2e/credit/` directory
- [ ] **3.2** Extract each test:

  | New file | TC | Tags |
  |---|---|---|
  | `credit/credit-healthy-state.spec.ts` | TC-DASH-01 | `@regression @credit` |
  | `credit/credit-near-limit-state.spec.ts` | TC-DASH-02 | `@regression @credit` |
  | `credit/credit-zero-unverified.spec.ts` | TC-DASH-03 | `@regression @credit` |
  | `credit/credit-full-verified.spec.ts` | TC-DASH-04 | `@regression @credit` |

- [ ] **3.3** Run `npx playwright test tests/e2e/credit/` — all 4 pass
- [ ] **3.4** Commit: `test: extract dashboard tests to atomic credit/ files`

---

## Phase 4 — Extract `design-alignment.spec.ts` → `checkout/` + `payment/`

9 tests → 5 checkout files + 4 payment files.

- [ ] **4.1** Create `tests/e2e/checkout/` and `tests/e2e/payment/` directories
- [ ] **4.2** Extract checkout tests:

  | New file | Source describe | Tags |
  |---|---|---|
  | `checkout/plan-selector-default-terms.spec.ts` | Plan Selector → test 1 | `@regression @checkout` |
  | `checkout/plan-selector-expand-secondary.spec.ts` | Plan Selector → test 2 | `@regression @checkout` |
  | `checkout/plan-selector-badges.spec.ts` | Plan Selector → test 3 | `@regression @checkout` |
  | `checkout/payment-timeline-renders.spec.ts` | Payment Timeline → test 1 | `@regression @checkout` |
  | `checkout/payment-timeline-first-card.spec.ts` | Payment Timeline → test 2 | `@regression @checkout` |

- [ ] **4.3** Extract payment tests:

  | New file | Source describe | Tags |
  |---|---|---|
  | `payment/pay-next-installment.spec.ts` | Payment Modal → test 3 | `@regression @payment` |
  | `payment/pay-specific-amount-input.spec.ts` | Payment Modal → test 4 | `@regression @payment` |
  | `payment/pay-full-balance.spec.ts` | Payment Modal → test 5 | `@regression @payment` |
  | `payment/pay-cancel-modal.spec.ts` | Payment Modal → test 6 | `@regression @payment` |

  Note: `opens payment modal` and `shows all 3 payment options` tests are covered by the above. Merge into `pay-next-installment.spec.ts` setup if needed.

- [ ] **4.4** Run `npx playwright test tests/e2e/checkout/ tests/e2e/payment/` — all 9 pass
- [ ] **4.5** Commit: `test: extract design-alignment tests to atomic checkout/ and payment/ files`

---

## Phase 5 — Add tags to `smoke/critical-path.spec.ts`

3 tests already in place — only add tags to titles.

- [ ] **5.1** Open `tests/e2e/smoke/critical-path.spec.ts`
- [ ] **5.2** Add `@smoke` to each test title:
  - `TC-SMOKE-01: Critical path ... @smoke`
  - `TC-SMOKE-02: Auth guard ... @smoke`
  - `TC-SMOKE-03: Merchant guard ... @smoke`
- [ ] **5.3** Run `npx playwright test --project=smoke` — 3 tests pass
- [ ] **5.4** Commit: `test: add @smoke tags to critical-path tests`

---

## Phase 6 — Full verification pass

- [ ] **6.1** Run all tests:
  ```bash
  npx playwright test
  ```
  Expected: **~24 tests pass** (10 auth + 4 credit + 5 checkout + 4 payment + 3 smoke = 26 total — adjust if any tests merged in Phase 4)

- [ ] **6.2** Run smoke project only:
  ```bash
  npx playwright test --project=smoke
  ```
  Expected: 4 tests (TC-LOGIN-01 + 3 smoke)

- [ ] **6.3** Run regression project only:
  ```bash
  npx playwright test --project=regression
  ```
  Expected: ~22 tests

- [ ] **6.4** Run a domain tag:
  ```bash
  npx playwright test --grep "@checkout"
  ```
  Expected: 5 tests

- [ ] **6.5** Run domain + tier combination:
  ```bash
  npx playwright test --grep "@smoke" --grep-invert "@regression"
  ```
  Expected: 4 smoke tests only

---

## Phase 7 — Delete original grouped files

Only after Phase 6 passes completely.

- [ ] **7.1** Delete:
  ```bash
  rm tests/e2e/regression/login.spec.ts
  rm tests/e2e/regression/dashboard.spec.ts
  rm tests/e2e/regression/design-alignment.spec.ts
  rmdir tests/e2e/regression
  ```
- [ ] **7.2** Run `npx playwright test` — count stays the same (same tests, new locations)
- [ ] **7.3** Commit: `test: delete original grouped spec files after atomic migration`

---

## Phase 8 — Add coverage gap stubs

Add `.skip` stubs for uncovered areas so they show as "pending" in CI reports.

- [ ] **8.1** Create stub directories: `kyc/`, `risk/`, `cards/`, `merchant/`, `dashboard/`
- [ ] **8.2** Create one stub file per gap:

  | File | Tags |
  |---|---|
  | `kyc/kyc-modal-opens-for-unverified.spec.ts` | `@regression @kyc` |
  | `kyc/kyc-blocks-checkout.spec.ts` | `@regression @kyc` |
  | `risk/locked-account-blocks-checkout.spec.ts` | `@regression @risk` |
  | `risk/locked-account-checkout-guard-order.spec.ts` | `@regression @risk` |
  | `risk/insufficient-credit-blocks-checkout.spec.ts` | `@regression @risk` |
  | `cards/add-card.spec.ts` | `@regression @cards` |
  | `cards/remove-card.spec.ts` | `@regression @cards` |
  | `cards/set-primary-card.spec.ts` | `@regression @cards` |
  | `merchant/merchant-settle-order.spec.ts` | `@regression @merchant` |
  | `merchant/merchant-payout-display.spec.ts` | `@regression @merchant` |
  | `dashboard/view-schedule-modal.spec.ts` | `@regression @dashboard` |

  Stub format:
  ```ts
  import { test } from '@playwright/test';
  test.skip('TODO: kyc-modal-opens-for-unverified @regression @kyc', async () => {
    // not yet implemented
  });
  ```

- [ ] **8.3** Commit: `test: add coverage gap stubs for kyc/risk/cards/merchant/dashboard`

---

## Phase 9 — PR and cleanup

- [ ] **9.1** Push branch: `git push -u origin e2e/atomic-restructure`
- [ ] **9.2** Create PR targeting `main`
- [ ] **9.3** Verify CI passes (all 3 jobs green)
- [ ] **9.4** Update `QA/qa_readme.md` if any commands changed during implementation
- [ ] **9.5** Merge

---

## Summary Counts (target)

| Folder | Files | Tests | Notes |
|---|---|---|---|
| `auth/` | 9 | 10 | TC-LOGIN-03 is 1 file / 3 parametrized cases |
| `credit/` | 4 | 4 | |
| `checkout/` | 5 | 5 | |
| `payment/` | 4 | 4 | |
| `smoke/` | 1 | 3 | Unchanged |
| **Stubs** | 11 | 11 | `.skip` — visible in CI as pending |
| **Total** | **34** | **37** | |
