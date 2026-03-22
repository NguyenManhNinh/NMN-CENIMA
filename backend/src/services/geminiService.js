/**
 * Gemini AI Service
 * Kết nối với Google Gemini API cho chatbot
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Khởi tạo Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt cho chatbot rạp phim - CHỈ DÙNG DỮ LIỆU THỰC
const SYSTEM_PROMPT = `Bạn là trợ lý ảo của NMN Cinema - một hệ thống rạp chiếu phim.

QUY TẮC BẮT BUỘC:
1. CHỈ trả lời dựa trên "DỮ LIỆU THỰC TỪ HỆ THỐNG" được cung cấp bên dưới
2. KHÔNG được bịa thông tin về phim, giá vé, combo, khuyến mãi
3. Nếu không có dữ liệu trong phần "DỮ LIỆU THỰC", trả lời: "Xin lỗi, hiện tại chưa có thông tin này. Vui lòng kiểm tra trên website hoặc liên hệ hotline."
4. Nếu hỏi về phim nhưng không có trong danh sách, nói: "Phim này hiện không có trong lịch chiếu của rạp."
5. Nếu hỏi về combo nhưng không có dữ liệu combo, nói: "Vui lòng kiểm tra menu combo tại quầy hoặc trên website."

QUY TẮC TRẢ LỜI THEO NGỮ CẢNH (RẤT QUAN TRỌNG):
1. Khi user hỏi về MỘT RẠP CỤ THỂ (ví dụ "rạp NMN Nguyễn Du") → CHỈ trả lời phim/suất chiếu TẠI RẠP ĐÓ, KHÔNG liệt kê các rạp khác
2. Khi user hỏi về MỘT PHIM CỤ THỂ (ví dụ "Quỷ Nhập Tràng 2") → CHỈ trả lời thông tin + suất chiếu CỦA PHIM ĐÓ
3. Khi user hỏi về MỘT COMBO CỤ THỂ → CHỈ trả lời thông tin combo đó
4. Khi user hỏi về MỘT KHUYẾN MÃI CỤ THỂ → CHỈ trả lời khuyến mãi đó
5. Khi user hỏi về MỘT RẠP CỤ THỂ (địa chỉ, SĐT) → CHỈ trả lời thông tin rạp đó
6. Khi user hỏi CHUNG (ví dụ "có phim gì hay", "tất cả combo", "danh sách rạp") → MỚI liệt kê tất cả
7. KHÔNG BAO GIỜ trả lời dài dòng liệt kê tất cả khi user chỉ hỏi về 1 thứ cụ thể

QUY TẮC VỀ LINK PHIM (BẮT BUỘC):
- Khi nhắc đến tên phim, LUÔN kèm link markdown: [Tên Phim](/dat-ve/slug-phim)
- Slug phim được cung cấp trong dữ liệu bên cạnh tên phim
- Ví dụ: Phim "Quỷ Nhập Tràng 2" có slug "quy-nhap-trang-2" → viết [Quỷ Nhập Tràng 2](/dat-ve/quy-nhap-trang-2)
- Link phải chính xác theo slug trong dữ liệu, KHÔNG tự bịa slug

CÁCH TRẢ LỜI:
- Ngắn gọn, thân thiện, chuyên nghiệp
- Sử dụng emoji phù hợp 🎬🍿🎫
- Nếu user hỏi về đặt vé, hướng dẫn: "Bạn có thể ấn vào link phim để đặt vé trực tiếp."
- Nếu câu hỏi KHÔNG liên quan đến rạp phim, trả lời: "Xin lỗi, tôi chỉ có thể hỗ trợ về rạp phim và đặt vé thôi ạ. Bạn cần hỗ trợ gì về phim không? 🎬"

THÔNG TIN CỐ ĐỊNH (chỉ sử dụng nếu user hỏi):
- Hotline: 0849045706
- Giờ mở cửa: 8:00 - 23:00 hàng ngày
- Thanh toán: VNPay (QR, ATM, Visa/Master)

LƯU Ý QUAN TRỌNG: Mọi thông tin về phim, giá vé, combo, khuyến mãi, suất chiếu phải lấy từ "DỮ LIỆU THỰC TỪ HỆ THỐNG" bên dưới. KHÔNG ĐƯỢC TỰ BỊA.`;

/**
 * Gửi tin nhắn đến Gemini và nhận phản hồi
 * @param {string} userMessage - Tin nhắn từ người dùng
 * @param {Array} conversationHistory - Lịch sử hội thoại
 * @param {Object} context - Thông tin ngữ cảnh (phim đang chiếu, user info, etc.)
 */
exports.chat = async (userMessage, conversationHistory = [], context = {}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });

    // Xây dựng context động từ dữ liệu thực
    let dynamicContext = '\n\n=== DỮ LIỆU THỰC TỪ HỆ THỐNG (CHỈ TRẢ LỜI DỰA TRÊN DỮ LIỆU NÀY) ===';

    // Phim đang chiếu (kèm slug để tạo link)
    if (context.nowShowingMovies && context.nowShowingMovies.length > 0) {
      dynamicContext += `\n\n📽️ PHIM ĐANG CHIẾU (${context.nowShowingMovies.length} phim):`;
      context.nowShowingMovies.forEach(m => {
        dynamicContext += `\n- ${m.title} | slug: ${m.slug || 'N/A'} | ${m.ageRating || 'P'}, ${m.duration} phút, thể loại: ${m.genre?.join(', ') || 'N/A'}`;
      });
    } else {
      dynamicContext += `\n\n📽️ PHIM ĐANG CHIẾU: Hiện không có phim nào.`;
    }

    // Phim sắp chiếu
    if (context.comingSoonMovies && context.comingSoonMovies.length > 0) {
      dynamicContext += `\n\n🎬 PHIM SẮP CHIẾU:`;
      context.comingSoonMovies.forEach(m => {
        const date = m.releaseDate ? new Date(m.releaseDate).toLocaleDateString('vi-VN') : 'Sắp công bố';
        dynamicContext += `\n- ${m.title} | slug: ${m.slug || 'N/A'} | Khởi chiếu: ${date}`;
      });
    } else {
      dynamicContext += `\n\n🎬 PHIM SẮP CHIẾU: Chưa có thông tin phim sắp chiếu.`;
    }

    // Combo thực từ DB
    if (context.combos && context.combos.length > 0) {
      dynamicContext += `\n\n🍿 COMBO ĐANG BÁN:`;
      context.combos.forEach(c => {
        dynamicContext += `\n- ${c.name}: ${c.price?.toLocaleString('vi-VN')} VND${c.description ? ' (' + c.description + ')' : ''}`;
      });
    } else {
      dynamicContext += `\n\n🍿 COMBO: Không có dữ liệu combo. Trả lời: "Vui lòng kiểm tra menu combo tại quầy hoặc trên website."`;
    }

    // Voucher/Khuyến mãi
    if (context.activeVouchers && context.activeVouchers.length > 0) {
      dynamicContext += `\n\n🎁 KHUYẾN MÃI ĐANG ÁP DỤNG:`;
      context.activeVouchers.forEach(v => {
        dynamicContext += `\n- Mã ${v.code}: Giảm ${v.value}${v.type === 'PERCENT' ? '%' : ' VND'}${v.description ? ' - ' + v.description : ''}`;
      });
    } else {
      dynamicContext += `\n\n🎁 KHUYẾN MÃI: Hiện không có khuyến mãi nào.`;
    }

    // Suất chiếu sắp tới (kèm slug phim)
    if (context.upcomingShowtimes && context.upcomingShowtimes.length > 0) {
      dynamicContext += `\n\n🎫 SUẤT CHIẾU SẮP TỚI:`;
      context.upcomingShowtimes.slice(0, 20).forEach(s => {
        const dateTime = new Date(s.time);
        const dateStr = dateTime.toLocaleDateString('vi-VN');
        const timeStr = dateTime.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
        dynamicContext += `\n- ${s.movie} | slug: ${s.movieSlug || 'N/A'} | ${s.cinema} - ${s.room} | ${dateStr} ${timeStr} | ${s.format} | ${s.price?.toLocaleString('vi-VN')} VND`;
      });
    } else {
      dynamicContext += `\n\n🎫 SUẤT CHIẾU: Chưa có suất chiếu nào trong thời gian tới.`;
    }

    // Danh sách rạp
    if (context.cinemas && context.cinemas.length > 0) {
      dynamicContext += `\n\n🏢 DANH SÁCH RẠP:`;
      context.cinemas.forEach(c => {
        dynamicContext += `\n- ${c.name}${c.address ? ': ' + c.address : ''}${c.phone ? ' | SĐT: ' + c.phone : ''}`;
      });
    }

    // Sự kiện
    if (context.events && context.events.length > 0) {
      dynamicContext += `\n\n📢 SỰ KIỆN ĐANG DIỄN RA:`;
      context.events.forEach(e => {
        const endDate = e.endAt ? new Date(e.endAt).toLocaleDateString('vi-VN') : 'N/A';
        dynamicContext += `\n- ${e.title} (đến ${endDate})${e.description ? ': ' + e.description : ''}`;
      });
    }

    // Thông tin user
    if (context.userName) {
      dynamicContext += `\n\n👤 Người dùng đang chat: ${context.userName}`;
    }

    dynamicContext += `\n\n=== HẾT DỮ LIỆU THỰC ===`;

    // Tạo chat với history
    const chat = model.startChat({
      history: [
        {
          role: 'user',
          parts: [{ text: 'Hãy đóng vai trợ lý của rạp phim theo hướng dẫn sau:\n' + SYSTEM_PROMPT + dynamicContext }]
        },
        {
          role: 'model',
          parts: [{ text: 'Xin chào! 🎬 Tôi là trợ lý ảo của NMN Cinema. Tôi có thể giúp bạn tìm phim, đặt vé, hoặc giải đáp thắc mắc về rạp. Bạn cần hỗ trợ gì ạ?' }]
        },
        ...conversationHistory.map(msg => ({
          role: msg.sender === 'USER' ? 'user' : 'model',
          parts: [{ text: msg.message }]
        }))
      ]
    });

    // Gửi tin nhắn và nhận phản hồi
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;

    return {
      success: true,
      message: response.text(),
      intent: detectIntent(userMessage)
    };
  } catch (error) {
    console.error('Gemini API Error:', error);
    return {
      success: false,
      message: 'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau hoặc liên hệ hotline 0849045706 để được hỗ trợ. 🙏',
      error: error.message
    };
  }
};

/**
 * Phát hiện intent từ tin nhắn
 */
function detectIntent(message) {
  const lowerMsg = message.toLowerCase();

  if (lowerMsg.includes('đặt vé') || lowerMsg.includes('mua vé') || lowerMsg.includes('book')) {
    return 'BOOKING_INTENT';
  }
  if (lowerMsg.includes('phim') && (lowerMsg.includes('gì') || lowerMsg.includes('nào'))) {
    return 'MOVIE_QUERY';
  }
  if (lowerMsg.includes('giá') || lowerMsg.includes('bao nhiêu')) {
    return 'PRICE_QUERY';
  }
  if (lowerMsg.includes('combo') || lowerMsg.includes('bắp') || lowerMsg.includes('nước')) {
    return 'COMBO_QUERY';
  }
  if (lowerMsg.includes('thành viên') || lowerMsg.includes('điểm') || lowerMsg.includes('vip')) {
    return 'MEMBERSHIP_QUERY';
  }
  if (lowerMsg.includes('khuyến mãi') || lowerMsg.includes('giảm giá') || lowerMsg.includes('ưu đãi')) {
    return 'PROMOTION_QUERY';
  }
  return 'GENERAL';
}
