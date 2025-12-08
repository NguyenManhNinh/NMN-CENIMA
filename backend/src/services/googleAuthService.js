/**
 * Google OAuth Service
 * Xử lý đăng nhập bằng Google
 */
const { OAuth2Client } = require('google-auth-library');

// Khởi tạo OAuth2 Client
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

/**
 * Tạo URL đăng nhập Google
 */
exports.getAuthUrl = () => {
  const scopes = [
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  return client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });
};

/**
 * Lấy thông tin user từ Google token
 * @param {string} code - Authorization code từ Google callback
 */
exports.getUserInfo = async (code) => {
  // Đổi code lấy tokens
  const { tokens } = await client.getToken(code);
  client.setCredentials(tokens);

  // Lấy thông tin user
  const ticket = await client.verifyIdToken({
    idToken: tokens.id_token,
    audience: process.env.GOOGLE_CLIENT_ID
  });

  const payload = ticket.getPayload();

  return {
    googleId: payload.sub,
    email: payload.email,
    name: payload.name,
    avatar: payload.picture,
    emailVerified: payload.email_verified
  };
};
