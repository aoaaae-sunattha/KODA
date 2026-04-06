import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test('TC-AUTH-021: Session isolation @regression @auth', async ({ browser }) => {
  // Context 1: Authenticate
  const context1 = await browser.newContext();
  const page1 = await context1.newPage();
  const loginPage1 = new LoginPage(page1);
  await loginPage1.goto();
  await loginPage1.login('active@koda.test');
  await expect(page1).toHaveURL(/.*dashboard/);

  // Context 2: Should be unauthenticated (simulates fresh incognito window)
  const context2 = await browser.newContext();
  const page2 = await context2.newPage();
  await page2.goto('/dashboard');
  await expect(page2).toHaveURL(/.*login/);

  await context1.close();
  await context2.close();
});
