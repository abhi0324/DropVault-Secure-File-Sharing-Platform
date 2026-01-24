import File from '../models/file.js';
import fs from 'fs';
import path from 'path';

/**
 * Cleanup expired files from database and filesystem
 * Run this periodically (e.g., via cron job) to remove expired files
 */
export const cleanupExpiredFiles = async () => {
    try {
        const now = new Date();
        
        // Find all expired files
        const expiredFiles = await File.find({
            expiresAt: { $lte: now }
        });

        let deletedCount = 0;
        let errorCount = 0;

        for (const file of expiredFiles) {
            try {
                // Delete file from filesystem
                if (fs.existsSync(file.path)) {
                    fs.unlinkSync(file.path);
                }
                
                // Delete record from database
                await File.findByIdAndDelete(file._id);
                deletedCount++;
            } catch (error) {
                console.error(`Error deleting file ${file._id}:`, error.message);
                errorCount++;
            }
        }

        console.log(`Cleanup completed: ${deletedCount} files deleted, ${errorCount} errors`);
        return { deletedCount, errorCount };
    } catch (error) {
        console.error('Cleanup error:', error.message);
        throw error;
    }
};

/**
 * Cleanup orphaned files (files in uploads/ but not in database)
 */
export const cleanupOrphanedFiles = async () => {
    try {
        const uploadsDir = 'uploads';
        if (!fs.existsSync(uploadsDir)) {
            return { deletedCount: 0 };
        }

        const filesInDb = await File.find({}, 'path');
        const dbPaths = new Set(filesInDb.map(f => f.path));

        const filesOnDisk = fs.readdirSync(uploadsDir);
        let deletedCount = 0;

        for (const file of filesOnDisk) {
            const filePath = path.join(uploadsDir, file);
            if (!dbPaths.has(filePath)) {
                try {
                    fs.unlinkSync(filePath);
                    deletedCount++;
                } catch (error) {
                    console.error(`Error deleting orphaned file ${filePath}:`, error.message);
                }
            }
        }

        console.log(`Orphaned files cleanup: ${deletedCount} files deleted`);
        return { deletedCount };
    } catch (error) {
        console.error('Orphaned files cleanup error:', error.message);
        throw error;
    }
};
