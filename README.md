# SyncChat

A real-time chat app with direct messages, group chats, an AI assistant, image sharing, typing indicators, read receipts, and message search.

**Stack:** React + Vite + Tailwind/DaisyUI (frontend) · Express + MongoDB + Socket.IO (backend) · Cloudinary (image uploads) · Groq API (AI assistant)

---

## Project structure

```
backend/    Express API, MongoDB models, Socket.IO server
frontend/   React app (Vite)
```

---

## 1. Prerequisites

- Node.js 18+
- A MongoDB database (local, or a free cluster from MongoDB Atlas)
- A Cloudinary account (free tier is fine) — for image uploads
- A Groq API key (free tier is fine) — for the AI assistant

---

## 2. Environment variables

Create `backend/.env` with:

```env
PORT=5001
NODE_ENV=development

MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=some_long_random_string

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

AI_API_KEY=your_groq_api_key
```

The frontend needs no `.env` — it talks to `http://localhost:5001/api` automatically in dev, and to `/api` (same origin) in production.

> **Never commit `.env`.** `backend/.gitignore` (included in this repo) covers this — double-check it's actually being ignored with `git status` before your first commit.

---

## 3. Local development

```bash
# backend
cd backend
npm install
npm run dev        # runs on http://localhost:5001

# frontend (in a second terminal)
cd frontend
npm install
npm run dev         # runs on http://localhost:5173
```

Open `http://localhost:5173` in your browser.

---

## 4. Deployment (single service)

`backend/src/index.js` serves `frontend/dist` as static files whenever `NODE_ENV=production` and a build is present, so both the API and the app ship from **one service, one URL** — no CORS setup, no cross-origin cookie complications.

Works on Render, Railway, Fly.io, a VPS, etc. Example using **Render**:

1. Push this repo to GitHub.
2. Create a new **Web Service** on Render, pointing at the repo.
3. **Root directory:** `backend`
4. **Build command:**
   ```
   npm run build
   ```
   (installs backend deps, then installs and builds the frontend into `frontend/dist`)
5. **Start command:**
   ```
   npm start
   ```
6. Add the environment variables from step 2 above, with:
   - `NODE_ENV=production`
   - `CLIENT_URL` set to your Render service's own URL (e.g. `https://syncchat.onrender.com`)
7. Deploy. Your app will be live at that URL, serving both the API and the frontend.

---

## 5. Notes

- `backend/.gitignore` protects `.env` and `node_modules` from ever being committed.
- The AI assistant is powered by Groq's `llama-3.3-70b-versatile` model — change the model string in `backend/src/controllers/ai.controller.js` if you want a different one.
- Profile pictures and message image attachments both upload through Cloudinary.
- If `frontend/dist` doesn't exist (e.g. you're running the backend standalone without building the frontend), the backend skips static serving automatically and just runs as an API.