import { test, expect } from '@playwright/test';
import { DashboardPage } from './pages/DashboardPage';

test.describe('Dashboard & Command Center', () => {
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();
  });

  test('loads dashboard or prompts login without throwing 500 error', async ({ page }) => {
    await dashboardPage.verifyPageLoaded();
    await expect(page.locator('body')).toBeVisible();
  });

  test('navbar and common navigation links remain present', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });
});
