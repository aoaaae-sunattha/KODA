import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-011: Empty Password Submit @smoke @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Fill valid email, leave password empty
  await loginPage.emailInput.fill('active@koda.test');
  await loginPage.submitButton.click();

  // Browser-native `required` validation prevents submission — URL stays at /login
  await expect(page).toHaveURL(/.*login/);
  await expect(loginPage.emailInput).toBeVisible();
});
