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
