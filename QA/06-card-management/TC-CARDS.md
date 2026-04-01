# TC-CARDS: Card Management

## Route: `/settings/cards`
Tests card list, add card modal, set primary, remove, and validation.

---

### TC-CARDS-01: Card list display
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings/cards` | Cards page loads |
| 2 | Verify page header | "Payment Methods" title + description |
| 3 | Verify card entry | Shows brand icon (VISA/MC circle), last 4 digits, expiry date |
| 4 | Verify primary badge | Primary card shows "Primary" pill (purple) |
| 5 | Verify "Add Card" button | Purple button with + icon in header |

---

### TC-CARDS-02: Multiple cards display
**Account:** `power@koda.test` (2 cards)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to cards page | Both cards listed |
| 2 | Verify primary card | One card shows "Primary" badge |
| 3 | Verify non-primary card | Shows "Set primary" link + "Remove" link |
| 4 | Verify stagger animation | Cards animate in sequentially |

---

### TC-CARDS-03: Set primary card
**Account:** `power@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find the non-primary card | "Set primary" link visible |
| 2 | Click "Set primary" | Card becomes primary (badge appears) |
| 3 | Previous primary | Loses "Primary" badge, gains "Set primary" link |

---

### TC-CARDS-04: Remove non-primary card
**Account:** `power@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Find non-primary card | "Remove" link visible |
| 2 | Click "Remove" | Card animates out (opacity 0, scale down, slides left) |
| 3 | Verify card list | Only 1 card remains |
| 4 | Remaining card still primary | "Primary" badge still shown |

---

### TC-CARDS-05: Cannot remove primary card

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe primary card | No "Remove" link visible |
| 2 | Only "Primary" badge shown | Cannot delete primary card |

---

### TC-CARDS-06: Add card modal
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Add Card" button | AddCardModal opens |
| 2 | Verify form fields | Card number, expiry (MM/YY), cardholder name |
| 3 | Fill in valid details | Fields accept input |
| 4 | Verify expiry auto-slash | Typing "12" auto-formats to "12/" |
| 5 | Submit form | Card added to list |
| 6 | Verify new card appears | Card shows at bottom of list with animation |

---

### TC-CARDS-07: First card auto-primary
**Account:** `new@koda.test` (no cards)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to cards page | "No cards saved" empty state |
| 2 | Click "Add Card" | Modal opens |
| 3 | Add a card | Card created |
| 4 | Verify card is primary | Automatically set as primary (first card) |

---

### TC-CARDS-08: Empty state
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/settings/cards` | Cards page loads |
| 2 | Observe card area | White card: "No cards saved" + "Add a card to make purchases." |

---

### TC-CARDS-09: Expired card display
**Account:** `declined@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to cards page | Card list loads |
| 2 | Observe expired card | Red "Expired" badge next to last 4 digits |
| 3 | Verify expiry date shown | Shows expired date (01/26) |

---

### TC-CARDS-10: Add Card button animation

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over "Add Card" button | Button scales up slightly |
| 2 | Click and hold | Button scales down slightly (tap feedback) |
