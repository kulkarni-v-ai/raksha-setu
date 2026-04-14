const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const twilio = require('twilio');

// Simplified for standard registration, since routes/auth.js has the full OTP flow.
// Just migrating the raw MySQL functions to Mongoose.
exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    if (!name || !phone || !password || !email) {
      return res.status(400).json({ success: false, message: 'Name, email, phone and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { phone }] });
    if (existingUser) {
       return res.status(409).json({ success: false, message: 'Account already exists with this email or phone.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const safeRole = ['user', 'admin', 'responder', 'pharmacy'].includes(role) ? role : 'user';
    
    const newUser = await User.create({
        name, email, phone, password: hashedPassword, role: safeRole
    });

    res.status(201).json({ 
        success: true, 
        message: 'Account registered successfully. Please Log In.',
        userId: newUser._id
    });

  } catch (error) {
    console.error("Registration Backend Error:", error);
    res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

exports.login = async (req, res) => {
    try {
        // Keeping credential as it expects either email or phone from front-end maybe
        const { credential, password, identifier } = req.body;
        const loginStr = credential || identifier;

        if (!loginStr || !password) {
             return res.status(400).json({ success: false, message: 'Please provide all authentication fields.' });
        }

        const user = await User.findOne({ $or: [{ email: loginStr }, { phone: loginStr }] });
        if (!user) {
             return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             return res.status(401).json({ success: false, message: 'Invalid credentials.' });
        }

        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name, email: user.email }, 
            process.env.JWT_SECRET || 'fallback-secret',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                role: user.role,
                phone: user.phone,
                email: user.email
            }
        });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: 'Server error.' });
    }
};
