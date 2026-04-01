# TC-MERCHANT: Merchant Portal

## Route: `/merchant`
Tests settlement table, commission math, settle action, and real-time integration.

---

### TC-MERCHANT-01: Merchant portal loads
**Account:** `merchant@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `merchant@koda.test` | Merchant portal loads (not shopper dashboard) |
| 2 | Verify merchant nav | "KODA.merchant" branding, business name, logout button |
| 3 | Verify summary card | "Total Settled Payouts" with animated counter |
| 4 | Verify stats boxes | "Total Orders" count + "Pending" count |

---

### TC-MERCHANT-02: Settlement table data
**Account:** `merchant@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe table headers | Order ID, Date, Gross Amount, KODA Fee (2.5%), Net Payout, Status, Action |
| 2 | Verify commission math | Fee = Amount * 0.025, Payout = Amount - Fee |
| 3 | Spot check: $1,000 order | Fee: $25, Payout: $975 |
| 4 | Spot check: $5,000 order | Fee: $125, Payout: $4,875 |

---

### TC-MERCHANT-03: Settlement status badges

| Status | Expected Badge |
|--------|---------------|
| Settled | Green badge with checkmark |
| Pending | Amber badge with clock icon |
| Held | Red badge with alert icon |

---

### TC-MERCHANT-04: Settle a pending order
**Account:** `merchant@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find a row with "Pending" status | "Settle" button visible |
| 2 | Click "Settle" | Row animates, status changes to "Settled" |
| 3 | Observe "Total Settled Payouts" | Counter animates UP by the payout amount |
| 4 | Observe "Pending" count | Decrements by 1 |
| 5 | Observe success toast | Green toast: "Payout Settled Successfully!" at bottom |
| 6 | Toast auto-dismisses | Disappears after ~2 seconds |

---

### TC-MERCHANT-05: Settled row shows "Completed"

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find a settled row | Action column shows "COMPLETED" text (not a button) |
| 2 | Verify no settle button | Cannot re-settle an already settled order |

---

### TC-MERCHANT-06: Real-time merchant integration
**This tests the cross-role flow.**

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in as `merchant@koda.test` | Note current order count |
| 2 | Log out | Return to login |
| 3 | Log in as `fresh@koda.test` | Shopper dashboard loads |
| 4 | Buy a product (any term) | Order confirmed |
| 5 | Log out, log back in as merchant | Merchant portal loads |
| 6 | Verify new row in settlement table | New order appears with "Pending" status |
| 7 | Verify commission calculated | 2.5% of gross amount |

---

### TC-MERCHANT-07: Empty settlement table

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | If no orders exist | Empty state shows icon + "No settlements yet" |
| 2 | Verify message | "New payouts will appear here as customers complete their purchases." |

---

### TC-MERCHANT-08: Merchant logout

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Log out" in merchant nav | Redirected to `/login` |
| 2 | Try navigating to `/merchant` | Redirected to `/login` |

---

### TC-MERCHANT-09: Summary counter animation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Load merchant portal | "Total Settled Payouts" counter animates from $0 to current total |
| 2 | Settle a pending order | Counter animates from old total to new total (smooth transition) |

---

### TC-MERCHANT-10: Responsive layout

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | View at desktop width | Summary card: side-by-side layout (stats on right) |
| 2 | Resize to mobile | Summary card: stacked layout (stats below total) |
| 3 | Verify table | Horizontally scrollable on mobile |
