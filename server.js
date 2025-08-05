// server.js

// 1. Import Dependencies
require('dotenv').config(); // Loads environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// 2. Initialize Express App
const app = express();
const PORT = process.env.PORT || 5001;

// 3. Middleware Setup
// Enable Cross-Origin Resource Sharing for all routes
// This is essential for your Next.js frontend to be able to call this backend
app.use(cors());

// Enable the express.json middleware to parse JSON request bodies
app.use(express.json());

// 4. Database Connection
const dbURI = process.env.MONGO_URI;
if (!dbURI) {
    console.error('FATAL ERROR: MONGO_URI is not defined in .env file.');
    process.exit(1); // Exit the application if the database URI is missing
}

mongoose.connect(dbURI)
    .then(() => console.log('Successfully connected to MongoDB.'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });


// 5. API Routes
// A simple health-check route to verify the server is running
app.get('/', (req, res) => {
    res.status(200).send('Amize Backend is running!');
});


// All routes in 'authRoutes' will be prefixed with /api/auth
const authRoutes = require('./routes/auth'); 
app.use('/api/auth', authRoutes);




// 6. Start the Server
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});