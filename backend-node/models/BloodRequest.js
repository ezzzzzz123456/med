const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
  hospitalName: String,
  bloodGroup: String,
  location: String,
  status: { type: String, default: 'Pending' }, // Pending, Accepted
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('BloodRequest', requestSchema);