import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-DASH-01: Healthy credit state (< 60% used) @regression @credit', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // 1. Log in with active@koda.test
  await loginPage.login('active@koda.test');
  
  // Wait for dashboard to load
  await expect(page).toHaveURL(/.*dashboard/);
  
  // 2. Observe "Available Credit" value
  const availableCredit = page.getByTestId('available-credit');
  await expect(availableCredit).toBeVisible();
  await expect(availableCredit).toHaveText('$7,800', { timeout: 10000 });
  
  // 3. Observe "Total Limit"
  const totalLimit = page.getByTestId('total-limit');
  await expect(totalLimit).toHaveText(/.*\$10,000/);
  
  // 4. Observe progress bar fill
  const progressFill = page.getByTestId('credit-progress-fill');
  await expect(progressFill).toBeVisible();
  
  // 5. Observe used amount
  const usedCredit = page.getByTestId('used-credit');
  await expect(usedCredit).toHaveText('$2,200');
  
  // 6. Observe percentage
  const percentage = page.getByTestId('credit-used-percentage');
  await expect(percentage).toHaveText('22%');
});
