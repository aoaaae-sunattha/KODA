import { test, expect } from '@playwright/test';

test('TC-AUTH-019: Unauthenticated Access to /merchant @regression @auth', async ({ page }) => {
  // Navigate to /merchant while logged out
  await page.goto('/merchant');

  // Verify redirect to login
  await expect(page).toHaveURL(/.*login/);
});
