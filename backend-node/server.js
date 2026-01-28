const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// --- 1. CORS CONFIGURATION (Allows Frontend Connection) ---
app.use(cors({
  origin: "http://localhost:5173", // Must match your Frontend URL
  credentials: true
}));

app.use(express.json());

// --- 2. ROUTES ---
try {
  // Ensure these files exist in your 'routes' folder
  const authRoutes = require('./routes/authRoutes');
  const bloodRoutes = require('./routes/bloodRoutes');
  
  app.use('/api/auth', authRoutes);
  app.use('/api/blood', bloodRoutes);
} catch (error) {
  console.warn("⚠️ Warning: Route files missing. Create 'routes/bloodRoutes.js' to fix this.");
}

// --- 3. DATABASE CONNECTION ---
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediconnect_pro';

mongoose.connect(MONGO_URI)
  .then(() => console.log('✅ PRO Database Connected'))
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('   (Hint: Open a new terminal and run "mongod" if using local DB)');
  });

// --- 4. SERVER PORT (Fixed for Mac) ---
// Changed to 5001 to avoid AirPlay conflict on Port 5000
const PORT = process.env.PORT || 5001; 
app.listen(PORT, () => console.log(`🚀 Node.js Running on Port ${PORT}`));