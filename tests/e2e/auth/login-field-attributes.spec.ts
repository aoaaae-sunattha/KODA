import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-LOGIN-16: Input field attribute validation @regression @auth', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  
  await expect(loginPage.emailInput).toHaveAttribute('type', 'email');
  await expect(loginPage.emailInput).toHaveAttribute('required', '');
  
  await expect(loginPage.passwordInput).toHaveAttribute('type', 'password');
  await expect(loginPage.passwordInput).toHaveAttribute('required', '');
});
