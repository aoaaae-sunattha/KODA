import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-012: Invalid Email Format @smoke @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();

  // Enter a string that is not a valid email format
  await loginPage.emailInput.fill('notanemail');
  await loginPage.passwordInput.fill('anypassword');
  await loginPage.submitButton.click();

  // Browser-native `type="email"` validation prevents submission — URL stays at /login
  await expect(page).toHaveURL(/.*login/);
  await expect(loginPage.emailInput).toBeVisible();
});
