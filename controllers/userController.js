const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

// SMTP Transport Configuration
const transporter = nodemailer.createTransport({
    service: 'Gmail', 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

// Register User
const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error('Please add all fields');
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({ name, email, password: hashedPassword });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
 
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            token, 
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

// Get User Profile
const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

// Forgot Password (OTP Generation)
const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Generate 4-digit OTP
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // OTP expires in 30 minutes
    await user.save();

    // Send OTP via email
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Password Reset OTP',
        text: `Your password reset OTP is: ${otp}`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
            res.status(500);
            throw new Error('Failed to send OTP');
        } else {
            res.status(200).json({ message: 'OTP sent successfully' });
        }
    });
});

// Reset Password
const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    // Validate OTP and expiration
    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp || user.resetPasswordExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }

    // Hash new password before saving
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    user.password = hashedPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({ message: 'Password reset successful' });
});

module.exports = { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword };
