const express = require('express');
const axios = require('axios'); // ✅ Required for Geocoding
const router = express.Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// --- 1. REGISTER (Now with Real Geocoding!) ---
router.post('/register', async (req, res) => {
  try {
    const { role, email, password, address, ...otherData } = req.body;

    const existingUser = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    if (existingUser) return res.status(400).json({ success: false, message: "Email already registered!" });

    // --- GEOCODING LOGIC START ---
    // Default location (New Delhi) in case address is empty or not found
    let location = { lat: 28.6139, lng: 77.2090 }; 

    if (address && role !== 'hospital') {
      try {
        console.log(`📍 Geocoding address: "${address}"...`);
        
        // Ask OpenStreetMap for coordinates
        const geoRes = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: { q: address, format: 'json', limit: 1 },
          headers: { 'User-Agent': 'MediConnect-App' } // Required by OSM to prevent blocking
        });

        if (geoRes.data && geoRes.data.length > 0) {
          location = {
            lat: parseFloat(geoRes.data[0].lat),
            lng: parseFloat(geoRes.data[0].lon)
          };
          console.log(`✅ Found Location:`, location);
        } else {
            console.log("⚠️ Address not found on map, using default.");
        }
      } catch (geoErr) {
        console.error("❌ Geocoding Failed (using default):", geoErr.message);
      }
    }
    // --- GEOCODING LOGIC END ---

    let newAccount;
    if (role === 'hospital') {
      newAccount = new Hospital({ role, email, password, address, ...otherData });
    } else {
      newAccount = new User({ 
        role, 
        email, 
        password, 
        address, // Save the text address
        location, // ✅ Save the REAL coordinates found above
        ...otherData 
      });
    }

    await newAccount.save();
    res.json({ success: true, message: "Registration Successful!" });

  } catch (err) {
    console.error("Register Error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

// --- 2. LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const account = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    if (!account) return res.status(400).json({ success: false, message: "User not found." });
    if (account.password !== password) return res.status(400).json({ success: false, message: "Wrong Password!" });

    res.json({ 
      success: true, 
      user: { 
        id: account._id, 
        name: account.name, 
        role: account.role,
        address: account.address || "Main St, City Center",
        location: account.location || { lat: 28.6139, lng: 77.2090 },
        bloodGroup: account.bloodGroup 
      } 
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- 3. RESET PASSWORD ---
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, role } = req.body;
    const account = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    if (!account) return res.status(404).json({ success: false, message: "Email not found!" });

    account.password = newPassword;
    await account.save();
    res.json({ success: true, message: "Password reset successful! Login now." });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- 4. SEEDER (Updated to spread donors randomly around Delhi) ---
router.post('/seed-donors', async (req, res) => {
  try {
    await User.deleteMany({ email: { $regex: /@avengers.com$/ } });

    const baseLat = 28.6139;
    const baseLng = 77.2090;
    const names = ["Tony Stark", "Steve Rogers", "Bruce Banner", "Natasha Romanoff", "Clint Barton"];
    const groups = ["O+", "A+", "B+", "AB+", "O-", "A-"];
    const donors = [];

    for(let i=0; i<50; i++) {
        // Random spread of ~20km around Delhi
        const lat = baseLat + (Math.random() - 0.5) * 0.2; 
        const lng = baseLng + (Math.random() - 0.5) * 0.2;

        donors.push({
            name: names[Math.floor(Math.random() * names.length)] + ` ${i}`,
            email: `donor${i}@avengers.com`,
            password: "123",
            role: "user",
            bloodGroup: groups[Math.floor(Math.random() * groups.length)],
            phone: `+91-98765${Math.floor(10000 + Math.random() * 90000)}`,
            address: "Random Generated Location",
            location: { lat, lng },
            isAvailable: true,
            age: Math.floor(20 + Math.random() * 30) // Random Age 20-50
        });
    }

    await User.insertMany(donors);
    res.json({ success: true, message: "✅ DB Refreshed with 50 Fake Donors!" });

  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;