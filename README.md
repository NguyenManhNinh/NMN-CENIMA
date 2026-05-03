# 🎬 NMN Cinema – Cinema Management System with Online Payment & AI Chatbot

<p align="center">
  <img src="frontend/src/assets/images/NMN_CENIMA_LOGO.png" alt="NMN Cinema Logo" width="200"/>
</p>
<p align="center">
  <strong>Graduation Thesis – NMN Cinema: A full-stack cinema management system with online ticketing, VNPay payment, and AI Chatbot support.</strong>
</p>
<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white" alt="Node.js"/>
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white" alt="React"/>
  <img src="https://img.shields.io/badge/MongoDB-7-47A248?logo=mongodb&logoColor=white" alt="MongoDB"/>
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" alt="Redis"/>
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker&logoColor=white" alt="Docker"/>
</p>

---

## 📖 Overview

**NMN Cinema** is a full-stack MERN cinema management and online ticket booking system, built as a graduation thesis project. The system supports 3 main roles:

- 🎥 **Customer (Client):** Browse now-showing / upcoming movies, select showtimes, choose seats, add food combos, pay online via VNPay, receive QR Code tickets, rate movies, and earn membership points.
- 🛡️ **Admin:** Revenue dashboard, manage movies / showtimes / screening rooms / seats / combos / promotions / vouchers / banners / articles / users / roles & permissions.
- 📱 **Staff:** Scan QR codes to verify tickets at the cinema.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, Material UI 5, Redux Toolkit, React Router 6, Socket.IO Client, Swiper, React Hook Form |
| **Backend** | Node.js, Express 4, Mongoose (MongoDB), Socket.IO, JWT, Zod Validation, Swagger API Docs |
| **Database** | MongoDB 7, Redis 7 (caching & rate limiting) |
| **Infra / DevOps** | Docker & Docker Compose, Winston Logger, Node-Cron Jobs |
| **Payment** | VNPay Payment Gateway |
| **Other** | Google OAuth 2.0, Nodemailer (email), QR Code generation, Gemini AI Chatbot, Multer (image upload) |

---

## ✨ Key Features

- 🎟️ Online seat booking with real-time seat locking (Socket.IO)
- 💳 Payment via VNPay
- 📊 Admin dashboard with revenue charts, showtime stats, and seat occupancy rates
- 🤖 AI movie recommendation chatbot (Google Gemini)
- 🔐 Role-based access control (Admin / Staff / User)
- 🎫 Electronic QR Code tickets
- ⭐ Movie ratings & comments
- 🏷️ Promotions & voucher system
- 🏅 Membership points system
- 🚀 Dockerized – deploy with a single command

---

## 📸 Screenshots

### Booking Page
![Booking](docs/screenshots/Booking.png)

### Seat Selection
![Seat Selection](docs/screenshots/chair%20booking%20page.png)

---

## 🚀 Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js >= 18 (if running without Docker)

### Run with Docker (recommended)

```bash
# Clone the repository
git clone https://github.com/NguyenManhNinh/NMN-CENIMA.git
cd NMN-CENIMA

# Configure backend environment
cp backend/.env.example backend/.env
# Edit .env with your credentials (MongoDB URI, JWT Secret, VNPay, ...)

# Start backend + MongoDB + Redis
cd backend
docker compose up -d

# Install & run frontend
cd ../frontend
npm install
npm run dev
```

- Frontend runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`

---

## 📁 Project Structure

```
DATN-Cinema/
├── backend/                # REST API Server
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Mongoose schemas (31 models)
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   ├── middlewares/    # Auth, validation, error handling
│   │   ├── jobs/           # Cron jobs
│   │   └── utils/          # Helper functions
│   ├── docker-compose.yml
│   └── Dockerfile
│
├── frontend/               # React SPA
│   ├── src/
│   │   ├── pages/          # Admin | Client | Staff | Auth
│   │   ├── components/     # Reusable UI components
│   │   ├── redux/          # Redux Toolkit slices
│   │   ├── apis/           # Axios API calls
│   │   ├── hooks/          # Custom hooks
│   │   └── theme/          # MUI Theme config
│   └── vite.config.js
│
└── README.md
```

---

## 👨‍💻 Author

**Nguyen Manh Ninh** – Graduation Thesis, 2026
