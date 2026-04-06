# Design: User Stories Update (As-Built Sync)

**Date:** 2026-04-06
**File to update:** `UserStories/UserStories.md`
**Approach:** In-place surgery — add missing ACs to existing stories, add US.7 as a new story. No structural changes to the file.

---

## Motivation

Phases 1–7 are complete. Several features were implemented that either have no user story (Merchant Portal, Dashboard alert banners, RefundModal UI, View Schedule toggle) or extend existing stories beyond their current ACs (4-step checkout guard, OrderCard hover tooltips, completed orders section). This update syncs the document to reflect what is actually built.

---

## Patches to Existing Stories

### US.1 — Visualize Installment Progress
Add 3 new ACs:
- **AC3:** Status alert banners render at the top of the dashboard based on account state — locked (red + "Pay Now"), action_required (amber + "Update Card"), unverified (indigo + "Verify").
- **AC4:** Active/overdue orders appear in an "Active" section; completed orders appear in a separate "Completed" section below.
- **AC5:** Progress bar segments are hoverable — a tooltip shows the dollar amount for Paid, Refunded, and Remaining segments.

### US.1.5 — Browse & Select Products
Replace AC2 (was: "Validate KYC status and credit limit before opening the checkout modal"):
- **AC2:** Pre-checkout guard runs 4 checks in order: (1) KYC → opens IDVerifyModal, (2) locked → RiskAlertModal "Account Locked", (3) action_required → RiskAlertModal "Payment Issue", (4) price > available credit → RiskAlertModal "Insufficient Credit".

### US.2.1 — View Payment Schedule
Add 1 new AC:
- **AC5:** On the Dashboard, each OrderCard has a "View Schedule" / "Hide Schedule" toggle that expands the payment timeline inline.

### US.3 — Handle Partial Refund
Add 3 new ACs:
- **AC3:** Refund is initiated from a "Refund" button on the OrderCard; the button is only visible when `paidCount > 0` and unpaid balance > 0.
- **AC4:** RefundModal provides a free-form amount input and 25% / 50% / 100% quick-select shortcuts; max refundable = sum of unpaid installments only.
- **AC5:** A 1.2s simulated processing animation plays before a success screen; modal is labeled "Simulation only · No real funds moved".

### US.4 — Identity Verification (KYC)
Add 1 new AC:
- **AC3:** An indigo "Identity Verification" banner appears on the Dashboard for unverified users with a "Verify" button that opens IDVerifyModal directly (not only triggered during checkout).

### US.5 — Handle Declined Payment
Add 2 new ACs:
- **AC2:** "Update Card" CTA on the dashboard banner navigates to `/settings/cards`.
- **AC3:** Checkout is blocked at guard step 3 (action_required); RiskAlertModal shows title "Payment Issue" and CTA "Manage Cards" which navigates to `/settings/cards`.

### US.5.1 — Choose Payment Type
Add 2 new ACs:
- **AC7:** Payment Modal header shows merchant name and remaining balance.
- **AC8:** X button and "Cancel" link dismiss the modal without executing any payment.

### US.8 — Simulate Edge Case Scenarios
Update AC2, add 1 new AC:
- **AC2 (update):** "Simulate Failure" button is only visible on orders with `status === 'active'` (not on overdue or completed orders).
- **AC4:** On the Merchant Portal, a "Settle" button on a Pending MerchantOrder transitions its status to `settled` and updates the total settled aggregation in the header immediately.

---

## New Story

### US.7 — Manage Merchant Orders (PRIORITY 7)

> **As a merchant,** I want to see all KODA customer orders and settle pending payouts **so that** I can track revenue and manage receivables.

- **AC1:** Merchant dashboard lists all associated orders with status badges: Pending (amber), Settled (green), Held (red).
- **AC2:** Each row shows the original purchase amount, 2.5% commission deducted, and net payout amount.
- **AC3:** "Settle" button on a Pending order transitions it to Settled; total settled amount in the header updates immediately.
- **AC4:** Business name is displayed in the merchant portal navigation.
- **AC5:** Merchant view is restricted to `merchant` role accounts; customer accounts are not routed to `/merchant`.

---

## Placement in File

US.7 inserts between US.6 (PRIORITY 5) and US.8 (PRIORITY 7) — matching the existing priority numbering gap. No renumbering of existing stories.

---

## Self-Review

- No placeholders or TBDs.
- US.1.5 AC2 replaces old text rather than adding to avoid contradiction with the 3-step guard described in old AC2.
- US.8 AC2 is explicitly marked as an update, not an addition.
- All AC wording verified against actual source (`useCheckoutGuard.ts`, `RiskAlertModal.tsx`, `Dashboard.tsx`, `OrderCard.tsx`, `RefundModal.tsx`, `Merchant.tsx`).
- US.7 numbering is consistent with Phase 7 label in `CLAUDE.md`.
- Scope is tightly bounded to `UserStories/UserStories.md` only — no changes to `ImplementationSpecs.md` or `CLAUDE.md`.
