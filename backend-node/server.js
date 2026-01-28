const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// IMPORT ROUTES
const authRoutes = require('./routes/authRoutes');
const bloodRoutes = require('./routes/bloodRoutes');

dotenv.config();
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/mediconnect_pro')
  .then(() => console.log("✅ PRO Database Connected"))
  .catch((err) => console.log("⚠️ Database Error:", err));

// ACTIVATE ROUTES
app.get('/', (req, res) => {
  res.send('✅ MediConnect Backend is WORKING!');
});
app.use('/api/auth', authRoutes);
app.use('/api/blood', bloodRoutes);

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Node.js Running on Port ${PORT}`));