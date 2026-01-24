import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure uploads directory exists
const uploadsDir = 'uploads';
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadsDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename with timestamp
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

// File filter for security
const fileFilter = (req, file, cb) => {
    // Block dangerous file types
    const dangerousTypes = [
        'application/x-msdownload', // .exe
        'application/x-executable',
        'application/x-msdos-program',
        'application/x-sh',
        'application/x-shellscript',
    ];
    
    if (dangerousTypes.includes(file.mimetype)) {
        return cb(new Error('File type not allowed for security reasons'), false);
    }
    
    cb(null, true);
};

// Configure multer with limits
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 25 * 1024 * 1024, // 25MB limit
        files: 10, // Allow multiple files
    }
});

export default upload;
