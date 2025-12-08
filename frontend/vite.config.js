import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

export default defineConfig({
  plugins: [react()],

  // 1. Cấu hình cổng chạy (Port)
  server: {
    port: 3000, // Chạy port 3000
  },

  // 2. Cấu hình đường dẫn tắt (Alias)
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})