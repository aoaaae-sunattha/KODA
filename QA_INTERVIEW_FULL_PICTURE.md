# KODA BNPL: QA Interview "Full Picture" & Testbed Overview

This document summarizes the **KODA** Buy Now, Pay Later mockup as a functional **Testbed** for demonstrating fintech QA and E2E automation.

---

## 1. The "Full Picture" (Current State)

### **A. Data Entry: The Merchant Storefront (`/store`)**
*   **Purpose:** Generate purchase data for testing different prices ($999 to $6,000).
*   **Test Scenario:** High-value vs. low-value items to verify credit limit math.

### **B. Logic Engine: The Checkout Flow (`/store` -> Modal)**
*   **Purpose:** Calculate the "Slicing" and upfront fees.
*   **Test Scenarios:**
    *   **Interest-Free:** 4 payments = 0% fee.
    *   **Extended Terms:** 6-24 months = Upfront fee added to the first installment.
    *   **Credit Block:** Correctly prevents purchase if Price > Available Credit.

### **C. State Reporter: The Shopper Dashboard (`/dashboard`)**
*   **Purpose:** Visualize the account health and payment progress.
*   **Test Scenarios:**
    *   **Credit Gauge:** Real-time feedback on "Available Credit" (Limit - Used).
    *   **Segmented Progress Bar:** Interactive visualization of **Paid**, **Refunded**, and **Remaining** amounts.
    *   **Account Locking:** Automated banners for **Locked** (overdue) and **Action Required** (declined card).

### **D. Scenario Switching: Mock Authentication (`/login`)**
*   **Purpose:** Instantly load "Edge Case" account data using pre-configured emails.
*   **Available Scenarios:**
    *   `active@koda.test`: Normal healthy user.
    *   `overdue@koda.test`: Delinquent user (locked UI).
    *   `declined@koda.test`: Expired card state.
    *   `maxed@koda.test`: 99% credit utilization.
    *   `merchant@koda.test`: Merchant settlement view.

---

## 2. Planned "Scenario Generators" (QA Tools)

To enhance your demo, we are implementing two additional "Data Generators":

1.  **ID Verification Modal (T-10):**
    *   **Goal:** Transition a `new@koda.test` user (unverified) into an `active` state during a live demo.
    *   **Demo Value:** Shows you can handle onboarding flows and conditional UI states.

2.  **Manual Overdue Trigger:**
    *   **Goal:** A "Simulate Failure" action on an active order.
    *   **Demo Value:** Demonstrates how the system handles real-time "Account Locking" and "403 State" simulation.

---

## 3. Core Fintech Logic (The "Specs")

*   **Refund Reconciliation:** Subtracts from the **last** unpaid installment first (Backward Reconciliation).
*   **Term Math:** Monthly = `(Price / Term)`. Total = `(Price + Fee)`.
*   **Account States:** `Active`, `Locked` (overdue), `Action Required` (declined card), `Unverified` (KYC pending).

---

*Last Updated: 2026-03-31*
