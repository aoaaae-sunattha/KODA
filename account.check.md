# account.check.md

Mock test accounts for the Anyway BNPL mockup.
Use any password to log in. The email determines which state loads.

---

## How it works
The login form reads the email, matches it to `mockUsers` in `src/data/mockUsers.ts`,
and loads that user's pre-configured state. No real authentication occurs.

---

## Accounts & States

### 1. Happy Path — Active User
**Email:** `active@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $10,000
- Used: $2,250 (3 active orders)
- Orders:
  - Sinnerup — $1,000 / 4 payments / 1 paid (25%)
  - Luksus Baby — $1,000 / 4 payments / 1 paid + $180 refunded
  - Åberg — $2,400 / 6 payments / 0 paid (just approved)
- Card on file: Visa •••• 4242
- Account status: Active
**What to demo:** Core dashboard, progress bars, refund simulation, Pay Next Installment

---

### 2. New User — Unverified (Zero State)
**Email:** `new@anyway.test`
**Password:** anything
**State:**
- KYC NOT verified ❌
- Credit limit: $0 (pending)
- No orders
- No card on file
- Account status: Pending KYC
**What to demo:** Empty/onboarding state, ID Verify mock flow, first-time UX

---

### 3. New User — Verified, No Orders
**Email:** `fresh@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $8,000
- Used: $0
- No orders
- Card on file: Mastercard •••• 1234
- Account status: Active
**What to demo:** Zero-orders empty state with credit gauge full, "Start shopping" CTA

---

### 4. Overdue / Locked Account
**Email:** `overdue@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $10,000
- Used: $5,000
- Orders:
  - ILLUM — $2,000 / 4 payments / 2 paid, **1 overdue** (due 2026-02-15, missed)
  - Magasin — $3,000 / 8 payments / 3 paid
- Card on file: Visa •••• 9999
- Account status: 🔴 LOCKED
- Lock reason: Overdue installment — ILLUM, $500 since 2026-02-15
**What to demo:** Red/yellow overdue alert, locked account banner, "Pay overdue" CTA, checkout blocked (403 state)

---

### 5. Declined Card
**Email:** `declined@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $10,000
- Used: $3,000
- Orders:
  - Nørr Streetwear — $3,000 / 10 payments / 4 paid
- Card on file: Mastercard •••• 5678 (EXPIRED 01/26)
- Account status: ⚠️ Action Required
- Decline reason: Card expired — payment failed on 2026-03-01
**What to demo:** "Upcoming Payment: Action Required" alert, update card flow, declined state UI

---

### 6. Maxed Out Credit
**Email:** `maxed@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $5,000
- Used: $4,950 (99% utilized)
- Orders:
  - Samsøe Samsøe — $2,500 / 6 payments / 1 paid
  - Norse Projects — $2,500 / 4 payments / 1 paid
- Card on file: Visa •••• 3333
- Account status: Active (but near limit)
- Available credit: $50
**What to demo:** Credit gauge at 99%, "Limit Exceeded" warning on checkout attempt, low-credit UX state

---

### 7. Power User — Long History
**Email:** `power@anyway.test`
**Password:** anything
**State:**
- KYC verified ✅
- Credit limit: $25,000
- Used: $8,400
- Orders:
  - Completed: Bolia — $4,000 / 4 payments ✅ (fully paid)
  - Completed: Illums Bolighus — $2,000 / 6 payments ✅ (fully paid)
  - Active: Bang & Olufsen — $6,000 / 12 payments / 5 paid (42%)
  - Active: Sneakersnstuff — $2,400 / 8 payments / 2 paid (25%)
- Cards: Visa •••• 4242 (primary), Mastercard •••• 8888
- Account status: Active
**What to demo:** Mix of completed + active orders, multiple cards, early payoff option, high credit limit

---

### 8. Merchant View
**Email:** `merchant@anyway.test`
**Password:** anything
**Role:** Merchant (loads merchant back-office view, not shopper dashboard)
**State:**
- Business: "Copenhagen Concept Store"
- Settlement data:
  - Order #1001 — $1,000 — Commission 2.5% — Payout $975 — ✅ Settled
  - Order #1002 — $2,400 — Commission 2.5% — Payout $2,340 — ✅ Settled
  - Order #1003 — $3,000 — Commission 2.5% — Payout $2,925 — ⏳ Pending
  - Order #1004 — $5,000 — Commission 2.5% — Payout $4,875 — 🔒 Held
**What to demo:** Merchant settlement table, payout statuses, commission calculation

---

## Credit Check States Explained

| Account | Credit Score Scenario | Limit | Notes |
|---|---|---|---|
| `active` | Good standing | $10,000 | Standard approved user |
| `new` | Not yet checked | $0 | Pre-KYC — no bureau check done |
| `fresh` | Checked, clean | $8,000 | Verified but no purchase history |
| `overdue` | Previously good, now delinquent | $10,000 | Locked until overdue paid |
| `declined` | Good credit, card issue only | $10,000 | Credit fine, payment method expired |
| `maxed` | Good credit, high utilization | $5,000 | Lower limit, nearly exhausted |
| `power` | Excellent history | $25,000 | Long-term customer, high trust |
| `merchant` | N/A (business account) | N/A | Separate back-office role |

---

## Tester Quick Reference

To switch scenarios during a demo, type the email below in the login field and press Enter:

```
active@anyway.test     → Normal dashboard (default demo)
new@anyway.test        → KYC onboarding flow
fresh@anyway.test      → Empty state (verified, no orders)
overdue@anyway.test    → Locked account + overdue alert
declined@anyway.test   → Declined card + action required
maxed@anyway.test      → Credit limit exceeded
power@anyway.test      → Power user with order history
merchant@anyway.test   → Merchant back-office view
```

Any string as password works — auth is mocked.
