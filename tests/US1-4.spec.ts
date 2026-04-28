import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-4: Deactivate Account', () => {

  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'User to Delete');
    await page.fill('#telephone', '0899999999');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    await page.goto(`${FRONTEND_URL}/profile`);
    
    await expect(page.locator('#name')).toHaveValue('User to Delete', { timeout: 10000 });
  });

  test('Should close prompt and keep account active when user clicks Cancel', async ({ page }) => {
    await page.getByRole('button', { name: 'Deactivate Account' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Are you absolutely sure?');

    await dialog.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog).toBeHidden();

    await expect(page).toHaveURL(`${FRONTEND_URL}/profile`);
    
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  test('Should deactivate account, log out, and redirect to login page upon confirmation', async ({ page }) => {
    await page.getByRole('button', { name: 'Deactivate Account' }).click();

    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    await dialog.getByRole('button', { name: 'Deactivate Account' }).click();

    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);

    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    await page.goto(`${FRONTEND_URL}/profile`);
    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
  });

});