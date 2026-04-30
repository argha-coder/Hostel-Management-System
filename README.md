<div align="center">

<img src="frontend/public/icon.svg" width="80" height="80" alt="UHostel Logo" />

# UHostel Management System

**A modern, full-stack hostel management platform built with React + Node.js**

[![License: MIT](https://img.shields.io/badge/License-MIT-6366f1.svg)](LICENSE)
![Node](https://img.shields.io/badge/Node.js-18%2B-brightgreen)
![React](https://img.shields.io/badge/React-18-61dafb)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248)

</div>

---

## ✨ Features

| Module | Description |
|---|---|
| 🔐 **Auth** | OTP-based email verification, JWT sessions, role-based access (Student / Warden) |
| 🏠 **Rooms** | Room allocation, availability tracking, student assignment |
| 🚪 **Gate Pass** | Apply, approve/reject gate passes with email notifications |
| 🍽️ **E-Canteen** | Browse menu, place orders, track order status |
| 📋 **Notices** | Post and view hostel notices |
| 💸 **Fines** | Issue and track student fines |
| 📅 **Bookings** | Manage room bookings |
| 💬 **Chat** | Real-time messaging (AI/support) |

---

## 🗂️ Project Structure

```
IP/
├── backend/                  # Node.js + Express + MongoDB
│   ├── scripts/              # Seed scripts & utilities
│   └── src/
│       ├── config/           # Database connection
│       ├── controllers/      # Route handlers
│       ├── middleware/        # Auth middleware
│       ├── models/           # Mongoose schemas
│       ├── routes/           # API route definitions
│       ├── utils/            # Email, token helpers
│       └── server.js         # Entry point
│
├── frontend/                 # React + Vite
│   ├── public/               # Static assets (icon, etc.)
│   └── src/
│       ├── components/       # Reusable UI components
│       ├── pages/            # Route-level page components
│       ├── store/            # Redux Toolkit state
│       ├── utils/            # API client
│       └── App.jsx           # Router & layout
│
├── .gitignore
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v18 or higher
- **MongoDB** (local instance or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **npm** v9+

### 1. Clone the repository

```bash
git clone https://github.com/your-username/uhostel.git
cd uhostel
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

> See [backend/.env.example](backend/.env.example) for all required variables.

Start the dev server:

```bash
npm run dev
# Runs on http://localhost:5001
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

---

## ⚙️ Environment Variables

Create `backend/.env` with the following:

```env
NODE_ENV=development
PORT=5001
MONGO_URI=mongodb://localhost:27017/uhostel

# JWT
JWT_SECRET=your_super_secret_key_here

# SMTP (for OTP emails)
SMTP_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_gmail_app_password
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

---

## 🛠️ Tech Stack

**Frontend**
- [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/) — state management
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Lucide React](https://lucide.dev/) — icons
- [React Router v6](https://reactrouter.com/)

**Backend**
- [Node.js](https://nodejs.org/) + [Express 5](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/) + [Mongoose](https://mongoosejs.com/)
- [JWT](https://jwt.io/) — authentication
- [Nodemailer](https://nodemailer.com/) — OTP emails
- [bcryptjs](https://github.com/dcodeIO/bcrypt.js) — password hashing

---

## 📜 Available Scripts

### Backend
| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (hot reload) |

### Frontend
| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Commit changes: `git commit -m 'feat: add my feature'`
4. Push to branch: `git push origin feature/my-feature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

<div align="center">
Made with ❤️ for the IP Project
</div>
