import { test, expect } from '@playwright/test';

test('TC-AUTH-007: Auth Guard Blocks Unauthenticated Access @smoke @auth', async ({ page }) => {
  // Attempt to access protected routes while logged out
  const protectedRoutes = ['/dashboard', '/store', '/settings/cards'];

  for (const route of protectedRoutes) {
    await page.goto(route);
    await expect(page).toHaveURL(/.*login/);
  }
});
