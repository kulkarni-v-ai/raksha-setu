const SosAlert = require('../models/SosAlert');

let ioInstance;
exports.setIo = (io) => {
  ioInstance = io;
};

exports.triggerSOS = async (req, res) => {
  try {
    const { userId, location } = req.body;
    
    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    const lat = location?.latitude || 0;
    const lng = location?.longitude || 0;

    // 1. Store the event in MongoDB
    const newAlert = await SosAlert.create({
      user: userId,
      location: {
        type: 'Point',
        coordinates: [lng, lat]
      },
      status: 'active'
    });

    // 2. Broadcast to admin room using socket.io if available
    if (ioInstance) {
      ioInstance.emit('new_sos_alert', {
        alertId: newAlert._id,
        userId: userId,
        latitude: lat,
        longitude: lng,
        timestamp: newAlert.createdAt
      });
    }

    // 3. Return success signal immediately
    return res.status(201).json({
      success: true,
      message: 'SOS Alert dispatched successfully',
      data: {
        alertId: newAlert._id,
        timestamp: newAlert.createdAt
      }
    });

  } catch (error) {
    console.error("SOS Controller Error:", error);
    res.status(500).json({ success: false, message: 'Internal Server Error processing SOS' });
  }
};
