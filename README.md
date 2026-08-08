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
- Frontend requires Firebase Web app config. `VITE_API_BASE_URL=/api` works for local Vite through the proxy and for hosted same-domain deployments served by Express. Use a full URL such as `https://api.example.com/api` only when the frontend and API are hosted on different domains.
- Backend `CLIENT_ORIGIN` accepts `*` for simple bring-up or one/more comma-separated frontend origins for locked-down separate-domain hosting, for example `http://localhost:5173,https://green-impact.com`.
- Backend uploads use `backend/uploads` by default. Set `UPLOAD_DIR=/absolute/persistent/uploads` on a VPS if you want uploaded files outside the app folder.
- AI entrepreneur coach uses Google AI Studio (Gemini). Add `GEMINI_API_KEY` to `backend/.env` (get a free key at [Google AI Studio](https://aistudio.google.com/apikey)). Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).
- If Gemini is not configured or temporarily fails, the coach returns a built-in fallback reply instead of breaking the chat.
- First admin user can be promoted by setting role from Firestore manually once, then use admin panel.
- This project uses the npm/module approach for Firebase (`import ... from "firebase/..."`) rather than `<script>` tags.

## VPS deployment
Build the React app first, then run the Express API. The backend serves `frontend/dist` and falls back to `index.html` for React routes, so page refreshes on `/dashboard`, `/app/tools`, and other deep links do not return 404.

```bash
cd frontend
npm install
npm run build

cd ../backend
npm install
npm start
```

For a same-domain VPS setup behind Nginx, point the domain to the backend process, or proxy traffic to `localhost:4000`. Keep `VITE_API_BASE_URL=/api` before building the frontend. For split domains, set `VITE_API_BASE_URL=https://your-api-domain/api` before `npm run build` and set backend `CLIENT_ORIGIN` to the frontend domain.

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
