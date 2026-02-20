# DropVault – Secure File Sharing Platform

A modern, full-stack secure file sharing platform built with **React**, **Express**, and **MongoDB**. Instantly upload files and share secure download links with anyone.

**Live Demo:** https://file-sharing-application-sigma.vercel.app/

---

## ✨ Features

### Core Features
- **Multiple File Upload:** Upload single or multiple files at once (up to 10 files)
- **Easy File Upload:** Drag & drop or click to select files, then upload with one click
- **Manual Upload Control:** Select files, configure options (password/expiry), then click "Upload Files" button
- **Download Tracking:** Each file's download count is tracked
- **Modern UI:** Clean, responsive React interface with beautiful gradients and animations

### Security & Protection
- **Password Protection:** Optional password protection for sensitive files
- **File Expiration:** Set automatic expiration dates for files (auto-delete after X days)
- **Server-Side Validation:** File size (25MB) and type validation on both client and server
- **Security Filtering:** Blocks dangerous file types (executables, scripts, etc.)

### User Experience
- **File Previews:** Image previews before upload
- **Manual Upload Workflow:** Select files → Set password/expiry options → Click "Upload Files" button
- **QR Code Generation:** Generate QR codes for easy mobile sharing
- **Toast Notifications:** Beautiful toast notifications for user feedback
- **Recent Uploads:** View and access recently uploaded files (stored locally)
- **File Metadata:** Display file size, type, upload date, and expiration info
- **Progress Tracking:** Real-time upload progress bar
- **Copy to Clipboard:** One-click link copying

### Advanced Features
- **File Info API:** Get file metadata without downloading
- **Automatic Cleanup:** Expired files are automatically deleted
- **Orphaned File Cleanup:** Utility to clean up files not in database
- **Error Handling:** Comprehensive error handling and user feedback

---

## 🖥️ Tech Stack
- **Frontend:** React, Vite, Axios, QRCode.react
- **Backend:** Node.js, Express, Multer, Mongoose
- **Database:** MongoDB
- **Storage:** Local filesystem (can be replaced with S3/Cloudinary)

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd DropVault-Secure-File-Sharing-Platform
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

**Note:** The frontend now includes `qrcode.react` for QR code generation. It will be installed automatically with `npm install`.

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

## 📖 How to Use

### Uploading Files

1. **Select Files:** 
   - Drag and drop files into the upload area, or
   - Click "Choose Files" button to browse and select files

2. **Configure Options (Optional):**
   - Set a password to protect your files
   - Set expiration time in days (files will auto-delete after expiration)

3. **Upload:**
   - Click the "Upload Files" button to start the upload
   - Watch the progress bar as files upload
   - Once complete, you'll receive shareable links

4. **Share:**
   - Copy the download link
   - Share the link with others (include password if set)
   - Generate QR code for easy mobile sharing

### Downloading Files

1. Open the shared link in your browser
2. If password-protected, a password page will appear — enter the password and click **Download File**
3. The file will download

---

## 📦 Project Structure
```
DropVault-Secure-File-Sharing-Platform/
├── client/              # React frontend
│   └── src/
│       ├── App.jsx      # Main application component
│       ├── App.css      # Styling
│       └── service/
│           └── api.js   # API service layer
├── server/              # Express backend
│   ├── controller/
│   │   └── image-controller.js  # Upload/download handlers
│   ├── models/
│   │   └── file.js      # MongoDB file schema
│   ├── routes/
│   │   └── routes.js    # API routes
│   ├── utils/
│   │   ├── upload.js    # Multer configuration
│   │   └── cleanup.js   # File cleanup utilities
│   ├── database/
│   │   └── db.js        # MongoDB connection
│   └── server.js        # Express server setup
```

---

## 🛠️ API Endpoints

### Upload File(s)
- **POST** `/upload` — Upload single or multiple files
  - **Body:** `multipart/form-data`
  - **Fields:**
    - `file` (required): File(s) to upload (can be multiple)
    - `password` (optional): Password to protect the file
    - `expiresInDays` (optional): Number of days until file expires
  - **Response:** Array of uploaded file objects with shareable links

### Get File Info
- **GET** `/file/:fileId/info` — Get file metadata without downloading
  - **Response:** File information (name, size, type, download count, expiration, etc.)

### Download File
- **GET** `/file/:fileId` — Download a file by its unique ID
  - **Query Parameters:**
    - `password` (optional): Password if file is protected
  - **Response:** File download or error message

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

## 🔒 Security Features
- ✅ Password protection for files
- ✅ File expiration and automatic deletion
- ✅ Server-side file size validation (25MB limit)
- ✅ Dangerous file type filtering (executables, scripts blocked)
- ✅ CORS configuration for allowed origins
- ✅ Secure password hashing (SHA-256)

## 🔧 Technical Improvements

### Backend Enhancements
- **Enhanced File Model:** Added `size`, `mimetype`, `originalName`, `password`, `expiresAt`, and `uploadedAt` fields with MongoDB TTL index support.
- **Improved Upload Handler:** Support for multiple files, password hashing, and expiration date handling.
- **New API Endpoints:** Added `/file/:fileId/info` for metadata and enhanced `/upload` with options.
- **Cleanup Utilities:** Added functions for automated cleanup of expired and orphaned files.

### Frontend Enhancements
- **Modern UI Components:** Added file preview cards, upload options panel, and QR code display.
- **Better State Management:** Handled multiple files, toast notifications, and recent uploads persistence.
- **Improved UX:** Drag and drop support, real-time progress tracking, and responsive design improvements.
- **Manual Upload Control:** Files no longer auto-upload on selection. Users can configure password/expiry options before clicking the "Upload Files" button, providing better control over the upload process.

## 🔄 Migration Notes

### For Existing Users
- The database schema has been updated. Existing files will remain functional but won't have the new metadata (size, mimetype, etc.).
- New optional features like password protection and expiration are available for all new uploads.

### For Developers
- **Dependencies:** Install the new frontend dependency using `npm install` in the `client` directory.
- **Maintenance:** Set up a cron job to run the cleanup utilities periodically as described in the Maintenance section.

## 📝 Future Enhancements (Next Steps)
- [ ] User authentication and accounts
- [ ] File versioning and history
- [ ] Advanced search and filtering
- [ ] Cloud storage integration (S3, Cloudinary)
- [ ] Virus scanning for uploaded files
- [ ] Rate limiting to prevent abuse

## 🧹 Maintenance

### Cleanup Expired Files
Run the cleanup utility to remove expired files:
```javascript
import { cleanupExpiredFiles, cleanupOrphanedFiles } from './utils/cleanup.js';

// Clean expired files
await cleanupExpiredFiles();

// Clean orphaned files (files on disk but not in database)
await cleanupOrphanedFiles();
```

Set up a cron job to run cleanup periodically:
```bash
# Example: Run cleanup daily at 2 AM
0 2 * * * node /path/to/server/utils/cleanup.js
```

## 📝 Notes on Production Hardening
- **Storage:** Replace local `multer` disk with S3/Cloudinary for reliable storage on serverless/free tiers
- **Rate Limiting:** Consider adding rate limiting to prevent abuse
- **File Scanning:** Add virus scanning for uploaded files
- **Monitoring:** Set up logging and monitoring for file operations
- **Backup:** Implement backup strategy for important files

---

## 🤝 Contributing
Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 📄 License

© 2025 Abhiswant Chaudhary.  
All rights reserved.  
This project and its source code cannot be copied, modified, or distributed without explicit permission from the author.