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
            // Check if this is a browser request
            const acceptsHtml = req.accepts('html');
            
            if (acceptsHtml) {
                // Return HTML password form for browser requests
                const isIncorrect = password !== undefined && password !== ''; // If password was provided but wrong
                return res.status(401).send(`
                    <!DOCTYPE html>
                    <html lang="en">
                    <head>
                        <meta charset="UTF-8">
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <title>Password Required - File Download</title>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body {
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                min-height: 100vh;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                padding: 20px;
                            }
                            .container {
                                background: rgba(255, 255, 255, 0.95);
                                backdrop-filter: blur(10px);
                                border-radius: 16px;
                                padding: 40px;
                                max-width: 400px;
                                width: 100%;
                                box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                            }
                            h1 {
                                color: #333;
                                margin-bottom: 10px;
                                font-size: 1.5rem;
                            }
                            .subtitle {
                                color: #666;
                                margin-bottom: 30px;
                                font-size: 0.9rem;
                            }
                            .error {
                                background: #fee;
                                border: 1px solid #fcc;
                                color: #c33;
                                padding: 12px;
                                border-radius: 8px;
                                margin-bottom: 20px;
                                font-size: 0.9rem;
                            }
                            .form-group {
                                margin-bottom: 20px;
                            }
                            label {
                                display: block;
                                color: #333;
                                margin-bottom: 8px;
                                font-weight: 500;
                                font-size: 0.9rem;
                            }
                            input[type="password"] {
                                width: 100%;
                                padding: 12px 16px;
                                border: 2px solid #e0e0e0;
                                border-radius: 8px;
                                font-size: 1rem;
                                transition: border-color 0.2s;
                            }
                            input[type="password"]:focus {
                                outline: none;
                                border-color: #667eea;
                            }
                            button {
                                width: 100%;
                                padding: 14px;
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                border-radius: 8px;
                                font-size: 1rem;
                                font-weight: 600;
                                cursor: pointer;
                                transition: transform 0.2s, box-shadow 0.2s;
                            }
                            button:hover {
                                transform: translateY(-2px);
                                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.4);
                            }
                            button:active {
                                transform: translateY(0);
                            }
                            .file-info {
                                background: #f5f5f5;
                                padding: 12px;
                                border-radius: 8px;
                                margin-bottom: 20px;
                                font-size: 0.85rem;
                                color: #666;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="container">
                            <h1>🔒 Password Required</h1>
                            <p class="subtitle">This file is password protected</p>
                            ${isIncorrect ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
                            <div class="file-info">
                                <strong>File:</strong> ${file.originalName.replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br>
                                <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                            <form method="GET" action="/file/${fileID}">
                                <div class="form-group">
                                    <label for="password">Enter Password:</label>
                                    <input 
                                        type="password" 
                                        id="password" 
                                        name="password" 
                                        placeholder="Enter file password" 
                                        required 
                                        autofocus
                                    />
                                </div>
                                <button type="submit">Download File</button>
                            </form>
                        </div>
                    </body>
                    </html>
                `);
            }
            // For API requests, return JSON
            return res.status(401).json({ 
                msg: "Password required or incorrect",
                requiresPassword: true,
                fileId: fileID
            });
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


