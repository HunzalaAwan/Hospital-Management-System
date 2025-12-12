const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { publishEvent } = require('../config/rabbitmq');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

// Cookie options
const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
});

// @desc    Register user
// @route   POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { email, password, name, role, phone, specialization, qualification, experience, consultationFee, dateOfBirth, gender, address } = req.body;
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    // Create user
    const userData = {
      email,
      password,
      name,
      role: role || 'patient',
      phone
    };
    
    // Add role-specific fields
    if (role === 'doctor') {
      userData.specialization = specialization;
      userData.qualification = qualification;
      userData.experience = experience;
      userData.consultationFee = consultationFee;
    } else {
      userData.dateOfBirth = dateOfBirth;
      userData.gender = gender;
      userData.address = address;
    }
    
    const user = await User.create(userData);
    
    // Publish user registered event
    await publishEvent('user.registered', {
      userId: user._id,
      email: user.email,
      name: user.name,
      role: user.role
    });
    
    // Generate token and set cookie
    const token = generateToken(user._id);
    
    res.cookie('token', token, getCookieOptions());
    
    res.status(201).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }
    
    // Find user and include password
    const user = await User.findOne({ email }).select('+password');
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check password
    const isMatch = await user.comparePassword(password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      });
    }
    
    // Generate token and set cookie
    const token = generateToken(user._id);
    
    res.cookie('token', token, getCookieOptions());
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
exports.logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });
  
  res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
};

// @desc    Get current user
// @route   GET /api/auth/me
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
exports.updateProfile = async (req, res) => {
  try {
    const fieldsToUpdate = {
      name: req.body.name,
      phone: req.body.phone
    };
    
    // Add role-specific fields
    if (req.user.role === 'doctor') {
      fieldsToUpdate.specialization = req.body.specialization;
      fieldsToUpdate.qualification = req.body.qualification;
      fieldsToUpdate.experience = req.body.experience;
      fieldsToUpdate.consultationFee = req.body.consultationFee;
      fieldsToUpdate.availableSlots = req.body.availableSlots;
    } else {
      fieldsToUpdate.dateOfBirth = req.body.dateOfBirth;
      fieldsToUpdate.gender = req.body.gender;
      fieldsToUpdate.address = req.body.address;
      fieldsToUpdate.medicalHistory = req.body.medicalHistory;
    }
    
    // Remove undefined fields
    Object.keys(fieldsToUpdate).forEach(key => 
      fieldsToUpdate[key] === undefined && delete fieldsToUpdate[key]
    );
    
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// @desc    Get all doctors
// @route   GET /api/auth/doctors
exports.getDoctors = async (req, res) => {
  try {
    const { specialization } = req.query;
    
    const query = { role: 'doctor', isActive: true };
    if (specialization) {
      query.specialization = new RegExp(specialization, 'i');
    }
    
    const doctors = await User.find(query).select('-password');
    
    res.status(200).json({
      success: true,
      count: doctors.length,
      doctors
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctors'
    });
  }
};

// @desc    Get doctor by ID
// @route   GET /api/auth/doctors/:id
exports.getDoctorById = async (req, res) => {
  try {
    const doctor = await User.findOne({ 
      _id: req.params.id, 
      role: 'doctor',
      isActive: true 
    }).select('-password');
    
    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }
    
    res.status(200).json({
      success: true,
      doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching doctor'
    });
  }
};
