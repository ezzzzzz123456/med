const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' }, // 'user' or 'hospital'
  
  // specific fields for Donors
  age: { type: Number },
  bloodGroup: { type: String },
  address: { type: String },
  phone: { type: String }, // Added for contact
  
  // Added for Map Location
  location: {
    lat: { type: Number },
    lng: { type: Number }
  },

  medicalHistory: { type: String },
  isAvailable: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);