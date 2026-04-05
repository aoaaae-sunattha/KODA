import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-13: Form submission via Enter key @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.emailInput.fill('active@koda.test');
  await loginPage.passwordInput.fill('test');
  await page.keyboard.press('Enter');
  
  await expect(page).toHaveURL(/.*dashboard/);
});
