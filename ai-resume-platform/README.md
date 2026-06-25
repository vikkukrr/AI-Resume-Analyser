# CareerAI — AI Resume Analyzer & Mock Interview Platform

A full-stack MERN application that analyzes resumes for ATS compatibility and conducts personalized mock interviews using **Google Gemini 2.5 Flash (Free Tier)**.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite, Tailwind CSS, Framer Motion, Recharts |
| Backend | Node.js, Express.js, MongoDB + Mongoose |
| AI | Google Gemini 2.5 Flash (Free Tier) |
| Auth | JWT (access tokens) |
| Files | Multer (PDF/DOCX upload) |
| Email | Nodemailer (SMTP) |
| Deploy | Vercel (FE) · Render (BE) · MongoDB Atlas |

---

## Project Structure

```
ai-resume-platform/
├── frontend/                       # React + Vite
│   └── src/
│       ├── components/
│       │   ├── common/             # ScoreRing, EmptyState, PageHeader, Skeletons
│       │   └── layout/             # AppLayout (sidebar nav)
│       ├── context/                # AuthContext, ThemeContext
│       ├── pages/                  # All 11 pages
│       └── utils/                  # api.js (Axios), helpers.js
│
└── backend/                        # Node.js + Express
    └── src/
        ├── config/                 # db.js
        ├── controllers/            # auth, user, resume, interview, dashboard, admin
        ├── middleware/             # auth, errorHandler, upload, validate
        ├── models/                 # User, Resume, Interview, Feedback
        ├── routes/                 # All REST routes
        └── services/              # aiService.js (Gemini), emailService.js
```

---

## Pages

| Route | Page | Auth |
|-------|------|------|
| `/` | Home / Landing | Public |
| `/login` | Login | Guest only |
| `/register` | Register | Guest only |
| `/dashboard` | Analytics dashboard | ✅ |
| `/resume/upload` | Upload + view resumes | ✅ |
| `/resume/:id` | Full ATS analysis result | ✅ |
| `/interview` | Start mock interview | ✅ |
| `/interview/:id` | Live interview session | ✅ |
| `/interview/:id/result` | Interview results | ✅ |
| `/profile` | Edit profile + password | ✅ |
| `/leaderboard` | Community rankings | ✅ |
| `/roadmap` | AI career roadmap | ✅ |
| `/admin` | User management | Admin only |

---

## API Endpoints

### Auth  `/api/auth`
```
POST   /register          Register new user
POST   /login             Login
GET    /me                Get current user
POST   /logout            Logout
PUT    /change-password   Change password
```

### Resumes  `/api/resumes`
```
POST   /upload            Upload PDF/DOCX resume
GET    /                  List user's resumes
GET    /:id               Get single resume with full analysis
GET    /:id/status        Poll analysis status
DELETE /:id               Delete resume
POST   /:id/reanalyze     Re-run AI analysis
```

### Interviews  `/api/interviews`
```
POST   /start             Generate 10 questions + start session
POST   /:id/answer        Submit + evaluate one answer
POST   /:id/skip          Skip a question
POST   /:id/complete      Finalize + get overall feedback
GET    /                  List user's interviews
GET    /:id               Get full interview with Q&A
DELETE /:id               Delete interview
```

### Dashboard  `/api/dashboard`
```
GET    /stats             Analytics: ATS history, interview history, role distribution
GET    /roadmap           Generate AI career roadmap
```

### Users  `/api/users`
```
GET    /profile           Get own profile
PUT    /profile           Update profile
GET    /leaderboard       Community rankings
GET    /:id               Public profile
DELETE /account           Deactivate account
```

### Admin  `/api/admin`
```
GET    /stats             Platform-wide stats
GET    /users             All users (paginated + searchable)
PATCH  /users/:id/toggle  Activate/deactivate user
PATCH  /users/:id/role    Change user role
DELETE /users/:id         Permanently delete user
GET    /feedback          View all feedback
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- Google Gemini API key (free at [aistudio.google.com](https://aistudio.google.com/apikey))

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# Fill in MONGODB_URI and GEMINI_API_KEY (minimum required)
npm run dev
# Server starts at http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
# Create .env.local
echo "VITE_API_URL=http://localhost:5000/api" > .env.local
npm run dev
# App starts at http://localhost:5173
```

### Environment Variables

**Backend `.env`** (minimum required):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ai_resume_db
JWT_SECRET=your_very_long_random_secret_key_here
GEMINI_API_KEY=AIzaSy_YOUR_FREE_GEMINI_KEY
FRONTEND_URL=http://localhost:5173
```

**Frontend `.env.local`**:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Getting Your Free Gemini API Key

1. Go to [aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API key"**
4. Copy and paste it into your `GEMINI_API_KEY` env var
5. **Free tier limits**: 15 RPM, 1M tokens/min, 1500 req/day — plenty for development

---

## Deployment

### Frontend → Vercel
```bash
# In Vercel dashboard:
# 1. Import GitHub repo
# 2. Set Root Directory: frontend
# 3. Framework Preset: Vite
# 4. Add env var: VITE_API_URL=https://your-backend.onrender.com/api
# 5. Deploy
```
Add `frontend/vercel.json`:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Backend → Render
```bash
# In Render dashboard:
# 1. New Web Service → connect GitHub
# 2. Root Directory: backend
# 3. Build Command: npm install
# 4. Start Command: npm start
# 5. Add all env vars from .env.example
# 6. Deploy
```

### MongoDB Atlas
1. Create free cluster at [mongodb.com/atlas](https://mongodb.com/atlas)
2. Create DB user
3. Allow all IPs: `0.0.0.0/0`
4. Get connection string → set as `MONGODB_URI`

### Create Admin User
After registering, run in MongoDB Atlas shell:
```js
db.users.updateOne(
  { email: "admin@yourdomain.com" },
  { $set: { role: "admin" } }
)
```

---

## Features

- ✅ ATS resume scoring (0–100) with section breakdown
- ✅ Skill detection & gap analysis  
- ✅ Job match recommendations with salary ranges
- ✅ AI career roadmap generator (4 phases)
- ✅ Mock interviews (10 questions, role-specific)
- ✅ Real-time AI answer evaluation with model answers
- ✅ Dashboard with ATS + interview score charts
- ✅ Leaderboard (sort by interview score or ATS)
- ✅ Dark / light mode
- ✅ Email notifications (welcome, analysis complete, interview done)
- ✅ Admin panel with user management
- ✅ JWT authentication with protected routes
- ✅ Fully responsive (mobile-first)
- ✅ Loading skeletons throughout

---

## License
MIT
