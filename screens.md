# screens.md — Anyway BNPL: Complete Screen & State Inventory

This is the definitive list of every view, modal, and component state to be built.
Used by T-01 (routing) and all UI tickets as the ground truth for scope.

---

## Full-Page Routes

| Route | Screen Name | Auth Required | Status | Notes |
|---|---|---|---|---|
| `/login` | Login | No | ✅ Built | Redirects to `/dashboard` if already logged in |
| `/dashboard` | Shopper Dashboard | Yes (shopper) | 🔄 Basic built | Main screen — order cards, credit gauge |
| `/store` | Product Store | Yes (shopper) | ⬜ Not built | Product grid — "Buy with Anyway" buttons. Route not yet in App.tsx |
| `/settings/cards` | Card Management | Yes (shopper) | 🔄 Basic built | Add / remove / set primary card |
| `/merchant` | Merchant Back-Office | Yes (merchant role) | ✅ Built | Settlement table — only `merchant@anyway.test` |

> Auth gate: any route visited without a session redirects to `/login`. After login, redirects back to intended route.

---

## Modal / Overlay Screens
*(Rendered on top of current route, not separate pages)*

| ID | Modal Name | Trigger | Parent Route | Status |
|---|---|---|---|---|
| M-01 | Checkout / Plan Selector | "Buy with Anyway" on product / "New Purchase" CTA | `/store` or `/dashboard` | ⬜ |
| M-02 | Payment Schedule Preview | Inside M-01, after selecting a plan | M-01 | ⬜ |
| M-03 | ID Verify (KYC) | `useCheckoutGuard` when `user.verified = false` | M-01 | ⬜ |
| M-04 | Refund Simulation | "Simulate Refund" on order card | `/dashboard` | ⬜ |
| M-05 | Pay Next Installment Confirm | "Pay Next" on order card | `/dashboard` | ⬜ |
| M-06 | Add Card | "Add new card" on cards page | `/settings/cards` | ⬜ |
| M-07 | Payment Success | After M-01 confirm | `/dashboard` | ⬜ |
| M-08 | Early Payoff Confirm | "Pay off full balance" on order card | `/dashboard` | ⬜ |

---

## Component States
*(Same component, different visual states — all must be designed)*

### Order Card (`OrderCard`)
| State | Trigger | Visual | Status |
|---|---|---|---|
| `active` | 1+ payments made, none overdue | Green + blue segments | 🔄 Basic |
| `pending` | 0 payments made, just approved | Blue-only bar, "First payment due today" | 🔄 Basic |
| `refunded` | Partial refund applied | Green + orange + blue, strikethrough price | 🔄 Basic |
| `overdue` | Missed payment | Red left border, overdue badge, "Pay Now" CTA | 🔄 Basic |
| `completed` | All payments made | Full green bar, "Paid in full" badge, muted | 🔄 Basic |

### Credit Gauge (`CreditGauge`)
| State | Condition | Visual | Status |
|---|---|---|---|
| `healthy` | Used < 60% | Purple fill | 🔄 Basic |
| `warning` | Used 60–89% | Amber fill | ⬜ |
| `critical` | Used ≥ 90% | Red fill, "Near limit" label | ⬜ |
| `maxed` | Used = 100% | Red fill, "Limit reached", checkout blocked | ⬜ |

### Account Banner (top of dashboard)
| State | Condition | Visual | Status |
|---|---|---|---|
| `none` | Good standing | Hidden | 🔄 |
| `locked` | Overdue account | Red banner — "Account locked. Pay overdue to unlock." | ⬜ |
| `action_required` | Card declined/expired | Yellow banner — "Upcoming Payment: Action Required" | ⬜ |
| `kyc_pending` | Unverified user | Purple info banner — "Verify your identity" | ⬜ |

### Plan Selector Term Buttons
| State | Condition | Visual | Status |
|---|---|---|---|
| `active` | Currently selected | Filled purple, white text | ⬜ |
| `available` | Amount meets threshold | White bg, purple border | ⬜ |
| `disabled` | Amount too low | Gray bg, muted text, `cursor: not-allowed` | ⬜ |

### Product Card (`ProductCard`) — NEW for Phase 1.5
| State | Condition | Visual | Status |
|---|---|---|---|
| `available` | User can afford it | Normal card, purple "Buy with Anyway" button | ⬜ |
| `over_limit` | Price > available credit | Card dimmed, "Insufficient credit" tooltip on button | ⬜ |
| `account_locked` | Account is locked | Button disabled, lock icon | ⬜ |

---

## Empty States

| Screen | Empty Condition | What to Show | Status |
|---|---|---|---|
| Dashboard | No orders | Illustration + "Start shopping with Anyway" CTA → `/store` | 🔄 Basic |
| Dashboard | Unverified user, no orders | Same + KYC nudge banner | ⬜ |
| Store | No products (shouldn't happen) | "Coming soon" placeholder | ⬜ |
| Card Management | No cards on file | "No cards saved yet" + "Add card" CTA | 🔄 Basic |
| Merchant | No settlements | "No settlements yet" placeholder | ✅ |

---

## Error States

| Error | Where | Visual | Status |
|---|---|---|---|
| Unknown email on login | `/login` | "Account not found" inline error | ✅ |
| Checkout blocked — locked | `/store` or M-01 | 403 error state + "Pay overdue" CTA | ⬜ |
| Checkout blocked — limit exceeded | `/store` or M-01 | "Insufficient credit" with gauge visual | ⬜ |
| Checkout blocked — unverified | `/store` | KYC modal (M-03) auto-opens | ⬜ |
| Card add failed (duplicate last-4) | M-06 | Inline form error | ⬜ |

---

## Navigation Structure (updated)

```
Login (/login)                         ← entry point, no nav shown
└── Global Nav (shown on all shopper pages)
    ├── Dashboard (/dashboard)         ← default after login
    │   ├── [Modal] Checkout (M-01)
    │   │   ├── [Modal] Schedule (M-02)
    │   │   └── [Modal] ID Verify (M-03)
    │   ├── [Modal] Refund (M-04)
    │   ├── [Modal] Pay Next (M-05)
    │   ├── [Modal] Pay Off (M-08)
    │   └── [Modal] Success (M-07)
    ├── Store (/store)                 ← Phase 1.5 — NEW
    │   └── [Modal] Checkout (M-01)   ← same checkout flow
    └── Cards (/settings/cards)
        └── [Modal] Add Card (M-06)

Merchant (/merchant)                   ← separate role, own nav
```

---

## Screen Count Summary

| Type | Count | Built | Remaining |
|---|---|---|---|
| Full-page routes | 5 | 3 | 2 |
| Modals / overlays | 8 | 0 | 8 |
| Order card states | 5 | 5 (basic) | 0 (needs polish) |
| Credit gauge states | 4 | 1 (basic) | 3 |
| Account banner states | 4 | 0 | 4 |
| Plan selector states | 3 | 0 | 3 |
| Product card states | 3 | 0 | 3 |
| Empty states | 5 | 2 (basic) | 3 |
| Error states | 5 | 1 | 4 |
| **Total distinct UI states** | **42** | **12** | **30** |
