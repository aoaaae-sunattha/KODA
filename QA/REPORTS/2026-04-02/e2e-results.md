# E2E Test Report

**Date:** 2026-04-02
**Service:** Koda Pay
**Duration:** 17.9s

## Summary

| Total | Passed | Failed | Skipped | Status |
|-------|--------|--------|---------|--------|
| 15 | 15 | 0 | 0 | PASS |

## Test Results

| Test | Status |
|------|--------|
| TC-DASH-01: Healthy credit state (< 60% used) | PASS |
| TC-DASH-02: Near-limit credit state (>= 90% used) | PASS |
| TC-DASH-03: Zero credit (new unverified user) | PASS |
| TC-DASH-04: Full credit available (verified, no orders) | PASS |
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
