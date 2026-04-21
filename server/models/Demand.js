const mongoose = require('mongoose');

const DemandSchema = new mongoose.Schema({
  medicineName: { 
    type: String, 
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  requestCount: { 
    type: Number, 
    default: 1 
  },
  lastRequested: { 
    type: Date, 
    default: Date.now 
  },
  // We can attach location if we want to show regional demand, but for simplicity we'll keep it global
  isAdded: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('Demand', DemandSchema);
