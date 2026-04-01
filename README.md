# KODA -- BNPL Mockup (QA & Testing Guide)

Welcome to the **KODA** testing repository. This project is a high-fidelity mockup of a Buy Now, Pay Later (BNPL) service, designed specifically for QA engineers to practice manual testing, exploratory testing, and E2E automation.

---

## Getting Started

### Prerequisites
- Node.js v22 via nvm (system Node 18 has icu4c mismatch)
- npm

### Installation
```bash
cd app
export NVM_DIR="$HOME/.nvm" && source "$NVM_DIR/nvm.sh" && nvm use 22
npm install
```

### Run the App
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## QA Testing Scenarios

The app uses **Mock Authentication**. You can trigger different account states by logging in with specific emails (any password works).

### 1. The "Happy Path" (Standard User)
- **Email:** `active@koda.test`
- **Goal:** Verify the core dashboard experience.
- **Checklist:**
    - [ ] Credit Gauge animates on load.
    - [ ] Active purchases show segmented progress bars.
    - [ ] Clicking "Pay Next" on an order card updates the progress bar and credit gauge in real-time.

### 2. KYC & Onboarding (New User)
- **Email:** `new@koda.test`
- **Goal:** Test the "Unverified" state and identity verification flow.
- **Checklist:**
    - [ ] Dashboard shows "Identity Verification" alert.
    - [ ] Credit limit is $0.
    - [ ] Clicking "Verify" opens the `IDVerifyModal`.
    - [ ] Completing verification unlocks credit ($8,000) and clears the alert.

### 3. Risk & Blocking (Locked Account)
- **Email:** `overdue@koda.test`
- **Goal:** Verify that delinquent accounts cannot make new purchases.
- **Checklist:**
    - [ ] Dashboard shows a red "Account Locked" alert.
    - [ ] Navigate to **Shop** and try to buy any item.
    - [ ] **Expectation:** The `RiskAlertModal` should appear, blocking the checkout.
    - [ ] Click "Pay Now" in the dashboard alert to unlock the account.

### 4. Credit Limits (Maxed Out)
- **Email:** `maxed@koda.test`
- **Goal:** Test "Insufficient Credit" logic.
- **Checklist:**
    - [ ] Credit gauge shows nearly 100% utilization.
    - [ ] Try to buy a high-value item (e.g., iPhone or MacBook).
    - [ ] **Expectation:** Checkout should be blocked due to "Insufficient Credit Limit".

### 5. Refund Reconciliation
- **Email:** `active@koda.test`
- **Goal:** Verify the "Backward Reconciliation" refund logic.
- **Checklist:**
    - [ ] Open an order card and click the "Refund" icon.
    - [ ] Enter a partial refund amount.
    - [ ] **Expectation:** The refund should be subtracted from the *last* unpaid installment first.

---

## Unit Testing

The business logic (fees, refunds, state transitions) is covered by Vitest.
```bash
cd app
npm run test              # single run
npm run test:watch        # watch mode
npx vitest run unit_test/CheckoutFlow.test.ts  # single file
```

---

## Project Documentation
- [Screens & Modals](screens.md) — Inventory of all UI states.
- [Technical Specs](Spec/ImplementationSpecs.md) — Business logic and math.
- [Account Scenarios](account.check.md) — Detailed list of all test accounts.
- [Design Tokens](design-reference.md) — Colors, typography, and spacing.

---

## Notes for Testers
This app is designed to be "broken" in specific ways (e.g., via the "Simulate Failure" button on order cards) to test your observation skills. If you find an unexpected edge case, document it in your test report.
