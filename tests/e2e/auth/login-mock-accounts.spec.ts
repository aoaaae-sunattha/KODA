import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

const mockAccounts = [
  { email: 'active@koda.test', expectedUrl: /.*dashboard/ },
  { email: 'overdue@koda.test', expectedUrl: /.*dashboard/ },
  { email: 'merchant@koda.test', expectedUrl: /.*merchant/ },
];

for (const account of mockAccounts) {
  test(`TC-LOGIN-03: Login with mock account ${account.email} @regression @auth`, async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(account.email);
    await expect(page).toHaveURL(account.expectedUrl);
  });
}
