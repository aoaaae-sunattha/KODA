import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-01: Login page renders correctly @smoke @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await expect(loginPage.kodaLogo).toBeVisible();
  await expect(loginPage.tagline).toBeVisible();
  await expect(loginPage.emailInput).toHaveAttribute('placeholder', 'active@koda.test');
  await expect(loginPage.passwordInput).toHaveAttribute('placeholder', 'Any password works');
  await expect(loginPage.submitButton).toBeVisible();
  await expect(loginPage.page.locator('text=Demo accounts:')).toBeVisible();
});
