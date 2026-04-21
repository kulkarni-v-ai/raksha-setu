const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const twilio = require('twilio');
const User = require('../models/User');

// Initialize Twilio client lazily to avoid crash if env vars are missing at startup
const getTwilioClient = () => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) return null;
    return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// In-memory OTP storage: phone -> { code, expires }
const otpStore = {};

const generateOTP = () => Math.floor(1000 + Math.random() * 9000).toString(); // 4 digit OTP

// Helper to generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '1d' });
};

// --- ENDPOINTS ---

// 1. Send OTP
router.post('/send-otp', async (req, res) => {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });

    const code = generateOTP();
    // Valid for 10 mins
    otpStore[phone] = { code, expires: Date.now() + 10 * 60 * 1000 };

    const client = getTwilioClient();
    if (!client) {
        console.warn('Twilio keys missing! OTP generated internally: ', code);
        return res.json({ message: `OTP (Dev Mode): ${code}` });
    }

    try {
        await client.messages.create({
            body: `Your Raksha Setu verification code is: ${code}`,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: (phone.startsWith('+') ? phone : '+91' + phone) // Default to India prefix if none provided
        });
        res.json({ message: 'OTP Sent successfully via Twilio' });
    } catch (err) {
        console.error('Twilio Error:', err);
        res.status(500).json({ error: 'Failed to send SMS using Twilio. Did you verify this number on trial account?' });
    }
});

// 2. Register User (requires OTP)
router.post('/register', async (req, res) => {
    const { name, email, phone, otp, password, role } = req.body;
    
    // Check missing
    if (!name || !email || !phone || !otp || !password) {
        return res.status(400).json({ error: 'All fields are required.' });
    }

    // Verify OTP
    const stored = otpStore[phone];
    if (!stored || stored.code !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    try {
        // Check if user exists
        const existing = await User.findOne({ phone });
        if (existing) return res.status(400).json({ error: 'Phone number is already registered.' });

        const existingEmail = await User.findOne({ email });
        if (existingEmail) return res.status(400).json({ error: 'Email is already registered.' });

        // Hash password and create
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await User.create({
            name, email, phone, password: hashedPassword, role: role || 'user'
        });

        // If pharmacy, create a skeleton pharmacy profile
        if (newUser.role === 'pharmacy') {
            const Pharmacy = require('../models/Pharmacy');
            await Pharmacy.create({
                owner: newUser._id,
                name: `${newUser.name}'s Pharmacy`,
                address: 'Update Address',
                contact: newUser.phone,
                location: { type: 'Point', coordinates: [77.2090, 28.6139] }, // Default Delhi for now
                medicines: []
            });
        }

        // Clean up OTP
        delete otpStore[phone];

        res.json({ 
            message: 'User created successfully!', 
            token: generateToken(newUser), 
            user: { id: newUser._id, name: newUser.name, role: newUser.role, email: newUser.email, phone: newUser.phone } 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Registration failed due to database error.' });
    }
});

// 3. Login with Password
router.post('/login-password', async (req, res) => {
    const { identifier, password } = req.body;
    if (!identifier || !password) return res.status(400).json({ error: 'Identifier and password required' });

    try {
        // Check if identifier is email or phone
        let user;
        if (identifier.includes('@')) {
            user = await User.findOne({ email: identifier });
        } else {
            user = await User.findOne({ phone: identifier });
        }

        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Incorrect password' });

        res.json({ message: 'Login successful', token: generateToken(user), user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during login.' });
    }
});

// 4. Login with OTP
router.post('/login-otp', async (req, res) => {
    const { phone, otp } = req.body;
    if (!phone || !otp) return res.status(400).json({ error: 'Phone and OTP required.' });

    const stored = otpStore[phone];
    if (!stored || stored.code !== otp || Date.now() > stored.expires) {
        return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    try {
        const user = await User.findOne({ phone });
        if (!user) return res.status(400).json({ error: 'No account registered with this phone number.' });

        // Cleanup
        delete otpStore[phone];

        res.json({ message: 'Login successful', token: generateToken(user), user: { id: user._id, name: user.name, role: user.role, email: user.email, phone: user.phone } });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error during OTP login.' });
    }
});

module.exports = router;
