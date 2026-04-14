const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    default: 'user',
  },
  emergencyContacts: [
    {
      name: String,
      phone: String,
      relation: String
    }
  ],
  preferredLanguage: {
    type: String,
    default: 'en'
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('User', UserSchema);
