/**
 * Script chụp full-page screenshot Dashboard Admin
 * Xử lý sidebar fixed bằng cách tắt position trước khi chụp
 *
 * Cách dùng:
 *   cd DATN-Cinema
 *   node screenshot.js
 *
 * Kết quả: Tạo file dashboard_screenshot.png trong thư mục hiện tại
 */

const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    defaultViewport: { width: 1440, height: 900 }
  });

  const page = await browser.newPage();

  // Mở trang Dashboard
  await page.goto('http://localhost:3000/admin/dashboard', {
    waitUntil: 'networkidle2',
    timeout: 30000
  });

  // Chờ thêm 2 giây cho biểu đồ load xong
  await new Promise(r => setTimeout(r, 2000));

  // Tắt tất cả fixed/sticky trước khi chụp
  await page.evaluate(() => {
    document.querySelectorAll('*').forEach(el => {
      const cs = getComputedStyle(el);
      if (cs.position === 'fixed' || cs.position === 'sticky') {
        el.style.setProperty('position', 'absolute', 'important');
      }
    });
  });

  // Chụp full page
  await page.screenshot({
    path: 'dashboard_screenshot.png',
    fullPage: true
  });

  console.log('✅ Đã chụp xong: dashboard_screenshot.png');

  await browser.close();
})();
