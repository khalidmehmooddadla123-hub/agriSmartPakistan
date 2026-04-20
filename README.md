# 🌾 AgriSmart360 — Smart Agriculture Management Platform

AI-powered, bilingual (English/Urdu) web platform that empowers Pakistani farmers with real-time crop prices, weather forecasts, disease detection, smart calculators, marketplace, and community — all in one place.

![Tech](https://img.shields.io/badge/Stack-MERN-22c55e) ![AI](https://img.shields.io/badge/AI-Gemini%202.5-8b5cf6) ![ML](https://img.shields.io/badge/ML-HuggingFace-f59e0b) ![License](https://img.shields.io/badge/License-MIT-blue)

---

## ✨ Key Features

### 🧠 AI & Machine Learning
- **AI Disease Detection** — Real image analysis via Hugging Face ML + Gemini diagnosis
- **AI Farming Chatbot** — Urdu/English conversational advisor powered by Gemini 2.5 Flash
- **Voice Input** — Speak in Urdu or English (Web Speech API)
- **Crop Recommendation Engine** — Personalized based on location, weather, season

### 📊 Real-Time Data
- **Crop Prices** — International (USD), National (PMEX), Local mandi — 30-day trend charts
- **Weather** — 7-day forecast + agricultural advisories via OpenWeatherMap
- **Agriculture News** — 47,000+ articles via GNews API in 7 categories
- **Interactive Map** — Pakistan-wide crop prices & weather visualization (Leaflet)

### 🔔 Smart Automation (8 cron jobs)
- Daily digest email at 6 AM PKT (personalized per user)
- Harvest reminders 7 days & 1 day before expected harvest
- Pest outbreak auto-detection (aggregates disease reports by district)
- Weather alerts for extreme heat/frost/rain/wind
- Price alert triggers when thresholds crossed
- Auto price updates, news refresh

### 🧮 Farmer Calculators (AI-powered)
- **Smart Irrigation** — Penman-Monteith ET calculation + Gemini advice
- **Fertilizer (NPK)** — Pakistani brand recommendations + PKR cost estimates
- **Yield Predictor** — AI-estimated harvest & revenue
- **Crop Rotation Planner** — Soil health + profit optimization
- **Zakat/Ushar Calculator** — Islamic jurisprudence (5% vs 10%)

### 💼 Business Tools
- **Expense Tracker** — Track inputs, revenue, profit margins, break-even
- **Farmer Marketplace** — Direct farmer-to-buyer sales (skip middlemen)
- **Community Forum** — Q&A platform with upvoting
- **Government Subsidies** — 8 Pakistani schemes + eligibility checker

### 🔒 Production-Grade
- JWT auth + OTP via SMS + Gmail SMTP
- Real-time notifications via Socket.io
- PWA (installable, offline-capable)
- Dark mode + full RTL Urdu support
- Rate limiting + Swagger API docs
- Responsive design (mobile, tablet, desktop)

---

## 🚀 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19 · Vite · Tailwind CSS v4 · Recharts · Leaflet · Socket.io-client |
| **Backend** | Node.js · Express.js · MongoDB (Mongoose) · node-cron |
| **AI** | Google Gemini 2.5 Flash · Hugging Face Inference API |
| **Auth** | JWT · bcrypt · Twilio OTP |
| **Email** | Nodemailer · Gmail SMTP |
| **Real-time** | Socket.io |
| **APIs** | OpenWeatherMap · GNews · Gemini · Hugging Face |
| **i18n** | i18next (English + Urdu with RTL) |

---

## 📦 Project Structure

```
agrismart360/
├── backend/
│   ├── config/          # MongoDB + Swagger config
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Auth, error handling, validation
│   ├── models/          # Mongoose schemas (User, Crop, Price, Weather, etc.)
│   ├── routes/          # API endpoints
│   ├── services/        # Email, SMS, AI, ML, cron, calculators
│   ├── seeds/           # DB seed script
│   └── server.js        # Entry point
├── frontend/
│   └── src/
│       ├── components/  # Layout, UI, Skeletons, FormControls
│       ├── context/     # Auth, Socket, Theme
│       ├── hooks/       # useVoiceInput
│       ├── i18n/        # EN + UR translations
│       ├── pages/       # All pages + tools/
│       └── services/    # API client
└── README.md
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)

### Free API Keys Needed
| Service | Link |
|---------|------|
| MongoDB Atlas | https://cloud.mongodb.com |
| OpenWeatherMap | https://openweathermap.org/api |
| Google Gemini | https://aistudio.google.com/app/apikey |
| Hugging Face | https://huggingface.co/settings/tokens |
| GNews | https://gnews.io |
| Gmail App Password | https://myaccount.google.com/apppasswords |

### 1. Backend

```bash
cd backend
cp .env.example .env
# Fill in all API keys in .env
npm install
npm run seed        # Seeds demo users, crops, prices, news
npm run dev         # Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL=http://localhost:5000/api (default)
npm install
npm run dev         # Runs on http://localhost:5173
```

### 3. Login

| Role | Email | Password |
|------|-------|----------|
| Admin | `admin@agrismart360.com` | `admin123` |
| Farmer | `farmer@agrismart360.com` | `farmer123` |

---

## 🌐 Deployment

### Frontend → Vercel
- Import repo at https://vercel.com/new
- Root directory: `frontend`
- Add env: `VITE_API_URL=https://your-backend.onrender.com/api`
- Deploy — auto redeploys on every push

### Backend → Render
- Create Web Service at https://render.com
- Root directory: `backend`
- Build: `npm install` · Start: `node server.js`
- Add all env vars from `.env.example`
- Deploy — auto redeploys on every push

### Database → MongoDB Atlas
- Free M0 cluster (512MB forever)
- Whitelist 0.0.0.0/0 for cloud deployment
- Copy connection string to `MONGODB_URI`

---

## 📸 Screenshots

Dashboard · Disease Scanner · Farm Tools · Marketplace · Forum · Interactive Map

*(Screenshots coming soon)*

---

## 🎓 Academic Info

**Final Year Project (FYP)** — BS Software Engineering
**Author**: Khalid Mehmood · F23BSEEN1M01163
**Institution**: The Islamia University of Bahawalpur
**Supervisor**: Maam Alishah Safdar
**Submitted**: 2026

---

## 📄 License

MIT © 2026 Khalid Mehmood

---

## 🙏 Acknowledgments

Built for Pakistani farmers — may this platform help bridge the information gap and empower the agricultural community.
