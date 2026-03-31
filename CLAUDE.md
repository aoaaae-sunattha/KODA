# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Anyway** is a BNPL (Buy Now, Pay Later) payment solution mockup — an interview-ready prototype. Code lives in `app/`. Planning docs are in the root.

**Current state:** Phases 1-7 are complete. Phase 8 (Polish & Demo Prep) is next.

## Documentation Structure

- `tasks.md` — Master task plan with progress tracker (28 tickets across 9 phases)
- `screens.md` — Complete screen inventory: 5 routes, 8 modals, 42 total UI states with build status
- `design-reference.md` — Color tokens, typography, spacing, layout wireframes
- `techstack.md` — Confirmed stack, folder structure, canonical type signatures
- `account.check.md` — 8 mock accounts for demo/testing
- `Epic/Epics.md` — Six prioritized product epics
- `Spec/ImplementationSpecs.md` — Technical logic, formulas, and DB schemas
- `UserStories/UserStories.md` — User stories with acceptance criteria

## Tech Stack

React 19 + TypeScript 5.9 + Vite 8 + Tailwind CSS v4 + Zustand 5 + react-router-dom v7 + framer-motion + lucide-react icons + date-fns.

**Tailwind v4 note:** No `tailwind.config`. Design tokens are defined via `@theme` block in `app/src/index.css`. Use token names like `bg-primary`, `text-secondary`, `bg-background`, etc.

## Commands

All commands run from the `app/` directory:

```bash
# Must use nvm v22 — system node 18 is broken (icu4c mismatch)
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22

# Dev server (http://localhost:5173)
npm run dev          # or: npx vite

# Type-check + build
npm run build        # runs: tsc -b && vite build

# Lint
npm run lint         # runs: eslint .

# Tests (Vitest + jsdom, globals enabled)
npm run test         # single run
npm run test:watch   # watch mode
npx vitest run unit_test/CheckoutFlow.test.ts  # single file

# Preview production build
npm run preview
```

Tests live in `app/unit_test/` (not colocated). `tsconfig.test.json` relaxes unused-variable rules for test files.

## What's Built (Phases 1-3)

| File | What it does |
|---|---|
| `app/unit_test/CheckoutFlow.test.ts` | Phase 3 Unit Tests (Math, Thresholds, Store) |
| `app/unit_test/components/Checkout.test.tsx` | Component tests for PlanSelector |
| `app/src/pages/Login.tsx` | Login screen, demo account shortcuts |
| `app/src/pages/Dashboard.tsx` | Dashboard, order cards, credit gauge (Phase 2) |
| `app/src/pages/Store.tsx` | Product catalog grid + checkout modal integration |
| `app/src/pages/Cards.tsx` | Card list, set primary, remove |
| `app/src/pages/Merchant.tsx` | Settlement table (fully done) |
| `app/src/store/useStore.ts` | Zustand store — all actions |
| `app/src/hooks/useCheckoutGuard.ts` | Pre-checkout validation (KYC → lock → credit) |
| `app/src/components/checkout/` | CheckoutModal, PlanSelector, PaymentTimeline, IDVerifyModal |
| `app/src/components/dashboard/` | CreditGauge, OrderCard (Phase 2) |
| `app/src/components/layout/Nav.tsx` | Global navigation bar |
| `app/src/data/types.ts` | All TypeScript interfaces |
| `app/src/data/feeRates.ts` | `calculatePlan()`, fee rates, APR, term thresholds |
| `app/src/data/seedProducts.ts` | 6 products (iPhone $999 → eBike $15,500) |
| `app/src/data/seedOrders.ts` | 3 default orders for `active@anyway.test` |
| `app/src/data/mockUsers.ts` | All 8 mock accounts with orders + cards |
| `app/src/utils/format.ts` | `formatCurrency($)`, `formatDate()`, `formatShortDate()` |

## Architecture Notes

- **Routing:** `App.tsx` uses `RequireAuth` and `RequireMerchant` wrapper components as route guards. Unknown routes redirect to `/login`.
- **State:** Single Zustand store (`useStore.ts`) holds all state. Login hydrates from `mockUsers.ts` lookup tables. Logout clears everything. Actions: `login`, `logout`, `createOrder`, `payInstallment`, `simulateRefund`, `simulateFailure`, `verifyKYC`, `lockAccount`, `payOverdue`, `addCard`, `removeCard`, `setPrimaryCard`.
- **Credit calculation:** `getUsedCredit()` and `getAvailableCredit()` are derived in the store via `get()`, not stored state.
- **Components:** `src/components/` has subdirs — `checkout/` (CheckoutModal, PlanSelector, PaymentTimeline, IDVerifyModal), `dashboard/` (CreditGauge, OrderCard), `layout/` (Nav), `settings/` (AddCardModal). Empty dirs ready for future phases: `merchant/`, `ui/`.
- **Vite plugins:** `@vitejs/plugin-react` + `@tailwindcss/vite` (configured in `app/vite.config.ts`).
- **Strict TS:** `noUnusedLocals`, `noUnusedParameters`, `strict`, and `erasableSyntaxOnly` are enabled. Three tsconfig files: `tsconfig.app.json` (app build), `tsconfig.node.json` (Vite config), `tsconfig.test.json` (tests, relaxed unused-var rules).
- **ESLint:** Flat config (ESLint 9) with TypeScript ESLint + React Hooks + React Refresh rules.

## Development Priorities

Build in this order per `tasks.md`:
1. ✅ Phase 0 — Planning
2. ✅ Phase 1 — Foundation & data layer
3. ✅ Phase 1.5 — Merchant Storefront
4. ✅ Phase 2 — Dashboard polish + animations
5. ✅ Phase 3 — Checkout modal + plan selector
6. ✅ Phase 4 — Refund engine
7. ✅ Phase 5 — Risk & error states
8. ✅ Phase 6 — Card management
9. ✅ Phase 7 — Merchant (done)
10. ← **Phase 8 — Animation pass + responsive**

## Key Business Logic

**Installment calculation:**
- Monthly payment = `Principal / N` (fee NOT spread across payments)
- First payment = `(Principal / N) + one-time fee`
- Duration = `N - 1` months (first payment at checkout)

**Fee rates by term:**
```
{ 4: 0%, 6: 3.98%, 8: 6.22%, 10: 7.997%, 12: 11.18%, 18: 17.25%, 24: 23.38% }
```

**Term thresholds (minimum purchase for term availability):**
```
{ 4: 300, 6: 1000, 8: 1000, 10: 2000, 12: 5000, 18: 5000, 24: 15000 }
```

**Refund reconciliation:**
- Subtract from last installment (N) first; if N = 0, subtract from N-1
- UI: strikethrough original price, orange segment on bar

**Account locking:**
- If `Current_Date > Due_Date` and `Status != Paid` → `Account_Status = Locked`
- Locked accounts block all checkout (mock 403)

**Pre-checkout validation order** (useCheckoutGuard):
1. `!user.verified` → open KYC modal
2. `accountStatus === 'locked'` → show locked error
3. `availableCredit < price` → show insufficient credit error
4. All clear → open checkout modal

**Merchant payout:**
- `Payout = Order_Total - (0.025 * Order_Total)` (2.5% commission)
- Status enum: `Pending`, `Settled`, `Held`

## Mock Authentication

Login is email-only (any password). Email maps to `src/data/mockUsers.ts`.

| Email | Scenario |
|---|---|
| `active@anyway.test` | Default — 3 active orders |
| `new@anyway.test` | Pre-KYC, no orders |
| `fresh@anyway.test` | Verified, zero orders |
| `overdue@anyway.test` | Locked account |
| `declined@anyway.test` | Expired card |
| `maxed@anyway.test` | 99% credit used |
| `power@anyway.test` | Power user, 2 cards |
| `merchant@anyway.test` | Merchant back-office |

## UI/UX Conventions

- Currency: `$` prefix — `$1,000` not `1000 kr`
- Background: `#F5F0EC` (warm cream); cards: white
- Primary: `#5D5FEF` (purple); secondary: `#3EB489` (green)
- Progress bar: green = paid, blue-gray = remaining, orange = refunded
- Term 4 = "0% / Free"; Term 24 = "Most Flexible"
- Fee badge: purple pill labeled "Free" for term 4 only
