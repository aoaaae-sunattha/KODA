# tasks.md — Anyway BNPL Mockup: Master Task Plan

Last updated: 2026-03-30
Status legend: ⬜ Not started | 🔄 In progress | ✅ Done | 🔒 Blocked

## Definition of Done (DoD)
All tickets must meet these criteria before being marked ✅:
1. **Implementation:** Code follows technical specs and design tokens.
2. **Unit Tests:** New logic (math, state, hooks) must have tests in `app/unit_test/`.
3. **Verification:** Tests must pass via `npx vitest run unit_test`.
4. **Responsive:** UI verified at 375px (mobile) and 1280px (desktop).

---

## PHASE 0 — Planning & Audit ✅

| # | Task | Status |
|---|------|--------|
| P-01 | Review Epics, User Stories, Implementation Specs | ✅ |
| P-02 | Audit live Anyday.io price calculator (fee logic, UX) | ✅ |
| P-03 | Correct fee structure (7 terms, upfront fee model) | ✅ |
| P-04 | Define mock account scenarios (account.check.md) | ✅ |
| P-05 | Write CLAUDE.md for future Claude sessions | ✅ |
| P-06 | Write tasks.md (this file) | ✅ |
| P-07 | Define complete screen inventory + modal list (screens.md) | ✅ |
| P-08 | Collect visual & UX reference, document design tokens (design-reference.md) | ✅ |
| P-09 | Confirm tech stack, folder structure, canonical types (techstack.md) | ✅ |

---

## PHASE 1 — Foundation & Data Layer ✅

| # | Task | Status |
|---|------|--------|
| T-01 | App Shell & Routing | ✅ |
| T-02 | Mock Data Layer | ✅ |
| T-20 | Testing Infrastructure | ✅ |

---

## PHASE 1.5 — Merchant Storefront ✅

| # | Task | Status |
|---|------|--------|
| T-17 | Store Route & Product Grid | ✅ |
| T-18 | Pre-Checkout Validation Hook | ✅ |
| T-19 | Global Navigation | ✅ |

---

## PHASE 2 — Dashboard (Priority 1) ✅

| # | Ticket | Description | Status |
|---|--------|-------------|--------|
| T-03 | Credit Utilization Header | Animated linear gauge | ✅ |
| T-04 | Order Card + Segmented Progress Bar | SegmentedBar with tooltips | ✅ |
| T-05 | Empty / Zero State | Detected when `orders.length === 0` | ✅ |

---

## PHASE 3 — Checkout & Payment Slicing (Priority 2) ✅

### Category: Checkout Flow

| # | Ticket | Description | Status |
|---|--------|-------------|--------|
| T-06 | Payment Plan Selector | 7 pill buttons, term selection math | ✅ |
| T-07 | Checkout Modal | Slide-up modal with order summary | ✅ |
| T-08 | Payment Schedule Timeline | Vertical list of N installments with dates | ✅ |
| T-21 | Checkout Flow Unit Tests | Verify selection math and modal state | ✅ |

### Deliverables for Phase 3
- [x] Plan selector shows correct monthly, fee, total for all 7 terms
- [x] Checkout modal opens, plan selection works, confirm creates new order
- [x] Payment timeline shows correct dates with fee on first row
- [x] Unit tests for checkout logic pass in `app/unit_test/`

---

## PHASE 4 — Refund Engine (Priority 3)

### Category: Dynamic Adjustment

| # | Ticket | Description | Status |
|---|--------|-------------|--------|
| T-09 | Refund Simulation | Refund input modal & Zustand action | ⬜ |
| T-22 | Refund Engine Tests | Verify last-installment-first logic | ⬜ |

---

## PHASE 5 — Risk & Error States (Priority 4) 🔄

### Category: Trust & Safety

| # | Ticket | Description | Status |
|---|--------|-------------|--------|
| T-10 | KYC / ID Verify Mock Flow | `IDVerifyModal` with 2s mock delay | ✅ |
| T-11 | Declined Payment & Overdue Alert | Dashboard banners & Locked account logic | ✅ |
| T-23 | Risk/KYC Unit Tests | Verify checkout blocking logic | ⬜ |
| T-25 | Manual Overdue Simulation | "Simulate Failure" action on OrderCard | ✅ |

---

## PHASE 6 — Card Management (Priority 5)

### Category: Account Settings

| # | Ticket | Description | Status |
|---|--------|-------------|--------|
| T-12 | Saved Cards CRUD | Card list and Primary setting | 🔄 |
| T-24 | Card Management Tests | Verify setPrimary and expiry logic | ⬜ |

---

## PHASE 7 — Merchant Back-Office (Priority 6) ✅

| # | Task | Status |
|---|------|--------|
| T-13 | Settlement Table | ✅ |

---

## PHASE 8 — Polish & Demo Prep

| # | Task | Status |
|---|------|--------|
| T-14 | Animation pass | ⬜ |
| T-15 | Responsive + mobile check | ⬜ |
| T-16 | Mock login screen | ✅ |

---

## Tech Stack Summary

React 19, Tailwind 4, Framer Motion 12, Zustand 5, Lucide React, Vitest.

---

## Build Order

1. Foundation ✅
2. Storefront ✅
3. Dashboard ✅
4. Checkout (Current) 🔄
5. Refunds
6. Risk/KYC
7. Cards
8. Polish
