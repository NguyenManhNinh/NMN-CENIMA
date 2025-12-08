const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sessionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ChatSession',
    required: true,
    index: true
  },
  sender: {
    type: String,
    enum: ['USER', 'BOT', 'AGENT'],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  intent: {
    type: String // Nếu là BOT, lưu intent (VD: 'booking_query')
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const ChatMessage = mongoose.model('ChatMessage', chatMessageSchema);
module.exports = ChatMessage;
