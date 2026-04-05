import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-17: Verification of Automation Selectors (Data-TestIDs) @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await expect(loginPage.loginForm).toBeVisible();
  await expect(loginPage.emailInput).toBeVisible();
  await expect(loginPage.passwordInput).toBeVisible();
  await expect(loginPage.submitButton).toBeVisible();
  
  await loginPage.login('invalid@koda.test');
  await expect(loginPage.errorMessage).toBeVisible();
});
