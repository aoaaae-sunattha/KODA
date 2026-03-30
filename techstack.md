# techstack.md — Anyway BNPL: Confirmed Tech Stack

Formally confirmed 2026-03-30. Do not change without updating this file.

---

## Core Stack

| Layer | Choice | Version | Reason |
|---|---|---|---|
| Build tool | **Vite** | 8.x ✅ installed | Instant HMR, zero config, fastest dev experience |
| Framework | **React** | 18.x ✅ installed | Industry standard, hooks-based, required for Framer Motion |
| Language | **TypeScript** | 5.x ✅ installed | Catches type errors in state shape early |
| Styling | **Tailwind CSS** | v4 `@tailwindcss/vite` ✅ | Design token config via `@theme` in CSS, no config file needed |
| Animation | **Framer Motion** | ✅ installed | Spring physics, `layoutId` for plan selector, number counters |
| State | **Zustand** | ✅ installed | Zero boilerplate, no Provider wrapping, simple actions |
| Routing | **React Router DOM** | v7 ✅ installed | Client-side routing, `<Navigate>` guards |
| Icons | **Lucide React** | ✅ installed | Clean, consistent, tree-shakeable |
| Date math | **date-fns** | ✅ installed | Lightweight, needed for payment schedule generation |

---

## Why NOT alternatives

| Alternative | Rejected because |
|---|---|
| Next.js | Overkill for a mockup — SSR adds complexity with no benefit |
| Create React App | Deprecated, slow |
| CSS Modules / styled-components | More files, slower iteration vs Tailwind |
| Redux Toolkit | Too much boilerplate for 8 mock accounts + simple state |
| React Context | Fine but more verbose than Zustand for this scope |
| MUI / Chakra UI | Component libraries override our custom Anyway branding |
| GSAP | Paid license for some features; Framer Motion covers all needs |

---

## Tailwind Design Tokens

Configure in `tailwind.config.ts`:

```ts
colors: {
  primary:       '#5D5FEF',
  'primary-light': '#E8E8FD',
  secondary:     '#3EB489',
  background:    '#F5F0EC',
  surface:       '#FFFFFF',
  error:         '#EF4444',
  warning:       '#F59E0B',
  refunded:      '#F97316',
}
```

---

## Folder Structure

```
src/
├── components/
│   ├── ui/              ← Primitives: Button, Badge, Modal, ProgressBar
│   ├── Nav.tsx          ← Global nav (Phase 1.5 T-19) — shared across all shopper pages
│   ├── dashboard/       ← CreditGauge, OrderCard, SegmentedBar, AccountBanner
│   ├── checkout/        ← PlanSelector, PaymentTimeline, CheckoutModal
│   ├── settings/        ← CardList, AddCardModal
│   └── merchant/        ← SettlementTable
├── data/
│   ├── types.ts         ← All TypeScript interfaces (Order, Card, User, Product, MerchantOrder)
│   ├── mockUsers.ts     ← 8 accounts mapped by email
│   ├── seedOrders.ts    ← 3 default orders for active@anyway.test
│   ├── seedProducts.ts  ← 6 products for /store (Phase 1.5 — to be created)
│   └── feeRates.ts      ← FEE_RATES + calculatePlan() + getAvailableTerms()
├── hooks/
│   └── useCheckoutGuard.ts  ← Pre-checkout validation hook (Phase 1.5 T-18 — to be created)
├── store/
│   └── useStore.ts      ← Zustand store — login/logout, payInstallment, simulateRefund,
│                           verifyKYC, lockAccount, addCard, setPrimaryCard, createOrder (pending)
├── pages/
│   ├── Login.tsx        ← ✅ Built
│   ├── Dashboard.tsx    ← 🔄 Basic built
│   ├── Store.tsx        ← ⬜ Phase 1.5 T-17
│   ├── Cards.tsx        ← 🔄 Basic built
│   └── Merchant.tsx     ← ✅ Built
├── utils/
│   └── format.ts        ← formatCurrency($), formatDate(), formatShortDate()
└── App.tsx              ← Router + RequireAuth + RequireMerchant guards
```

---

## `calculatePlan` Signature (canonical)

```ts
// src/data/feeRates.ts
export const FEE_RATES: Record<number, number> = {
  4: 0,
  6: 0.0398,
  8: 0.0622,
  10: 0.07997,
  12: 0.1118,
  18: 0.1725,
  24: 0.2338,
}

export const TERM_THRESHOLDS: Record<number, number> = {
  4: 300,
  6: 1000,
  8: 1000,
  10: 2000,
  12: 5000,
  18: 5000,
  24: 15000,
}

export interface PlanResult {
  term: number
  monthly: number        // Principal / N (no fee)
  fee: number            // One-time fee (added to first payment only)
  firstPayment: number   // monthly + fee
  total: number          // principal + fee
  durationMonths: number // term - 1
  installments: number[] // array of N amounts (installments[0] includes fee)
  apr: number
}

export function calculatePlan(principal: number, term: number): PlanResult
```

---

## Currency Formatting

Always use:
```ts
// src/utils/format.ts
export const formatCurrency = (amount: number): string =>
  `$${amount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`

// Examples:
// formatCurrency(1000)    → "$1,000"
// formatCurrency(833.33)  → "$833.33"
// formatCurrency(0)       → "$0"
```

---

## Commands (once scaffolded)

```bash
npm run dev      # Start dev server (localhost:5173)
npm run build    # Production build
npm run preview  # Preview production build locally
```

---

## Constraints

- No backend, no API calls — all state in memory
- No real authentication — email lookup only
- No real card numbers — last 4 digits only
- Works fully offline after initial load
