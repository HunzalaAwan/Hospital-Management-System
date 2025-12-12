const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  getDoctors,
  getDoctorById
} = require('../controllers/authController');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);

// Protected routes
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

module.exports = router;
