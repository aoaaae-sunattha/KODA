# E2E Test Report

**Date:** 2026-04-05
**Service:** Koda Pay
**Duration:** 64.9s

## Summary

| Total | Passed | Failed | Skipped | Status |
|-------|--------|--------|---------|--------|
| 51 | 50 | 1 | 0 | FAIL |

## Test Results

| Test | Status |
|------|--------|
| TC-LOGIN-01: Login page renders correctly @smoke @auth | PASS |
| TC-LOGIN-01: Login page renders correctly @smoke @auth | PASS |
| TC-LOGIN-15: Demo shortcut data-binding @regression @auth | PASS |
| TC-LOGIN-15: Demo shortcut data-binding @regression @auth | PASS |
| TC-LOGIN-13: Form submission via Enter key @regression @auth | PASS |
| TC-LOGIN-13: Form submission via Enter key @regression @auth | PASS |
| TC-LOGIN-16: Input field attribute validation @regression @auth | PASS |
| TC-LOGIN-16: Input field attribute validation @regression @auth | PASS |
| TC-LOGIN-04: Invalid email (verify error message) @regression @auth | PASS |
| TC-LOGIN-04: Invalid email (verify error message) @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account active@koda.test @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account overdue@koda.test @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account merchant@koda.test @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account active@koda.test @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account overdue@koda.test @regression @auth | PASS |
| TC-LOGIN-03: Login with mock account merchant@koda.test @regression @auth | PASS |
| TC-LOGIN-17: Verification of Automation Selectors (Data-TestIDs) @regression @auth | PASS |
| TC-LOGIN-17: Verification of Automation Selectors (Data-TestIDs) @regression @auth | PASS |
| TC-LOGIN-14: Session persistence on page refresh @regression @auth | PASS |
| TC-LOGIN-14: Session persistence on page refresh @regression @auth | PASS |
| TC-LOGIN-02: Successful login with valid email @regression @auth | PASS |
| TC-LOGIN-02: Successful login with valid email @regression @auth | PASS |
| TC-DASH-01: Healthy credit state (< 60% used) | PASS |
| TC-DASH-02: Near-limit credit state (>= 90% used) | PASS |
| TC-DASH-03: Zero credit (new unverified user) | PASS |
| TC-DASH-04: Full credit available (verified, no orders) | PASS |
| shows primary terms and hides secondary terms by default | PASS |
| expands secondary terms when "+ other options!" is clicked | PASS |
| shows free badge on term 4 and most flexible on term 24 | PASS |
| renders timeline cards with progress rings | PASS |
| first card shows "Upon checkout" | FAIL |
| opens payment modal when Pay button is clicked | PASS |
| shows all 3 payment options | PASS |
| pay next installment updates order card | PASS |
| pay specific amount shows input field | PASS |
| pay off full balance completes the order | PASS |
| cancel closes the modal | PASS |
| TC-LOGIN-01: Login page renders correctly | PASS |
| TC-LOGIN-02: Successful login with valid email | PASS |
| TC-LOGIN-03: Login with mock account active@koda.test | PASS |
| TC-LOGIN-03: Login with mock account overdue@koda.test | PASS |
| TC-LOGIN-03: Login with mock account merchant@koda.test | PASS |
| TC-LOGIN-04: Invalid email (verify error message) | PASS |
| TC-LOGIN-13: Form submission via Enter key | PASS |
| TC-LOGIN-14: Session persistence on page refresh | PASS |
| TC-LOGIN-15: Demo shortcut data-binding | PASS |
| TC-LOGIN-16: Input field attribute validation | PASS |
| TC-LOGIN-17: Verification of Automation Selectors (Data-TestIDs) | PASS |
| TC-SMOKE-01: Critical path — Login → Store → BNPL → Dashboard | PASS |
| TC-SMOKE-02: Auth guard blocks unauthenticated access | PASS |
| TC-SMOKE-03: Merchant guard blocks shoppers from /merchant | PASS |
