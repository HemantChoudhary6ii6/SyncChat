<p align="center">
  <img src="frontend/public/favicon.svg" alt="SyncChat logo" width="90" height="90" />
</p>

<h1 align="center">SyncChat</h1>

<p align="center">
  A real-time chat app with direct messages, group chats, an AI assistant, image sharing, typing indicators, read receipts, and message search.
</p>

<p align="center">
  <a href="https://syncchat-l30s.onrender.com"><img src="https://img.shields.io/badge/demo-live-brightgreen" alt="Live demo"></a>
  <img src="https://img.shields.io/badge/node-18%2B-339933?logo=node.js&logoColor=white" alt="Node 18+">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/MongoDB-database-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
</p>

<p align="center">
  <a href="https://syncchat-l30s.onrender.com"><strong>Live demo →</strong></a>
</p>

---

## ✨ Features

- 💬 **Direct messages & group chats** — 1:1 conversations plus named group chats with multiple members
- 🤖 **Built-in AI assistant** — chat with an AI (powered by Groq's Llama 3.3 70B) right inside the app, no separate tab needed
- 🖼️ **Image sharing** — send photos in any conversation, uploaded and hosted via Cloudinary
- ✅ **Read receipts & delivery status** — single/double check marks like modern messaging apps
- ⌨️ **Live typing indicators** — see when someone's typing, in real time via Socket.IO
- 🟢 **Online presence** — know who's currently online
- 🔍 **Message search** — search across your conversations instantly
- 🔐 **Secure auth** — JWT-based sessions with hashed passwords (bcrypt)
- 🎨 **Clean, responsive UI** — built with Tailwind CSS + DaisyUI, works on mobile and desktop

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, DaisyUI, Zustand, React Router |
| Backend | Node.js, Express 5, Socket.IO |
| Database | MongoDB (Mongoose) |
| Image storage | Cloudinary |
| AI assistant | Groq API (Llama 3.3 70B Versatile) |
| Auth | JWT + bcrypt |

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

## 🤝 Contributing

Issues and pull requests are welcome. If you're adding a feature, please open an issue first to discuss what you'd like to change.