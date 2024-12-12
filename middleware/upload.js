const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Define storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = path.join(__dirname, '../uploads'); // Define the uploads directory
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true }); // Create uploads directory if it doesn't exist
        }
        cb(null, uploadPath); // Destination folder for the file
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Generate a unique file name based on current timestamp
    },
});

// Configure multer with the storage settings
const upload = multer({ storage: storage });

module.exports = upload;
