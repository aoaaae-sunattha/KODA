# TC-DASH: Empty & Zero States

## Tests for when the dashboard has no orders or is in an onboarding state.

---

### TC-DASH-24: Zero orders empty state
**Account:** `fresh@koda.test`
**Precondition:** Verified, credit limit $8,000, zero orders

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `fresh@koda.test` | Dashboard loads |
| 2 | Observe below credit gauge | Empty state card with dashed border |
| 3 | Verify shopping bag icon | Purple ShoppingBag icon in cream circle |
| 4 | Verify heading | "No orders yet" |
| 5 | Verify description | "Ready to split your first purchase? Explore our curated shop." |
| 6 | Verify CTA button | "Start Shopping" button (dark background) |
| 7 | Click "Start Shopping" | Navigates to `/store` |

---

### TC-DASH-25: No "Active Purchases" or "Completed" headers when empty
**Account:** `fresh@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `fresh@koda.test` | Dashboard loads |
| 2 | Check for "Active Purchases" header | **Not visible** (no active orders) |
| 3 | Check for "Completed" header | **Not visible** (no completed orders) |
| 4 | Only empty state card is shown | Single centered card with "Start Shopping" |

---

### TC-DASH-26: New unverified user combined state
**Account:** `new@koda.test`
**Precondition:** Not verified, $0 credit, no orders, no cards

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Log in with `new@koda.test` | Dashboard loads |
| 2 | Observe alert | Purple KYC verification banner present |
| 3 | Observe credit gauge | Available Credit: **$0**, Limit: **$0**, bar empty |
| 4 | Observe orders area | Empty state card: "No orders yet" |
| 5 | Click "Start Shopping" | Navigates to store |
| 6 | Try to buy an item | Checkout blocked (unverified, triggers KYC modal) |
