require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const path= require('path');

const MONGO_URL = process.env.MONGO_URL;
const PORT = process.env.PORT || 3000;

const errorMiddleware = require('./middleware/errorMiddleware');
const productRoute = require('./Routes/productRoute');
const userRoute = require('./Routes/userRoute');
const salesRoute = require('./Routes/salesRoute');
const adminRoute = require('./Routes/adminRoute');
const categoryRoute = require('./Routes/categoryRoute');
const purchaseRoute = require('./Routes/purchaseRoute'); 
const { purchaseProduct } = require('./controllers/purchaseController');
const sellerRoute = require('./Routes/sellerRoute');
const buyerRoute = require('./Routes/buyerRoute');
const reviewRoutes = require('./Routes/reviewRoute');


app.use(cors());  
app.use(express.json());  
app.use(express.urlencoded({ extended: false })); 
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/pdfs', express.static(path.join(__dirname, 'pdfs')));

app.get('/', (req, res) => {
    res.send('Hello Node API');
});
app.use('/api/products', productRoute); 
app.use('/api/users', userRoute); 
app.use('/api/admin',adminRoute);
app.use('/api/buyer', buyerRoute);
app.use('/api/seller', sellerRoute); 
app.use('/api/reviews', reviewRoutes);
app.use('/api', salesRoute);

app.use('/api/categories', categoryRoute);
app.use('/api', purchaseRoute); 
app.use('/api', purchaseProduct);
app.use('/pdf', productRoute); 

app.use('/api/products', productRoute); 


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