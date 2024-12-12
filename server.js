require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path= require('path');

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

const errorMiddleware = require('./middleware/errorMiddleware');
const userRoute = require('./Routes/userRoute');
const productRoute = require('./Routes/productRoute');
const categoryRoute = require('./Routes/categoryRoute');


app.use(cors());  
app.use(express.json());  
app.use(express.urlencoded({ extended: false })); 
app.use('/uploads', express.static('uploads'));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.get('/', (req, res) => {
    res.send('Hello Node API');
});
app.use('/api/users', userRoute);  
app.use('/api/products', productRoute);  
app.use('/pdf', productRoute); 
app.use('/api/categories', categoryRoute);
app.use(errorMiddleware);

mongoose.set("strictQuery", false);

mongoose.connect(MONGO_URL)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Node API is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Error connecting to MongoDB:', error.message);
    });


