# Epics: KODA BNPL Solution (Mockup Focused)

This document outlines the high-level epics for the KODA BNPL mockup, prioritized for an interview-ready prototype.

## [PRIORITY 1] Epic 1: Dashboard & Order Progress
**Goal:** High-visibility visualization of debt and repayment status.
- **Spending Limit:** Real-time credit capacity.
- **Visual Progress:** Segmented progress bars for active orders.
- **Status Segmentation:** Orders grouped by Pending, In Progress, and Completed.

## [PRIORITY 2] Epic 2: Purchase Slicing & Checkout
**Goal:** Interactive payment plan selection.
- **Dynamic Slicing:** User choice of 4, 6, 8, 10, 12, 18, or 24 payments.
- **Cost Transparency:** Upfront display of one-time fees for long-term plans.

## [PRIORITY 3] Epic 3: Refund & Adjustment Engine
**Goal:** Demonstration of dynamic recalculation.
- **Partial Refund Handling:** Visual update of remaining installments.
- **Status Indicators:** Explicit labeling of "Refunded" amounts in the UI.

## [PRIORITY 4] Epic 4: Risk, Identity & Error States
**Goal:** Showcase "Safety First" engineering.
- **KYC (Identity):** Mocked ID Verify flow.
- **Failure Handling:** UI states for "Payment Declined" or "Limit Exceeded".
- **Dunning/Recovery:** Alerts for overdue payments.

## [PRIORITY 5] Epic 5: Account & Card Management
**Goal:** Supporting settings for long-term usage.
- **Payment Methods:** Manage saved Visa/Mastercard tokens.
- **Manual Actions:** Options to pay early or pay off the full balance.
- **Flexible Payment Modal:** "Pay" button opens a modal with 3 options — pay next installment, pay a specific amount, or pay off full balance. Requires `paySpecificAmount()` and `payFullBalance()` store actions.

## [PRIORITY 6] Epic 6: Merchant Lifecycle
**Goal:** Back-office visibility (Backlog).
- **Merchant Settlement:** View of merchant payouts and commission tracking.
