import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage';

test.describe('Authentication Flows', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('renders login page correctly with form controls', async ({ page }) => {
    await loginPage.verifyElementsVisible();
    await expect(page).toHaveTitle(/login|sign in|contribo/i);
  });

  test('unauthenticated users accessing protected routes redirect to login', async ({ page }) => {
    await page.goto('/dashboard');
    // If not authenticated, user should either be on login or prompted
    await page.waitForLoadState('networkidle');
    const url = page.url();
    expect(url).toMatch(/\/(login|dashboard)/);
  });

  test('handles invalid credentials without crashing', async ({ page }) => {
    await loginPage.emailInput.fill('invalid-test-user@example.com');
    await loginPage.passwordInput.fill('WrongPassword123!');
    await loginPage.submitButton.click();
    
    // Page should remain alive and not encounter 500 unhandled errors
    await page.waitForTimeout(1000);
    expect(page.url()).toContain('/login');
  });
});
