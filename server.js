require('dotenv').config(); // Load environment variables from .env file
const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(express.static('public'));

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: 'restaurant_registration'
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));
// Define MongoDB schema and models
const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { collection: 'users' });
const User = mongoose.model('User', userSchema);

// Middleware
app.use(bodyParser.json());

// Routes
app.post('/signup', async (req, res) => {
    console.log(req.body)
    // Hash the password before saving it to the database
    const saltRounds = 10;
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
        console.log(hashedPassword);
        const newUser = new User({
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            age: req.body.age,
            country: req.body.country,
            gender: req.body.gender,
            email: req.body.email,
            password: hashedPassword
        });
        console.log('hey')
        await newUser.save();
        console.log('User registered successfully:', newUser);
        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).send(error.message);
    }
});


app.post('/login', async (req, res) => {
    // Authenticate user
    // Generate and send JWT token
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
