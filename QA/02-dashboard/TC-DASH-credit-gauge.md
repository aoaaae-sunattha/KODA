# TC-DASH: Credit Gauge

## Component: `CreditGauge`
Tests the credit utilization bar, animated counter, and threshold-based color changes.

---

### TC-DASH-01: Healthy credit state (< 60% used)
**Account:** `active@koda.test`
**Precondition:** Credit limit $10,000, used $2,250

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard loads |
| 2 | Observe "Available Credit" value | Shows animated counter landing on **$7,750** |
| 3 | Observe "Total Limit" | Shows **$10,000** (static, no animation) |
| 4 | Observe progress bar | Purple fill at ~22%, animates from 0 on load |
| 5 | Observe bottom-left text | Shows **$2,250 used** (animated counter) |
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
