const SOS = require('../models/SosModel');

let io = null;

exports.setIo = (socketIo) => {
  io = socketIo;
};

exports.triggerSOS = async (req, res) => {
  try {
    const { userId, type, severity, location, address } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    // Build the SOS alert document
    const alertData = {
      userId,
      status: 'active',
      severity: severity || 'Moderate',
      address: address || type || 'Emergency Alert',
      location: location || {
        type: 'Point',
        coordinates: [0, 0]
      }
    };

    // If location is passed as lat/lng instead of GeoJSON
    if (!location?.type && (req.body.location?.latitude || req.body.location?.longitude)) {
      alertData.location = {
        type: 'Point',
        coordinates: [
          parseFloat(req.body.location.longitude) || 0,
          parseFloat(req.body.location.latitude) || 0
        ]
      };
    }

    const alert = await SOS.create(alertData);

    // Broadcast to all connected clients via Socket.IO
    if (io) {
      io.emit('sos-alert', {
        alertId: alert._id,
        userId,
        location: alert.location,
        severity: alert.severity,
        timestamp: alert.createdAt
      });
    }

    return res.status(201).json({
      success: true,
      message: 'SOS Alert dispatched successfully',
      data: {
        alertId: alert._id,
        timestamp: alert.createdAt
      }
    });

  } catch (error) {
    console.error("SOS Controller Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error processing SOS' });
  }
};
