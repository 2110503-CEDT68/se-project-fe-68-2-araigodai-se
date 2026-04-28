import { test, expect } from '@playwright/test';

// ใช้ environment variable เผื่อเวลารันใน Docker
const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-4: Deactivate Account', () => {

  // ========================================================
  // ตั้งค่าก่อนเริ่มเทสต์: สร้าง User สมมติและพาไปที่หน้า Profile
  // ========================================================
  test.beforeEach(async ({ page }) => {
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    // 1. ลงทะเบียน User ใหม่
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'User to Delete');
    await page.fill('#telephone', '0899999999');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    // 🔴 [จุดที่เติมให้] ติ๊กยอมรับเงื่อนไขก่อนกด Create account
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    // 2. นำทางไปที่หน้า Account Settings (Profile)
    await page.goto(`${FRONTEND_URL}/profile`);
    
    // รอให้หน้าเว็บโหลดข้อมูลตั้งต้นสำเร็จก่อน
    await expect(page.locator('#name')).toHaveValue('User to Delete', { timeout: 10000 });
  });

  // ========================================================
  // เคสที่ 1: กดยกเลิก (Cancel) -> บัญชียังอยู่เหมือนเดิม
  // ========================================================
  test('Should close prompt and keep account active when user clicks Cancel', async ({ page }) => {
    // 1. (When) กดปุ่ม "Deactivate Account" บนหน้าจอหลัก
    await page.getByRole('button', { name: 'Deactivate Account' }).click();

    // 2. ตรวจสอบว่ามีกล่อง Alert Dialog เด้งขึ้นมา
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Are you absolutely sure?');

    // 3. (When) กดปุ่ม "Cancel" ที่อยู่ในกล่อง Dialog
    await dialog.getByRole('button', { name: 'Cancel' }).click();

    // 4. (Then) ตรวจสอบว่ากล่อง Dialog ปิดไปแล้ว (ถูกซ่อน)
    await expect(dialog).toBeHidden();

    // 5. (Then) ตรวจสอบว่ายังอยู่ที่หน้า profile เหมือนเดิม ไม่ได้เด้งไปไหน
    await expect(page).toHaveURL(`${FRONTEND_URL}/profile`);
    
    // 6. (Then) ยืนยันว่า Token ยังอยู่ บัญชียัง Active 
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeTruthy();
  });

  // ========================================================
  // เคสที่ 2: กดยืนยัน (Confirm) -> ลบบัญชีและออกจากระบบ
  // ========================================================
  test('Should deactivate account, log out, and redirect to login page upon confirmation', async ({ page }) => {
    // 1. (When) กดปุ่ม "Deactivate Account" บนหน้าจอหลัก
    await page.getByRole('button', { name: 'Deactivate Account' }).click();

    // 2. จับตัวกล่อง Dialog
    const dialog = page.getByRole('alertdialog');
    await expect(dialog).toBeVisible();

    // 3. (When) กดยืนยันปุ่ม "Deactivate Account" สีแดง ที่อยู่ในกล่อง Dialog
    await dialog.getByRole('button', { name: 'Deactivate Account' }).click();

    // 4. (Then) ตรวจสอบว่าระบบเด้งไปที่หน้า Login ตามโค้ด router.push("/login")
    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);

    // 5. (Then) ตรวจสอบว่า localStorage ถูกเคลียร์ทิ้งแล้ว (Log the user out)
    const token = await page.evaluate(() => localStorage.getItem('token'));
    expect(token).toBeNull();

    // 6. (แถมเพื่อความชัวร์) ลองแอบเข้าหน้า /profile อีกรอบ ต้องโดนเตะกลับมาหน้า /login เพราะไม่มี Token
    await page.goto(`${FRONTEND_URL}/profile`);
    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
  });

});