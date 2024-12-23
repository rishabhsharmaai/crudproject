const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Please add a name'],
        },
        email: {
            type: String,
            required: [true, 'Please add an email'],
            unique: true,
        },
        password: {
            type: String,
            required: [true, 'Please add a password'],
        },
        role: {
            type: String,
            enum: ['admin', 'seller', 'buyer'],
            default: 'buyer',
        },
        isVerified: { 
            type: Boolean,
            default: false, 
        },
        resetPasswordOTP: {
            type: String,
        },
        resetPasswordExpire: {
            type: Date,
        },
    },
    { timestamps: true }
);

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

userSchema.methods.generateOTP = function () {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    this.resetPasswordOTP = bcrypt.hashSync(otp, 10);
    this.resetPasswordExpire = Date.now() + 30 * 60 * 1000;
    return otp;
};

module.exports = mongoose.model('User', userSchema);