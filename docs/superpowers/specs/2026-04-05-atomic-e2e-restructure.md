# Atomic E2E Test Restructure — Design Spec

**Date:** 2026-04-05
**Status:** Draft — pending implementation
**Source:** Gemini plan (sync block 2026-04-05) + Claude verification pass
**Audience:** Interview showcase + real development workflow

---

## Overview

Reorganize the current grouped E2E spec files into a 1-test-per-file atomic structure with deep business-logic-driven folder categorization and Playwright tag-based execution. Deletes 3 original grouped files after migration.

**Current state:**
```
tests/e2e/
  regression/
    login.spec.ts          ← 8 tests
    dashboard.spec.ts      ← 4 tests
    design-alignment.spec.ts ← 9 tests
  smoke/
    critical-path.spec.ts  ← 3 tests (keep as-is, already atomic)
  pages/                   ← POMs (no changes)
  helpers/                 ← auth.setup.ts, date-utils.ts, etc.
```

**Target state:** ~24 atomic files across domain-driven subdirectories.

---

## Folder Structure

```
tests/e2e/
  auth/
    login-renders-correctly.spec.ts          TC-LOGIN-01 @smoke @auth
    login-valid-email.spec.ts                TC-LOGIN-02 @regression @auth
    login-mock-accounts.spec.ts              TC-LOGIN-03 @regression @auth  ← see §Exceptions
    login-invalid-email.spec.ts              TC-LOGIN-04 @regression @auth
    login-enter-key.spec.ts                  TC-LOGIN-13 @regression @auth
    login-session-persistence.spec.ts        TC-LOGIN-14 @regression @auth
    login-demo-shortcut.spec.ts              TC-LOGIN-15 @regression @auth
    login-field-attributes.spec.ts           TC-LOGIN-16 @regression @auth
    login-selector-verification.spec.ts      TC-LOGIN-17 @regression @auth
  credit/
    credit-healthy-state.spec.ts             TC-DASH-01 @regression @credit
    credit-near-limit-state.spec.ts          TC-DASH-02 @regression @credit
    credit-zero-unverified.spec.ts           TC-DASH-03 @regression @credit
    credit-full-verified.spec.ts             TC-DASH-04 @regression @credit
  checkout/
    plan-selector-default-terms.spec.ts      @regression @checkout
    plan-selector-expand-secondary.spec.ts   @regression @checkout
    plan-selector-badges.spec.ts             @regression @checkout
    payment-timeline-renders.spec.ts         @regression @checkout
    payment-timeline-first-card.spec.ts      @regression @checkout
  payment/
    pay-next-installment.spec.ts             @regression @payment
    pay-specific-amount-input.spec.ts        @regression @payment
    pay-full-balance.spec.ts                 @regression @payment
    pay-cancel-modal.spec.ts                 @regression @payment
  smoke/
    critical-path.spec.ts                    @smoke  ← no changes
```

**Stubs (no implementation yet — created as empty describe blocks with skip):**
```
  kyc/
    kyc-modal-opens-for-unverified.spec.ts   @regression @kyc
    kyc-blocks-checkout.spec.ts              @regression @kyc
  risk/
    locked-account-blocks-checkout.spec.ts   @regression @risk
    locked-account-checkout-guard-order.spec.ts @regression @risk
    insufficient-credit-blocks-checkout.spec.ts @regression @risk
  cards/
    add-card.spec.ts                         @regression @cards
    remove-card.spec.ts                      @regression @cards
    set-primary-card.spec.ts                 @regression @cards
  merchant/
    merchant-settle-order.spec.ts            @regression @merchant
    merchant-payout-display.spec.ts          @regression @merchant
  dashboard/
    view-schedule-modal.spec.ts              @regression @dashboard
```

---

## Tagging Strategy

Three layers — each tag serves a different CI use case:

| Tag | Execution context | Example command |
|-----|------------------|-----------------|
| `@smoke` | Every push gate (fast, ~30s) | `npx playwright test --grep @smoke` |
| `@regression` | PR gate (full suite) | `npx playwright test --grep @regression` |
| `@auth` `@credit` `@checkout` `@payment` `@kyc` `@risk` `@cards` `@merchant` `@dashboard` | Targeted re-run after domain change | `npx playwright test --grep @checkout` |

**Rule:** Every test gets exactly two tags — one execution tier (`@smoke` or `@regression`) and one domain tag. No test is untagged.

**CI mapping (no changes to workflow):**
- `ci.yml` continues running `npx playwright test` (all tests) — the tags enable local targeted runs and future CI matrix splits, not a CI change today.

---

## Exceptions to "1 test = 1 file"

### TC-LOGIN-03: Parametrized mock account loop

`login.spec.ts:32-43` generates 3 tests from one loop (active, overdue, merchant routing). Keep as a single file:
```
auth/login-mock-accounts.spec.ts   ← 3 parametrized cases, 1 file
```
**Rationale:** These test the same behavior (routing by account type) across different inputs — not independent paths. Splitting adds 3 files with identical structure and no readability benefit.

---

## Hidden Dependencies & Mitigations

### 1. `auth.setup.ts` — single-user storageState

**Risk:** The global auth setup saves `active@koda.test` storageState only. Tests that need other users (`maxed`, `new`, `fresh`, `overdue`) bypass this by doing a full login in `beforeEach`.

**Mitigation:** Keep the `beforeEach` login pattern for all atomic tests. Do not use storageState until a multi-user fixture is built. Document this as intentional — it's slower but safer for a mockup with Zustand localStorage auth.

**Future option (not now):** Create per-user auth files:
```
helpers/.auth/active.json
helpers/.auth/maxed.json
helpers/.auth/fresh.json
```
and expose a `loginAs(user)` fixture that loads the correct storageState.

### 2. Payment modal tests — state mutation

**Risk:** `pay-next-installment.spec.ts` and `pay-full-balance.spec.ts` both mutate `power@koda.test`'s localStorage. Parallel Playwright workers could race if sharing the same storageState.

**Mitigation:** Not a problem — each Playwright test file gets its own isolated browser context by default. Each test starts with a fresh login, fresh localStorage. Confirmed safe.

**Rule to enforce:** Payment mutation tests must always do a fresh `loginPage.login('power@koda.test')` in `beforeEach`, never reuse storageState.

### 3. `CheckoutPage.ts` — cross-boundary app import

**Risk:** `tests/e2e/pages/CheckoutPage.ts:8` imports `type { Term }` from `../../../app/src/data/types`. All checkout-related atomic files inherit this path.

**Mitigation:** No change needed. The import is a type-only import (`erasableSyntaxOnly` compliant) and the path is stable. If `types.ts` moves, update `CheckoutPage.ts` once — all tests heal automatically via the POM.

---

## Files to Delete After Migration

Once all tests are extracted and verified passing:

```
tests/e2e/regression/login.spec.ts
tests/e2e/regression/dashboard.spec.ts
tests/e2e/regression/design-alignment.spec.ts
```

`tests/e2e/smoke/critical-path.spec.ts` stays — it's already atomic.

---

## Coverage Gaps — Stub Rationale

The 6 uncovered areas below exist in the codebase but have no E2E tests. Add as `.skip` stubs during restructure so they appear in the test report as "pending":

| Gap | Why it matters |
|-----|---------------|
| KYC / IDVerify modal | Pre-checkout guard step 1; `new@koda.test` triggers this |
| Locked account checkout block | Pre-checkout guard step 2; `overdue@koda.test` triggers this |
| Insufficient credit checkout block | Pre-checkout guard step 3; `maxed@koda.test` triggers this |
| Card management (add/remove/primary) | `/settings/cards` route has no E2E coverage at all |
| Merchant back-office (settle, payout) | `/merchant` route has no E2E coverage at all |
| View Schedule modal | Added in most recent commit (PaymentTimeline refactor); no test yet |

These are not part of this restructure's scope — adding the stubs makes the gap visible in CI output.

---

## Technical Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Folder naming | domain-driven (auth/, credit/, checkout/) | Makes "what's covered" obvious by directory listing |
| Tag layers | execution tier + domain | Tier for CI gates, domain for targeted re-runs |
| TC-LOGIN-03 | Stay parametrized, 1 file | Same behavior, different inputs — not independent paths |
| Coverage gaps | Stubs with `.skip` | Visible in CI report; avoids illusion of complete coverage |
| storageState | `beforeEach` full login for all tests | Multi-user support without per-user auth fixture complexity |
| Payment tests isolation | Default Playwright context isolation | Each file = fresh context; no shared localStorage between workers |
| `critical-path.spec.ts` | No changes | Already atomic and correctly placed |

---

## Out of Scope

- Implementing the 6 stub tests (separate phase)
- Multi-user storageState fixture
- Changes to `playwright.config.ts`
- Changes to POMs
- CI workflow changes
