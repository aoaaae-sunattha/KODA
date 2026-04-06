import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-022: Repeated Failed Login Error Persists @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  // First failed attempt
  await loginPage.login('ghost@koda.test');
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toHaveText(/No account found/);
  
  // Second failed attempt
  await loginPage.login('nobody@koda.test');
  
  // Error message should remain visible
  await expect(loginPage.errorMessage).toBeVisible();
  await expect(loginPage.errorMessage).toHaveText(/No account found/);
});
