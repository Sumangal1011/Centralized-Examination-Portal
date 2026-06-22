const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  const { uid, name, password, role, avatar } = req.body;

  try {
    const userExists = await User.findOne({ uid });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      uid,
      name,
      password,
      role: role || 'student',
      avatar: avatar || '',
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        uid: user.uid,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
  const { uid, password, role } = req.body;

  try {
    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(401).json({ message: 'Invalid University ID or Password' });
    }

    // Optional safety role match check
    if (role && user.role !== role) {
      return res.status(401).json({ message: `Access denied. Selected role does not match account.` });
    }

    const isMatch = await user.comparePassword(password);

    if (isMatch) {
      res.json({
        _id: user._id,
        uid: user.uid,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid University ID or Password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
