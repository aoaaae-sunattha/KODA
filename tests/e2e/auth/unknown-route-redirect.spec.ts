import { test, expect } from '@playwright/test';

test('TC-AUTH-020: Unknown Route Redirect @regression @auth', async ({ page }) => {
  // Navigate to a non-existent route
  await page.goto('/foobar');
  
  // Verify redirect to login
  await expect(page).toHaveURL(/.*login/);
});
