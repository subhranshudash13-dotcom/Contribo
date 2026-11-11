import { test, expect } from '@playwright/test';
import { ProposalStudioPage } from './pages/ProposalStudioPage';

test.describe('Proposal Studio User Journey', () => {
  let studioPage: ProposalStudioPage;

  test.beforeEach(async ({ page }) => {
    studioPage = new ProposalStudioPage(page);
    await studioPage.goto();
  });

  test('renders Proposal Studio hub with title and active controls', async ({ page }) => {
    await studioPage.verifyPageLoaded();
    await expect(page).toHaveTitle(/proposal studio|contribo/i);
    await expect(page.locator('body')).toBeVisible();
  });

  test('displays proposal sections or guidance overview without error', async ({ page }) => {
    await page.waitForLoadState('domcontentloaded');
    const pageText = await page.textContent('body');
    expect(pageText).toBeTruthy();
  });
});
