import { test, expect } from '@playwright/test';

const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('End-to-End Registration Flow', () => {

  test('Should complete the full registration journey to the dashboard', async ({ page }) => {
    
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    await page.goto(`${FRONTEND_URL}/register`);
    
    // กรอกข้อมูล
    await page.fill('#name', 'Marvelouz Test');
    await page.fill('#telephone', '0812345678');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');

    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);


    await expect(page.locator('text=Registration Successful!')).toBeVisible();
  });

});

test.describe('Registration - Duplicate Data Handling', () => {

  test('Should show "duplicate key error" when registering with an existing email', async ({ page }) => {
    const duplicateEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'First User');
    await page.fill('#telephone', '0811111111');
    await page.fill('#email', duplicateEmail); 
    await page.fill('#password', 'Password123!');
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'Second User');
    await page.fill('#telephone', '0822222222');
    await page.fill('#email', duplicateEmail); 
    await page.fill('#password', 'Password123!');
    
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');

    await expect(page.getByText(/duplicate key/i)).toBeVisible({ timeout: 10000 }); 

    await expect(page).toHaveURL(`${FRONTEND_URL}/register`);
  });

});