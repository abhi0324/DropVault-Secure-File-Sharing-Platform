# File Sharing Application

A modern, full-stack file sharing application built with **React**, **Express**, and **MongoDB**. Instantly upload files and share secure download links with anyone.

**Live Demo:** https://file-sharing-application-sigma.vercel.app/

---

## ✨ Features
- **Easy File Upload:** Upload any file and get a unique, shareable download link.
- **Download Tracking:** Each file's download count is tracked.
- **Modern UI:** Clean, responsive React interface with drag-and-drop, copy link, and open link.
- **Progress & Validation:** Upload progress bar and client-side size validation (25MB default).
- **REST API:** Robust backend with Express and MongoDB.

---

## 🖥️ Tech Stack
- **Frontend:** React, Vite, Axios
- **Backend:** Node.js, Express, Multer, Mongoose
- **Database:** MongoDB

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd File-sharing-application
```

### 2. Install dependencies
#### Backend
```bash
cd server
npm install
```
#### Frontend
```bash
cd ../client
npm install
```

### 3. Set up environment variables
Create a `.env` file in the `server` directory:
```
MONGO_URI=your_mongodb_connection_string
# Optional: public URL of your API (used to build download links)
PUBLIC_BASE_URL=https://your-api.example.com
# Optional: comma-separated list of allowed origins for CORS
CORS_ORIGINS=https://your-app.vercel.app,http://localhost:5173
```

Create a `.env.local` file in the `client` directory:
```
VITE_API_URL=http://localhost:8000
```

### 4. Start the servers
#### Backend
```bash
cd server
npm run dev
```
#### Frontend
```bash
cd ../client
npm run dev
```

---

## 📦 Project Structure
```
File-sharing-application/
├── client/         # React frontend
│   └── src/
│       ├── App.jsx
│       └── service/api.js
├── server/         # Express backend
│   ├── controller/
│   │   └── image-controller.js
│   ├── models/
│   │   └── file.js
│   ├── routes/
│   │   └── routes.js
│   ├── utils/
│   │   └── upload.js
│   ├── database/
│   │   └── db.js
│   └── server.js
```

---

## 🛠️ API Endpoints
- `POST /upload` — Upload a file (multipart/form-data, field: `file`)
- `GET /file/:fileId` — Download a file by its unique ID

---

## ☁️ Deployment
This setup deploys the frontend to Vercel and the backend to a host with persistent storage (e.g., Render/Railway/Fly/VM). Vercel serverless is not ideal for local-disk uploads.

### Backend (e.g., Render)
- Root directory: `server`
- Build command: `npm install`
- Start command: `node server.js`
- Environment variables: `MONGO_URI`, `PUBLIC_BASE_URL`, `CORS_ORIGINS` (and optionally `PORT`)
- If using persistent disk for uploads, ensure `server/uploads/` is writable or configure a mounted disk.

### Frontend (Vercel)
- Root directory: `client/`
- Build command: `npm run build`
- Output directory: `dist`
- Environment variables: set `VITE_API_URL` to your backend URL (e.g., `https://your-api.example.com`)
- Optional `vercel.json` at repo root (already included) builds from `client/`.

---

## 🔒 Notes on Production Hardening
- Replace local `multer` disk with S3/Cloudinary for reliable storage on serverless/free tiers.
- Add password-protected and expiring links.
- Restrict CORS to your deployed domains via `CORS_ORIGINS`.
- Validate file types and size on both client and server.

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License
[MIT](LICENSE) 