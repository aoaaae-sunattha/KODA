import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-DASH-04: Full credit available (verified, no orders) @regression @credit', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login('fresh@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);
  
  const availableCredit = page.getByTestId('available-credit');
  await expect(availableCredit).toHaveText('$8,000', { timeout: 10000 });
  
  const percentage = page.getByTestId('credit-used-percentage');
  await expect(percentage).toHaveText('0%');
});
