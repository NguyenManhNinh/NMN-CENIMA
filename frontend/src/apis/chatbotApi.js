import axiosInstance from './axiosInstance'

// Tạo session chat mới
export const createSessionAPI = async () => {
  const res = await axiosInstance.post('/chatbot/session', { channel: 'WEB' })
  return res.data.data
}

// Gửi tin nhắn đến chatbot
export const sendMessageAPI = async (message, sessionId) => {
  const res = await axiosInstance.post('/chatbot/message', { message, sessionId })
  return res.data.data
}

// Lấy lịch sử chat
export const getHistoryAPI = async (sessionId) => {
  const res = await axiosInstance.get(`/chatbot/history/${sessionId}`)
  return res.data.data
}

// Lấy câu hỏi nhanh
export const getQuickRepliesAPI = async () => {
  const res = await axiosInstance.get('/chatbot/quick-replies')
  return res.data.data
}
