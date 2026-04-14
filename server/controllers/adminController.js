const User = require('../models/User');
const Pharmacy = require('../models/Pharmacy');
const Hospital = require('../models/Hospital');
const SosAlert = require('../models/SosAlert');

exports.getStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({});
    const totalPharmacies = await Pharmacy.countDocuments({});
    const totalHospitals = await Hospital.countDocuments({});
    const activeSos = await SosAlert.countDocuments({ status: 'active' });

    res.json({
      totalUsers,
      totalPharmacies,
      totalHospitals,
      activeSos
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

exports.getSosAlerts = async (req, res) => {
  try {
    const alerts = await SosAlert.find({}).populate('user', 'name phone email').sort({ createdAt: -1 });
    res.json(alerts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
};
