# Checkout Module — Manual Case Fix + Gap Fill Plan
> **For:** Gemini (implementation)
> **Source:** `qa-module-review checkout` output by Claude
> **Do NOT start automation yet — fix manual cases first, then write specs.**

---

## Overview

`CHECKOUT_CASES.md` has 4 cases. **2 are broken** (wrong test data). **8 gaps** identified.
Total after fixes: **12 cases** (TC-CHKT-001 through TC-CHKT-012).

---

## Part 1 — Fix Existing Cases in `CHECKOUT_CASES.md`

### Fix 1 — TC-CHKT-001 (broken test data)

**Problem:** Steps say "find an item priced exactly $299.99" — no such product in catalog. At $299.99, term-4 would be disabled (needs $300+). But the cheapest real product is Dyson $949, where term-4 IS enabled.

**Rewrite the case:**

```markdown
## TC-CHKT-001: Term Threshold Disables Unavailable Options (BVA)
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test` (verified, $0 balance).
- **Steps:**
  1. Navigate to `/store`.
  2. Click "Buy with KODA" on the **Dyson Gen5detect ($949)**.
  3. Observe the Plan Selector inside the checkout modal.
- **Expected:**
  - Term 4 is **enabled** (row is clickable — $949 ≥ $300 threshold).
  - Term 10 is **disabled** (grayed out — $949 < $2,000 threshold).
  - Term 10 row shows the label **"$2,000+"**.
  - Term 18 is **disabled** with label **"$5,000+"**.
  - Term 24 is **disabled** with label **"$15,000+"**.
```

---

### Fix 2 — TC-CHKT-003 (broken test data + wrong expected values)

**Problem:** "$1,000 | Term 24" — no $1,000 product exists. Term-24 requires $15,000 minimum. The expected values ($275 first payment, $41 monthly) are mathematically correct for $1k/24 but completely unreachable in the app.

**Rewrite the case:**

```markdown
## TC-CHKT-003: Fee Calculation Accuracy — MacBook $2,499 / Term 6 (BVA)
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Navigate to `/store`, click "Buy with KODA" on **MacBook Pro 14" ($2,499)**.
  2. In the Plan Selector, click **"+ other options!"** to expand secondary terms.
  3. Select **"6 Payments"**.
  4. Review the payment timeline below the selector.
- **Expected (calculated from `feeRates.ts`):**
  - Fee rate: 3.98% → fee = `Math.round(2499 × 0.0398)` = **$99**
  - Monthly base: `Math.floor(2499 / 6)` = **$416**
  - First payment (installment 0): $416 + $99 = **$515** (labeled "incl. $99 fee")
  - Payments 1–4: **$416** each
  - Last payment (installment 5): $416 + remainder ($2499 − $416×6 = **$3**) = **$419**
  - Total charged: $2,499 + $99 = **$2,598**
```

---

### Fix 3 — TC-CHKT-004 (wrong test data, non-blocking)

**Problem:** Steps say "open checkout for a $1,000 item" — no such product.

**One-line fix:** Change "a $1,000 item" → "**MacBook Pro 14" ($2,499)**" in Steps 1 and 2.

---

## Part 2 — Add New Cases to `CHECKOUT_CASES.md`

Append these after TC-CHKT-004 in the file.

---

### TC-CHKT-005: KYC Gate Blocks Checkout — IDVerify Modal Shown
```markdown
## TC-CHKT-005: KYC Gate Blocks Checkout — IDVerify Modal Shown
- **Priority:** P0
- **Precondition:** Logged in as `new@koda.test` (unverified, `kyc_pending`).
- **Steps:**
  1. Navigate to `/store`.
  2. Click "Buy with KODA" on any product.
- **Expected:**
  - Checkout modal does **not** open.
  - **ID Verify Modal** appears instead (KYC prompt).
  - No risk alert is shown.
- **Guard order:** KYC check fires before credit limit check (per `useCheckoutGuard` priority).
```

---

### TC-CHKT-006: Happy Path — Checkout Completion
```markdown
## TC-CHKT-006: Checkout Completion — Success Toast + Dashboard Redirect
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test` (verified, $0 balance, $8,000 credit).
- **Steps:**
  1. Navigate to `/store`.
  2. Click "Buy with KODA" on **iPhone 15 Pro ($999)**.
  3. Verify checkout modal opens with term-4 selected by default.
  4. Click **"Confirm Purchase"**.
- **Expected:**
  - Success toast appears briefly.
  - App navigates to `/dashboard` after ~2 seconds.
  - New order for "iPhone 15 Pro" appears on the dashboard.
```

---

### TC-CHKT-007: Term 4 — Free Badge + Zero Fee
```markdown
## TC-CHKT-007: Term 4 Shows "Free" Badge and Zero Fee
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **iPhone 15 Pro ($999)**.
  2. Observe term-4 row in the Plan Selector (default selected).
- **Expected:**
  - Term 4 row displays a purple **"free"** badge.
  - No fee amount shown anywhere in the summary.
  - First payment = monthly payment = `Math.floor(999/4)` = **$249**.
```

---

### TC-CHKT-008: Locked Account Blocks Checkout
```markdown
## TC-CHKT-008: Locked Account Blocks Checkout — Account Locked Alert
- **Priority:** P1
- **Precondition:** Logged in as `overdue@koda.test` (accountStatus = 'locked').
- **Steps:**
  1. Navigate to `/store`.
  2. Click "Buy with KODA" on any product.
- **Expected:**
  - Checkout modal does **not** open.
  - **Risk Alert Modal** appears with title **"Account Locked"**.
  - Message says account is locked due to overdue payments.
  - CTA button reads **"Go to Dashboard to Pay"**.
- **Guard order:** Lock check fires after KYC, before credit check.
```

---

### TC-CHKT-009: Term 24 Shows "Most Flexible" Badge
```markdown
## TC-CHKT-009: Term 24 Shows "Most Flexible" Badge
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **Specialized Turbo Levo ($15,500)** (only product unlocking term 24).
  2. Observe term-24 row in the Plan Selector.
- **Expected:**
  - Term 24 row displays a purple **"most flexible"** badge.
  - Term 24 is **enabled** ($15,500 ≥ $15,000 threshold).
```

---

### TC-CHKT-010: Term 24 Threshold BVA ($15,000 minimum)
```markdown
## TC-CHKT-010: Term 24 Minimum Threshold BVA
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **Eames Lounge Chair ($7,900)** (below $15,000 threshold for term-24).
  2. Observe term-24 row.
- **Expected:**
  - Term 24 is **disabled** with threshold label **"$15,000+"**.
  - Term 18 is **enabled** ($7,900 ≥ $5,000 threshold).
```

---

### TC-CHKT-011: Checkout Modal Dismissal
```markdown
## TC-CHKT-011: Checkout Modal — Close via X Button
- **Priority:** P3
- **Precondition:** Logged in as `fresh@koda.test`, checkout modal is open.
- **Steps:**
  1. Open checkout for any product.
  2. Click the **X** close button on the modal.
- **Expected:**
  - Modal closes.
  - User remains on `/store`.
  - No order is created.
```

---

### TC-CHKT-012: Store Renders Product Catalog
```markdown
## TC-CHKT-012: Store Loads with Product Catalog
- **Priority:** P3
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Navigate to `/store`.
- **Expected:**
  - At least 3 product cards are visible.
  - Each card has a visible price and "Buy with KODA" button.
  - Products include items > $500 (iPhone, MacBook, etc.).
```

---

## Part 3 — After Manual Cases Are Fixed: Write E2E Specs

Once `CHECKOUT_CASES.md` is updated, create `tests/e2e/checkout/` and write one spec per TC:

| File | Covers | Priority | User | Notes |
|------|--------|----------|------|-------|
| `checkout-credit-limit-guard.spec.ts` | TC-CHKT-002 | P0 | `maxed@koda.test` ($50 credit) | Any product triggers guard |
| `checkout-kyc-gate.spec.ts` | TC-CHKT-005 | P0 | `new@koda.test` | Assert IDVerify modal visible, checkout-modal NOT visible |
| `checkout-happy-path.spec.ts` | TC-CHKT-006 | P1 | `fresh@koda.test` | Confirm → toast → dashboard redirect |
| `checkout-term-threshold.spec.ts` | TC-CHKT-001 | P1 | `fresh@koda.test` | Dyson $949; assert term-10 disabled with "$2,000+" |
| `checkout-fee-calculation.spec.ts` | TC-CHKT-003 | P1 | `fresh@koda.test` | MacBook $2499 / term-6; exact $ assertions on timeline |
| `checkout-locked-account.spec.ts` | TC-CHKT-008 | P1 | `overdue@koda.test` | Assert "Account Locked" heading visible |
| `checkout-plan-expand.spec.ts` | TC-CHKT-004 | P2 | `fresh@koda.test` | MacBook; before/after expand-other-options |
| `checkout-free-badge.spec.ts` | TC-CHKT-007 | P2 | `fresh@koda.test` | iPhone $999; plan-badge-free visible on term-4 |
| `checkout-term24-badge.spec.ts` | TC-CHKT-009 | P2 | `fresh@koda.test` | Turbo Levo $15500; plan-badge-flexible visible |
| `checkout-term24-threshold.spec.ts` | TC-CHKT-010 | P2 | `fresh@koda.test` | Eames $7900; term-24 disabled with "$15,000+" |
| `checkout-modal-close.spec.ts` | TC-CHKT-011 | P3 | `fresh@koda.test` | Close via checkout-close testid; URL stays /store |
| `checkout-store-renders.spec.ts` | TC-CHKT-012 | P3 | `fresh@koda.test` | Count product cards >= 3 |

### Key testids for specs

| Element | data-testid | Notes |
|---------|-------------|-------|
| Buy button | `buy-with-koda-btn` | `.first()` or match by product name |
| Checkout modal | `checkout-modal` | Assert visible / not visible |
| Close button | `checkout-close` | Inside modal |
| Confirm button | `checkout-confirm-btn` | Inside modal |
| Plan option | `plan-option-{term}` | Has `disabled` attr when unavailable |
| Free badge | `plan-badge-free` | Term-4 only |
| Flexible badge | `plan-badge-flexible` | Term-24 only |
| Expand link | `expand-other-options` | Disappears after click |
| Timeline amount | `timeline-amount-{i}` | 0-indexed per installment |
| **RiskAlertModal** | `risk-alert-modal`, `risk-alert-title`, `risk-alert-message`, `risk-alert-btn`, `risk-alert-close` | Use testids directly — do not assert by text |
| **IDVerifyModal** | check source | Needs verification before scripting |

### Import template for all specs
```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';
// import { BNPLPage } from '../pages/BNPLPage'; // for fee/timeline assertions

test('TC-CHKT-00X: Title @tag @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);
  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await page.goto('/store');
  // ...
});
```

---

## Gemini Execution Order

1. **Edit `tests/manual-cases/checkout/CHECKOUT_CASES.md`** — apply Fix 1, Fix 2, Fix 3, append TC-CHKT-005 through TC-CHKT-012
2. **Verify** IDVerifyModal testids in `app/src/components/checkout/IDVerifyModal.tsx` before scripting TC-CHKT-005
3. **Create `tests/e2e/checkout/`**
4. **Write specs** in priority order: P0 first (TC-CHKT-002, TC-CHKT-005), then P1, then P2/P3
5. **Run** `npm run test:e2e` from root, confirm all pass
6. **sync-export** with results
