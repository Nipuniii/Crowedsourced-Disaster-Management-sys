const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require("../middleware/authMiddleware");
const router = express.Router();

// Register User (Only for normal users, Admins are pre-created)
router.post('/register', async (req, res) => {
    try {
      const { name, email, password } = req.body;
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ name, email, password: hashedPassword, role: 'user' });
      await user.save();
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });
  
  // Login User/Admin
  router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log("Login attempt:", email);

      const user = await User.findOne({ email });
      if (!user) {
        console.log("User not found");
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        console.log("Password incorrect");
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const payload = {
        user: {
          id: user._id,
          role: user.role  // Make sure role is included in the payload
        }
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '2h' });
      res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  });

  // Get current user profile
router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Get current user profile (Using /api/auth/me)
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password"); // Exclude the password field
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

  
  module.exports = router;
  