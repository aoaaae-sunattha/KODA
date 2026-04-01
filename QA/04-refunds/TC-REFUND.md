# TC-REFUND: Refund Engine

## Component: `RefundModal` + store logic
Tests refund simulation, backward reconciliation, and UI updates.

---

### TC-REFUND-01: Open refund modal
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find an order with paidCount > 0 | "Refund" button visible |
| 2 | Click "Refund" button | RefundModal slides up |
| 3 | Verify modal header | "Simulate Refund" + merchant name |
| 4 | Verify max refundable amount shown | "Max: $[sum of unpaid installments]" |
| 5 | Verify quick-select buttons | 25%, 50%, 100% buttons visible |
| 6 | Verify reconciliation explanation | Two-step explanation visible |

---

### TC-REFUND-02: Quick select refund amounts

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal | Modal visible |
| 2 | Click "25%" | Input field fills with 25% of max refundable |
| 3 | Click "50%" | Input updates to 50% of max refundable |
| 4 | Click "100%" | Input updates to full max refundable amount |

---

### TC-REFUND-03: Submit partial refund
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal on order | Modal visible |
| 2 | Enter a valid amount (e.g., $100) | Amount accepted |
| 3 | Click "Apply Refund" | Spinner appears with "Processing..." text |
| 4 | Wait ~1.2 seconds | Success screen: "Refund Processed" with orange checkmark |
| 5 | Verify success message | Shows refund amount and merchant name |
| 6 | Modal auto-closes after ~1.5s | Returns to dashboard |

---

### TC-REFUND-04: Verify backward reconciliation in UI
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Apply a refund to an order | Refund processes |
| 2 | Observe order card | Orange segment appears in progress bar |
| 3 | Observe price area | Original price has ~~strikethrough~~, new total shown |
| 4 | Observe refund label | Orange text: "$X Refunded" |
| 5 | Hover over orange segment | Tooltip shows "Refunded: $X" |

---

### TC-REFUND-05: Refund validation - over max
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal | Note the max refundable amount |
| 2 | Enter amount greater than max | Input accepts the number |
| 3 | Click "Apply Refund" | Button disabled OR refund rejected (amount > max) |

---

### TC-REFUND-06: Refund validation - zero/negative

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal | Modal visible |
| 2 | Enter "0" | "Apply Refund" button disabled |
| 3 | Enter "-50" | "Apply Refund" button disabled |
| 4 | Leave field empty | "Apply Refund" button disabled |

---

### TC-REFUND-07: Refund updates credit gauge
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Note current "Available Credit" and "used" values | Record values |
| 2 | Apply a $200 refund to an order | Refund processes |
| 3 | Observe credit gauge | Available Credit increases by ~$200, used decreases |

---

### TC-REFUND-08: Close refund modal via backdrop

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal | Modal visible |
| 2 | Click the dark backdrop | Modal closes |
| 3 | No refund applied | Order card unchanged |

---

### TC-REFUND-09: Close refund modal via X button

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open refund modal | Modal visible |
| 2 | Click the X button in the header | Modal closes |
| 3 | No refund applied | Order card unchanged |

---

### TC-REFUND-10: Refund not available on zero-payment orders

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find or create an order with 0 payments made | Card visible |
| 2 | Check for "Refund" button | **Not visible** (paidCount must be > 0) |
