import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const JWT_SECRET = process.env.JWT_SECRET || 'dropvault_jwt_secret_dev_key_2026';

// Required Authentication Middleware
export const requireAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ msg: 'Authorization required. Please log in.' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET);
        
        const user = await User.findById(decoded.id).select('-password');
        if (!user) {
            return res.status(401).json({ msg: 'User session expired or not found.' });
        }

        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({ msg: 'Invalid or expired token', error: error.message });
    }
};

// Optional Authentication Middleware (allows guest uploads while tagging logged-in user if token provided)
export const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            const decoded = jwt.verify(token, JWT_SECRET);
            const user = await User.findById(decoded.id).select('-password');
            if (user) {
                req.user = user;
            }
        }
    } catch (error) {
        // Silently continue as guest if token is invalid/expired
        req.user = null;
    }
    next();
};
