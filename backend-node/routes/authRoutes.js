const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Hospital = require('../models/Hospital');

// --- 1. REGISTER (SIGN UP) ---
router.post('/register', async (req, res) => {
  try {
    const { role, email, password, ...otherData } = req.body;

    // Check if email already exists in the correct collection
    const existingUser = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already registered!" });
    }

    // Create the new account based on role
    let newAccount;
    if (role === 'hospital') {
      newAccount = new Hospital({ role, email, password, ...otherData });
    } else {
      newAccount = new User({ role, email, password, ...otherData });
    }

    // Save to MongoDB
    await newAccount.save();

    res.json({ success: true, message: "Registration Successful!" });

  } catch (err) {
    console.error("Signup Error:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
});

// --- 2. LOGIN ---
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // 1. Find the account based on role
    const account = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    // 2. Strict Check: Does account exist?
    if (!account) {
      return res.status(400).json({ success: false, message: "User not found. Please Sign Up first." });
    }

    // 3. Strict Check: Does password match?
    // (In a real app, use bcrypt.compare here)
    if (account.password !== password) {
      return res.status(400).json({ success: false, message: "Wrong Password!" });
    }

    // 4. Login Valid
    res.json({ 
      success: true, 
      user: { 
        id: account._id, 
        name: account.name, 
        role: account.role 
      } 
    });

  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// --- 3. RESET PASSWORD (FORGOT PASSWORD) ---
router.post('/reset-password', async (req, res) => {
  try {
    const { email, newPassword, role } = req.body;

    // 1. Find the account to update
    const account = role === 'hospital' 
      ? await Hospital.findOne({ email }) 
      : await User.findOne({ email });

    if (!account) {
      return res.status(404).json({ success: false, message: "Email not found! Please Register." });
    }

    // 2. Update the password
    account.password = newPassword; // In production, hash this new password
    await account.save();

    res.json({ success: true, message: "Password reset successful! Login now." });

  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;