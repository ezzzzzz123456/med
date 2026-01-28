const express = require('express');
const router = express.Router();
const BloodRequest = require('../models/BloodRequest');
const User = require('../models/User');

// --- 1. SEARCH DONORS ---
router.post('/search', async (req, res) => {
  try {
    const { bloodGroup } = req.body;
    const donors = await User.find({ role: 'user', bloodGroup })
                             .select('name location bloodGroup _id phone isAvailable'); 
    res.json({ success: true, donors });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 2. CREATE REQUEST ---
router.post('/create', async (req, res) => {
  try {
    const newRequest = new BloodRequest({
        ...req.body,
        status: 'Pending'
    });
    const savedRequest = await newRequest.save();
    res.json({ success: true, message: "Request Broadcasted!", requestId: savedRequest._id });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 3. FETCH REQUESTS (Donor Inbox) ---
router.get('/for-donor/:bloodGroup', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ 
        bloodGroup: req.params.bloodGroup, 
        status: 'Pending' 
    }).sort({ createdAt: -1 });
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 4. DONOR ACCEPTS REQUEST ---
router.put('/accept', async (req, res) => {
  try {
    const { requestId, donorId } = req.body;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    if (request.status !== 'Pending') {
        return res.status(400).json({ message: "Request already fulfilled!" });
    }

    const donor = await User.findById(donorId);
    request.status = 'Fulfilled';
    request.donorId = donor._id;
    await request.save();

    res.json({ success: true, message: "Request Accepted!", donorName: donor.name });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 5. STATUS CHECK ---
router.get('/status/:requestId', async (req, res) => {
  try {
    const request = await BloodRequest.findById(req.params.requestId);
    if (!request) return res.status(404).json({ message: "Not found" });

    let donorDetails = null;
    if (request.status === 'Fulfilled' && request.donorId) {
        donorDetails = await User.findById(request.donorId).select('name phone bloodGroup location address');
    }

    res.json({ success: true, status: request.status, donor: donorDetails });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 6. FETCH HOSPITAL REQUESTS (Updated to include AGE) ---
router.get('/hospital-requests/:hospitalName', async (req, res) => {
  try {
    const requests = await BloodRequest.find({ 
        hospitalName: req.params.hospitalName 
    })
    // ✅ ADDED 'age' here
    .populate('donorId', 'name phone address location age') 
    .sort({ createdAt: -1 });
    
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 7. HOSPITAL DECLINES DONOR (Reset to Pending) ---
router.put('/decline-donor', async (req, res) => {
  try {
    const { requestId } = req.body;
    const request = await BloodRequest.findById(requestId);
    if (!request) return res.status(404).json({ message: "Request not found" });

    // Reset status so other donors can accept it
    request.status = 'Pending';
    request.donorId = null; 
    await request.save();

    res.json({ success: true, message: "Donor Declined. Request is Pending again." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// --- 8. HOSPITAL ACCEPTS/COMPLETES (Removes Request) ---
router.delete('/complete-request/:id', async (req, res) => {
  try {
    await BloodRequest.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Request Completed and Removed." });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;