import File from "../models/file.js";
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

// Helper to hash password
const hashPassword = async (password) => {
    if (!password) return null;
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

// Helper to verify password
const verifyPassword = async (inputPassword, hashedPassword) => {
    if (!hashedPassword) return true; // No password set
    if (!inputPassword) return false;
    return bcrypt.compare(inputPassword, hashedPassword);
};

// Helper to safely delete file from disk
const deleteFileFromDisk = (filePath) => {
    try {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (err) {
        console.error("Error deleting file from disk:", err.message);
    }
};

// Upload single or multiple files
export const uploadImage = async (req, res) => {
    try {
        const files = req.files || (req.file ? [req.file] : []);
        
        if (files.length === 0) {
            return res.status(400).json({ msg: "No file uploaded" });
        }

        const { password, expiresInDays, maxDownloads, burnAfterReading } = req.body;
        
        const expiresAt = expiresInDays && parseInt(expiresInDays) > 0
            ? new Date(Date.now() + parseInt(expiresInDays) * 24 * 60 * 60 * 1000)
            : null;

        const maxDownloadsNum = maxDownloads && parseInt(maxDownloads) > 0 
            ? parseInt(maxDownloads) 
            : null;

        const isBurnAfterReading = burnAfterReading === 'true' || burnAfterReading === true;

        const hashedPassword = password ? await hashPassword(password) : null;
        const userId = req.user ? req.user._id : null;

        const uploadedFiles = [];

        for (const file of files) {
            // Validate file size (25MB)
            if (file.size > 25 * 1024 * 1024) {
                deleteFileFromDisk(file.path);
                continue; // Skip this file
            }

            const fileObj = {
                userId: userId,
                path: file.path,
                name: path.basename(file.path),
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                password: hashedPassword,
                expiresAt: expiresAt,
                maxDownloads: isBurnAfterReading ? 1 : maxDownloadsNum,
                burnAfterReading: isBurnAfterReading,
                isRevoked: false,
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
                maxDownloads: savedFile.maxDownloads,
                burnAfterReading: savedFile.burnAfterReading,
                isRevoked: savedFile.isRevoked,
                hasPassword: !!savedFile.password,
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
};

// Get file metadata
export const getFileInfo = async (req, res) => {
    try {
        const fileID = req.params.fileId;
        const file = await File.findById(fileID);
        
        if (!file) {
            return res.status(404).json({ msg: "File not found or has been deleted" });
        }

        // Check if link is revoked by owner
        if (file.isRevoked) {
            return res.status(403).json({ 
                msg: "This file link has been revoked by the owner",
                isRevoked: true 
            });
        }

        // Check if file expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            deleteFileFromDisk(file.path);
            await File.findByIdAndDelete(fileID);
            return res.status(410).json({ msg: "File has expired and been deleted" });
        }

        // Check if download limit reached
        if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
            return res.status(410).json({ msg: "Download limit reached for this file" });
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
            maxDownloads: file.maxDownloads,
            burnAfterReading: file.burnAfterReading,
            isRevoked: file.isRevoked,
            uploadedAt: file.uploadedAt,
            expiresAt: file.expiresAt,
            hasPassword: !!file.password,
        });
    }
    catch (error) {
        console.error("Get file info error:", error.message);
        res.status(500).json({ msg: "Error fetching file info", error: error.message });
    }
};

// Download file
export const getImage = async (req, res) => {
    try {
        const fileID = req.params.fileId;
        const { password } = req.query;
        
        const file = await File.findById(fileID);
        
        if (!file) {
            return res.status(404).json({ msg: "File not found or has already been deleted" });
        }

        // Check if link is revoked
        if (file.isRevoked) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Access Revoked</title><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>body{font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
                .card{background:#1e293b;padding:32px;border-radius:16px;text-align:center;max-width:400px;border:1px solid #334155;}</style></head>
                <body><div class="card"><h2 style="color:#ef4444;">🚫 Access Revoked</h2><p style="color:#94a3b8;margin-top:12px;">The owner has revoked access to this download link.</p></div></body></html>
            `);
        }

        // Check if file expired
        if (file.expiresAt && new Date() > file.expiresAt) {
            deleteFileFromDisk(file.path);
            await File.findByIdAndDelete(fileID);
            return res.status(410).json({ msg: "File has expired and been deleted" });
        }

        // Check download limits
        if (file.maxDownloads && file.downloadCount >= file.maxDownloads) {
            deleteFileFromDisk(file.path);
            await File.findByIdAndDelete(fileID);
            return res.status(410).send(`
                <!DOCTYPE html>
                <html>
                <head><title>Limit Reached</title><meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>body{font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
                .card{background:#1e293b;padding:32px;border-radius:16px;text-align:center;max-width:400px;border:1px solid #334155;}</style></head>
                <body><div class="card"><h2 style="color:#f59e0b;">⚠️ Limit Reached</h2><p style="color:#94a3b8;margin-top:12px;">This file has reached its maximum download limit and is no longer available.</p></div></body></html>
            `);
        }

        // Check password if required
        if (file.password) {
            const isPasswordValid = await verifyPassword(password, file.password);
            if (!isPasswordValid) {
                const acceptsHtml = req.accepts('html');
                if (acceptsHtml) {
                    const isIncorrect = password !== undefined && password !== '';
                    return res.status(401).send(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Password Required - DropVault</title>
                            <style>
                                * { margin: 0; padding: 0; box-sizing: border-box; }
                                body {
                                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                    background: #090d16;
                                    color: #f8fafc;
                                    min-height: 100vh;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    padding: 20px;
                                }
                                .container {
                                    background: rgba(30, 41, 59, 0.85);
                                    backdrop-filter: blur(16px);
                                    border: 1px solid rgba(255, 255, 255, 0.1);
                                    border-radius: 20px;
                                    padding: 40px;
                                    max-width: 420px;
                                    width: 100%;
                                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                                }
                                h1 { color: #fff; margin-bottom: 8px; font-size: 1.5rem; font-weight: 700; }
                                .subtitle { color: #94a3b8; margin-bottom: 24px; font-size: 0.9rem; }
                                .error { background: rgba(239, 68, 68, 0.15); border: 1px solid #ef4444; color: #fca5a5; padding: 12px; border-radius: 10px; margin-bottom: 20px; font-size: 0.9rem; }
                                .form-group { margin-bottom: 20px; }
                                label { display: block; color: #cbd5e1; margin-bottom: 8px; font-weight: 500; font-size: 0.9rem; }
                                input[type="password"] {
                                    width: 100%; padding: 14px 16px; background: #0f172a; border: 1px solid #334155; border-radius: 10px; font-size: 1rem; color: #fff; outline: none; transition: border-color 0.2s;
                                }
                                input[type="password"]:focus { border-color: #6366f1; ring: 2px solid #6366f1; }
                                button {
                                    width: 100%; padding: 14px; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; border: none; border-radius: 10px; font-size: 1rem; font-weight: 600; cursor: pointer; transition: transform 0.15s, opacity 0.2s;
                                }
                                button:hover { opacity: 0.95; transform: translateY(-1px); }
                                .file-info { background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255, 255, 255, 0.05); padding: 14px; border-radius: 10px; margin-bottom: 20px; font-size: 0.85rem; color: #94a3b8; }
                            </style>
                        </head>
                        <body>
                            <div class="container">
                                <h1>🔒 Password Protected</h1>
                                <p class="subtitle">Enter the password set by the sender to access this file.</p>
                                ${isIncorrect ? '<div class="error">Incorrect password. Please try again.</div>' : ''}
                                <div class="file-info">
                                    <strong>File:</strong> ${file.originalName.replace(/</g, '&lt;').replace(/>/g, '&gt;')}<br>
                                    <strong>Size:</strong> ${(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <form method="GET" action="/file/${fileID}">
                                    <div class="form-group">
                                        <label for="password">Password</label>
                                        <input type="password" id="password" name="password" placeholder="Enter password" required autofocus />
                                    </div>
                                    <button type="submit">Download Secure File</button>
                                </form>
                            </div>
                        </body>
                        </html>
                    `);
                }
                return res.status(401).json({ 
                    msg: "Password required or incorrect",
                    requiresPassword: true,
                    fileId: fileID
                });
            }
        }

        // Check if file exists on disk
        if (!fs.existsSync(file.path)) {
            return res.status(404).json({ msg: "File not found on server" });
        }

        // Update download count
        file.downloadCount += 1;
        await file.save();

        // Check if file should self-destruct / burn after reading or limit reached
        const shouldBurn = file.burnAfterReading || (file.maxDownloads && file.downloadCount >= file.maxDownloads);

        // Set download headers
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(file.originalName)}"`);
        res.setHeader('Content-Type', file.mimetype || 'application/octet-stream');

        // Stream file and clean up afterwards if burned
        res.download(file.path, file.originalName, async (err) => {
            if (err) {
                console.error("Error during file download stream:", err.message);
            } else if (shouldBurn) {
                // Self-destruct: remove from disk and database immediately
                setTimeout(async () => {
                    deleteFileFromDisk(file.path);
                    await File.findByIdAndDelete(fileID);
                }, 1000);
            }
        });
    }
    catch (error) {
        console.error("Download error:", error.message);
        res.status(500).json({ msg: "Error downloading file", error: error.message });
    }
};

// Get files for logged in user
export const getUserFiles = async (req, res) => {
    try {
        const userId = req.user._id;
        const host = process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get('host')}`;
        
        const files = await File.find({ userId }).sort({ uploadedAt: -1 });

        const formattedFiles = files.map(file => {
            const isExpired = file.expiresAt && new Date() > file.expiresAt;
            const isLimitReached = file.maxDownloads && file.downloadCount >= file.maxDownloads;
            
            let computedStatus = 'active';
            if (file.isRevoked) {
                computedStatus = 'revoked';
            } else if (isExpired) {
                computedStatus = 'expired';
            } else if (isLimitReached) {
                computedStatus = 'limit_reached';
            }

            return {
                id: file._id,
                name: file.originalName,
                size: file.size,
                mimetype: file.mimetype,
                downloadCount: file.downloadCount,
                maxDownloads: file.maxDownloads,
                burnAfterReading: file.burnAfterReading,
                isRevoked: file.isRevoked,
                status: computedStatus,
                hasPassword: !!file.password,
                expiresAt: file.expiresAt,
                uploadedAt: file.uploadedAt,
                downloadUrl: `${host}/file/${file._id}`,
            };
        });

        res.status(200).json({
            files: formattedFiles,
            count: formattedFiles.length
        });
    } catch (error) {
        console.error("Get user files error:", error.message);
        res.status(500).json({ msg: "Error fetching user files", error: error.message });
    }
};

// Toggle Revoke File Link
export const toggleRevokeFile = async (req, res) => {
    try {
        const userId = req.user._id;
        const fileId = req.params.id;

        const file = await File.findOne({ _id: fileId, userId });
        if (!file) {
            return res.status(404).json({ msg: "File not found or unauthorized" });
        }

        file.isRevoked = !file.isRevoked;
        await file.save();

        res.status(200).json({
            msg: file.isRevoked ? "File link revoked successfully" : "File link restored successfully",
            isRevoked: file.isRevoked,
        });
    } catch (error) {
        console.error("Toggle revoke error:", error.message);
        res.status(500).json({ msg: "Error updating file status", error: error.message });
    }
};

// Delete User File
export const deleteUserFile = async (req, res) => {
    try {
        const userId = req.user._id;
        const fileId = req.params.id;

        const file = await File.findOne({ _id: fileId, userId });
        if (!file) {
            return res.status(404).json({ msg: "File not found or unauthorized" });
        }

        deleteFileFromDisk(file.path);
        await File.findByIdAndDelete(fileId);

        res.status(200).json({ msg: "File permanently deleted" });
    } catch (error) {
        console.error("Delete file error:", error.message);
        res.status(500).json({ msg: "Error deleting file", error: error.message });
    }
};

// Get User Aggregated Stats
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const files = await File.find({ userId });

        const totalFiles = files.length;
        let totalDownloads = 0;
        let totalStorageBytes = 0;
        let activeLinks = 0;

        const now = new Date();

        files.forEach(file => {
            totalDownloads += file.downloadCount || 0;
            totalStorageBytes += file.size || 0;

            const isExpired = file.expiresAt && now > file.expiresAt;
            const isLimitReached = file.maxDownloads && file.downloadCount >= file.maxDownloads;
            
            if (!file.isRevoked && !isExpired && !isLimitReached) {
                activeLinks++;
            }
        });

        res.status(200).json({
            stats: {
                totalFiles,
                totalDownloads,
                activeLinks,
                totalStorageBytes,
            }
        });
    } catch (error) {
        console.error("Get user stats error:", error.message);
        res.status(500).json({ msg: "Error calculating user stats", error: error.message });
    }
};
