const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');

// Generate JWT
const generateToken = (id) => {
    // Change expiresIn to '30m' for 30 minutes expiration
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30m' });
};

// Signup user
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Create user
    const user = await User.create({ name, email, password });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),  // Generate token with 30m expiration
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

// Login user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    // Check for user
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token: generateToken(user.id),  // Generate token with 30m expiration
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Get user profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

module.exports = { registerUser, loginUser, getUserProfile };
