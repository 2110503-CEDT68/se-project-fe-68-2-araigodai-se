import { test, expect } from '@playwright/test';

// สามารถใช้ ENV BASE_URL ที่เราตั้งใน docker-compose ได้ หรือ fallback ไปที่ localhost
const FRONTEND_URL = process.env.BASE_URL || 'http://localhost:3000';

test.describe('End-to-End Registration Flow', () => {

  test('Should complete the full registration journey to the dashboard', async ({ page }) => {
    
    // ==========================================
    // Phase 1: หน้าลงทะเบียน (Register Page)
    // ==========================================
    const uniqueEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;
    
    await page.goto(`${FRONTEND_URL}/register`);
    
    // กรอกข้อมูล
    await page.fill('#name', 'Marvelouz Test');
    await page.fill('#telephone', '0812345678');
    await page.fill('#email', uniqueEmail);
    await page.fill('#password', 'Password123!');
    
    // 👈 เพิ่มการติ๊กยอมรับเงื่อนไข (Terms & Conditions) ก่อนกด Submit
    // ใช้ getByRole เพราะ Checkbox ของ Shadcn UI มักถูกเรนเดอร์เป็นปุ่มที่มี role="checkbox"
    await page.getByRole('checkbox').click();
    
    // กดปุ่มสร้างบัญชี
    await page.click('button:has-text("Create account")');

    // ==========================================
    // Phase 2: หน้าสำเร็จ (Register Success Page)
    // ==========================================
    // 1. รอให้ระบบยิง API และพาไปหน้า success อัตโนมัติ
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    // 2. เช็คว่ามีข้อความสำเร็จขึ้นมาจริงๆ
    await expect(page.locator('text=Registration Successful!')).toBeVisible();
    // ==========================================
  });

});

test.describe('Registration - Duplicate Data Handling', () => {

  test('Should show "duplicate key error" when registering with an existing email', async ({ page }) => {
    // กำหนดอีเมลที่จะใช้จำลองสถานการณ์ซ้ำ
    const duplicateEmail = `test_${Date.now()}_${Math.floor(Math.random() * 1000)}@example.com`;

    // ==========================================
    // 1. ลงทะเบียนรอบแรก (เพื่อให้มีข้อมูลใน Database)
    // ==========================================
    await page.goto(`${FRONTEND_URL}/register`);
    await page.fill('#name', 'First User');
    await page.fill('#telephone', '0811111111');
    await page.fill('#email', duplicateEmail); 
    await page.fill('#password', 'Password123!');
    
    // 👈 ติ๊กยอมรับเงื่อนไขรอบที่ 1
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');
    
    // รอจนกว่าจะเด้งไปหน้า Success แปลว่าข้อมูลเข้า Database แน่นอนแล้ว
    await expect(page).toHaveURL(`${FRONTEND_URL}/register-success`);

    // ==========================================
    // 2. ลงทะเบียนรอบสอง (จงใจใช้อีเมลซ้ำ)
    // ==========================================
    await page.goto(`${FRONTEND_URL}/register`); // กลับมาหน้าสมัครใหม่
    await page.fill('#name', 'Second User');
    await page.fill('#telephone', '0822222222');
    await page.fill('#email', duplicateEmail); // 🔴 ใช้อีเมลเดิม!
    await page.fill('#password', 'Password123!');
    
    // 👈 ติ๊กยอมรับเงื่อนไขรอบที่ 2
    await page.getByRole('checkbox').click();
    
    await page.click('button:has-text("Create account")');

    // ==========================================
    // 3. ตรวจสอบผลลัพธ์ (ต้องไม่เปลี่ยนหน้า และมี Error ขึ้น)

    // ใช้ RegExp เพื่อจับคำว่า duplicate key (ตัวเล็กหรือใหญ่ก็ได้)
    await expect(page.getByText(/duplicate key/i)).toBeVisible({ timeout: 10000 }); 

    // ยืนยันว่าหน้าเว็บไม่ได้ถูก Redirect ไปไหน (ยังอยู่ที่หน้า register)
    await expect(page).toHaveURL(`${FRONTEND_URL}/register`);
  });

});