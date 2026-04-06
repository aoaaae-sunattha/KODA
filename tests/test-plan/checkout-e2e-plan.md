# Checkout E2E — Implementation Plan for Gemini

> **Target:** Write 4 atomic Playwright specs covering TC-CHKT-001 through TC-CHKT-004.
> **Output dir:** `tests/e2e/checkout/` (create it — does not exist yet)
> **Style contract:** One test per file. TC ID in test name. Follow the same pattern as `tests/e2e/auth/login-invalid-format.spec.ts`.

---

## Context You Need

### POMs available

| Class | File | Key locators |
|---|---|---|
| `LoginPage` | `tests/e2e/pages/LoginPage.ts` | `emailInput`, `passwordInput`, `submitButton`; `login(email)` method |
| `CheckoutPage` | `tests/e2e/pages/CheckoutPage.ts` | `modal`, `confirmButton`, `closeButton`; `openCheckoutFor(name)`, `selectTerm(term)`, `confirmPurchase()` |
| `BNPLPage` | `tests/e2e/pages/BNPLPage.ts` | `termPill(term)`, `feeDisplay`, `firstPaymentDisplay`, `totalDisplay`, `timelineRows()` |

### Relevant test IDs in app source

| Component | data-testid | Notes |
|---|---|---|
| Store page | `buy-with-koda-btn` | Click to trigger checkout guard |
| Store page | `product-card` | Wraps each product card |
| PlanSelector | `plan-option-{term}` | `disabled` attribute set when price < threshold |
| PlanSelector | `expand-other-options` | Click to reveal terms 6, 8, 12 (hidden by default) |
| PlanSelector | `plan-badge-free` | Only on term-4 when available |
| CheckoutModal | `checkout-modal` | The modal itself |
| CheckoutModal | `checkout-confirm-btn` | Confirm purchase button |
| PaymentTimeline | `timeline-card-{i}` | 0-indexed installment card |
| PaymentTimeline | `timeline-amount-{i}` | Amount text on card i |
| **RiskAlertModal** | **none** | No testids — assert by text: `page.locator('h2', { hasText: 'Insufficient Credit' })` |

### Primary terms (default visible in PlanSelector)
`PRIMARY_TERMS = [4, 10, 18, 24]` — terms 6, 8, 12 are hidden until "other options" is clicked.

### Products in store (from `seedProducts.ts`)
| Name | Price | Min available term |
|---|---|---|
| Dyson Gen5detect | $949 | term-4 (>= $300) |
| iPhone 15 Pro | $999 | term-4 (>= $300) |
| MacBook Pro 14" | $2,499 | term-4 + 6 + 8 + 10 (>= $2000) |
| Sony Alpha 7R V | $3,899 | term-4…10 (>= $2000) |
| Eames Lounge Chair | $7,900 | term-4…12 (>= $5000) |
| Specialized Turbo Levo | $15,500 | all terms including 24 (>= $15000) |

### Mock accounts
| Email | Scenario |
|---|---|
| `fresh@koda.test` | Verified, creditLimit=$8,000, zero orders → plenty of credit |
| `maxed@koda.test` | creditLimit=$5,000, ~$4,950 used → **$50 available** (confirmed by `credit-near-limit-state.spec.ts`) |

---

## Spec 1 — TC-CHKT-001

**File:** `tests/e2e/checkout/checkout-term-threshold.spec.ts`
**Title:** `TC-CHKT-001: Term Threshold Disables Options (BVA) @regression @checkout`
**User:** `fresh@koda.test`

### The gap vs manual case
The manual case says "find a $299.99 item" — **no such product exists in the catalog.** Use **Dyson Gen5detect ($949)** instead. This still tests the threshold boundary: term-4 is enabled ($949 ≥ $300), but term-10 is disabled ($949 < $2,000). The threshold label `$2,000+` must be visible on the disabled option.

### Steps
1. Login as `fresh@koda.test`
2. Navigate to `/store`
3. Click "Buy with KODA" on the Dyson Gen5detect
4. Wait for checkout modal to appear (`checkout-modal` visible)
5. Assert `plan-option-4` is **not disabled** (term-4 is available for $949)
6. Assert `plan-option-10` is **disabled** (needs $2,000+)
7. Assert the disabled option contains text `$2,000+` (the threshold label rendered as `{formatCurrency(TERM_THRESHOLDS[term])}+`)
8. Terms 6, 8, 12 are hidden by default (PRIMARY_TERMS only) — no need to expand

### Key assertion pattern
```typescript
await expect(page.getByTestId('plan-option-4')).not.toBeDisabled();
await expect(page.getByTestId('plan-option-10')).toBeDisabled();
await expect(page.getByTestId('plan-option-10')).toContainText('$2,000+');
```

---

## Spec 2 — TC-CHKT-002 ⚠️ P0

**File:** `tests/e2e/checkout/checkout-credit-limit-guard.spec.ts`
**Title:** `TC-CHKT-002: Credit Limit Guard Blocks Checkout @smoke @regression @checkout`
**User:** `maxed@koda.test`

### Why this is P0
This is the primary safety gate preventing over-limit purchases. Must pass before any release.

### Steps
1. Login as `maxed@koda.test`
2. Navigate to `/store`
3. Click "Buy with KODA" on **any product** (e.g., iPhone 15 Pro — all items cost more than $50 available credit)
4. Assert the **checkout modal does NOT appear** (`checkout-modal` should NOT be visible)
5. Assert the **RiskAlertModal appears** — look for the heading `Insufficient Credit` and the message about available credit

### Key assertion pattern
```typescript
// Modal must NOT open
await expect(page.getByTestId('checkout-modal')).not.toBeVisible();

// Risk alert must appear — no testid, use text
await expect(page.locator('h2', { hasText: 'Insufficient Credit' })).toBeVisible();
// Optional: assert the credit amount in the message
await expect(page.locator('text=$50')).toBeVisible(); // available credit shown in message
```

### Note on RiskAlertModal
The component has **no data-testid**. Assert via heading text. The message text is:
`"This purchase of ${price} exceeds your available credit of ${availableCredit}."`
So `maxed@koda.test` will see: `"This purchase of $999 exceeds your available credit of $50."`

---

## Spec 3 — TC-CHKT-003

**File:** `tests/e2e/checkout/checkout-fee-calculation.spec.ts`
**Title:** `TC-CHKT-003: Fee Calculation Accuracy — MacBook $2,499 term-6 @regression @checkout`
**User:** `fresh@koda.test`

### The gap vs manual case
The manual case uses "$1,000 / term 24" — **no $1,000 product exists**, and term-24 requires $15,000 minimum. Use **MacBook Pro 14" ($2,499) with term-6** instead.

### Pre-calculated expected values (from `feeRates.ts` formulas)
```
principal = 2499, term = 6
fee_rate  = 0.0398
fee       = Math.round(2499 * 0.0398) = Math.round(99.4602) = 99
base      = Math.floor(2499 / 6)      = 416
remainder = 2499 - (416 * 6)          = 2499 - 2496 = 3
firstPayment = 416 + 99               = 515   (base + fee)
monthly      = 416                            (payments 1-4)
lastPayment  = 416 + 3                = 419   (absorbs rounding)
total        = 2499 + 99              = 2598
```

### Steps
1. Login as `fresh@koda.test`
2. Navigate to `/store`, open checkout for MacBook Pro 14"
3. Select term-6 via `page.getByTestId('plan-option-6')` — **not visible by default** (not in PRIMARY_TERMS)
   - First click `expand-other-options`, then click `plan-option-6`
4. Assert timeline amounts via `timeline-amount-{i}`:
   - `timeline-amount-0` → `$515` (first payment = base + fee)
   - `timeline-amount-1` → `$416` (regular payment)
   - `timeline-amount-5` → `$419` (last payment = base + remainder)
5. Assert total display shows `$2,598`

### Note on expand
Term-6 is NOT in PRIMARY_TERMS. You must click `expand-other-options` first before `plan-option-6` becomes visible.

---

## Spec 4 — TC-CHKT-004

**File:** `tests/e2e/checkout/checkout-plan-expand.spec.ts`
**Title:** `TC-CHKT-004: Plan Selector "Other Options" Expand @regression @checkout`
**User:** `fresh@koda.test`

### Steps
1. Login as `fresh@koda.test`
2. Navigate to `/store`, open checkout for MacBook Pro 14" ($2,499)
3. Assert initial state: only PRIMARY_TERMS [4, 10, 18, 24] are visible
   - `plan-option-6` is NOT visible
   - `plan-option-8` is NOT visible
4. Assert `expand-other-options` button is visible
5. Click `expand-other-options`
6. Assert `plan-option-6` is now visible
7. Assert `plan-option-8` is now visible
8. Assert `expand-other-options` button is gone (disappears after expand)
9. (Optional mobile): Run same flow at 375px width via `page.setViewportSize({ width: 375, height: 812 })`

### Key assertion pattern
```typescript
// Before expand
await expect(page.getByTestId('plan-option-6')).not.toBeVisible();
await expect(page.getByTestId('expand-other-options')).toBeVisible();

// Expand
await page.getByTestId('expand-other-options').click();

// After expand
await expect(page.getByTestId('plan-option-6')).toBeVisible();
await expect(page.getByTestId('plan-option-8')).toBeVisible();
await expect(page.getByTestId('expand-other-options')).not.toBeVisible();
```

---

## File naming & import template

```typescript
// tests/e2e/checkout/checkout-XXXXX.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { CheckoutPage } from '../pages/CheckoutPage';
// import { BNPLPage } from '../pages/BNPLPage';  // only if asserting fee/timeline

test('TC-CHKT-00X: Title @tag @checkout', async ({ page }) => {
  const loginPage = new LoginPage(page);
  const checkoutPage = new CheckoutPage(page);

  await loginPage.goto();
  await loginPage.login('fresh@koda.test');
  await expect(page).toHaveURL(/.*store|.*dashboard/);

  // Navigate to store if landed on dashboard
  await page.goto('/store');
  await checkoutPage.openCheckoutFor('MacBook Pro 14"');
  // ... assertions
});
```

---

## Checklist for Gemini

- [ ] Create `tests/e2e/checkout/` directory
- [ ] Write `checkout-term-threshold.spec.ts` (TC-CHKT-001)
- [ ] Write `checkout-credit-limit-guard.spec.ts` (TC-CHKT-002) — P0, do this first
- [ ] Write `checkout-fee-calculation.spec.ts` (TC-CHKT-003)
- [ ] Write `checkout-plan-expand.spec.ts` (TC-CHKT-004)
- [ ] Run `npm run test:e2e` from root and confirm all 4 pass

## Known gaps to flag in sync-export
- TC-CHKT-001: no $299.99 product — test adapted to use Dyson $949, testing threshold label display
- TC-CHKT-003: no $1,000 product for term-24 — test adapted to MacBook $2,499 / term-6 with pre-calculated values
- RiskAlertModal has no data-testids — must assert via text; if tests are brittle, add testids to the component
