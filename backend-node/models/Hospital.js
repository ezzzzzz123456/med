const mongoose = require('mongoose');

const hospitalSchema = new mongoose.Schema({
  role: { type: String, default: 'hospital' },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  // Location
  address: { type: String, required: true },

  // Security & Verification
  establishmentId: { type: String, required: true }, 
  nabhId: { type: String, required: true },
  
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Hospital', hospitalSchema);