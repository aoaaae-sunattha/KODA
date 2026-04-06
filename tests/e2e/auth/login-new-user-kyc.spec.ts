import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-009: New User / KYC Deferred Login @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('new@koda.test');
  
  await expect(page).toHaveURL(/.*dashboard/);
  
  // Verify "Unverified" state in nav or dashboard
  await expect(page.locator('nav').first()).toContainText('Unverified');
  
  // Verify credit gauge shows $0 available
  const availableCredit = page.getByTestId('available-credit');
  await expect(availableCredit).toHaveText('$0');
});
