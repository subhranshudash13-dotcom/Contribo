import { test, expect } from '@playwright/test';
import { MatcherPage } from './pages/MatcherPage';

test.describe('Orbit AI Matcher Flow', () => {
  let matcherPage: MatcherPage;

  test.beforeEach(async ({ page }) => {
    matcherPage = new MatcherPage(page);
    await matcherPage.goto();
  });

  test('loads Orbit AI Matcher interface without crashing', async ({ page }) => {
    await matcherPage.verifyPageLoaded();
    await expect(page).toHaveTitle(/matcher|orbit|contribo/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('matcher form elements are responsive and accessible', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const interactiveElements = await page.locator('button, input, select').count();
    expect(interactiveElements).toBeGreaterThan(0);
  });
});
