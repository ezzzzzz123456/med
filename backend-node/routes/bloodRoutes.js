const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest'); // Import the new model

// 1. HOSPITAL: Send a Request to ALL donors
router.post('/request', async (req, res) => {
  try {
    const { latitude, longitude, bloodGroup } = req.body;
    
    // Save to Database so Donors can see it later
    const newRequest = new BloodRequest({
      hospitalName: "City General Hospital", // Hardcoded for demo (or send from frontend)
      bloodGroup: bloodGroup,
      location: `Lat: ${latitude}, Lng: ${longitude}`,
      status: 'Pending'
    });
    
    await newRequest.save();

    // Return mock donors for the Map UI (Visual only)
    const mockDonors = [
      { id: 1, name: "Rahul S.", bloodGroup: "O+", lat: latitude + 0.01, lng: longitude + 0.01 },
      { id: 2, name: "Priya P.", bloodGroup: "O+", lat: latitude - 0.01, lng: longitude - 0.01 },
    ];

    res.json({ success: true, count: mockDonors.length, donors: mockDonors });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. DONOR: Get My Inbox
router.get('/inbox', async (req, res) => {
  try {
    // Fetch all requests sorted by newest first
    const requests = await BloodRequest.find().sort({ date: -1 });
    res.json(requests);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. DONOR: Accept a Request
router.put('/accept/:id', async (req, res) => {
  try {
    await BloodRequest.findByIdAndUpdate(req.params.id, { status: 'Accepted' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;