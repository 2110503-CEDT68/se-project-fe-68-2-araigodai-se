import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-3: Edit Profile (Validation & Happy Path)', () => {

  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'Original Name');
    await page.fill('#telephone', '0800000000');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');

    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    await page.goto(`${FRONTEND_URL}/profile`);
  });

  test('Should modify information and display success message', async ({ page }) => {
    await expect(page.locator('#name')).toHaveValue('Original Name', { timeout: 10000 });

    await page.fill('#name', 'Updated Marvelouz');
    await page.fill('#telephone', '0899999999');
    await page.fill('#village', 'Bangkok Village');


    await page.click('button:has-text("Save Changes")');

    await expect(page.getByText('Profile updated successfully!')).toBeVisible();

    await expect(page.locator('#name')).toHaveValue('Updated Marvelouz');
  });

  test('Should prevent update and show validation error when clearing mandatory fields', async ({ page }) => {
    await expect(page.locator('#name')).toHaveValue('Original Name', { timeout: 10000 });

    await page.fill('#name', '');
    await page.fill('#telephone', '');

    await page.click('button:has-text("Save Changes")');

    await expect(page.getByText('Please fill in all required fields.')).toBeVisible();
  });

});