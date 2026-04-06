# Manual Test Cases: Checkout & Plan Selection (KODA BNPL)

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

## TC-CHKT-002: Credit Limit Guard (Negative)
- **Priority:** P0
- **User:** `maxed@koda.test` (99% used)
- **Steps:**
  1. Navigate to `/store`. Click "Buy with KODA" on **MacBook Pro 14" ($2,499)**.
- **Expected:**
  - Checkout does not open.
  - Risk Alert Modal appears with title **"Insufficient Credit"**.

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
  - First payment (installment 0): $416 + $99 = **$515**
    - Timeline card shows **"Incl. Fee"** label (`data-testid="timeline-fee-label"`)
    - Summary card reads: *"Includes first installment + $99 one-time setup fee"*
  - Installments 1–4 (indices 1–4): **$416** each
  - Last payment (installment 5): $416 + remainder ($2499 − $416×6 = **$3**) = **$419**
  - Total charged: $2,499 + $99 = **$2,598**

## TC-CHKT-004: Plan Selector "Other Options" (UI/UX)
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **MacBook Pro 14" ($2,499)**.
  2. Observe default terms **(4, 10, 18, 24)**.
  3. Click "+ other options!".
- **Expected:**
  - Terms **6, 8, and 12** expand into view.
  - Layout does not break on mobile (375px).

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

## TC-CHKT-007: Term 4 Shows "Free" Badge and Zero Fee
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **iPhone 15 Pro ($999)**.
  2. Observe term-4 row in the Plan Selector (default selected).
- **Expected:**
  - Term 4 row displays a purple **"free"** badge.
  - No fee amount shown anywhere in the summary.
  - First payment (installment 0): **$249** (0% fee, term-4)
  - Installments 1–2: **$249** each
  - Last installment (3): **$252** ($249 + $3 rounding remainder — `999 - 249×4 = 3`)
  - All 4 installments sum to **$999** (no fee charged)

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

## TC-CHKT-009: Term 24 Shows "Most Flexible" Badge
- **Priority:** P2
- **Precondition:** Logged in as **`power@koda.test`** (verified, creditLimit=$25,000 — required because Turbo Levo costs $15,500 which exceeds `fresh@koda.test`'s $8,000 limit).
- **Steps:**
  1. Open checkout for **Specialized Turbo Levo ($15,500)**.
  2. Observe term-24 row in the Plan Selector.
- **Expected:**
  - Term 24 row displays a purple **"most flexible"** badge.
  - Term 24 is **enabled** ($15,500 ≥ $15,000 threshold).

## TC-CHKT-010: Term 24 Minimum Threshold BVA
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **Eames Lounge Chair ($7,900)** (below $15,000 threshold for term-24).
  2. Observe term-24 row.
- **Expected:**
  - Term 24 is **disabled** with threshold label **"$15,000+"**.
  - Term 18 is **enabled** ($7,900 ≥ $5,000 threshold).

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

## TC-CHKT-012: Store Loads with Product Catalog
- **Priority:** P3
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Navigate to `/store`.
- **Expected:**
  - At least 3 product cards are visible.
  - Each card has a visible price and "Buy with KODA" button.
  - Products include items > $500 (iPhone, MacBook, etc.).

## TC-CHKT-013: Action Required Blocks Checkout — Payment Issue Alert
- **Priority:** P1
- **Precondition:** Logged in as `declined@koda.test` (accountStatus = 'action_required', card declined).
- **Steps:**
  1. Navigate to `/store`.
  2. Click "Buy with KODA" on any product.
  3. Click the **"Manage Cards"** button.
- **Expected:**
  - Checkout modal does **not** open.
  - **Risk Alert Modal** appears with title **"Payment Issue"**.
  - Message references updating card details to proceed.
  - CTA button reads **"Manage Cards"**.
  - User navigates to `/settings/cards` (card management page visible).
- **Guard order:** `action_required` check fires after KYC and lock checks, before credit check (3rd priority in `useCheckoutGuard`).
> **Bug Fixed:** `RiskAlertModal.tsx` previously called `navigate('/cards')` — corrected to `navigate('/settings/cards')`. TC-CHKT-017 validates this fix.

## TC-CHKT-014: Term 6/8 Threshold BVA — Disabled After Expand ($1,000 minimum)
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test`. Item price $949 < $1,000 threshold.
- **Steps:**
  1. Open checkout for **Dyson Gen5detect ($949)**.
  2. Click **"+ other options!"** to expand secondary terms.
  3. Observe terms 6 and 8.
- **Expected:**
  - Term 6 is **disabled** with label **"$1,000+"** ($949 < $1,000 threshold).
  - Term 8 is **disabled** with label **"$1,000+"** (same threshold as term 6).
  - Term 12 is **disabled** with label **"$5,000+"**.
- **Note:** This validates `TERM_THRESHOLDS` for secondary terms — only visible after expand.

## TC-CHKT-015: Checkout Modal — Close via Backdrop Click
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`, checkout modal is open.
- **Steps:**
  1. Open checkout for any product.
  2. Click the **backdrop** (dark overlay area outside the modal).
- **Expected:**
  - Modal closes.
  - User remains on `/store`.
  - No order is created.

## TC-CHKT-016: No Primary Card — Confirm Disabled (Edge Case)
- **Priority:** P1
- **Precondition:** Logged in as `fresh@koda.test` (verified, active — has 1 Mastercard ••••1234 by default).
- **Steps:**
  1. Navigate to `/settings/cards`.
  2. Remove the Mastercard ••••1234 so no cards are listed.
  3. Navigate to `/store`.
  4. Attempt checkout for any product (e.g., iPhone 15 Pro).
- **Expected:**
  - Modal opens (guard passes — account status is active).
  - Footer shows amber warning: "No payment method found. Please add one in settings."
  - "Confirm Purchase" button is disabled (grayed out).
  - Clicking the button area has no effect.

## TC-CHKT-017: action_required CTA Navigates to /settings/cards (Bug Validation)
- **Priority:** P1
- **Precondition:** Logged in as `declined@koda.test`.
- **Steps:**
  1. Navigate to `/store`.
  2. Trigger risk alert by clicking "Buy with KODA".
  3. Click the **"Manage Cards"** button.
- **Expected:**
  - User lands at `/settings/cards` (card management page), not `/login`.

## TC-CHKT-018: KYC Completion Flow — Full 3-Step Walkthrough
- **Priority:** P1
- **Precondition:** Logged in as `new@koda.test` (unverified).
- **Steps:**
  1. Navigate to `/store`.
  2. Click any buy button to trigger KYC modal.
  3. Click **"Start Verification"** → verify scanning step animates.
  4. Wait for scanning to complete (progress reaches 100%) → verify **"Verified!"** step appears.
  5. Click **"Go to Dashboard"** → verify navigation to `/dashboard`.
  6. Navigate back to `/store` → click "Buy with KODA" again.
- **Expected:**
  - Checkout modal opens (KYC gate no longer fires — user is now verified).

## TC-CHKT-019: Term Selection Change Updates Payment Timeline (Reactivity)
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **MacBook Pro 14" ($2,499)**.
  2. Verify term-4 selected by default.
  3. Click **"+ other options!"** → select **"6 Payments"**.
  4. Observe the Payment Schedule section.
- **Expected:**
  - Timeline updates immediately to show term-6 installments (first payment $515, others $416/$419).
  - The plan selector highlights term-6 row as selected.

## TC-CHKT-020: Fee Calculation Accuracy — High-Tier Term 18 on Eames Chair
- **Priority:** P2
- **Precondition:** Logged in as `fresh@koda.test`.
- **Steps:**
  1. Open checkout for **Eames Lounge Chair ($7,900)**.
  2. Select **"18 Payments"** from the Plan Selector (visible by default — term 18 is a primary term, no expand needed).
- **Expected (calculated from feeRates.ts):**
  - Fee: `Math.round(7900 × 0.1725)` = `Math.round(1362.75)` = **$1,363**
  - Base: `Math.floor(7900 / 18)` = **$438**
  - Remainder: `7900 − 438×18` = `7900 − 7884` = **$16**
  - First payment: $438 + $1,363 = **$1,801** (labeled "incl. $1,363 fee")
  - Installments 1–16: **$438** each
  - Last installment (17): $438 + $16 = **$454**
  - Total: $7,900 + $1,363 = **$9,263**

## TC-CHKT-021: Product Image Click Also Triggers Checkout Guard (Coverage)
- **Priority:** P3
- **Precondition:** Logged in as `new@koda.test`.
- **Steps:**
  1. Navigate to `/store`.
  2. Click the product image/emoji (not the button).
- **Expected:**
  - IDVerify modal appears (same guard fires as clicking "Buy with KODA").

## TC-CHKT-022: Insufficient Credit — "Back to Shop" CTA Closes Modal (P1)
- **Priority:** P1
- **User:** `maxed@koda.test` (99% used)
- **Steps:**
  1. Navigate to `/store`. Click "Buy with KODA" on **MacBook Pro 14" ($2,499)**.
  2. Verify Risk Alert Modal appears with title **"Insufficient Credit"**.
  3. Click the **"Back to Shop"** button.
- **Expected:**
  - Risk Alert Modal closes.
  - User remains on `/store`.
  - Checkout modal does not open.

## TC-CHKT-023: Locked Account — "Go to Dashboard to Pay" CTA Navigates (P1)
- **Priority:** P1
- **User:** `overdue@koda.test` (accountStatus = 'locked')
- **Steps:**
  1. Navigate to `/store`. Click "Buy with KODA" on any product.
  2. Verify Risk Alert Modal appears with title **"Account Locked"**.
  3. Click the **"Go to Dashboard to Pay"** button.
- **Expected:**
  - User navigates to `/dashboard`.
  - Risk Alert Modal is no longer visible.

## TC-CHKT-024: Checkout Modal Resets to Term-4 on Reopen (P2)
- **Priority:** P2
- **User:** `fresh@koda.test`
- **Steps:**
  1. Open checkout for **MacBook Pro 14" ($2,499)**.
  2. Click **"+ other options!"** → select **"6 Payments"**.
  3. Verify term-6 row is highlighted as selected.
  4. Click the **X** close button to dismiss the modal.
  5. Click **"Buy with KODA"** on the same product to reopen.
- **Expected:**
  - Checkout modal reopens with term-4 selected (not term-6).
  - Term-4 row is highlighted.
  - Payment schedule shows term-4 installments.
- **Note:** Driven by `useEffect([isOpen])` in `CheckoutModal.tsx` — resets `selectedTerm` to 4 whenever modal opens.

## TC-CHKT-025: Term-10 Enabled at $2,000+ Threshold BVA (P2)
- **Priority:** P2
- **User:** `fresh@koda.test`
- **Steps:**
  1. Open checkout for **MacBook Pro 14" ($2,499)**.
  2. Observe the Plan Selector — term-10 row.
- **Expected:**
  - Term-10 is enabled and clickable ($2,499 ≥ $2,000 threshold).
  - Clicking term-10 selects it (row highlights, timeline updates to 10 installments).
- **Note:** Completes the BVA pair — TC-CHKT-001 covers term-10 disabled at $949; this covers the enabled side.

## TC-CHKT-026: Risk Alert Modal — Close via X Button (P3)
- **Priority:** P3
- **User:** `maxed@koda.test`
- **Steps:**
  1. Navigate to `/store`. Click "Buy with KODA" on **MacBook Pro 14" ($2,499)**.
  2. Verify Risk Alert Modal appears.
  3. Click the **X** close button (top-right of modal).
- **Expected:**
  - Risk Alert Modal closes.
  - User remains on `/store`.
  - No checkout modal appears.

## TC-CHKT-027: Plan Selector Expand Link Disappears After Click (P3)
- **Priority:** P3
- **User:** `fresh@koda.test`
- **Steps:**
  1. Open checkout for **MacBook Pro 14" ($2,499)**.
  2. Verify **"+ other options!"** link is visible.
  3. Click **"+ other options!"**.
- **Expected:**
  - Terms 6, 8, 12 appear in the plan list.
  - The **"+ other options!"** link is no longer visible (removed from DOM when `showOtherOptions=true`).

---
## Documented Non-Testable Boundary
### Term-4 lower threshold ($300 minimum)
The catalog's cheapest item is Dyson $949 (term-4 enabled). No product currently exists below $300 in the mock data, so the boundary where term-4 becomes disabled cannot be exercised manually. This gap is inherent to the mock data. Recommendation: Add a $150 item to `seedProducts.ts` if this boundary must be verified manually.
