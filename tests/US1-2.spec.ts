import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-2: View Profile', () => {

  test('Should display correct personal information for a logged-in user', async ({ page }) => {
    
    const uniqueName = `Tony Profile ${Date.now()}`;
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    const uniquePhone = '0899999999';
    const password = 'Password123!';

    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', uniqueName);
    await page.fill('#telephone', uniquePhone);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    await page.goto(`${FRONTEND_URL}/profile`);

    await expect(page.locator('#name')).toHaveValue(uniqueName, { timeout: 10000 });
    await expect(page.locator('#telephone')).toHaveValue(uniquePhone, { timeout: 10000 });
    await expect(page.locator('#email')).toHaveValue(uniqueEmail, { timeout: 10000 });
    
    await expect(page.locator('#email')).toBeDisabled();
  });

  test('Should deny access and redirect to login page if user is not logged in', async ({ page }) => {
    
    await page.goto(`${FRONTEND_URL}/profile`);

    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
  });

});