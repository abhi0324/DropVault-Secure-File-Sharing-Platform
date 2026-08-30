import express from 'express';
import { 
    getImage, 
    uploadImage, 
    getFileInfo, 
    getUserFiles, 
    toggleRevokeFile, 
    deleteUserFile, 
    getUserStats 
} from '../controller/image-controller.js';
import { registerUser, loginUser, getMe } from '../controller/auth-controller.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import upload from '../utils/upload.js'; 

const router = express.Router();

// --- Auth Routes ---
router.post('/api/auth/register', registerUser);
router.post('/api/auth/login', loginUser);
router.get('/api/auth/me', requireAuth, getMe);

// --- User Dashboard & Management Routes ---
router.get('/api/user/files', requireAuth, getUserFiles);
router.patch('/api/user/files/:id/revoke', requireAuth, toggleRevokeFile);
router.delete('/api/user/files/:id', requireAuth, deleteUserFile);
router.get('/api/user/stats', requireAuth, getUserStats);

// --- Public File & Upload Routes ---
// Upload endpoint - supports guest uploads and authenticated user uploads
router.post('/upload', optionalAuth, upload.array("file", 10), uploadImage);

// Get file metadata
router.get("/file/:fileId/info", getFileInfo);

// Download file
router.get("/file/:fileId", getImage);

export default router;
