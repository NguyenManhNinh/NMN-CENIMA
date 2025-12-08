module.exports = {
  // Môi trường Node.js
  testEnvironment: 'node',

  // Thư mục gốc cho test
  roots: ['<rootDir>/src/test'],

  // Chỉ tìm file có đuôi .test.js
  testMatch: ['**/?(*.)+(spec|test).js'],

  // Bỏ qua node_modules
  testPathIgnorePatterns: ['/node_modules/'],

  // Module paths để dễ import
  moduleDirectories: ['node_modules', 'src'],

  // Thiết lập trước khi chạy test
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.js'],

  // Tính toán độ bao phủ của code (Coverage)
  collectCoverage: false,
  collectCoverageFrom: [
    'src/controllers/**/*.js',
    'src/services/**/*.js',
    '!src/**/*.test.js'
  ],

  verbose: true,
  testTimeout: 30000
};
