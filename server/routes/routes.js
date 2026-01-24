import express from 'express';
import { getImage, uploadImage, getFileInfo } from '../controller/image-controller.js';
import upload from '../utils/upload.js'; 
const router = express.Router();

// Upload endpoint - supports both single and multiple files
router.post('/upload', upload.array("file", 10), uploadImage);

// Get file metadata
router.get("/file/:fileId/info", getFileInfo);

// Download file
router.get("/file/:fileId", getImage);

export default router;
