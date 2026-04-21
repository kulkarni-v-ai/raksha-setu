const mongoose = require('mongoose');

const HospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  emergencyStatus: {
    type: String,
    enum: ['Active', 'Crowded', 'Full', 'Offline'],
    default: 'Active'
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  contact: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  specialities: [String],
  totalBeds: { type: Number, default: 0 },
  availableBeds: { type: Number, default: 0 }
}, {
  timestamps: true,
});

// Index for geospatial queries
HospitalSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Hospital', HospitalSchema);
