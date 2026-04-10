import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should redirect unauthenticated users to login, and login successfully to projects dashboard', async ({ page }) => {
    // Navigate to the app base URL
    await page.goto('/');

    // It should force redirect to /login
    await expect(page).toHaveURL(/.*\/login/);

    // Fill in credentials
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password123');

    // Click submit
    await page.click('button:has-text("Sign In")');

    // Wait for MSW resolving latency and assert redirect to /projects
    await expect(page).toHaveURL(/.*\/projects/);
  });
});
