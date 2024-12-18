const User = require('../models/userModel');
const asyncHandler = require('express-async-handler');

const getAllUsers = asyncHandler(async (req, res) => {
    try {
        const users = await User.find({}, 'name email role createdAt updatedAt'); 
        res.status(200).json({
            message: 'Users fetched successfully',
            users,
        });
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

const deleteUser = asyncHandler(async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.findByIdAndDelete(userId);

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = { getAllUsers, deleteUser };
