import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-DASH-02: Near-limit credit state (>= 90% used) @regression @credit', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login('maxed@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);
  
  const availableCredit = page.getByTestId('available-credit');
  await expect(availableCredit).toHaveText('$50', { timeout: 10000 });
  
  const percentage = page.getByTestId('credit-used-percentage');
  await expect(percentage).toHaveText('99%');
  
  const statusLabel = page.getByTestId('credit-status-label');
  await expect(statusLabel).toHaveText('Near limit');
});
