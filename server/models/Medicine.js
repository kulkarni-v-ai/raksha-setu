const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  composition: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['General', 'Antibiotics', 'Emergency', 'Cardiology', 'Pediatric', 'Ayurvedic', 'Other'],
    default: 'General'
  },
  description: String,
  manufacturer: String,
}, {
  timestamps: true
});

module.exports = mongoose.model('Medicine', MedicineSchema);
