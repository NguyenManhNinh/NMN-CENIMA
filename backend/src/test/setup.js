/**
 * Jest Setup File
 * Cấu hình môi trường test trước khi chạy
 */

// Load biến môi trường test
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing';
process.env.VNP_TMN_CODE = 'TEST_CODE';
process.env.VNP_HASH_SECRET = 'test_vnp_secret';
process.env.VNP_URL = 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
process.env.VNP_RETURN_URL = 'http://localhost:5000/api/v1/payments/vnpay_return';

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   error: jest.fn(),
//   warn: jest.fn(),
// };

// Global test timeout
jest.setTimeout(30000);
