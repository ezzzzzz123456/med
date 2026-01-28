const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  hospitalName: { type: String, required: true },
  patientName: { type: String, required: true },
  urgency: { type: String, default: 'Critical' },
  bloodGroup: { type: String, required: true },
  location: { type: String, required: true },
  latitude: { type: Number },
  longitude: { type: Number },
  status: { type: String, default: 'Pending' }, 
  donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
}, { timestamps: true });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);