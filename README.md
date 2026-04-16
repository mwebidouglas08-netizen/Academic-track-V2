# AcademiTrack V2

Full-stack academic student progress tracking system with separate student portal and admin dashboard.

## Live URLs (after deployment)
- **Student Portal:** `https://your-app.railway.app/`
- **Admin Portal:** `https://your-app.railway.app/admin/` ← Not linked from frontend

---

## Architecture

```
academitrack-v2/
├── server/               Express API (Node.js + PostgreSQL)
│   ├── routes/
│   │   ├── auth.js       Student auth (register/login)
│   │   ├── adminAuth.js  Admin auth
│   │   ├── submissions.js
│   │   ├── communications.js  (notifications + messages)
│   │   ├── admin.js      Full admin CRUD
│   │   └── aiScore.js    Anthropic AI scoring endpoint
│   ├── middleware/auth.js JWT middleware
│   ├── db.js             PostgreSQL pool
│   ├── schema.sql        Database schema + seed
│   └── index.js          Express entry point
├── client/               React student portal (Vite)
│   └── src/
│       ├── contexts/AuthContext.jsx
│       ├── utils/api.js
│       ├── components/AppShell.jsx, Toast.jsx
│       └── pages/Landing.jsx, Auth.jsx, AppPage.jsx
├── admin/                React admin portal (Vite, base=/admin/)
│   └── src/
│       ├── contexts/AdminContext.jsx
│       ├── utils/api.js
│       ├── components/Toast.jsx
│       └── pages/AdminLogin.jsx, AdminDashboard.jsx
├── Dockerfile            Multi-stage build
└── railway.toml          Railway deployment config
```

---

## Default Admin Credentials

```
URL:      https://your-app.railway.app/admin/
Username: superadmin
Password: Admin@1234
```
**Change immediately after first login!**

---

## Local Development

### Prerequisites
- Node.js >= 18
- PostgreSQL database

### Setup

```bash
# 1. Install all dependencies
cd server && npm install
cd ../client && npm install
cd ../admin && npm install

# 2. Configure server environment
cp server/.env.example server/.env
# Edit server/.env with your DATABASE_URL and JWT_SECRET

# 3. Run database schema
psql $DATABASE_URL -f server/schema.sql

# 4. Start all three services
# Terminal 1 - API server
cd server && npm run dev

# Terminal 2 - Student portal
cd client && npm run dev      # http://localhost:3000

# Terminal 3 - Admin portal
cd admin && npm run dev       # http://localhost:3001
```

---

## Deploy to Railway

### Step 1 — Push to GitHub

```bash
git init
git add -A
git status    # Verify ALL files are listed, especially client/src/contexts/ etc.
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/academitrack-v2.git
git push -u origin main
```

### Step 2 — Create Railway Project

1. Go to https://railway.app
2. **New Project → Deploy from GitHub Repo**
3. Select your repository

### Step 3 — Add PostgreSQL

In your Railway project: **+ New → Database → Add PostgreSQL**

Railway will automatically provide `DATABASE_URL`.

### Step 4 — Set Environment Variables

In Railway → your service → **Variables**, add:

```
NODE_ENV=production
JWT_SECRET=<generate a long random string, e.g. openssl rand -hex 32>
ANTHROPIC_API_KEY=<your Anthropic API key - optional, app works without it>
```

Railway sets `PORT` automatically — do NOT add it.

### Step 5 — Run Database Schema

Option A — Railway Query tab:
1. Click your PostgreSQL service
2. Open **Query** tab
3. Paste contents of `server/schema.sql` and run

Option B — Via CLI:
```bash
# Install Railway CLI
npm install -g @railway/cli
railway login
railway run psql $DATABASE_URL -f server/schema.sql
```

### Step 6 — Deploy

Railway auto-deploys on every push to `main`. The `Dockerfile` handles everything:
1. Builds student React app
2. Builds admin React app
3. Packages both into the Express server

### Step 7 — Access Your App

| URL | Description |
|-----|-------------|
| `https://your-app.railway.app/` | Student landing page |
| `https://your-app.railway.app/login` | Student login |
| `https://your-app.railway.app/register` | Student registration |
| `https://your-app.railway.app/admin/` | Admin portal (separate, unlisted) |

---

## API Reference

### Student Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new student |
| POST | `/api/auth/login` | Student login |
| GET | `/api/auth/me` | Get current student (JWT required) |

### Student Endpoints (JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/submissions` | List student's submissions |
| POST | `/api/submissions` | Create new submission |
| GET | `/api/notifications` | Get notifications |
| PATCH | `/api/notifications/:id/read` | Mark notification as read |
| GET | `/api/messages` | Get sent messages |
| POST | `/api/messages` | Send message to moderator |
| POST | `/api/ai-score` | Score a submission with AI |

### Admin Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/auth/login` | Admin login |
| GET | `/api/admin/auth/me` | Get current admin (JWT required) |

### Admin Endpoints (Admin JWT required)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard statistics |
| GET/POST | `/api/admin/students` | List / add students |
| PATCH | `/api/admin/students/:id` | Activate/deactivate student |
| DELETE | `/api/admin/students/:id` | Remove student |
| GET | `/api/admin/submissions` | All submissions |
| PATCH | `/api/admin/submissions/:id` | Approve/reject/advance submission |
| GET/POST | `/api/admin/notifications` | List / send notifications |
| GET | `/api/admin/messages` | All student messages |
| POST | `/api/admin/messages/:id/reply` | Reply to message |
| GET/POST | `/api/admin/moderators` | List / add moderators |
| DELETE | `/api/admin/moderators/:id` | Remove moderator |

---

## Features

### Student Portal
- Register with name, reg number, phone, email, academic level, department, research topic
- Submit Proposals, Results, Presentations, Publications to any review level
- AI-powered automatic scoring (requires `ANTHROPIC_API_KEY`, graceful fallback otherwise)
- Visual journey tracker: Department → School Faculty → Postgraduate Board
- Progress dashboard with submission history and AI scores
- Receive and read notifications from moderators
- Send messages to moderators and receive replies

### Admin Portal (at `/admin/` — completely separate, no link from frontend)
- Secure login with separate JWT tokens from student tokens
- System dashboard with key statistics
- Full student management: add, view, activate/deactivate, remove
- Review all submissions: approve, reject, or advance to next level
- Manual score override + moderator notes fed back to students
- Send broadcast or targeted notifications to students
- Reply to student messages inline
- Manage moderator accounts (Super Admin only)
