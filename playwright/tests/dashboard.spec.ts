import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Dashboard - Credit Gauge', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC-DASH-01: Healthy credit state (< 60% used)', async ({ page }) => {
    // 1. Log in with active@koda.test
    await loginPage.login('active@koda.test');
    
    // Wait for dashboard to load
    await expect(page).toHaveURL(/.*dashboard/);
    
    // 2. Observe "Available Credit" value
    const availableCredit = page.getByTestId('available-credit');
    await expect(availableCredit).toBeVisible();
    // Actual code truth: $7,800
    await expect(availableCredit).toHaveText('$7,800', { timeout: 10000 });
    
    // 3. Observe "Total Limit"
    const totalLimit = page.getByTestId('total-limit');
    await expect(totalLimit).toHaveText(/.*\$10,000/);
    
    // 4. Observe progress bar fill
    const progressFill = page.getByTestId('credit-progress-fill');
    await expect(progressFill).toBeVisible();
    // Check color (purple is default)
    
    // 5. Observe used amount
    const usedCredit = page.getByTestId('used-credit');
    await expect(usedCredit).toHaveText('$2,200');
    
    // 6. Observe percentage
    const percentage = page.getByTestId('credit-used-percentage');
    await expect(percentage).toHaveText('22%');
  });

  test('TC-DASH-02: Near-limit credit state (>= 90% used)', async ({ page }) => {
    await loginPage.login('maxed@koda.test');
    await expect(page).toHaveURL(/.*dashboard/);
    
    const availableCredit = page.getByTestId('available-credit');
    await expect(availableCredit).toHaveText('$50', { timeout: 10000 });
    
    const percentage = page.getByTestId('credit-used-percentage');
    await expect(percentage).toHaveText('99%');
    
    const statusLabel = page.getByTestId('credit-status-label');
    await expect(statusLabel).toHaveText('Near limit');
  });

  test('TC-DASH-03: Zero credit (new unverified user)', async ({ page }) => {
    await loginPage.login('new@koda.test');
    await expect(page).toHaveURL(/.*dashboard/);
    
    const availableCredit = page.getByTestId('available-credit');
    await expect(availableCredit).toHaveText('$0');
    
    const percentage = page.getByTestId('credit-used-percentage');
    await expect(percentage).toHaveText('0%');
  });

  test('TC-DASH-04: Full credit available (verified, no orders)', async ({ page }) => {
    await loginPage.login('fresh@koda.test');
    await expect(page).toHaveURL(/.*dashboard/);
    
    const availableCredit = page.getByTestId('available-credit');
    await expect(availableCredit).toHaveText('$8,000', { timeout: 10000 });
    
    const percentage = page.getByTestId('credit-used-percentage');
    await expect(percentage).toHaveText('0%');
  });
});
