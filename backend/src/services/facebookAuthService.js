/**
 * Facebook OAuth Service
 * Xử lý đăng nhập bằng Facebook
 */
const axios = require('axios');

const FB_APP_ID = process.env.FACEBOOK_APP_ID;
const FB_APP_SECRET = process.env.FACEBOOK_APP_SECRET;
const FB_REDIRECT_URI = process.env.FACEBOOK_REDIRECT_URI;

/**
 * Tạo URL đăng nhập Facebook
 */
exports.getAuthUrl = () => {
  const scopes = 'email,public_profile';
  return `https://www.facebook.com/v18.0/dialog/oauth?client_id=${FB_APP_ID}&redirect_uri=${encodeURIComponent(FB_REDIRECT_URI)}&scope=${scopes}&response_type=code`;
};

/**
 * Lấy thông tin user từ Facebook
 * @param {string} code - Authorization code từ Facebook callback
 */
exports.getUserInfo = async (code) => {
  // 1. Đổi code lấy access_token
  const tokenResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
    params: {
      client_id: FB_APP_ID,
      client_secret: FB_APP_SECRET,
      redirect_uri: FB_REDIRECT_URI,
      code
    }
  });

  const accessToken = tokenResponse.data.access_token;

  // 2. Lấy thông tin user
  const userResponse = await axios.get('https://graph.facebook.com/me', {
    params: {
      access_token: accessToken,
      fields: 'id,name,email,picture.type(large)'
    }
  });

  const fbUser = userResponse.data;

  return {
    facebookId: fbUser.id,
    email: fbUser.email,
    name: fbUser.name,
    avatar: fbUser.picture?.data?.url || null
  };
};
