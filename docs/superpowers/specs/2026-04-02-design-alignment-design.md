# Phase 8.5 — Design Alignment

**Date:** 2026-04-02
**Scope:** Align 3 UI features with anyday.io production design reference.

---

## 1. Plan Selector Redesign (`PlanSelector.tsx`)

**Gap:** Current 4-column grid of 7 terms doesn't match anyday's vertical radio-button layout with progressive disclosure.

**Design:**
- Vertical stack of radio-style buttons (white rounded rows, full width)
- Primary terms visible by default: 4, 10, 18, 24
- "+ other options!" expandable link reveals terms 6, 8, 12 (inserted in numeric order)
- Badges: purple "free" pill on term 4, purple "most flexible" pill on term 24
- Selected state: filled purple radio circle, subtle purple background tint
- Disabled terms: grayed out with threshold label when purchase price is too low
- Summary card below stays as-is (total, first payment, fee breakdown)

**Test IDs:**
- `data-testid="plan-option-{term}"` on each radio row
- `data-testid="expand-other-options"` on the "+ other options!" link
- `data-testid="plan-badge-free"` and `data-testid="plan-badge-flexible"` on badges

---

## 2. Payment Timeline Redesign (`PaymentTimeline.tsx`)

**Gap:** Current vertical line with flat dots doesn't match anyday's card-based layout with circular progress rings.

**Design:**
- Vertical stack of white rounded cards (one per installment), no connecting line
- Each card has:
  - Left: circular progress ring (SVG) with installment number inside. Green stroke = paid, gray = upcoming
  - Right: bold date label ("Upon checkout" for first, month/day for rest) with "Due" subtitle
- First installment ring uses purple (primary) color
- Amount right-aligned on each card, first row includes fee note if applicable
- Scrollable container with max-height for high term counts (18, 24)

**Test IDs:**
- `data-testid="timeline-card-{index}"` on each card
- `data-testid="timeline-ring-{index}"` on each progress ring
- `data-testid="timeline-amount-{index}"` on each amount

---

## 3. Flexible Payment Modal (New: `PaymentModal.tsx`)

**Gap:** OrderCard only has a single "Pay $X" button that instantly pays the next installment. No confirmation step, no flexible payment options.

### 3a. OrderCard Change
- "Pay $X" button becomes "Pay" — opens PaymentModal instead of calling `payInstallment()` directly

### 3b. PaymentModal (combines screens.md M-05 + M-08)
- **Header:** merchant name + remaining balance
- **Body:** "Type of payment" with 3 radio options:
  1. "Pay my next installment" — shows next unpaid amount (default selected)
  2. "Pay specific amount" — reveals number input (min $1, max = remaining balance)
  3. "Pay off my balance in full" — shows total remaining
- **Confirm:** purple "Confirm Payment" button (disabled until valid selection)
- **Cancel:** "Cancel" link or X button

### 3c. New Store Actions (`useStore.ts`)
- `paySpecificAmount(orderId, amount)` — pays off installments starting from next unpaid, applying amount forward. Marks fully covered installments as paid. Remainder reduces next unpaid installment amount.
- `payFullBalance(orderId)` — marks all remaining installments as paid, sets order status to `completed`.

### 3d. Test IDs
- `data-testid="pay-btn"` on OrderCard Pay button
- `data-testid="payment-modal"` on modal wrapper
- `data-testid="payment-option-next"` / `payment-option-specific` / `payment-option-full` on radio options
- `data-testid="specific-amount-input"` on amount input
- `data-testid="confirm-payment-btn"` on confirm
- `data-testid="cancel-payment-btn"` on cancel

---

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Plan selector hidden terms | Show 4,10,18,24 primary + expandable others | Matches anyday.io progressive disclosure pattern |
| Flexible payment UI | Modal (not inline or dropdown) | Matches screens.md M-05/M-08 spec, keeps OrderCard clean |
| Phase structure | Single "Phase 8.5 — Design Alignment" | All 3 gaps stem from same design reference, one coherent deliverable |
