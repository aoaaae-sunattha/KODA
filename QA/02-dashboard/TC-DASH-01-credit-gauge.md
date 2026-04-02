# TC-DASH: Credit Gauge

## Component: `CreditGauge`
Tests the credit utilization bar, animated counter, and threshold-based color changes.

---

### TC-DASH-01: Healthy credit state (< 60% used)
**Account:** `active@koda.test`
**Precondition:** Credit limit $10,000, used $2,200

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Observe "Available Credit" value | Shows animated counter landing on **$7,800** |
| 3 | Observe "Total Limit" | Shows **$10,000** (static, no animation) |
| 4 | Observe progress bar | Purple fill at ~22%, animates from 0 on load |
| 5 | Observe bottom-left text | Shows **$2,200 used** (animated counter) |
| 6 | Observe bottom-right text | Shows **22%**, no warning label |

---

### TC-DASH-02: Near-limit credit state (>= 90% used)
**Account:** `maxed@koda.test`
**Precondition:** Credit limit $5,000, used $4,950

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `maxed@koda.test` | Dashboard loads |
| 2 | Observe "Available Credit" | Animated counter lands on **$50** |
| 3 | Observe progress bar color | **Red** fill (not purple) |
| 4 | Observe bottom-right | Shows **"Near limit"** label in red + **99%** |

---

### TC-DASH-03: Zero credit (new unverified user)
**Account:** `new@koda.test`
**Precondition:** Credit limit $0, used $0

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `new@koda.test` | Dashboard loads |
| 2 | Observe "Available Credit" | Shows **$0** |
| 3 | Observe progress bar | Empty (0% fill) |
| 4 | Observe percentage | Shows **0%** |

---

### TC-DASH-04: Full credit available (verified, no orders)
**Account:** `fresh@koda.test`
**Precondition:** Credit limit $8,000, used $0

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `fresh@koda.test` | Dashboard loads |
| 2 | Observe "Available Credit" | Animated counter lands on **$8,000** |
| 3 | Observe progress bar | Empty (0% used) |
| 4 | Observe percentage | Shows **0%** |

---

### TC-DASH-05: Credit gauge updates after payment
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Available Credit shows **$7,750** |
| 2 | Note the used amount | **$2,250 used** |
| 3 | Click "Pay $250" on any active order card | Payment processes |
| 4 | Observe credit gauge | Available Credit animates UP (counter ticks), used amount animates DOWN |
| 5 | Observe progress bar | Purple fill shrinks slightly |

---

### TC-DASH-06: Warning credit state (60-89% used)
**Account:** `power@koda.test`
**Precondition:** Credit limit $25,000, used $8,400 (34% -- below threshold)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `power@koda.test` | Dashboard loads |
| 2 | Observe progress bar color | **Purple** (34% is below 60% threshold) |
| 3 | No warning label displayed | Bottom-right shows only **34%** |

> **Note:** No mock account hits exactly 60-89%. To test amber state, buy items as `power@koda.test` until used credit exceeds 60% ($15,000+).

---

### TC-DASH-07: Credit gauge updates after KYC verification
**Account:** `new@koda.test`
**Precondition:** Credit limit $0, unverified

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `new@koda.test` | Dashboard loads, gauge shows **$0** available, **$0** limit |
| 2 | Observe progress bar | Empty (0% fill) |
| 3 | Click "Verify" on the KYC alert banner | ID Verify modal opens |
| 4 | Complete the verification flow | Modal closes |
| 5 | Observe "Available Credit" | Animated counter ticks up to **$8,000** |
| 6 | Observe "Total Limit" | Updates to **$8,000** |
| 7 | Observe progress bar | Still empty (0% used — limit increased, no orders) |

---

### TC-DASH-08: Credit gauge updates after new purchase
**Account:** `active@koda.test`
**Precondition:** Credit limit $10,000, used $2,250, available $7,750

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Gauge shows **$7,750** available, **$2,250 used**, **22%** |
| 2 | Navigate to `/store` | Product grid loads |
| 3 | Purchase "Sony WH-1000XM5" ($349) with 4-month plan | Checkout completes, redirected to dashboard |
| 4 | Observe "Available Credit" | Counter animates DOWN (available decreases) |
| 5 | Observe "used" amount | Counter animates UP (used increases) |
| 6 | Observe progress bar | Purple fill grows slightly (percentage increases) |

---

### TC-DASH-09: Amber warning color state (60-89% used)
**Account:** `active@koda.test`
**Precondition:** Must buy items to push usage above 60% ($6,000+ used)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Buy multiple items in Store to push used credit above $6,000 | Orders created |
| 3 | Return to dashboard | Gauge reflects new totals |
| 4 | Observe progress bar color | **Amber** (`#F59E0B`) fill — not purple, not red |
| 5 | Observe bottom-right | Shows percentage (60-89%), no "Near limit" label |

> **How to reach 60%:** Starting at $2,250 used, buy ~$4,000+ worth of items (e.g., iPhone $999 × 4 at 4-month term).

---

### TC-DASH-10: 100% utilized state ("Limit reached")
**Account:** `maxed@koda.test`
**Precondition:** Credit limit $5,000, available $50

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `maxed@koda.test` | Gauge shows **$50** available, **99%** |
| 2 | Navigate to Store and purchase cheapest available item that costs ≤ $50 | Checkout completes |
| 3 | Return to dashboard | Gauge updates |
| 4 | Observe "Available Credit" | Shows **$0** (or near $0) |
| 5 | Observe progress bar | Solid **red** fill spanning full width |
| 6 | Observe bottom-right label | Shows **"Limit reached"** in red + **100%** |

> **Note:** `maxed@koda.test` has $50 available. No seed product costs ≤$50, so this state requires purchasing items as `active@koda.test` and paying installments to manipulate the balance precisely, OR testing via unit test. The "Limit reached" label logic exists in code (`CreditGauge.tsx:15`) but may be unreachable through normal UI flow with current seed data.

---

### TC-DASH-11: Automation selectors (data-testid)

| Step | Action | Expected Result | Selector (`data-testid`) |
|------|--------|-----------------|--------------------------|
| 1 | Inspect gauge container | Wrapper div exists | `credit-gauge` |
| 2 | Inspect available credit value | Large number display exists | `available-credit` |
| 3 | Inspect total limit value | Limit text exists | `total-limit` |
| 4 | Inspect progress bar fill | Animated bar exists | `credit-progress-fill` |
| 5 | Inspect used credit value | Animated used text | `used-credit` |
| 6 | Inspect status label (when ≥ 90%) | Warning label exists | `credit-status-label` |
| 7 | Inspect percentage text | Percentage display exists | `credit-used-percentage` |
