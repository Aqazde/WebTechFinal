require('dotenv').config();
const path = require('path');
const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

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

// Define MongoDB schema and models for users and admins
const adminSchema = new mongoose.Schema({
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
    },
}, { collection: 'admins' });
const Admin = mongoose.model('Admin', adminSchema);

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
        await newUser.save();
        console.log('User registered successfully:', newUser);


        // Sending welcome email to the user
        const transporter = nodemailer.createTransport({
            host: 'smtp.mail.ru', // Replace 'smtp.mail.ru' with your SMTP server address
            port: 465, // Replace 465 with the port number you're using
            secure: true, // Set to true if you're using SSL/TLS
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            }
        });

        const mailOptions = {
            from: process.env.SMTP_USER,
            to: req.body.email,
            subject: 'Welcome to Our Application',
            text: 'Thank you for registering with us. We look forward to serving you!'
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending welcome email:', error);
            } else {
                console.log('Welcome email sent:', info.response);
            }
        });

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error registering user:', error);
        res.status(400).send(error.message);
    }
});

// Function to handle user login
async function loginUser(req, res) {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the users collection
        const user = await User.findOne({ email });
        if (user) {
            // If the email exists, verify the password
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (isPasswordValid) {
                // Set the redirect URL based on the user role and frontend port
                const frontendPort = process.env.FRONTEND_PORT || 3000; // Adjust the port as needed
                let redirectUrl = `http://localhost:${frontendPort}/user-profile`;

                // Send the response with the redirect URL
                return res.json({ redirectUrl });
            }
        }
        // If no matching user is found or password is invalid, return an error
        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Middleware to authenticate users
function authenticateUser(req, res, next) {
    // This middleware can be left as is since it's used for protecting routes that require authentication.
    // No changes related to JWT token are needed here.
}

// Function to handle admin login
async function loginAdmin(req, res) {
    const { email, password } = req.body;

    try {
        // Check if the email exists in the admins collection
        const admin = await Admin.findOne({ email });
        if (admin) {
            // If the email exists, compare the passwords
            if (password === admin.password) {
                // Set the redirect URL to admin dashboard
                const frontendPort = process.env.FRONTEND_PORT || 3000; // Adjust the port as needed
                const redirectUrl = `http://localhost:${frontendPort}/admin-dashboard`;
                // Send the response with the redirect URL
                return res.json({ redirectUrl });
            }
        }
        // If no matching admin is found or password is invalid, return an error
        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Middleware to authenticate admins
function authenticateAdmin(req, res, next) {
    // This middleware can be left as is since it's used for protecting admin routes that require authentication.
    // No changes related to JWT token are needed here.
}

app.post('/login', loginUser);
app.get('/user-profile', authenticateUser, (req, res) => {
    // This route handler will only be reached if the user is authenticated
    res.sendFile(__dirname, 'public', 'userProfilePage.html');
});
app.post('/admin-login', loginAdmin);
app.get('/admin-dashboard', authenticateAdmin, (req, res) => {
    // This route handler will only be reached if the admin is authenticated
    res.sendFile(__dirname, 'public', 'adminDashboardPage.html');
});


app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
