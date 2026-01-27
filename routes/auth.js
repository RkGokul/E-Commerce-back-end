const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
    if (!process.env.JWT_SECRET) {
        console.warn('WARNING: JWT_SECRET is not defined in environment variables. Using a default for development ONLY.');
    }
    return jwt.sign({ id }, process.env.JWT_SECRET || 'dev_secret', {
        expiresIn: '30d',
    });
};

// @route   GET /api/auth/test-db
// @desc    Test database connection
// @access  Public
router.get('/test-db', async (req, res) => {
    try {
        const count = await User.countDocuments();
        res.json({ success: true, message: 'Database connected!', count });
    } catch (err) {
        console.error('DB Test Error:', err);
        res.status(500).json({ success: false, error: err.message });
    }
});

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    try {
        console.log('--- Registration Request ---');
        console.log('Body:', { ...req.body, password: '***', confirmPassword: '***' });
        const { name, email, password, confirmPassword, phone } = req.body;

        // Validate
        if (!name || !email || !password || !confirmPassword) {
            console.log('Validation failed: Missing fields');
            return res.status(400).json({ message: 'All fields are required' });
        }

        if (password !== confirmPassword) {
            console.log('Validation failed: Passwords do not match');
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        if (password.length < 6) {
            console.log('Validation failed: Password too short');
            return res.status(400).json({ message: 'Password must be at least 6 characters' });
        }

        // Check existing user
        console.log('Checking for existing user with email:', email);
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create user
        console.log('Creating user in database...');
        const user = await User.create({
            name,
            email,
            password,
            phone: phone || null,
        });

        console.log('User created successfully:', user._id);

        // Response
        return res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });

    } catch (error) {
        console.error('CRITICAL Registration Error:');
        console.error(error);
        return res.status(500).json({
            message: 'Server error during registration',
            error: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});





// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check for user
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            isAdmin: user.isAdmin,
            token: generateToken(user._id),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            address: user.address,
            isAdmin: user.isAdmin,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.phone = req.body.phone || user.phone;
            user.address = req.body.address || user.address;

            if (req.body.password) {
                user.password = req.body.password;
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                phone: updatedUser.phone,
                address: updatedUser.address,
                isAdmin: updatedUser.isAdmin,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// @route   GET /api/auth/users
// @desc    Get all users (admin only)
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
