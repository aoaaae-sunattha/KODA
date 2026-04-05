import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-04: Invalid email (verify error message) @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('invalid@koda.test');
  
  // Verify error message
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toHaveText(/No account found/);
});
