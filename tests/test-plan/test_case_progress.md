# Test Case Progress — KODA BNPL

> **Last updated:** 2026-04-07
> **Source of truth:** `tests/manual-cases/` (manual) · `tests/e2e/` (automation)
> **Coverage rule:** ✅ = has running E2E spec · ❌ = no spec · ⚠️ = partial/behavioral-only · 🔄 = legacy TC-ID mismatch

---

## Overall Progress

| Priority | Module   | Manual Total | ✅ Covered | ❌ Missing | Orphaned | Coverage | Status |
|----------|----------|:------------:|:----------:|:----------:|:--------:|:--------:|--------|
| 🔴 P1    | auth     | 23           | 23         | 0          | 0        | **100%** | ✅ Done |
| 🔴 P1    | checkout | 27           | 27         | 0          | 0        | **100%** | ✅ Done |
| 🔴 P1    | risk     | 18           | 18         | 0          | 0        | **100%** | ✅ Done |
| 🟠 P2    | payment  | 11           | 3          | 8          | 0        | **27%**  | 🚧 In progress |
| 🟠 P2    | credit   | 9            | 4          | 5          | 1        | **44%**  | 🚧 In progress |
| 🟠 P2    | kyc      | 3            | 0          | 3          | 0        | **0%**   | ❌ Dir absent |
| 🟡 P3    | cards    | 3            | 0          | 3          | 0        | **0%**   | ❌ Dir absent |
| 🟡 P3    | merchant | 6            | 1          | 5          | 0        | **17%**  | 🚧 In progress |
| 🟡 P3    | schedule | 4            | 2          | 2          | 0        | **50%**  | 🚧 In progress |
| —        | **Total**| **104**      | **73**     | **31**     | **1**    | **70%**  | |

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

### 🔴 checkout — 100% ✅ Done
> Core BNPL purchase flow. Contains P0 guards (credit limit, KYC).

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-CHKT-001 | Term Threshold Disables Unavailable Options (BVA) | P1 | checkout-term-threshold.spec.ts | ✅ |
| 2 | TC-CHKT-002 | Credit Limit Guard | P0 | checkout-credit-limit-guard.spec.ts | ✅ |
| 3 | TC-CHKT-003 | Fee Calculation Accuracy — MacBook $2,499 / Term 6 | P1 | checkout-fee-calculation.spec.ts | ✅ |
| 4 | TC-CHKT-004 | Plan Selector "Other Options" Expand | P2 | checkout-plan-expand.spec.ts | ✅ |
| 5 | TC-CHKT-005 | KYC Gate Blocks Checkout — IDVerify Modal Shown | P0 | checkout-kyc-gate.spec.ts | ✅ |
| 6 | TC-CHKT-006 | Checkout Completion — Success Toast + Dashboard Redirect | P1 | checkout-happy-path.spec.ts | ✅ |
| 7 | TC-CHKT-007 | Term 4 Shows "Free" Badge and Zero Fee | P2 | checkout-free-badge.spec.ts | ✅ |
| 8 | TC-CHKT-008 | Locked Account Blocks Checkout — Account Locked Alert | P1 | checkout-locked-account.spec.ts | ✅ |
| 9 | TC-CHKT-009 | Term 24 Shows "Most Flexible" Badge | P2 | checkout-term24-badge.spec.ts | ✅ |
| 10 | TC-CHKT-010 | Term 24 Minimum Threshold BVA | P2 | checkout-term24-threshold.spec.ts | ✅ |
| 11 | TC-CHKT-011 | Checkout Modal — Close via X Button | P3 | checkout-modal-close.spec.ts | ✅ |
| 12 | TC-CHKT-012 | Store Loads with Product Catalog | P3 | checkout-store-renders.spec.ts | ✅ |
| 13 | TC-CHKT-013 | Action Required Blocks Checkout — Payment Issue Alert | P1 | checkout-action-required.spec.ts | ✅ |
| 14 | TC-CHKT-014 | Term 6/8 Threshold BVA — Disabled After Expand | P1 | checkout-secondary-term-threshold.spec.ts | ✅ |
| 15 | TC-CHKT-015 | Checkout Modal — Close via Backdrop Click | P2 | checkout-backdrop-close.spec.ts | ✅ |
| 16 | TC-CHKT-016 | No Primary Card — Confirm Disabled | P1 | checkout-no-card.spec.ts | ✅ |
| 17 | TC-CHKT-017 | action_required CTA Navigates to /settings/cards | P1 | checkout-action-required-cta.spec.ts | ✅ |
| 18 | TC-CHKT-018 | KYC Completion Flow — Full 3-Step Walkthrough | P1 | checkout-kyc-completion.spec.ts | ✅ |
| 19 | TC-CHKT-019 | Term Selection Change Updates Payment Timeline | P2 | checkout-selection-reactivity.spec.ts | ✅ |
| 20 | TC-CHKT-020 | Fee Calculation Accuracy — Term 18 on Eames Chair | P2 | checkout-high-tier-fee.spec.ts | ✅ |
| 21 | TC-CHKT-021 | Product Image Click Also Triggers Checkout Guard | P3 | checkout-image-click.spec.ts | ✅ |
| 22 | TC-CHKT-022 | Insufficient Credit — "Back to Shop" CTA Closes Modal | P1 | checkout-insufficient-credit-cta.spec.ts | ✅ |
| 23 | TC-CHKT-023 | Locked Account — "Go to Dashboard to Pay" CTA Navigates | P1 | checkout-locked-account-cta.spec.ts | ✅ |
| 24 | TC-CHKT-024 | Checkout Modal Resets to Term-4 on Reopen | P2 | checkout-modal-reset.spec.ts | ✅ |
| 25 | TC-CHKT-025 | Term-10 Enabled at $2,000+ Threshold BVA | P2 | checkout-term10-threshold-enabled.spec.ts | ✅ |
| 26 | TC-CHKT-026 | Risk Alert Modal — Close via X Button | P3 | checkout-risk-alert-close.spec.ts | ✅ |
| 27 | TC-CHKT-027 | Plan Selector Expand Link Disappears After Click | P3 | checkout-plan-expand-link-hidden.spec.ts | ✅ |

---

### 🔴 risk — 72% 🚧 In progress
> Overdue/locked account protection and refund engine. Contains P0 cases.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-RISK-001 | Locked Account Blocks Checkout | P0 | risk-locked-account-guard.spec.ts | ✅ |
| 2 | TC-RISK-002 | Unverified Account KYC Guard | P0 | risk-unverified-kyc-guard.spec.ts | ✅ |
| 3 | TC-RISK-003 | Action Required (Declined Card) Guard | P1 | risk-declined-card-guard.spec.ts | ✅ |
| 4 | TC-RISK-004 | Unlock Account via Pay Overdue | P0 | risk-unlock-via-overdue.spec.ts | ✅ |
| 5 | TC-RISK-005 | Simulate Payment Failure | P1 | risk-simulate-failure.spec.ts | ✅ |
| 6 | TC-RISK-006 | ID Verification Simulator | P1 | risk-id-verify-simulator.spec.ts | ✅ |
| 7 | TC-RFND-001 | Partial Refund - Backward Allocation (BVA) | P1 | refunds/refund-backward-allocation.spec.ts | ✅ |
| 8 | TC-RFND-002 | Refund Matching Multiple Installments | P2 | refunds/refund-multi-installment.spec.ts | ✅ |
| 9 | TC-RFND-003 | Full Refund (All Unpaid) | P1 | refunds/refund-full-complete.spec.ts | ✅ |
| 10 | TC-RFND-004 | Refund > Unpaid Balance (Mock behavior) | P2 | refunds/refund-max-cap.spec.ts | ✅ |
| 11 | TC-RFND-005 | Refund UI Price Strikethrough | P2 | refunds/refund-ui-strikethrough.spec.ts | ✅ |
| 12 | TC-RFND-006 | Refund Skipping Paid Installments (Unit only) | P1 | RefundEngine.test.ts | ✅ |
| 13 | TC-RISK-007 | KYC Credit Limit Grant Verification | P2 | risk-kyc-credit-grant.spec.ts | ✅ |
| 14 | TC-RISK-008 | Action Required Banner & Navigation | P1 | risk-action-required-banner.spec.ts | ✅ |
| 15 | TC-RISK-009 | Dashboard KYC Banner for Unverified User | P1 | risk-kyc-banner.spec.ts | ✅ |
| 16 | TC-RFND-007 | Refund Button Visibility Conditions | P1 | refunds/refund-button-visibility.spec.ts | ✅ |
| 17 | TC-RFND-008 | RefundModal — Input, Quick-Select, Max Cap | P2 | refunds/refund-modal-input.spec.ts | ✅ |
| 18 | TC-RFND-009 | RefundModal — Processing Animation and Simulation Label | P2 | refunds/refund-processing-label.spec.ts | ✅ |

> 📁 Manual cases at `tests/manual-cases/risk-refunds/RISK_REFUND_CASES.md`. Create nested specs at `tests/e2e/risk/` and `tests/e2e/risk/refunds/`.

---

### 🟠 payment — 27% 🚧 In progress
> Installment repayment flow.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-PAY-001 | Pay Specific Amount - Exact Match | P1 | — | ❌ |
| 2 | TC-PAY-002 | Pay Specific Amount - Partial | P1 | — | ❌ |
| 3 | TC-PAY-003 | Pay Specific Amount - Multi-Installment | P2 | — | ❌ |
| 4 | TC-PAY-004 | Pay Full Balance (New Flow) | P1 | — | ❌ |
| 5 | TC-PAY-005 | Flexible Payment Input Validation | P2 | — | ❌ |
| 6 | TC-PAY-006 | Partial Payment UI Update | P2 | — | ❌ |
| 7 | TC-PAY-007 | Payment Modal Default Selection | P1 | — | ❌ |
| 8 | TC-PAY-008 | Pay Next Installment (Happy Path) | P1 | — | ❌ |
| 9 | TC-PAY-009 | Payment Modal Shows All 3 Options | P2 | payment/payment-modal-options.spec.ts | ✅ |
| 10 | TC-PAY-010 | Payment Modal Header Shows Merchant Name and Balance | P2 | payment/payment-modal-header.spec.ts | ✅ |
| 11 | TC-PAY-011 | Payment Modal Cancel Dismisses Without Payment | P2 | payment/payment-modal-cancel.spec.ts | ✅ |

> 📁 Manual cases at `tests/manual-cases/risk-refunds/RISK_REFUND_CASES.md`. Create nested specs at `tests/e2e/risk/payment/`.

---

### 🟠 credit — 44% 🚧 In progress
> Credit gauge visual states.

| # | TC ID | Title | Priority | E2E Spec | Status |
|---|-------|-------|----------|----------|--------|
| 1 | TC-CRDT-001 | Gauge — Full Available (0% used) | P1 | credit-full-verified.spec.ts | ✅ 🔄 legacy-id |
| 2 | TC-CRDT-002 | Gauge — Partial Utilization (50%) | P1 | credit-healthy-state.spec.ts | ⚠️ behavioral |
| 3 | TC-CRDT-003 | Gauge — Warning Threshold (60% BVA) | P1 | — | ❌ |
| 4 | TC-CRDT-004 | Gauge — Near Limit (90%) | P1 | credit-near-limit-state.spec.ts | ✅ 🔄 legacy-id |
| 5 | TC-CRDT-005 | Gauge — Fully Exhausted (0% available) | P1 | — | ❌ |
| 6 | TC-CRDT-006 | Gauge — Real-time Update after Checkout | P2 | — | ❌ |
| 7 | TC-CRED-001 | Insufficient Credit Guard | P0 | credit/credit-insufficient-guard.spec.ts | ✅ |
| 8 | TC-CRED-002 | Credit Calculation Consistency | P1 | — | ❌ |
| 9 | TC-CRED-003 | Exact Credit Limit Purchase | P3 | — | ❌ |

> 📁 Manual cases at `tests/manual-cases/risk-refunds/RISK_REFUND_CASES.md`. Create nested specs at `tests/e2e/risk/credit/`.

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
| 4 | TC-MRCH-004 | Refund Impact on Merchant Payout | P1 | — | ❌ |
| 5 | TC-MRCH-005 | Merchant Settle Button (Happy Path) | P1 | — | ❌ |
| 6 | TC-MRCH-006 | Merchant Portal Nav Shows Business Name | P3 | — | ❌ |

> 📁 Manual cases at `tests/manual-cases/merchant/MERCHANT_CASES.md` and `tests/manual-cases/risk-refunds/RISK_REFUND_CASES.md`. Create nested specs at `tests/e2e/risk/merchant/`.

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

- [x] 🔴 Write `tests/e2e/checkout/` — TC-CHKT-001 to TC-CHKT-027 ✅ 100% done
- [x] 🔴 Write `tests/e2e/risk/` — TC-RISK-001 to TC-RISK-009, TC-RFND-001 to TC-RFND-009 ✅ 100% done
- [~] 🟠 Write `tests/e2e/risk/payment/` — TC-PAY-001 to TC-PAY-011 (27% done — TC-PAY-009/010/011 ✅; missing: TC-PAY-001 to TC-PAY-008)
- [ ] 🟠 Write `tests/e2e/kyc/` — TC-KYC-001, TC-KYC-002
- [~] 🟠 Write missing credit specs at `tests/e2e/risk/credit/` — TC-CRDT-003, TC-CRDT-005, TC-CRDT-006, TC-CRED-002, TC-CRED-003 (TC-CRED-001 ✅)
- [ ] 🟡 Write `tests/e2e/cards/` — TC-CARD-001 to TC-CARD-003
- [ ] 🟡 Write `tests/e2e/risk/merchant/` — TC-MRCH-001, TC-MRCH-002, TC-MRCH-004 to TC-MRCH-006
- [ ] 🟡 Write missing schedule specs — TC-SCHD-003, TC-SCHD-004
- [ ] 🔧 Fix `AUTH_CASES.md` ordering (TC-AUTH-023 / TC-AUTH-022)
- [ ] 🔧 Rename `TC-DASH-NN` → `TC-CRDT-NNN` in credit/ specs
- [ ] 🔧 Retire `regression/dashboard.spec.ts` once payment/ and schedule/ are complete
