# TC-DASH: Order Cards

## Component: `OrderCard`
Tests order card rendering, progress bar segments, tooltips, actions (pay, refund, simulate failure), and state transitions.

---

### TC-DASH-20: Active order card layout
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `active@koda.test` | Dashboard shows 3 order cards |
| 2 | Observe card structure | Each card shows: merchant icon (first letter), merchant name, category, term count |
| 3 | Verify price display | Total price shown in bold (e.g., "$1,000") |
| 4 | Verify payment counter | Shows "X / Y Payments" (e.g., "1 / 4 Payments") |
| 5 | Verify next due date | Shows "Next: [date]" on the right |

---

### TC-DASH-21: Progress bar segments and tooltips
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe progress bar on first order | Green (paid) + blue-gray (remaining) segments |
| 2 | Hover over the **green** segment | Tooltip appears: "Paid: $[amount]" |
| 3 | Hover over the **blue-gray** segment | Tooltip appears: "Remaining: $[amount]" |
| 4 | Move mouse away | Tooltip disappears with animation |

---

### TC-DASH-22: Refunded order - orange segment
**Account:** `active@koda.test`
**Precondition:** The "Luksus Baby" order has $180 refunded

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find the Luksus Baby order card | Card visible on dashboard |
| 2 | Observe progress bar | Three segments: green (paid) + **orange** (refunded) + blue-gray (remaining) |
| 3 | Hover over the **orange** segment | Tooltip shows "Refunded: $180" |
| 4 | Observe price area | Original price shown with ~~strikethrough~~ |
| 5 | Observe refund text | Orange text: "$180 Refunded" below the strikethrough price |

---

### TC-DASH-23: Pay Next Installment
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find an order card with a "Pay $[amount]" button | Button visible with purple background |
| 2 | Note current payment count | e.g., "1 / 4 Payments" |
| 3 | Click "Pay $[amount]" | Button click registers |
| 4 | Observe payment count | Updates to "2 / 4 Payments" |
| 5 | Observe progress bar | Green segment grows (animated) |
| 6 | Observe credit gauge | "Available Credit" increases, "used" decreases |
| 7 | Observe next due date | Updates to the following month |

---

### TC-DASH-24: Pay all installments until completion
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find order with fewest remaining payments | e.g., "1 / 4" (3 more to pay) |
| 2 | Click "Pay" repeatedly until all paid | Each click: counter increments, bar grows |
| 3 | After final payment | Order card moves from "Active Purchases" to "Completed" section |
| 4 | Observe completed section | Section header shows count, card appears muted (grayscale) |
| 5 | Hover over completed section | Grayscale lifts, opacity returns to full |

---

### TC-DASH-25: Refund button visibility rules
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find an order with 0 payments made (e.g., Aberg, just approved) | Card visible |
| 2 | Check for Refund button | **Not visible** (requires paidCount > 0) |
| 3 | Click "Pay" once on that order | Payment made, now paidCount = 1 |
| 4 | Check for Refund button | **Now visible** (Undo2 icon + "Refund" text) |

---

### TC-DASH-26: Simulate Failure
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find an active order card | "Simulate Failure" text visible (small red text) |
| 2 | Click "Simulate Failure" | Order status changes to overdue |
| 3 | Observe order card | **"Overdue" badge** appears (red pill) next to the price |
| 4 | Observe dashboard banner | **Red "Account Locked"** alert appears at top |
| 5 | Verify "Simulate Failure" button disappears | Button gone (only shown for `active` status) |

---

### TC-DASH-27: Overdue order card display
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `overdue@koda.test` | Dashboard loads |
| 2 | Find the ILLUM order card | Card visible in "Active Purchases" |
| 3 | Observe the "Overdue" badge | Red pill badge next to the price: "OVERDUE" |
| 4 | Verify "Pay" button still available | Can still pay individual installments |
| 5 | Verify "Simulate Failure" not shown | Button hidden for overdue orders |

---

### TC-DASH-28: Completed orders section
**Account:** `power@koda.test`
**Precondition:** Has 2 completed + 2 active orders

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `power@koda.test` | Dashboard loads |
| 2 | Scroll to "Completed" section | Section visible with header "Completed (2)" |
| 3 | Observe visual treatment | Cards appear **muted** (opacity 60%, grayscale) |
| 4 | Hover over the completed section | Grayscale lifts, opacity becomes 100% (smooth transition) |
| 5 | Verify no action buttons | Completed cards have no "Pay" or "Refund" buttons |
| 6 | Verify progress bar | Full green bar (100% paid) |

---

### TC-DASH-29: Active purchases count in header
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in | Dashboard loads with active orders |
| 2 | Observe section header | "Active Purchases (3)" matches actual count |
| 3 | Pay all installments on one order | Order moves to completed |
| 4 | Observe section header | Count decrements to "Active Purchases (2)" |
