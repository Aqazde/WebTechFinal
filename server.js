require('dotenv').config();
const bcrypt = require('bcrypt');
const cors = require('cors');
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

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
                // If the password is valid, generate a JWT for the user
                const token = generateToken(user);

                // Determine if the user is an admin based on their role or any other criteria
                const isAdmin = user.role === 'admin';

                // Set the redirect URL based on the user role and frontend port
                const frontendPort = process.env.FRONTEND_PORT || 3000; // Adjust the port as needed
                const redirectUrl = isAdmin ? `http://localhost:${frontendPort}/admin-dashboard` : `http://localhost:${frontendPort}/user-profile`;

                // Send the response with the token and redirect URL
                return res.json({ token, redirectUrl });
            }
        }
        // If no matching user is found or password is invalid, return an error
        return res.status(401).json({ error: 'Invalid email or password' });
    } catch (error) {
        console.error('Error logging in:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}

// Function to generate JWT token
function generateToken(user) {
    return jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Middleware to authenticate users
function authenticateUser(req, res, next) {
    // Get the token from the request headers
    const token = req.headers.authorization;

    if (!token) {
        return res.status(401).json({ error: 'Authorization token not provided' });
    }

    try {
        // Verify the token
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        // Attach the decoded token to the request object for further use
        req.user = decodedToken;
        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        console.error('Error authenticating user:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
}

app.post('/login', loginUser);
app.get('/user-profile', authenticateUser, (req, res) => {
    // This route handler will only be reached if the user is authenticated
    res.sendFile(`${__dirname}/userProfile/userProfilePage.html`);
});

// Start the server
const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server is listening on port ${port}`));
