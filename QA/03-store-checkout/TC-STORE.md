# TC-STORE: Product Store & Checkout

## Route: `/store`
Tests product grid, checkout modal, plan selection, and payment timeline.

---

### TC-STORE-01: Product grid loads
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/store` | Store page loads |
| 2 | Observe header | "Curated Essentials" title + subtitle |
| 3 | Count products | 6 product cards visible |
| 4 | Verify grid layout | 3 columns on desktop, 2 on tablet, 1 on mobile |
| 5 | Observe stagger animation | Cards animate in sequentially |

---

### TC-STORE-02: Product card details

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Observe any product card | Shows: emoji, product name, price, category |
| 2 | Verify "from $X/mo" text | Shows cheapest monthly payment (longest available term) |
| 3 | Verify term badge | Shows available term range (e.g., "4-12 terms") |
| 4 | Verify "Buy with KODA" button | Purple button at bottom of card |

---

### TC-STORE-03: Product card hover interactions

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Hover over a product card | Card lifts up (y: -8px) + shadow increases |
| 2 | Hover over product emoji | Emoji wobbles (rotate animation) and scales up |
| 3 | Move mouse away | Card returns to normal position |

---

### TC-STORE-04: Open checkout modal
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Buy with KODA" on any product | Checkout modal slides up from bottom |
| 2 | Verify backdrop | Dark semi-transparent overlay behind modal |
| 3 | Verify product info in modal | Correct product name and price shown |

---

### TC-STORE-05: Plan selector - term pills
**Account:** `active@koda.test`
**Product:** iPhone 16 Pro ($999)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open checkout for iPhone ($999) | Plan selector shows available terms |
| 2 | Verify available terms | Terms 4 and 6 enabled (thresholds: 4=$300, 6=$1000) |
| 3 | Verify disabled terms | Terms 8+ are disabled/greyed (require $1000+) |
| 4 | Select term 4 | Pill highlights purple, shows $0 fee ("Free" badge) |
| 5 | Select term 6 | Fee updates to 3.98%, monthly payment recalculates |

---

### TC-STORE-06: Plan selector - fee calculation
**Account:** `active@koda.test`
**Product:** MacBook Pro ($2,499)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open checkout for MacBook ($2,499) | Plan selector loads |
| 2 | Select term 4 | Monthly: $624.75, Fee: $0, Total: $2,499 |
| 3 | Select term 10 | Monthly: $249.90, Fee: $199.93 (7.997%), Total: $2,698.93 |
| 4 | Verify "Free" badge | Only shown on term 4 |

---

### TC-STORE-07: Payment timeline
**Account:** `active@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open checkout, select a term | Payment timeline visible |
| 2 | Verify first payment | Shows "Today" + amount includes fee (for terms > 4) |
| 3 | Verify subsequent payments | Monthly dates, equal amounts (no fee included) |
| 4 | Verify payment count | Matches selected term |
| 5 | Switch terms | Timeline updates with new dates and amounts |

---

### TC-STORE-08: Confirm purchase
**Account:** `fresh@koda.test` (clean slate)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Open checkout for any affordable product | Modal opens |
| 2 | Select a term | Plan details shown |
| 3 | Click "Confirm Purchase" | Order created |
| 4 | Navigate to `/dashboard` | New order card appears in "Active Purchases" |
| 5 | Verify credit gauge | "Available Credit" decreased by purchase amount |

---

### TC-STORE-09: Checkout blocked - insufficient credit
**Account:** `maxed@koda.test` (only $50 available)

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Click "Buy with KODA" on iPhone ($999) | RiskAlertModal appears (not checkout) |
| 2 | Verify error message | "Insufficient Credit Limit" or similar |
| 3 | Modal prevents checkout | No order created |

---

### TC-STORE-10: Checkout blocked - locked account
**Account:** `overdue@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/store` | Store loads |
| 2 | Click "Buy with KODA" on any product | RiskAlertModal appears |
| 3 | Verify error message | Account locked message |

---

### TC-STORE-11: Checkout blocked - unverified (KYC)
**Account:** `new@koda.test`

| Step | Action | Expected Result |
|------|--------|-----------------|
| 1 | Navigate to `/store` | Store loads |
| 2 | Click "Buy with KODA" on any product | IDVerifyModal opens (not checkout, not risk alert) |
| 3 | Verify this is the KYC modal | "Identity Verify" title with shield icon |

---

### TC-STORE-12: Checkout validation order
The pre-checkout guard checks in this order: KYC -> Locked -> Credit. Verify priority:

| Account | First Block | Why |
|---------|------------|-----|
| `new@koda.test` | KYC modal | Not verified (checked first) |
| `overdue@koda.test` | Risk alert | Locked (checked second) |
| `maxed@koda.test` | Risk alert | Insufficient credit (checked third) |
