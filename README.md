# 🎓 ADIT Student Portal

> A full-stack student productivity platform for A.D. Patel Institute of Technology.
> Built with React + Node.js + MongoDB + Firebase + Cloudinary.

---

## ✅ What's Built (P0 Features)

| Feature | Status |
|---|---|
| Student / Faculty / Admin authentication | ✅ |
| Email domain restriction (`@adit.ac.in`) | ✅ |
| Role-based dashboards | ✅ |
| Academic Hub (Semester → Branch → Subject → Resources) | ✅ |
| Resource upload (PDF, 10MB limit) | ✅ |
| Faculty approval / rejection workflow | ✅ |
| Download tracking with counter | ✅ |
| Bookmark toggle | ✅ |
| Notice Board (post, filter, paginate) | ✅ |
| Profile page (uploads + bookmarks + settings) | ✅ |
| Admin panel (user management + moderation) | ✅ |
| In-app notification bell | ✅ |
| Placement Hub (static company cards) | ✅ |

---

## 🚀 Quick Setup (Step-by-Step)

### 1. Prerequisites
- Node.js 18+ installed (`node --version`)
- A Google account (for Firebase + Cloudinary)

---

### 2. Firebase Setup (5 minutes)

1. Go to [console.firebase.google.com](https://console.firebase.google.com)
2. Click **"Add project"** → give it a name (e.g. `campusos-adit`) → Continue
3. Disable Google Analytics (not needed) → **Create project**
4. In the project, go to **Build → Authentication** → **Get started**
5. Under **Sign-in providers**, enable **Email/Password** → Save
6. Go to **Project Settings** (gear icon) → **Your apps** → click the `</>` (Web) icon
7. Register the app (name: `CampusOS Web`) → you'll see a `firebaseConfig` object:
   ```js
   const firebaseConfig = {
     apiKey: "...",
     authDomain: "...",
     projectId: "...",
     ...
   };
   ```
   **Copy these values** — you'll need them for the frontend `.env`.

8. Go to **Project Settings → Service Accounts** → **Generate new private key**
   → Download the JSON file. You'll need `project_id`, `client_email`, and `private_key` for the backend `.env`.

---

### 3. MongoDB Atlas Setup (5 minutes)

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com) → Sign up / Log in
2. Create a **Free (M0) cluster** (choose any region, default settings)
3. Create a **database user**: Security → Database Access → Add New Database User
   - Username: `campusos` | Password: (remember this!)
4. Allow network access: Security → Network Access → Add IP Address → **Allow Access from Anywhere** (`0.0.0.0/0`)
5. Get connection string: Clusters → Connect → Drivers → Node.js
   - Copy the string — it looks like:
   ```
   mongodb+srv://campusos:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
   Replace `<password>` with your DB password and add `campusos` as the database name:
   ```
   mongodb+srv://campusos:yourpassword@cluster0.xxxxx.mongodb.net/campusos?retryWrites=true&w=majority
   ```

---

### 4. Cloudinary Setup (3 minutes)

1. Go to [cloudinary.com](https://cloudinary.com) → Sign up (free)
2. After signup, go to **Dashboard**
3. Note your **Cloud name**, **API Key**, and **API Secret**

---

### 5. Configure Environment Files

**Backend:**
```bash
cd backend
copy .env.example .env
# Now open .env and fill in all values
```

Fill in:
- `MONGODB_URI` — from step 3
- `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` — from the service account JSON (step 2, item 8)
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — from step 4
- `ALLOWED_EMAIL_DOMAIN=@adit.ac.in` (or `@gmail.com` for local testing)

**Frontend:**
```bash
cd frontend
copy .env.example .env
# Now open .env and fill in all values
```

Fill in all `VITE_FIREBASE_*` values from the `firebaseConfig` object (step 2, item 7).
Set `VITE_ALLOWED_EMAIL_DOMAIN` to match the backend.

---

### 6. Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

### 7. Run the Seed Script (creates test accounts)

```bash
cd backend
node seed.js
```

This creates:
| Account | Email | Password | Role |
|---|---|---|---|
| Admin | admin@adit.ac.in | Admin@123456 | Admin |
| Faculty | faculty@adit.ac.in | Faculty@123456 | Faculty |
| Student | student@adit.ac.in | Student@123456 | Student |

> ⚠️ If your `ALLOWED_EMAIL_DOMAIN` is `@gmail.com` for testing, update the `SEED_*_EMAIL` values in `.env` accordingly before running.

---

### 8. Start the Servers

Open two terminals:

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev
# Server starts at http://localhost:5000
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
# App starts at http://localhost:5173
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing the Full Flow

### Test 1: Student upload → Faculty approval
1. Log in as **Student** → Upload Resource → submit a PDF
2. Log in as **Faculty** → Dashboard shows pending count → Faculty Approvals → Approve it
3. Log in as **Student** → Academic Hub → find and download the resource
4. Check Student Profile → My Uploads → status changed to Published

### Test 2: Role-based access control
1. Log in as **Student** → try navigating to `/admin` manually
2. You should be redirected to Dashboard with an "Access denied" toast

### Test 3: Notification bell
1. Log in as **Admin** → Post a notice
2. Log in as **Student** → Bell should show unread count → click to read

---

## 📁 Project Structure

```
campusos/
├── backend/
│   ├── src/
│   │   ├── config/       # db.js, cloudinary.js, firebase.js
│   │   ├── middleware/   # auth.js (Firebase token verify + role guard)
│   │   ├── models/       # User, Resource, Notice, Download, Bookmark, Notification
│   │   ├── routes/       # auth, resources, notices, admin
│   │   └── controllers/  # authController, resourceController, noticeController, adminController
│   ├── seed.js           # Creates test accounts + sample notices
│   ├── .env.example      # Copy to .env and fill in
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── layout/   # AppShell (sidebar + navbar)
    │   │   └── ui/       # StatCard, ResourceListItem, StatusBadge, EmptyState, NotificationBell
    │   ├── context/      # AuthContext (Firebase + MongoDB user)
    │   ├── pages/
    │   │   ├── auth/     # Login, Register
    │   │   ├── dashboard/# StudentDashboard, FacultyDashboard, AdminDashboard
    │   │   ├── academic/ # AcademicHub, SubjectPage, UploadResource
    │   │   ├── faculty/  # ApprovalQueue
    │   │   ├── admin/    # AdminPanel
    │   │   ├── notices/  # NoticePage
    │   │   ├── profile/  # ProfilePage
    │   │   └── placement/# PlacementHub
    │   ├── router/       # ProtectedRoute
    │   ├── services/     # api.js (axios), firebase.js
    │   └── index.css     # Full design system (CSS variables, components)
    ├── .env.example
    └── vite.config.js
```

---

## 🚢 Deployment (P0 Verification)

### Frontend — Vercel
1. Push code to GitHub
2. Connect repo to Vercel → set **Root Directory** to `frontend`
3. Add all `VITE_*` environment variables in Vercel project settings
4. Deploy

### Backend — Render
1. Connect repo to [render.com](https://render.com) → New Web Service
2. Set **Root Directory** to `backend`
3. Build command: `npm install`
4. Start command: `node src/app.js`
5. Add all environment variables from `backend/.env`
6. Update `FRONTEND_URL` to your Vercel URL

---

## 📋 P1 Features (Next Phase)
- Search bar (resources + subjects)
- AI Assistant (PDF summarizer, MCQ generator via Gemini API)
- Discussion Forum
- Interview Experience submissions
- CGPA calculator
- Dark mode

---

## 👥 Team
Built by a 4-Friends
