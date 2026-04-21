const mongoose = require('mongoose');

const SOSSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'deployed', 'en_route', 'on_scene', 'patient_onboard', 'handover', 'resolved', 'cancelled'],
    default: 'active'
  },
  severity: {
    type: String,
    enum: ['Moderate', 'High', 'Critical'],
    default: 'Moderate'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  address: String,
  responderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  deviceTime: Date
}, {
  timestamps: true
});

SOSSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('SOS', SOSSchema);
