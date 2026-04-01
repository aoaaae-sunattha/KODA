# CI/CD Pipeline for E2E Testing — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a GitHub Actions CI pipeline that runs lint, unit tests, and Playwright E2E tests on every PR to main — with artifact uploads, PR comments, and auto-committed reports.

**Architecture:** Single workflow file with 3 parallel jobs (lint-typecheck, unit-tests, e2e-tests). The e2e-tests job handles three post-run actions: artifact upload, PR comment via github-script, and report commit via git push. A helper script generates the markdown report from Playwright JSON output.

**Tech Stack:** GitHub Actions, Node 22, Playwright, Vitest, actions/cache, actions/github-script

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `.github/workflows/ci.yml` | CI pipeline — 3 parallel jobs |
| Create | `scripts/generate-e2e-report.mjs` | Parses Playwright JSON results → markdown report |
| Modify | `playwright.config.ts` | Add JSON reporter alongside HTML |
| Modify | `QA/README.md` | Add E2E automation + CI section |

---

### Task 1: Create branch and update Playwright config for JSON output

The CI pipeline needs machine-readable test results (JSON) to generate PR comments and markdown reports. Currently `playwright.config.ts` only outputs HTML.

**Files:**
- Modify: `playwright.config.ts:9`

- [ ] **Step 1: Create the feature branch**

```bash
git checkout main
git pull origin main
git checkout -b e2e/login
```

- [ ] **Step 2: Update Playwright reporter config**

In `playwright.config.ts`, change line 9 from:

```ts
  reporter: 'html',
```

to:

```ts
  reporter: process.env.CI
    ? [['html'], ['json', { outputFile: 'playwright-report/results.json' }]]
    : 'html',
```

This keeps local dev experience unchanged (just HTML) but adds JSON output in CI for the report generator and PR comment.

- [ ] **Step 3: Verify locally that tests still run**

```bash
npx playwright test
```

Expected: 11 tests pass, HTML report generated as before.

- [ ] **Step 4: Verify JSON output works**

```bash
CI=1 npx playwright test
ls playwright-report/results.json
```

Expected: Both `playwright-report/index.html` and `playwright-report/results.json` exist.

- [ ] **Step 5: Commit**

```bash
git add playwright.config.ts
git commit -m "chore: add JSON reporter for CI pipeline"
```

---

### Task 2: Create the report generator script

This script reads Playwright's JSON output and generates a markdown report file compatible with the existing `QA/REPORTS/` structure.

**Files:**
- Create: `scripts/generate-e2e-report.mjs`

- [ ] **Step 1: Create the scripts directory**

```bash
mkdir -p scripts
```

- [ ] **Step 2: Write the report generator**

Create `scripts/generate-e2e-report.mjs`:

```js
#!/usr/bin/env node
/**
 * Reads playwright-report/results.json and generates:
 * 1. QA/REPORTS/YYYY-MM-DD/e2e-results.md
 * 2. QA/REPORTS/LATEST_REPORT.md (overwrite)
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';

const results = JSON.parse(readFileSync('playwright-report/results.json', 'utf8'));

const today = new Date().toISOString().slice(0, 10);
const suites = results.suites ?? [];

let totalTests = 0;
let totalPassed = 0;
let totalFailed = 0;
let totalSkipped = 0;
let duration = 0;
const rows = [];

function walkSpecs(suite) {
  for (const spec of suite.specs ?? []) {
    for (const test of spec.tests ?? []) {
      totalTests++;
      const result = test.results?.[test.results.length - 1];
      const status = result?.status ?? 'unknown';
      if (status === 'passed' || status === 'expected') totalPassed++;
      else if (status === 'skipped') totalSkipped++;
      else totalFailed++;
      duration += result?.duration ?? 0;
      rows.push({
        title: spec.title,
        status: status === 'passed' || status === 'expected' ? 'PASS' : status === 'skipped' ? 'SKIP' : 'FAIL',
      });
    }
  }
  for (const child of suite.suites ?? []) {
    walkSpecs(child);
  }
}

for (const suite of suites) {
  walkSpecs(suite);
}

const durationSec = (duration / 1000).toFixed(1);
const overallStatus = totalFailed === 0 ? 'PASS' : 'FAIL';

const report = `# E2E Test Report

**Date:** ${today}
**Service:** Koda Pay
**Duration:** ${durationSec}s

## Summary

| Total | Passed | Failed | Skipped | Status |
|-------|--------|--------|---------|--------|
| ${totalTests} | ${totalPassed} | ${totalFailed} | ${totalSkipped} | ${overallStatus} |

## Test Results

| Test | Status |
|------|--------|
${rows.map(r => `| ${r.title} | ${r.status} |`).join('\n')}
`;

// Write dated report
const dir = `QA/REPORTS/${today}`;
mkdirSync(dir, { recursive: true });
writeFileSync(`${dir}/e2e-results.md`, report);

// Overwrite latest
writeFileSync('QA/REPORTS/LATEST_REPORT.md', report);

// Output summary for PR comment (read by CI)
const summary = JSON.stringify({ totalTests, totalPassed, totalFailed, totalSkipped, durationSec, overallStatus, rows });
writeFileSync('playwright-report/summary.json', summary);

console.log(`Report written to ${dir}/e2e-results.md`);
console.log(`Status: ${overallStatus} (${totalPassed}/${totalTests} passed)`);
```

- [ ] **Step 3: Test the script locally**

```bash
CI=1 npx playwright test
node scripts/generate-e2e-report.mjs
cat QA/REPORTS/LATEST_REPORT.md
```

Expected: Report shows 11 tests, all PASS, duration ~21s.

- [ ] **Step 4: Commit**

```bash
git add scripts/generate-e2e-report.mjs
git commit -m "feat: add E2E report generator script"
```

---

### Task 3: Create the CI workflow file

The main deliverable — a single GitHub Actions workflow with 3 parallel jobs.

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create the directory**

```bash
mkdir -p .github/workflows
```

- [ ] **Step 2: Write the workflow file**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  pull_request:
    branches: [main]

jobs:
  lint-typecheck:
    name: Lint & Type Check
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npm run lint
      - run: npx tsc -b

  unit-tests:
    name: Unit Tests
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: app
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: app/package-lock.json
      - run: npm ci
      - run: npm run test

  e2e-tests:
    name: E2E Tests (Playwright)
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
    steps:
      - uses: actions/checkout@v4
        with:
          ref: ${{ github.head_ref }}
          token: ${{ secrets.GITHUB_TOKEN }}

      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
          cache-dependency-path: |
            package-lock.json
            app/package-lock.json

      # Install app dependencies (needed for dev server)
      - run: npm ci
        working-directory: app

      # Install Playwright dependencies (root package.json)
      - run: npm ci

      # Cache Playwright browsers
      - name: Cache Playwright browsers
        id: playwright-cache
        uses: actions/cache@v4
        with:
          path: ~/.cache/ms-playwright
          key: playwright-${{ runner.os }}-${{ hashFiles('package-lock.json') }}

      - name: Install Playwright browsers
        if: steps.playwright-cache.outputs.cache-hit != 'true'
        run: npx playwright install --with-deps chromium

      - name: Install Playwright system deps
        if: steps.playwright-cache.outputs.cache-hit == 'true'
        run: npx playwright install-deps chromium

      # Run tests
      - name: Run Playwright tests
        run: npx playwright test

      # Generate markdown report
      - name: Generate report
        if: always()
        run: node scripts/generate-e2e-report.mjs

      # Upload HTML report as artifact
      - name: Upload Playwright report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 7

      # Post PR comment with results
      - name: Comment on PR
        if: always()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let summary;
            try {
              summary = JSON.parse(fs.readFileSync('playwright-report/summary.json', 'utf8'));
            } catch {
              summary = { totalTests: 0, totalPassed: 0, totalFailed: 0, totalSkipped: 0, durationSec: '0', overallStatus: 'ERROR', rows: [] };
            }

            const icon = summary.overallStatus === 'PASS' ? '✅' : '❌';
            const rows = summary.rows.map(r => `| ${r.title} | ${r.status === 'PASS' ? '✅' : '❌'} |`).join('\n');

            const body = `## ${icon} E2E Test Results

            | Total | Passed | Failed | Skipped | Duration |
            |-------|--------|--------|---------|----------|
            | ${summary.totalTests} | ${summary.totalPassed} | ${summary.totalFailed} | ${summary.totalSkipped} | ${summary.durationSec}s |

            <details><summary>Test details</summary>

            | Test | Status |
            |------|--------|
            ${rows}

            </details>

            **Report:** Download the full HTML report from the [Actions artifacts](${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}).
            `.replace(/^            /gm, '');

            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });
            const botComment = comments.find(c => c.body?.includes('E2E Test Results'));

            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body,
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body,
              });
            }

      # Commit report to QA/REPORTS/
      - name: Commit test report
        if: always()
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add QA/REPORTS/ || true
          git diff --cached --quiet && echo "No report changes" && exit 0
          git commit -m "ci: update E2E report [skip ci]"
          git push
```

- [ ] **Step 3: Validate YAML syntax**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"
```

Expected: "YAML valid"

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add CI pipeline with lint, unit, and E2E jobs"
```

---

### Task 4: Update QA README with automation section

Add documentation about the Playwright E2E setup and CI pipeline.

**Files:**
- Modify: `QA/README.md`

- [ ] **Step 1: Add automation section to QA/README.md**

Append after the existing "How to Use" section:

```markdown

## E2E Automation (Playwright)

Automated E2E tests live in `playwright/` at the repo root, using the Page Object Model (POM) pattern for maintainability.

```
playwright/
  tests/
    login.spec.ts        # 11 automated tests mapped to TC-LOGIN
  pages/
    LoginPage.ts         # Page Object for /login
```

### Run locally

```bash
# Run all E2E tests
npx playwright test

# Run with visible browser
npx playwright test --headed

# View HTML report
npx playwright show-report
```

### CI Pipeline

Every PR to `main` triggers 3 parallel jobs via GitHub Actions:

1. **Lint & Type Check** — `npm run lint` + `tsc -b`
2. **Unit Tests** — `npm run test` (Vitest, 6 test suites)
3. **E2E Tests** — Playwright against dev server (Chromium)

**Test results appear as:**
- Green/red status checks on the PR
- Bot comment with pass/fail summary table
- Downloadable HTML report in Actions artifacts
- Auto-committed markdown report in `QA/REPORTS/`

### Test case mapping

Each Playwright test is named after its manual TC-ID (e.g., `TC-LOGIN-01`) for traceability between manual and automated test plans.
```

- [ ] **Step 2: Commit**

```bash
git add QA/README.md
git commit -m "docs: add E2E automation and CI section to QA README"
```

---

### Task 5: Push branch and create PR

**Files:** None (git operations only)

- [ ] **Step 1: Push the branch**

```bash
git push -u origin e2e/login
```

- [ ] **Step 2: Create the PR**

```bash
gh pr create \
  --title "E2E: Login flow automation + CI pipeline" \
  --body "$(cat <<'EOF'
## Summary
- Set up GitHub Actions CI pipeline with 3 parallel jobs (lint, unit, E2E)
- Login E2E: 11 automated Playwright tests mapped to TC-LOGIN manual test cases
- Auto-generated test reports: artifact upload + PR comment + commit to QA/REPORTS/
- Page Object Model (POM) pattern for maintainable E2E tests

## What's included
- `.github/workflows/ci.yml` — full CI pipeline
- `scripts/generate-e2e-report.mjs` — JSON → markdown report converter
- `playwright.config.ts` — added JSON reporter for CI
- `QA/README.md` — added E2E automation docs

## Test plan
- [ ] CI runs all 3 jobs in parallel on this PR
- [ ] Lint & type check passes
- [ ] Unit tests pass (6 suites)
- [ ] E2E tests pass (11 tests)
- [ ] HTML report uploaded as artifact
- [ ] PR comment shows pass/fail summary
- [ ] Report committed to QA/REPORTS/

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

- [ ] **Step 3: Verify CI runs**

Go to the PR on GitHub. Confirm:
1. Three jobs appear in the checks section
2. All three show green checkmarks
3. A bot comment appears with E2E results table
4. Artifacts tab has "playwright-report" download
5. A new commit appears: `ci: update E2E report [skip ci]`

- [ ] **Step 4: Verify report was committed**

```bash
git pull
cat QA/REPORTS/LATEST_REPORT.md
```

Expected: Report shows today's date, 11 tests, all PASS.

---

### Task 6: Merge and verify

- [ ] **Step 1: Merge the PR on GitHub**

Use "Squash and merge" for a clean history.

- [ ] **Step 2: Update local main**

```bash
git checkout main
git pull origin main
```

- [ ] **Step 3: Verify workflow file is on main**

```bash
ls .github/workflows/ci.yml
```

Expected: File exists. Future PRs will now automatically run CI.

---

## Next PRs (after this plan)

Each follows the same pattern — branch from main, add spec + page object, push, PR, CI runs:

| Order | Branch | Spec file to create |
|-------|--------|-------------------|
| 2 | `e2e/dashboard` | `playwright/tests/dashboard.spec.ts` + `playwright/pages/DashboardPage.ts` |
| 3 | `e2e/store-checkout` | `playwright/tests/store-checkout.spec.ts` + `playwright/pages/StorePage.ts` |
| 4 | `e2e/refunds` | `playwright/tests/refunds.spec.ts` |
| 5 | `e2e/risk-kyc` | `playwright/tests/risk-kyc.spec.ts` |
| 6 | `e2e/card-management` | `playwright/tests/cards.spec.ts` + `playwright/pages/CardsPage.ts` |
| 7 | `e2e/merchant` | `playwright/tests/merchant.spec.ts` + `playwright/pages/MerchantPage.ts` |

No workflow changes needed — CI is already set up from PR #1.
