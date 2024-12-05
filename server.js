require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const app = express();
const MONGO_URL =process.env.MONGO_URL
const PORT = process.env.PORT || 3000
const productRoute = require('./Routes/productRoute')
const errorMiddleware = require('./middleware/errorMiddleware')
const cors = require('cors')
const userRoute = require('./Routes/userRoute');

app.get('/', (req, res) => {
    res.send('Hello Node API');
});

app.use(express.json());
app.use(express.urlencoded({extended:false}))
app.use('/',productRoute);
app.use(errorMiddleware)
app.use(cors())
app.use('/api/users', userRoute);




// MongoDB Connection
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


