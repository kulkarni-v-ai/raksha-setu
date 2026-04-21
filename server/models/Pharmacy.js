const mongoose = require('mongoose');

const PharmacySchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
  },
  contact: {
    type: String,
  },
  address: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [lng, lat]
      required: true
    }
  },
  inventory: [{
    medicine: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Medicine'
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    status: {
      type: String,
      enum: ['Available', 'Limited Stock', 'Out of Stock'],
      default: 'Available'
    },
    price: Number
  }],
  isOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for proximity searches
PharmacySchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Pharmacy', PharmacySchema);
