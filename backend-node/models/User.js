const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  role: { type: String, default: 'user' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Personal Details
  age: { type: Number, required: true },
  address: { type: String, required: true },
  
  // Medical Data
  bloodGroup: { type: String, required: true },
  medicalHistory: { type: String, default: "None" },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);