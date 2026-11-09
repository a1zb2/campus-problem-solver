# 🏫 Campus Problem Solver

An AI-powered campus complaint management system. Students submit problems, Gemini classifies them into categories, and they're auto-routed to the right department — all in seconds.

---

## 🎯 What it does

1. **Student submits** a complaint with their hostel block, room number, and an optional photo
2. **Gemini AI classifies** it into one of 6 categories with a confidence score
3. **Auto-routed** to the correct department executive
4. **Student tracks** their complaint status using a Tracking ID
5. **Admin resolves** complaints and updates status from a protected dashboard

---

## 🚀 Live Demo

- **Frontend:** [campus-problem-solver.vercel.app](https://campus-problem-solver.vercel.app)
- **Backend API:** [campus-problem-solver.onrender.com](https://campus-problem-solver.onrender.com)
- **API Docs:** [campus-problem-solver.onrender.com/docs](https://campus-problem-solver.onrender.com/docs)

> ⚠️ The backend is on Render's free tier and may take ~30 seconds to wake up after inactivity.

---

## 🗂️ Project Structure

```
campus-problem-solver/
├── backend/
│   ├── main.py          # FastAPI — all API routes
│   ├── agent.py         # Gemini classification agent (with model fallback)
│   ├── auth.py          # Clerk token verification for admin routes
│   ├── database.py      # SQLite (dev) / Postgres (prod) storage, incl. photos
│   ├── router.py        # Department routing + notification logger
│   ├── requirements.txt
│   └── Procfile         # For Render deployment
└── frontend/
    ├── src/
    │   ├── pages/               # Home, Submit, Track, Admin + 5 service pages
    │   ├── components/          # Shared UI (buttons, headers, hero demo…)
    │   ├── lib/                 # Services, categories, formatting helpers
    │   ├── api.js               # All API calls in one place
    │   └── App.jsx              # Routing, navbar, footer
    ├── package.json
    └── vite.config.js
```

---

## 🤖 AI Classification

Powered by **Gemini 3.8 Flash** (with Gemini 3.5 Flash-Lite as an automatic fallback) via LangChain. Complaints are classified into:

| Category | Routed To |
|---|---|
| 🚿 Bathroom & Hygiene | Maintenance Department |
| 🛡️ Anti-Ragging & Safety | Dean of Students Office |
| 🍱 Mess & Food Quality | Hostel & Mess Committee |
| 📚 Academic Issues | Academic Office |
| 🔧 Infrastructure/Maintenance | Maintenance Department |
| 📌 Other | General Administration |

- Returns **category + confidence score + reasoning**
- Low confidence (<50%) → fallback to General Administration for manual review
- Classification accuracy: **~90%+** on campus complaints

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Clerk, lucide-react |
| Backend | FastAPI, Python |
| Database | SQLite (local) / Postgres (production) |
| AI | Gemini 3.8 Flash via LangChain |
| Frontend Deploy | Vercel |
| Backend Deploy | Render |

---

## ⚙️ Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- A Google Gemini API key

### Backend

```bash
cd backend
pip install -r requirements.txt

# Create .env (see .env.example for all options)
cp .env.example .env   # then fill in GOOGLE_API_KEY

# Run
uvicorn main:app --reload
# Runs on http://localhost:8000
# Docs at http://localhost:8000/docs
```

### Frontend

```bash
cd frontend
npm install

# Create .env with your API URL and Clerk publishable key
cp .env.example .env

# Run
npm run dev
# Runs on http://localhost:5173
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/` | Health check |
| `POST` | `/problems` | Submit a complaint (multipart/form-data) |
| `GET` | `/problems` | Get all problems — **admin** |
| `GET` | `/problems/{id}` | Get single problem by tracking ID |
| `PATCH` | `/problems/{id}` | Update status + resolution — **admin** |
| `DELETE` | `/problems/{id}` | Delete a problem — **admin** |
| `GET` | `/stats` | Dashboard stats (total, by status) — **admin** |
| `GET` | `/images/{id}` | Photo attached to a complaint |

Admin routes require `Authorization: Bearer <Clerk session token>` once `CLERK_SECRET_KEY` is set (the frontend sends it automatically).

---

## 🚢 Deployment

### Backend → Render

1. Push to GitHub
2. Go to [render.com](https://render.com) → New Web Service
3. Connect your repo, set **Root Directory** to `backend`
4. **Build Command:** `pip install -r requirements.txt`
5. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `GOOGLE_API_KEY` — your Gemini key
   - `DATABASE_URL` — a Postgres URL (e.g. a free [Neon](https://neon.tech) database). **Without it, Render's free tier wipes all complaints and photos every time the service restarts or sleeps.**
   - `CLERK_SECRET_KEY` — from the Clerk dashboard → API keys. Locks the admin endpoints.
   - `ALLOWED_ORIGINS` — your Vercel URL (optional)
7. Deploy — copy your Render URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → New Project
2. Connect your repo, set **Root Directory** to `frontend`
3. Add environment variables: `VITE_API_URL=https://your-render-url.onrender.com` and `VITE_CLERK_PUBLISHABLE_KEY`
4. Deploy (`frontend/vercel.json` makes deep links like `/track` work on refresh)

---

## 🔐 Admin Access

Sign-in is handled by [Clerk](https://clerk.com). To make someone an admin, open the user in the Clerk dashboard and set their **public metadata** to:

```json
{ "role": "admin" }
```

They'll then see **Dashboard** in the navbar. The backend checks the same role (when `CLERK_SECRET_KEY` is set), so the admin API can't be called by anyone else.

---

## 👤 Team

Built for the AI/ML Hackathon — Campus Problem Solver challenge.