# Manual Test Cases: Payment Schedule (KODA BNPL)

These cases cover the payment timeline visualization and installment details (US.2.1).

## TC-SCHD-001: Installment Card Display (UI)
- **Priority:** P0
- **Context:** User with an active 4-term interest-free order.
- **Steps:**
  1. Navigate to Dashboard.
  2. Click on the active order to view the schedule/timeline.
- **Expected:**
  - Timeline displays 4 distinct installment cards/points.
  - Each card shows the installment amount (Order Total / 4).
  - Each card shows the expected payment date (monthly intervals).

## TC-SCHD-002: "Upon Checkout" Label (Logic)
- **Priority:** P0
- **Context:** Any active order.
- **Steps:**
  1. View the payment schedule for a new or active order.
- **Expected:**
  - The first installment (index 0) is marked as "Paid" (if active) or "Due now" (if in checkout).
  - The date for the first installment is labeled "Upon Checkout".

## TC-SCHD-003: Extended Term Fee Note (UI/Logic)
- **Priority:** P1
- **Context:** User has selected an 18-term or 24-term plan (which carries a one-time fee).
- **Steps:**
  1. View the payment schedule for the extended term order.
- **Expected:**
  - The first installment card shows the base installment amount PLUS the one-time fee.
  - A small info icon or note explains: "Includes one-time setup fee".
  - Subsequent installments show only the base principal amount.

## TC-SCHD-004: Scrollable Timeline for Many Terms (UX)
- **Priority:** P2
- **Context:** Order with 24 installments.
- **Steps:**
  1. View the payment schedule for a 24-term order on a mobile viewport (375px).
- **Expected:**
  - The timeline is horizontally scrollable.
  - User can see all 24 installments by scrolling.
  - No layout breaking or overlapping cards.
