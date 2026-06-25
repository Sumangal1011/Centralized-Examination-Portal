const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET,
    {
      expiresIn: '30d',
    }
  );
};

// =============================
// REGISTER USER
// POST /api/auth/register
// =============================
router.post('/register', async (req, res) => {
  try {
    const {
      uid,
      name,
      password,
      role,
      avatar,
    } = req.body;

    const userExists = await User.findOne({ uid });

    if (userExists) {
      return res.status(400).json({
        message: 'User already exists',
      });
    }

    const user = await User.create({
      uid,
      name,
      password,
      role: role || 'student',
      avatar: avatar || '',
    });

    res.status(201).json({
      _id: user._id,
      uid: user.uid,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// =============================
// LOGIN USER
// POST /api/auth/login
// =============================
router.post('/login', async (req, res) => {
  try {
    const {
      uid,
      password,
      role,
    } = req.body;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(401).json({
        message:
          'Invalid University ID or Password',
      });
    }

    if (role && user.role !== role) {
      return res.status(401).json({
        message:
          'Selected role does not match account',
      });
    }

    const isMatch =
      await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message:
          'Invalid University ID or Password',
      });
    }

    res.json({
      _id: user._id,
      uid: user.uid,
      name: user.name,
      role: user.role,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// =============================
// REGISTER FACE
// POST /api/auth/register-face
// =============================
router.post('/register-face', async (req, res) => {
  try {
    const {
      uid,
      descriptor,
    } = req.body;

    const user = await User.findOne({ uid });

    if (!user) {
      return res.status(404).json({
        message: 'User not found',
      });
    }

    user.faceDescriptor = descriptor;

    await user.save();

    res.json({
      success: true,
      message:
        'Face registered successfully',
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: error.message,
    });
  }
});

// =============================
// CURRENT USER
// GET /api/auth/me
// =============================
router.get(
  '/me',
  protect,
  async (req, res) => {
    try {
      const user =
        await User.findById(req.user._id)
          .select('-password');

      res.json(user);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: error.message,
      });
    }
  }
);

module.exports = router;