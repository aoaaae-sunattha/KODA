import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-DASH-03: Zero credit (new unverified user) @regression @credit', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await loginPage.login('new@koda.test');
  await expect(page).toHaveURL(/.*dashboard/);
  
  const availableCredit = page.getByTestId('available-credit');
  await expect(availableCredit).toHaveText('$0');
  
  const percentage = page.getByTestId('credit-used-percentage');
  await expect(percentage).toHaveText('0%');
});
