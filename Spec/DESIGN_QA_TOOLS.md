# DESIGN: QA Scenario Generators (T-10 & Manual Overdue)

## 1. ID Verification Flow (T-10)
**Goal:** Transition a `new` user to `active` status via a mock KYC process.

### **UI Components**
- **Trigger:** The existing "Verify" button on `Dashboard.tsx`.
- **Modal (`IDVerifyModal.tsx`):**
    - A slide-up modal using `Framer Motion`.
    - **Step 1:** "Scanning your document..." (2-second animated progress bar).
    - **Step 2:** "Identity Verified!" (Green checkmark animation).
    - **Action:** Calls `verifyKYC()` in `useStore.ts` upon completion.

---

## 2. Manual Overdue Trigger (Simulation)
**Goal:** Allow the user to "break" an account during a demo to show error state handling.

### **Store Logic (`useStore.ts`)**
- **Action:** `simulateFailure(orderId)`
    - Updates `order.status = 'overdue'`.
    - Updates `currentUser.accountStatus = 'locked'`.
    - Sets `currentUser.overdueAmount` to the value of the next installment.

### **UI Implementation (`OrderCard.tsx`)**
- **Trigger:** A small, subtle button labeled "Simulate Failure" visible only on active orders.
- **Feedback:** UI instantly triggers the red "Account Locked" banner and blocks checkout.

---

## 3. Success Metrics for QA Demo
- [ ] User can log in as `new@koda.test` and become verified in < 5 seconds.
- [ ] User can log in as `active@koda.test`, fail a payment, and see the account lock.
- [ ] Locked status correctly blocks the "Buy" button in the store (verified by `useCheckoutGuard`).
