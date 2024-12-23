const User = require('../models/userModel');
const bcrypt = require('bcryptjs');
const asyncHandler = require('express-async-handler');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        res.status(400);
        throw new Error('Please provide all required fields');
    }

    if (!['admin', 'seller', 'buyer'].includes(role)) {
        res.status(400);
        throw new Error('Invalid role');
    }

    if (role === 'admin' && email !== 'rishabh.sharma@aayaninfotech.com') {
        res.status(403);
        throw new Error('Only the authorized email can register as admin');
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
        res.status(400);
        throw new Error('User already exists');
    }

    const isVerified = role === 'admin' ? true : false;
    const user = await User.create({
        name,
        email,
        password,
        role,
        isVerified,
    });

    if (user) {
        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        });
    } else {
        res.status(400);
        throw new Error('Invalid user data');
    }
});

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error('Please provide both email and password');
    }

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    console.log('User Password in DB:', user.password); 
    console.log('Plaintext Password:', password);      

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password Match Result:', isMatch); 

    if (isMatch) {
        if (!user.isVerified) {
            res.status(403);
            throw new Error('Account not verified by admin');
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
            token,
        });
    } else {
        res.status(401);
        throw new Error('Invalid email or password');
    }
});

const adminVerifyUser = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    if (req.user.role !== 'admin') {
        res.status(403);
        throw new Error('Only admin can verify users');
    }

    const user = await User.findById(userId);
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (user.isVerified) {
        res.status(400);
        throw new Error('User is already verified');
    }

    user.isVerified = true;
    await user.save();

    sendVerificationEmail(user.email);

    res.status(200).json({
        message: 'User verified successfully',
        user: {
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified,
        },
    });
});

const sendVerificationEmail = async (email) => {
    const mailOptions = {
        from: process.env.SMTP_USER,
        to: email,
        subject: 'Account Verified',
        text: 'Your account has been successfully verified by the admin. You can now log in to your account.',
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(error);
        } else {
            console.log('Verification email sent: ' + info.response);
        }
    });
};

const getUserProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
});

const forgotPassword = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    const data = await user.save();
    console.log(data)
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

const resetPassword = asyncHandler(async (req, res) => {
    const { email, otp, newPassword } = req.body;
    console.log(email, otp, newPassword)
    const user = await User.findOne({ email });
    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    if (!user.resetPasswordOTP || user.resetPasswordOTP !== otp || user.resetPasswordExpire < Date.now()) {
        res.status(400);
        throw new Error('Invalid or expired OTP');
    }


    user.password = newPassword;
    user.resetPasswordOTP = undefined;
    user.resetPasswordExpire = undefined;
    const data = await user.save();
    console.log(data)

    res.status(200).json({ message: 'Password reset successful' });
});

module.exports = { registerUser, loginUser, getUserProfile, forgotPassword, resetPassword, adminVerifyUser };