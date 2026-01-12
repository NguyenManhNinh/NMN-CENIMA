const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api/v1';
const REPORT_ID = '6964a8b03ccc7d209e5ede63';

// Lấy Token từ tham số dòng lệnh
const ADMIN_TOKEN = process.argv[2];

if (!ADMIN_TOKEN) {
  console.error('❌ Vui lòng cung cấp Admin Token!');
  console.log('Usage: node src/test/testBanReport.js <YOUR_ADMIN_TOKEN>');
  process.exit(1);
}

async function testBan() {
  try {
    // Ban User via Report Action
    console.log(`\nExecuting Ban Action for Report ID: ${REPORT_ID}...`);
    try {
      const actionRes = await axios.patch(
        `${BASE_URL}/admin/reports/${REPORT_ID}/action`,
        {
          action: 'ban_user',
          banMinutes: 30, // Ban 30 phút
          hiddenReason: 'Vi phạm quy định (Test Ban ID: ' + REPORT_ID + ')'
        },
        {
          headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
        }
      );

      console.log('✅ Ban Action Successful!');
      console.log('Status:', actionRes.data.status);
      console.log('Message:', actionRes.data.message);
      console.log('Data:', JSON.stringify(actionRes.data.data, null, 2));
    } catch (err) {
      console.error('❌ Ban Action Failed:');
      console.error('Status:', err.response?.status);
      console.error('Message:', err.response?.data?.message || err.message);
    }

  } catch (error) {
    console.error('Unexpected error:', error.message);
  }
}

testBan();
