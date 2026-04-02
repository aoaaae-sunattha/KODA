# E2E Test Report
**Date:** 2026-04-01
**Service:** Koda Pay
**Tool:** Playwright
**Account:** Multiple (active, maxed, new, fresh, merchant)

## Summary

| Total | Passed | Failed | Skipped | Status |
|-------|--------|--------|---------|--------|
| 16 | 16 | 0 | 0 | PASS |

## Test Results

### Dashboard Credit Gauge
| ID | Name | Status | Notes |
|----|------|--------|-------|
| TC-DASH-01 | Healthy credit state | PASS | Verified $7,800 available / $2,200 used (Synced from code) |
| TC-DASH-02 | Near-limit credit state | PASS | Verified $50 available (99% used) + "Near limit" label |
| TC-DASH-03 | Zero credit (new) | PASS | Verified $0 available / 0% used |
| TC-DASH-04 | Full credit (fresh) | PASS | Verified $8,000 available / 0% used |
| TC-DASH-11 | Automation Selectors | PASS | Verified all data-testids including new `used-credit` |

### Login & Authentication
| Test | Status |
|------|--------|
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

**Summary:** 16/16 tests passed. Dashboard logic and Login flows verified.
