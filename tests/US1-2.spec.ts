import { test, expect } from '@playwright/test';

// 💡 แนะนำให้ใช้ process.env เผื่อรันใน Docker
const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('US1-2: View Profile', () => {

  // ========================================================
  // เคสที่ 1: ล็อกอินแล้ว ต้องเห็นข้อมูลตัวเองครบถ้วน
  // ========================================================
  test('Should display correct personal information for a logged-in user', async ({ page }) => {
    
    // 1. เตรียมข้อมูลจำลอง
    const uniqueName = `Tony Profile ${Date.now()}`;
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    const uniquePhone = '0899999999';
    const password = 'Password123!';

    // 2. สมัครสมาชิก (เพื่อรับ Token ล็อกอิน)
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', uniqueName);
    await page.fill('#telephone', uniquePhone);
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', password);
    
    // 🔴 [สำคัญมาก] ติ๊กยอมรับเงื่อนไขก่อนกด Submit
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    
    // รอจนสมัครสำเร็จ 
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    // 3. (When) นำทางไปที่หน้าโปรไฟล์
    await page.goto(`${FRONTEND_URL}/profile`);

    // 4. (Then) ตรวจสอบว่ามีข้อมูลที่เรากรอกไป แสดงอยู่บนหน้าจอจริงๆ
    // เช็คทั้งชื่อ เบอร์โทร และเพิ่มการเช็คอีเมลด้วย
    await expect(page.locator('#name')).toHaveValue(uniqueName, { timeout: 10000 });
    await expect(page.locator('#telephone')).toHaveValue(uniquePhone, { timeout: 10000 });
    await expect(page.locator('#email')).toHaveValue(uniqueEmail, { timeout: 10000 });
    
    // ตรวจสอบชัวร์ๆ ว่าช่อง Email ถูกล็อคแก้ไขไม่ได้ (ตามโค้ดหน้า Profile ของคุณ)
    await expect(page.locator('#email')).toBeDisabled();
  });

  // ========================================================
  // เคสที่ 2: ยังไม่ล็อกอิน ต้องเข้าหน้าโปรไฟล์ไม่ได้
  // ========================================================
  test('Should deny access and redirect to login page if user is not logged in', async ({ page }) => {
    
    // 1. (Given) เปิดเบราว์เซอร์ใหม่แบบ "หน้าขาวสะอาด" (ไม่มี Token)
    
    // 2. (When) พยายามเข้า URL หน้า Profile ตรงๆ
    await page.goto(`${FRONTEND_URL}/profile`);

    // 3. (Then) ตรวจสอบว่าระบบไม่อนุญาต และเด้งกลับไปที่หน้า Login อัตโนมัติ
    await expect(page).toHaveURL(`${FRONTEND_URL}/login`);
  });

});