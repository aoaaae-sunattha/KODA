# KODA — BNPL QA Automation Project

> **Visual presentation →** open [`showcase/index.html`](showcase/index.html) in your browser for the full portfolio walkthrough.

[![104 Test Cases](https://img.shields.io/badge/Test%20Cases-104-5D5FEF?style=flat-square)](tests/manual-cases/)
[![70% Automated](https://img.shields.io/badge/Automated-70%25-3EB489?style=flat-square)](tests/e2e/)
[![CI Passing](https://img.shields.io/badge/CI-Passing-22c55e?style=flat-square)](.github/workflows/ci.yml)

---

## What is this?

**KODA** is a fully functional Buy Now, Pay Later (BNPL) app — built from scratch as a QA portfolio project for the **QA Automation Engineer** position at anyday.io.

The goal: go beyond writing tests for someone else's software. Instead, build a realistic app with complex business logic, then apply a complete QA testing cycle on top of it — from planning through automation through CI/CD.

---

## The Testing Cycle

A real QA process, applied end-to-end:

### Step 1 — Test Plan
Defined scope, priorities, and objectives before writing any test cases. 9 modules identified and prioritized by business impact (P1 = revenue-critical, P3 = supporting flows).

📄 [`tests/test-plan/test_case_progress.md`](tests/test-plan/test_case_progress.md)

---

### Step 2 — Manual Test Cases
104 test cases written by hand, one file per module. Each case includes preconditions, steps, expected result, and priority.

📁 [`tests/manual-cases/`](tests/manual-cases/)

| Module | Cases | Priority |
|--------|-------|----------|
| Auth | 23 | 🔴 P1 |
| Checkout | 27 | 🔴 P1 |
| Risk | 18 | 🔴 P1 |
| Payment | 11 | 🟠 P2 |
| Credit | 9 | 🟠 P2 |
| KYC | 3 | 🟠 P2 |
| Cards | 3 | 🟡 P3 |
| Merchant | 6 | 🟡 P3 |
| Schedule | 4 | 🟡 P3 |

---

### Step 3 — Automation Scripts
73 of 104 cases automated. P1 modules (auth, checkout, risk) are 100% covered. Atomic structure — one spec file per test case.

📁 [`tests/e2e/`](tests/e2e/) — Playwright end-to-end specs  
📁 [`app/tests/unit/`](app/tests/unit/) — Vitest unit tests for business logic

---

### Step 4 — CI/CD Pipeline
GitHub Actions runs three quality gates automatically on every pull request:

1. **Lint + Type Check** — ESLint + TypeScript compiler
2. **Unit Tests** — Vitest (business logic: fees, refunds, state)
3. **E2E Tests** — Playwright in Chromium (full user flows)

Results are posted as a comment on the PR. All three must pass before merging.

⚙️ [`.github/workflows/ci.yml`](.github/workflows/ci.yml)

---

## Tech Stack

| Layer | Tools |
|-------|-------|
| **App** | React 19, TypeScript, Vite, Zustand, Tailwind CSS v4, Framer Motion |
| **E2E Testing** | Playwright, Page Object Model |
| **Unit Testing** | Vitest |
| **CI/CD** | GitHub Actions |

---

## How to Run

**Prerequisites:** Node.js v22

```bash
# 1. Run the app (opens at http://localhost:5173)
cd app && npm install && npm run dev

# 2. Run unit tests
cd app && npm run test

# 3. Run E2E tests (auto-starts the dev server)
npx playwright install chromium   # first time only
npx playwright test

# Interactive UI mode
npx playwright test --ui
```

---

## Test Accounts

Login with any of these emails (any password works):

| Email | Scenario |
|-------|----------|
| `active@koda.test` | Standard user — 3 active orders |
| `new@koda.test` | Pre-KYC, no orders |
| `fresh@koda.test` | Verified, zero orders |
| `overdue@koda.test` | Locked account — overdue payments |
| `declined@koda.test` | Expired card — payment failed |
| `maxed@koda.test` | 99% credit used |
| `power@koda.test` | Power user, 2 cards |
| `merchant@koda.test` | Merchant back-office view |

---

## Where to Find Things

| What | Location |
|------|----------|
| Test plan & coverage tracker | [`tests/test-plan/`](tests/test-plan/) |
| Manual test cases | [`tests/manual-cases/`](tests/manual-cases/) |
| E2E automation scripts | [`tests/e2e/`](tests/e2e/) |
| Unit tests | [`app/tests/unit/`](app/tests/unit/) |
| CI/CD config | [`.github/workflows/ci.yml`](.github/workflows/ci.yml) |
| Page Object Model | [`playwright/pages/`](playwright/pages/) |
| App source code | [`app/src/`](app/src/) |
| Mock accounts detail | [`account.check.md`](account.check.md) |

---

> Full visual presentation: [`showcase/index.html`](showcase/index.html)
