# Test Case Progress — KODA BNPL

> **Last updated:** 2026-04-06
> **Source of truth:** `tests/manual-cases/` (manual) · `tests/e2e/` (automation)
> **Coverage rule:** ✅ = has running E2E spec · ❌ = no spec · ⚠️ = partial/behavioral-only · 🔄 = legacy TC-ID mismatch

---

## Overall Progress

| Priority | Module   | Manual Total | ✅ Covered | ❌ Missing | Orphaned | Coverage | Status |
|----------|----------|:------------:|:----------:|:----------:|:--------:|:--------:|--------|
| 🔴 P1    | auth     | 23           | 23         | 0          | 0        | **100%** | ✅ Done |
| 🔴 P1    | checkout | 4            | 0          | 4          | 0        | **0%**   | ❌ Dir absent |
| 🔴 P1    | risk     | 4            | 0          | 4          | 0        | **0%**   | ❌ Dir absent |
| 🟠 P2    | payment  | 6            | 3          | 3          | 0        | **50%**  | 🚧 In progress |
| 🟠 P2    | credit   | 6            | 3          | 3          | 1        | **50%**  | 🚧 In progress |
| 🟠 P2    | kyc      | 3            | 0          | 3          | 0        | **0%**   | ❌ Dir absent |
| 🟡 P3    | cards    | 3            | 0          | 3          | 0        | **0%**   | ❌ Dir absent |
| 🟡 P3    | merchant | 3            | 1          | 2          | 0        | **33%**  | 🚧 In progress |
| 🟡 P3    | schedule | 4            | 2          | 2          | 0        | **50%**  | 🚧 In progress |
| —        | **Total**| **56**       | **32**     | **24**     | **1**    | **57%**  | |

### Priority Key

| Level | Label | Rationale |
|-------|-------|-----------|
| 🔴 P1 | Critical | Blocks revenue or security. Must be green before any release. |
| 🟠 P2 | High | Core user journey. Should be green before demo / staging. |
| 🟡 P3 | Medium | Supporting flows. Cover before production hardening. |

---

## Module Checklists

---

### 🔴 auth — 100% ✅ Done
> Security gate to all features. Every case must be automated.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-AUTH-001 | Valid Login (Happy Path) | P0 | login-valid-email.spec.ts | ✅ |
| 2 | TC-AUTH-002 | Unknown Email Error | P1 | login-invalid-email.spec.ts | ✅ |
| 3 | TC-AUTH-003 | Email Normalization | P2 | login-email-normalization.spec.ts | ✅ |
| 4 | TC-AUTH-004 | Session Persistence on Refresh | P1 | login-session-persistence.spec.ts | ✅ |
| 5 | TC-AUTH-005 | Logout Flow | P1 | logout-flow.spec.ts | ✅ |
| 6 | TC-AUTH-006 | Merchant Routing | P1 | login-mock-accounts.spec.ts | ✅ |
| 7 | TC-AUTH-007 | Auth Guard Blocks Unauthenticated | P0 | security-auth-guard.spec.ts | ✅ |
| 8 | TC-AUTH-008 | Declined Card User Banner | P1 | login-declined-card.spec.ts | ✅ |
| 9 | TC-AUTH-009 | New User / KYC Deferred Login | P1 | login-new-user-kyc.spec.ts | ✅ |
| 10 | TC-AUTH-010 | Empty Email Submit | P1 | login-field-attributes.spec.ts | ⚠️ partial (tests `required` attr, not submit behaviour) |
| 11 | TC-AUTH-011 | Empty Password Submit | P1 | login-empty-password.spec.ts | ✅ |
| 12 | TC-AUTH-012 | Invalid Email Format | P1 | login-invalid-format.spec.ts | ✅ |
| 13 | TC-AUTH-013 | Enter Key Submits Form | P2 | login-enter-key.spec.ts | ✅ |
| 14 | TC-AUTH-014 | Demo Quick-Fill Button | P1 | login-demo-shortcut.spec.ts | ✅ |
| 15 | TC-AUTH-015 | Error Clears on Valid Re-attempt | P2 | login-error-clears.spec.ts | ✅ |
| 16 | TC-AUTH-016 | Overdue User Logs In | P1 | login-mock-accounts.spec.ts | ⚠️ partial (routing only; locked-state UI not asserted) |
| 17 | TC-AUTH-017 | RequireMerchant Guard — Non-Merchant | P1 | smoke/critical-path.spec.ts (TC-SMOKE-03) | ⚠️ behavioral |
| 18 | TC-AUTH-018 | Auth User Visits /login | P3 | login-already-authenticated.spec.ts | ✅ |
| 19 | TC-AUTH-019 | Unauthenticated Access to /merchant | P1 | security-unauthenticated-merchant.spec.ts | ✅ |
| 20 | TC-AUTH-020 | Unknown Route Redirect | P2 | unknown-route-redirect.spec.ts | ✅ |
| 21 | TC-AUTH-021 | Session Isolation in Incognito | P2 | session-incognito.spec.ts | ✅ |
| 22 | TC-AUTH-022 | Repeated Failed Login Error Persists | P2 | login-failed-repeated.spec.ts | ✅ |
| 23 | TC-AUTH-023 | Deep Link — No Redirect-Back | P3 | login-deep-link-redirect.spec.ts | ✅ |

> ⚠️ **Known issue:** TC-AUTH-023 appears before TC-AUTH-022 in `AUTH_CASES.md` — run `qa-number-fix auth` to reorder.

---

### 🔴 checkout — 0% ❌ Not started
> Core BNPL purchase flow. Contains P0 credit-limit guard.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-CHKT-001 | Unlock Terms via Purchase Amount (BVA) | P1 | — | ❌ |
| 2 | TC-CHKT-002 | Credit Limit Guard | P0 | — | ❌ |
| 3 | TC-CHKT-003 | Fee Calculation Accuracy (BVA) | P1 | — | ❌ |
| 4 | TC-CHKT-004 | Plan Selector "Other Options" expand | P2 | — | ❌ |

> 📁 Create `tests/e2e/checkout/` before writing specs.

---

### 🔴 risk — 0% ❌ Not started
> Overdue/locked account protection and refund engine. Contains P0 case.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-RISK-001 | Locked Account Blocks Checkout | P0 | — | ❌ |
| 2 | TC-RISK-002 | Pay Overdue Balance Unlocks Account | P1 | — | ❌ |
| 3 | TC-RFND-001 | Backward Refund Reconciliation (BVA) | P1 | — | ❌ |
| 4 | TC-RFND-002 | Full Refund Completes Order | P1 | — | ❌ |

> 📁 Create `tests/e2e/risk/` before writing specs.

---

### 🟠 payment — 50% 🚧 In progress
> Installment repayment flow. P0 cases partially covered via legacy regression spec.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-PYMT-001 | Pay Next Installment | P0 | regression/dashboard.spec.ts | ⚠️ behavioral (legacy grouped spec) |
| 2 | TC-PYMT-002 | Pay Specific Amount — Exact | P1 | — | ❌ |
| 3 | TC-PYMT-003 | Pay Specific Amount — Overlap | P1 | — | ❌ |
| 4 | TC-PYMT-004 | Pay Full Balance | P0 | regression/dashboard.spec.ts | ⚠️ behavioral (legacy grouped spec) |
| 5 | TC-PYMT-005 | Invalid Amount ($0 or negative) | P1 | — | ❌ |
| 6 | TC-PYMT-006 | Amount Exceeds Remaining Balance | P1 | — | ❌ |

> 📁 Create `tests/e2e/payment/` and write atomic specs; retire `regression/dashboard.spec.ts` payment tests once done.

---

### 🟠 credit — 50% 🚧 In progress
> Credit gauge visual states. All specs use legacy `TC-DASH-NN` IDs — rename needed.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-CRDT-001 | Gauge — Full Available (0% used) | P1 | credit-full-verified.spec.ts | ✅ 🔄 legacy-id (TC-DASH-04) |
| 2 | TC-CRDT-002 | Gauge — Partial Utilization (50%) | P1 | credit-healthy-state.spec.ts | ⚠️ behavioral (spec tests 22%, not 50%) |
| 3 | TC-CRDT-003 | Gauge — Warning Threshold (60% BVA) | P1 | — | ❌ |
| 4 | TC-CRDT-004 | Gauge — Near Limit (90%) | P1 | credit-near-limit-state.spec.ts | ✅ 🔄 legacy-id (TC-DASH-02) |
| 5 | TC-CRDT-005 | Gauge — Fully Exhausted (0% available) | P1 | — | ❌ |
| 6 | TC-CRDT-006 | Gauge — Real-time Update after Checkout | P2 | — | ❌ |

> 🔄 Rename `TC-DASH-01/02/03/04` → `TC-CRDT-001/002/003/004` in credit/ specs.

---

### 🟠 kyc — 0% ❌ Not started
> Identity verification gate before first checkout.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-KYC-001 | KYC Modal Triggered at Checkout | P1 | — | ❌ |
| 2 | TC-KYC-002 | KYC Completion Unlocks Checkout | P1 | — | ❌ |
| 3 | TC-KYC-003 | KYC Enforcement — Bypass Blocked | P1 | Manual only | 🚫 excluded |

> 📁 Create `tests/e2e/kyc/` before writing specs.

---

### 🟡 cards — 0% ❌ Not started
> Payment method management (add, remove, set primary).

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-CARD-001 | Add New Payment Card | P1 | — | ❌ |
| 2 | TC-CARD-002 | Remove Existing Card | P1 | — | ❌ |
| 3 | TC-CARD-003 | Set Primary Payment Method | P1 | — | ❌ |

> 📁 Create `tests/e2e/cards/` before writing specs.

---

### 🟡 merchant — 33% 🚧 In progress
> Merchant back-office portal.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-MRCH-001 | Settle Order — Release Funds | P1 | — | ❌ |
| 2 | TC-MRCH-002 | Payout Calculation (2.5% fee) | P1 | — | ❌ |
| 3 | TC-MRCH-003 | Merchant Guard — Non-Merchant Blocked | P1 | smoke/critical-path.spec.ts (TC-SMOKE-03) | ⚠️ behavioral |

> 📁 Create `tests/e2e/merchant/` and write atomic specs.

---

### 🟡 schedule — 50% 🚧 In progress
> Payment timeline / installment card display.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-SCHD-001 | Installment Cards Display | P0 | regression/dashboard.spec.ts | ⚠️ behavioral (legacy grouped spec) |
| 2 | TC-SCHD-002 | "Upon Checkout" Label on First Card | P0 | regression/dashboard.spec.ts | ⚠️ behavioral (legacy grouped spec) |
| 3 | TC-SCHD-003 | Extended Term Fee Note | P1 | — | ❌ |
| 4 | TC-SCHD-004 | Scrollable Timeline (mobile 375px) | P2 | — | ❌ |

> 📁 Create `tests/e2e/schedule/` and write atomic specs; retire dashboard.spec.ts schedule tests once done.

---

## Cleanup Backlog

These are not coverage gaps — they are technical debt items that should be resolved alongside new spec work.

| # | Item | Action |
|---|------|--------|
| 1 | `regression/dashboard.spec.ts` | Retire after payment/ and schedule/ atomic specs are written |
| 2 | `regression/design-alignment.spec.ts` | Audit: no TC IDs, no manual case — annotate or delete |
| 3 | Credit specs `TC-DASH-NN` IDs | Rename to `TC-CRDT-NNN` in all 4 credit/ spec files |
| 4 | `AUTH_CASES.md` ordering bug | TC-AUTH-023 appears before TC-AUTH-022 — run `qa-number-fix auth` |
| 5 | TC-AUTH-010 spec title mismatch | `login-field-attributes.spec.ts` tests attributes, not empty-submit UX — consider a dedicated empty-submit assertion |
| 6 | TC-AUTH-016 partial coverage | `login-mock-accounts.spec.ts` only checks redirect URL; add locked-state UI assertion |
| 7 | TC-AUTH-017 no dedicated spec | Currently covered via TC-SMOKE-03; write `security-merchant-guard-shopper.spec.ts` |

---

## Next Actions (Priority Order)

- [ ] 🔴 Write `tests/e2e/checkout/` — TC-CHKT-001 to TC-CHKT-004 (P0 credit guard first)
- [ ] 🔴 Write `tests/e2e/risk/` — TC-RISK-001 to TC-RFND-002 (P0 locked checkout first)
- [ ] 🟠 Write `tests/e2e/payment/` — TC-PYMT-001 to TC-PYMT-006 (atomic, retire regression coverage)
- [ ] 🟠 Write `tests/e2e/kyc/` — TC-KYC-001, TC-KYC-002
- [ ] 🟠 Write missing credit specs — TC-CRDT-003, TC-CRDT-005, TC-CRDT-006
- [ ] 🟡 Write `tests/e2e/cards/` — TC-CARD-001 to TC-CARD-003
- [ ] 🟡 Write `tests/e2e/merchant/` — TC-MRCH-001, TC-MRCH-002
- [ ] 🟡 Write missing schedule specs — TC-SCHD-003, TC-SCHD-004
- [ ] 🔧 Fix `AUTH_CASES.md` ordering (TC-AUTH-023 / TC-AUTH-022)
- [ ] 🔧 Rename `TC-DASH-NN` → `TC-CRDT-NNN` in credit/ specs
- [ ] 🔧 Retire `regression/dashboard.spec.ts` once payment/ and schedule/ are complete
