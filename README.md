<div align="center">

<img src="frontend/public/icon.svg" width="100" height="100" alt="UHostel Logo" />

# UHostel Premium
### The Next-Generation Hostel Management Experience

**A sleek, high-performance SaaS platform built for modern campus life.**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg?style=for-the-badge)](LICENSE)
[![Node](https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)

</div>

---

## ✨ Premium Features

| Module | Description |
|---|---|
| 🔐 **Elite Auth** | OTP-based verification, secure JWT sessions, and **Advanced Password Recovery**. |
| 💎 **Branding** | Professional "U" identity with a custom glassmorphism UI design. |
| 🏠 **Smart Rooms** | Automated room allocation, real-time availability, and resident tracking. |
| 🎫 **Express Gate Pass** | Instant digital applications with automated warden approval workflows. |
| 🛒 **E-Canteen 2.0** | Integrated **Razorpay** payments, automated receipts, and instant inventory management. |
| 📊 **Admin Insights** | High-level statistics, occupancy rates, and financial overviews. |
| 💬 **Support Suite** | Real-time messaging and an integrated student security center. |
| ⚡ **Performance** | Optimized background visitor tracking and ultra-fast asset delivery. |

---

## 🗂️ Project Architecture

```bash
IP/
├── backend/                  # Scalable Node.js + Express API
│   ├── src/
│   │   ├── controllers/      # Business logic & Route handlers
│   │   ├── models/           # Mongoose schemas (optimized with indexes)
│   │   ├── utils/            # Email engine, JWT & security helpers
│   │   └── server.js         # Optimized entry point with DB pooling
│   └── scripts/              # Intelligent data seeding tools
│
├── frontend/                 # High-performance React + Vite SPA
│   ├── src/
│   │   ├── components/       # Premium UI components (Framer Motion)
│   │   ├── pages/            # Modern dashboard modules
│   │   ├── store/            # Redux Toolkit state management
│   │   └── utils/            # API client & specialized services (PDF/Receipts)
│
└── ...
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** (v18+)
- **MongoDB Atlas** account
- **Razorpay** API Keys (for canteen)
- **SMTP** Credentials (for OTP/Reset emails)

### 1. Environment Setup
Create a `.env` file in the `backend` folder:
```env
PORT=5001
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
CLIENT_URL=http://localhost:5173

# SMTP Configuration
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Razorpay Keys
RAZORPAY_KEY_ID=your_id
RAZORPAY_KEY_SECRET=your_secret
```

### 2. Launch
```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Redux Toolkit, Framer Motion, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js, Express 5, Mongoose, JWT, Nodemailer, Razorpay SDK.
- **Tools**: PostCSS, Autoprefixer, Axios, jsPDF.

---

<div align="center">

**Built with excellence for the IP Project.**  
Elevate your campus experience with **UHostel**.

</div>
