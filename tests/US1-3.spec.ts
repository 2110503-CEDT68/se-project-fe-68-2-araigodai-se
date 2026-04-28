import { test, expect } from '@playwright/test';

// กำหนด URL ของ Next.js Frontend
const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-3: Edit Profile (Validation & Happy Path)', () => {

  // ========================================================
  // ตั้งค่าก่อนเริ่มเทสต์: สร้าง User ใหม่และเข้าหน้า Profile
  // ========================================================
  test.beforeEach(async ({ page }) => {
    // 1. สมัครสมาชิกใหม่เพื่อใช้ในการเทสต์รอบนี้โดยเฉพาะ
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'Original Name');
    await page.fill('#telephone', '0800000000');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    // 🔴 [จุดที่แก้ 1] เพิ่มการติ๊ก Checkbox เงื่อนไข
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');

    // 2. รอจนสมัครเสร็จและระบบพาไปหน้า Success
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    // 3. เข้าสู่หน้าแก้ไขโปรไฟล์
    await page.goto(`${FRONTEND_URL}/profile`);
  });

  // ========================================================
  // เคสที่ 1: แก้ไขข้อมูลสำเร็จ (Happy Path)
  // ========================================================
  test('Should modify information and display success message', async ({ page }) => {
    // 1. รอให้ API ดึงข้อมูลเดิมมาใส่ในกล่องให้เสร็จก่อน
    await expect(page.locator('#name')).toHaveValue('Original Name', { timeout: 10000 });

    // 2. ลบข้อมูลเดิมและพิมพ์ข้อมูลใหม่ลงไป
    await page.fill('#name', 'Updated Marvelouz');
    await page.fill('#telephone', '0899999999');
    await page.fill('#village', 'Bangkok Village');

    // 3. กดปุ่มบันทึก
    await page.click('button:has-text("Save Changes")');

    // 4. ตรวจสอบว่าระบบขึ้นข้อความสีเขียวว่าอัปเดตสำเร็จ
    await expect(page.getByText('Profile updated successfully!')).toBeVisible();

    // 5. ยืนยันว่าหน้าจอแสดงข้อมูลใหม่แล้วจริงๆ
    await expect(page.locator('#name')).toHaveValue('Updated Marvelouz');
  });

  // ========================================================
  // เคสที่ 2: เคลียร์ฟิลด์บังคับทิ้ง (ดัก Error จาก Frontend)
  // ========================================================
  test('Should prevent update and show validation error when clearing mandatory fields', async ({ page }) => {
    // 1. รอให้ข้อมูลตั้งต้นโหลดมาใส่กล่องให้เสร็จก่อน
    await expect(page.locator('#name')).toHaveValue('Original Name', { timeout: 10000 });

    // 2. ลบข้อมูลในช่องบังคับทิ้ง (ให้กลายเป็นค่าว่าง)
    await page.fill('#name', '');
    await page.fill('#telephone', '');

    // 3. กดปุ่มบันทึก
    await page.click('button:has-text("Save Changes")');

    // 🔴 [จุดที่แก้ 2] เปลี่ยนข้อความให้ตรงกับโค้ด React ของคุณ
    await expect(page.getByText('Please fill in all required fields.')).toBeVisible();
  });

});