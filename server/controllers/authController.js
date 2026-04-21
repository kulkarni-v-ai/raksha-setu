const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    
    // Quick validation bridging
    if (!name || !phone || !password) {
      return res.status(400).json({ success: false, message: 'Name, phone and password are required strictly.' });
    }

    // Check bounds locally preventing collisions inside the database mapping
    const existing = await User.findOne({ $or: [{ email: email }, { phone: phone }] });
    if (existing) {
       return res.status(409).json({ success: false, message: 'Account already exists globally with this credential format.' });
    }

    // Heavy Security hash arrays establishing limits
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Injection bound execution cleanly
    const safeRole = ['user', 'admin', 'responder', 'field', 'control', 'pharmacy'].includes(role) ? role : 'user';
    const newUser = await User.create({ name, email, phone, password: hashedPassword, role: safeRole });

    res.status(201).json({ 
        success: true, 
        message: 'Account registered structurally successfully. Please Log In.',
        userId: newUser._id
    });

    } catch (error) {
        console.error("Registration Backend Error:", error);
        res.status(500).json({ success: false, message: 'Backend structural fault: ' + (error.message || error.code || 'Unknown Fault') });
    }
};

exports.login = async (req, res) => {
    try {
        const { credential, password } = req.body;

        if (!credential || !password) {
             return res.status(400).json({ success: false, message: 'Please provide all authentication bounds.' });
        }

        // Pull identity matrix reliably across arrays
        const user = await User.findOne({ $or: [{ email: credential }, { phone: credential }] });
        if (!user) {
             return res.status(401).json({ success: false, message: 'Invalid credentials parsed.' });
        }

        // Compare explicit strings resolving bcrypt hash geometry natively
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
             return res.status(401).json({ success: false, message: 'Invalid credentials parsed.' });
        }

        // Structure generic JWT signing logic organically bridging security roles dynamically limits safely
        const token = jwt.sign(
            { id: user._id, role: user.role, name: user.name }, 
            process.env.JWT_SECRET || 'raksha_fallback_secret_encryption_key_matrix',
            { expiresIn: '24h' }
        );

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                phone: user.phone
            }
        });

    } catch (error) {
        console.error("Login Backend Error:", error);
        res.status(500).json({ success: false, message: 'Backend structural fault.' });
    }
};
