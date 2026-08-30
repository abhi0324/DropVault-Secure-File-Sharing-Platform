import User from '../models/user.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dropvault_jwt_secret_dev_key_2026';

const generateToken = (id) => {
    return jwt.sign({ id }, JWT_SECRET, { expiresIn: '7d' });
};

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ msg: 'Please provide all required fields (name, email, password).' });
        }

        if (password.length < 6) {
            return res.status(400).json({ msg: 'Password must be at least 6 characters long.' });
        }

        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.status(400).json({ msg: 'An account with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email: email.toLowerCase(),
            password: hashedPassword,
        });

        const token = generateToken(user._id);

        res.status(201).json({
            msg: 'Account created successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error('Registration error:', error.message);
        res.status(500).json({ msg: 'Server error during registration', error: error.message });
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password.' });
        }

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid email or password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid email or password.' });
        }

        const token = generateToken(user._id);

        res.status(200).json({
            msg: 'Logged in successfully',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            },
            token,
        });
    } catch (error) {
        console.error('Login error:', error.message);
        res.status(500).json({ msg: 'Server error during login', error: error.message });
    }
};

// Get current user profile
export const getMe = async (req, res) => {
    try {
        res.status(200).json({
            user: req.user,
        });
    } catch (error) {
        res.status(500).json({ msg: 'Error fetching user profile', error: error.message });
    }
};
