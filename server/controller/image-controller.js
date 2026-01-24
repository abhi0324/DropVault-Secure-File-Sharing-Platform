import File from "../models/file.js";
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// Helper to hash password
const hashPassword = (password) => {
    if (!password) return null;
    return crypto.createHash('sha256').update(password).digest('hex');
};

// Helper to verify password
const verifyPassword = (inputPassword, hashedPassword) => {
    if (!hashedPassword) return true; // No password set
    return hashPassword(inputPassword) === hashedPassword;
};

// Upload single or multiple files
export const uploadImage = async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        
        if (files.length === 0) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const { password, expiresInDays } = req.body;
        const expiresAt = expiresInDays 
            ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000)
            : null;

        const uploadedFiles = [];

        for (const file of files) {
            // Validate file size (25MB)
            if (file.size > 25 * 1024 * 1024) {
                // Delete the file if it exceeds size
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                continue; // Skip this file
            }

            const fileObj = {
                path: file.path,
                name: path.basename(file.path),
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                password: password ? hashPassword(password) : null,
                expiresAt: expiresAt,
            };

            const savedFile = await File.create(fileObj);
            const host = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
            
            uploadedFiles.push({
                id: savedFile._id,
                name: savedFile.originalName,
                size: savedFile.size,
                mimetype: savedFile.mimetype,
                path: `${host}/file/${savedFile._id}`,
                expiresAt: savedFile.expiresAt,
            });
        }

        if (uploadedFiles.length === 0) {
            return res.status(400).json({ msg: "No valid files uploaded" });
        }

        res.status(200).json({
            msg: "File(s) uploaded successfully",
            files: uploadedFiles,
            count: uploadedFiles.length
        });
    }
    catch (error) {
        console.error("Upload error:", error.message);
        res.status(500).json({ msg: "Error uploading file", error: error.message });
    }
}

// Get file metadata
export const getFileInfo = async (req, res) => {
    try {
        const fileID = req.params.fileId;
        const file = await File.findById(fileID);
        
        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        // Check if file expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            return res.status(410).json({ msg: "File has expired" });
        }

        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ msg: "File not found on server" });
        }

        res.status(200).json({
            id: file._id,
            name: file.originalName,
            size: file.size,
            mimetype: file.mimetype,
            downloadCount: file.downloadCount,
            uploadedAt: file.uploadedAt,
            expiresAt: file.expiresAt,
            hasPassword: !!file.password,
        });
    }
    catch (error) {
        console.error("Get file info error:", error.message);
        res.status(500).json({ msg: "Error fetching file info", error: error.message });
    }
}

// Download file
export const getImage = async (req, res) => {
    try {
        const fileID = req.params.fileId;
        const { password } = req.query;
        
        const file = await File.findById(fileID);
        
        if (!file) {
            return res.status(404).json({ msg: "File not found" });
        }

        // Check if file expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            // Delete expired file
            if (fs.existsSync(file.path)) {
                fs.unlinkSync(file.path);
            }
            await File.findByIdAndDelete(fileID);
            return res.status(410).json({ msg: "File has expired and been deleted" });
        }

        // Check password if required
        if (file.password && !verifyPassword(password, file.password)) {
            return res.status(401).json({ msg: "Password required or incorrect" });
        }

        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ msg: "File not found on server" });
        }

        // Increment download count
        file.downloadCount++;
        await file.save();

        // Set appropriate headers
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
        res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');
        
        res.download(file.path, file.originalName);
    }
    catch (error) {
        console.error("Download error:", error.message);
        res.status(500).json({ msg: "Error downloading file", error: error.message });
    }
}


