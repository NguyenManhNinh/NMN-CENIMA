const mongoose = require('mongoose');

const chatSessionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,  // Cho phép guest chat
    index: true
  },
  channel: {
    type: String,
    enum: ['WEB', 'MOBILE'],
    default: 'WEB'
  },
  lastActivityAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: { createdAt: true, updatedAt: false }
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
module.exports = ChatSession;
