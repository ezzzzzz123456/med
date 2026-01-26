const express = require('express');
const router = express.Router();

router.post('/login', (req, res) => {
  res.json({ success: true, token: "demo-token", user: { name: "Demo User" } });
});

module.exports = router;