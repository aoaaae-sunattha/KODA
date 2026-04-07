# KODA Presentation Design Spec
**Date:** 2026-04-07  
**Goal:** Present the KODA QA project to non-tech interviewers at anyday.io for a QA Automation Engineer position.

---

## Approach: Dual-Layer (Option C)

Two deliverables that work independently:
1. **`README.md`** — rewritten for non-tech readers; mirrors the showcase in Markdown
2. **`showcase/index.html`** — self-contained dark-mode HTML presentation page

---

## HTML Showcase Page (`showcase/index.html`)

### Style
- **Theme:** Dark mode — `#0f0f1a` background, `#5D5FEF` purple + `#3EB489` green accents (matches KODA brand)
- **Font:** System UI / monospace for code blocks
- **Self-contained:** No external dependencies — single HTML file with inline CSS + JS

### Sections (in order)

| # | Section | Purpose |
|---|---------|---------|
| 1 | **Hero** | KODA name, role, 3 stat badges (104 test cases · 70% automated · CI ✓) |
| 2 | **Why I Built the App** | "To test software, you need real software to test" — 3–4 sentences |
| 3 | **Tech Stack** | App side (React/TS/Vite/Zustand/Tailwind) + QA side (Playwright/Vitest/GitHub Actions) |
| 4 | **The Testing Cycle** | Core story — 4 numbered steps with file links: Test Plan → Manual Cases → Automation → CI/CD |
| 5 | **Coverage Dashboard** | 9-module table: test case count + automation % per module, P1 = 100% |
| 6 | **CI/CD Flow** | Diagram: PR → 3 jobs → PR comment → merge; plain English explanation |
| 7 | **App Screenshots** | Login, Dashboard, Checkout modal, Risk alert |
| 8 | **How to Run It** | 3 command blocks (run app / unit tests / E2E), each with plain English label |
| 9 | **Where to Find Things** | Quick-reference file map table with repo links |

---

## README.md Rewrite

Structure:
- **Top banner** — link to `showcase/index.html` with a one-liner: "Full visual presentation → open showcase/index.html"
- **What is KODA** — 2 sentences
- **The Testing Cycle** — 4 numbered steps, each with the actual file path
- **Quick Stats** — inline badges or table (104 cases · 70% automated · 3 CI jobs)
- **Tech Stack** — two-column: App dev vs QA tools
- **How to Run** — 3 command blocks
- **Where to Find Things** — file map table
- Remove QA-practitioner-focused sections (test account checklists, selector lists) — move to a linked `docs/FOR_TESTERS.md`

---

## Source Data (from codebase)

| Item | Value |
|------|-------|
| Total manual test cases | 104 |
| Automated | 73 (70%) |
| P1 modules (100%) | auth, checkout, risk |
| P2 modules (partial) | payment 27%, credit 44%, kyc 0% |
| P3 modules (partial) | cards 0%, merchant 17%, schedule 50% |
| CI jobs | Lint+Typecheck · Unit Tests · E2E Tests |
| CI trigger | Pull request to `main` |
| App port | localhost:5173 |
| E2E framework | Playwright (root `playwright/` + `tests/e2e/`) |
| Unit test framework | Vitest (`app/tests/unit/`) |
| Test plan location | `tests/test-plan/` |
| Manual cases location | `tests/manual-cases/` |

---

## Files to Create / Modify

| Action | File |
|--------|------|
| Rewrite | `README.md` |
| Create | `showcase/index.html` |
| Create (optional) | `docs/FOR_TESTERS.md` — moved tester-only content |

---

## Out of Scope
- No new test cases
- No code changes to the app
- No screenshots to take (use existing `screenshot.png` or embed placeholder frames)
