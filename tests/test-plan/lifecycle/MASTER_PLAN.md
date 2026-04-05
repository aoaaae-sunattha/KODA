# Master Test Plan: End-to-End Purchase Lifecycle (KODA BNPL)

## 1. Executive Summary
This test plan defines the strategy, scope, and verification criteria for the **KODA BNPL Purchase Lifecycle**. It ensures that the core product (Buy Now, Pay Later) is technically sound, secure against unauthorized access, and handles edge cases/boundary values gracefully.

## 2. Test Scope

### 2.1 In Scope
- **Authentication:** Valid/Invalid logins, session persistence, logout.
- **KYC & Verification:** First-time user verification (mock), credit limit establishment (TC-KYC-001..003).
- **Merchant Storefront:** Product browsing, credit-guard verification, merchant settle order, payout %, merchant guard (TC-MRCH-001..003).
- **Checkout Flow:** Plan selection (4-24 terms), threshold logic, payment schedule generation.
- **Dashboard & Management:** Order visualization, flexible payments (Specific/Full), and risk states (Locked/Overdue).
- **Cards Management:** Add card, remove card, set primary card (TC-CARD-001..003).
- **Refund Engine:** Partial refunds with backward reconciliation logic.

### 2.2 Out of Scope
- Real payment gateway integration (Mocked).
- Multi-currency support (USD only).
- Merchant dashboard analytics (CRUD only).

## 3. Test Types & Strategy

| Type | Focus Area | Example |
|------|------------|---------|
| **Positive (Happy Path)** | Core Value Flow | Login -> Buy MacBook -> Confirm 4-term plan -> Pay Next installment. |
| **Negative** | Error Handling | Login with unknown email; Attempt checkout with $1 over credit limit. |
| **Boundary Value (BVA)** | Precision Logic | Purchase of exactly $300 (unlocks 4-term); Payment of exactly $0.01 remaining. |
| **Edge Case** | Non-Standard Flow | Refunding an amount larger than the last 3 installments; Refreshing during KYC delay. |
| **UI/UX** | Design Alignment | Plan selector badges (Most Flexible); Mobile responsive layout at 375px. |

## 4. Test Environment
- **URL:** `http://localhost:5173`
- **Browsers:** Chrome (Desktop/Mobile Emulation), Safari, Firefox.
- **Test Data:** Mock users (`active@koda.test`, `fresh@koda.test`, `new@koda.test`).

## 5. Entry & Exit Criteria
- **Entry:** App build passes `npm run build`; Dev server starts without errors.
- **Exit:** 100% of P0/P1 manual cases pass; 0 critical/high bugs remaining.

## 6. Risk Assessment
| Risk | Probability | Impact | Mitigation |
|------|-------------|--------|------------|
| Math Rounding Errors | Medium | High | Use precise BVA cases for fractional payments ($1.33). |
| Race Conditions (KYC) | Low | Medium | Test "Verify" button with multiple rapid clicks. |
| State Desync | Medium | High | Verify Dashboard immediately after "Confirm Purchase" or "Pay Specific". |

---
*Created on 2026-04-05 for KODA BNPL Suite.*
