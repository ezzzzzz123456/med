
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'hospital'], default: 'user' },
  bloodGroup: { type: String, required: true },
  
  // Health History - Used to auto-filter unfit donors
  healthDetails: {
    age: { type: Number, required: true },
    hasChronicIllness: { type: Boolean, default: false },
    lastDonationDate: { type: Date, default: null },
    hadRecentInfection: { type: Boolean, default: false } // Reset after 14 days
  },

  // Geospatial Index for 5km Radius Search
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [Longitude, Latitude]
  }
}, { timestamps: true });

// Create the Geo-Index
userSchema.index({ location: '2dsphere' });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

module.exports = mongoose.model('User', userSchema);