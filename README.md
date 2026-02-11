# Sustainable Entrepreneurship Platform MVP

Full-stack MVP for entrepreneurship training and mentoring focused on environmental, social, and economic sustainability.

## Stack
- Backend: Node.js + Express + Firebase Admin (Auth token verification + Firestore)
- Frontend: React + Vite + Firebase Client Auth
- Database: Firestore
- File upload: local disk for MVP (`backend/uploads`)

## Features
- Role-based access: `entrepreneur`, `mentor`, `admin`
- Learning system: courses, modules, videos, downloadable docs, quizzes, progress tracking
- Entrepreneur workflow: learning paths, BMC/Green BMC/Green Business Plan forms, document uploads, validation tracking
- Mentor workflow: course creation, project review, feedback loops, validation and strategy recommendations
- Mentoring sessions: scheduling, meeting links, session history, simple reminder metadata
- Admin panel: user/role management, course and project visibility

## Run locally

### 1) Backend
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### 2) Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Environment notes
- Backend requires Firebase Admin credentials in `.env`.
- Frontend requires Firebase Web app config and backend URL.
- First admin user can be promoted by setting role from Firestore manually once, then use admin panel.
- This project uses the npm/module approach for Firebase (`import ... from "firebase/..."`) rather than `<script>` tags.

## Firebase quick setup (your project)
- Frontend config is prefilled in `frontend/.env.example` for `greenland-a11db`.
- Copy it to `frontend/.env` before running the frontend.
- Firestore in Test mode is fine for early MVP testing, but switch to restricted security rules before production.

## MVP architecture notes
- Firestore collections: `users`, `courses`, `enrollments`, `projects`, `sessions`
- Auth uses Firebase ID token from frontend; backend verifies every protected request.
- Uploads are served from `/uploads/*` for MVP simplicity.

## Sustainability focus in product flow
- Structured forms include sustainability-specific sections.
- Learning tracks include classic and green entrepreneurship.
- Validation stages model growth from idea to creation to growth with impact-oriented review.
