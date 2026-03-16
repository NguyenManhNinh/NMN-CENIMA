import { useState, useRef, useEffect, useCallback } from 'react'
import SendRoundedIcon from '@mui/icons-material/SendRounded'
import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import { createSessionAPI, sendMessageAPI, getQuickRepliesAPI } from '../../apis/chatbotApi'
import chatbotAvatar from '../../assets/images/chatbotAI.png'
import './ChatbotWidget.css'

function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [quickReplies, setQuickReplies] = useState([])
  const [initialized, setInitialized] = useState(false)

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Auto-scroll xuống cuối khi có tin nhắn mới
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, loading, scrollToBottom])

  // Focus input khi mở panel
  useEffect(() => {
    if (isOpen && initialized) {
      setTimeout(() => inputRef.current?.focus(), 300)
    }
  }, [isOpen, initialized])

  // Khởi tạo session khi mở lần đầu
  const initChat = useCallback(async () => {
    if (initialized) return
    try {
      // Tạo session + lấy quick replies song song
      const [sessionData, repliesData] = await Promise.all([
        createSessionAPI(),
        getQuickRepliesAPI()
      ])

      setSessionId(sessionData.sessionId)
      setQuickReplies(repliesData.quickReplies || [])

      // Thêm welcome message
      setMessages([{
        id: 'welcome',
        sender: 'BOT',
        message: sessionData.welcomeMessage,
        time: new Date()
      }])

      setInitialized(true)
    } catch (err) {
      console.error('Lỗi khởi tạo chatbot:', err)
      setMessages([{
        id: 'error',
        sender: 'BOT',
        message: 'Xin lỗi, hiện tại trợ lý ảo chưa sẵn sàng. Vui lòng thử lại sau!',
        time: new Date()
      }])
      setInitialized(true)
    }
  }, [initialized])

  // Mở/đóng panel
  const toggleChat = useCallback(() => {
    setIsOpen(prev => {
      if (!prev && !initialized) {
        initChat()
      }
      return !prev
    })
  }, [initialized, initChat])

  // Gửi tin nhắn
  const handleSend = useCallback(async (text) => {
    const msg = (text || input).trim()
    if (!msg || loading) return

    // Thêm tin nhắn user
    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'USER',
      message: msg,
      time: new Date()
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const data = await sendMessageAPI(msg, sessionId)

      // Cập nhật sessionId nếu cần
      if (data.sessionId && !sessionId) {
        setSessionId(data.sessionId)
      }

      // Thêm phản hồi bot
      setMessages(prev => [...prev, {
        id: `bot-${Date.now()}`,
        sender: 'BOT',
        message: data.message,
        time: new Date(data.timestamp || Date.now())
      }])
    } catch (err) {
      console.error('Lỗi gửi tin nhắn:', err)
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        sender: 'BOT',
        message: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại!',
        time: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }, [input, loading, sessionId])

  // Xử lý Enter
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }, [handleSend])

  // Format thời gian
  const formatTime = (date) => {
    const d = new Date(date)
    return d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          className="chatbot-float-btn"
          onClick={toggleChat}
          aria-label="Mở trợ lý ảo"
        >
          <img src={chatbotAvatar} alt="NMN Cinema AI" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="chatbot-panel">
          {/* Header */}
          <div className="chatbot-header">
            <img
              src={chatbotAvatar}
              alt="NMN Cinema AI"
              className="chatbot-header-avatar"
            />
            <div className="chatbot-header-info">
              <p className="chatbot-header-title">NMN Cinema AI</p>
              <p className="chatbot-header-subtitle">Trợ lý ảo • Luôn sẵn sàng hỗ trợ</p>
            </div>
            <button
              className="chatbot-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng trợ lý ảo"
            >
              <CloseRoundedIcon fontSize="small" />
            </button>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((msg) => (
              <div key={msg.id} className={`chatbot-msg ${msg.sender.toLowerCase()}`}>
                {msg.sender === 'BOT' && (
                  <img src={chatbotAvatar} alt="" className="chatbot-msg-avatar" />
                )}
                <div>
                  <div className="chatbot-msg-bubble">{msg.message}</div>
                  <div className="chatbot-msg-time">{formatTime(msg.time)}</div>
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="chatbot-msg bot">
                <img src={chatbotAvatar} alt="" className="chatbot-msg-avatar" />
                <div className="chatbot-typing">
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                  <span className="chatbot-typing-dot" />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Replies */}
          {quickReplies.length > 0 && messages.length <= 1 && !loading && (
            <div className="chatbot-quick-replies">
              {quickReplies.map((qr) => (
                <button
                  key={qr.id}
                  className="chatbot-quick-btn"
                  onClick={() => handleSend(qr.query)}
                >
                  {qr.text}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="chatbot-input-area">
            <input
              ref={inputRef}
              className="chatbot-input"
              type="text"
              placeholder="Nhập câu hỏi..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chatbot-send-btn"
              onClick={() => handleSend()}
              disabled={!input.trim() || loading}
              aria-label="Gửi tin nhắn"
            >
              <SendRoundedIcon fontSize="small" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

export default ChatbotWidget
