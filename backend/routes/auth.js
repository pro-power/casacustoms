const express = require('express');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const { Admin } = require('../models');

const router = express.Router();

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access token required' });
  }
  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// GET /api/auth/status - Check if setup is needed
router.get('/status', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments({});
    res.json({ 
      setupRequired: adminCount === 0, 
      hasAdmins: adminCount > 0 
    });
  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ error: 'Failed to check setup status' });
  }
});

// POST /api/auth/setup - Create first admin account
router.post('/setup', async (req, res) => {
  try {
    console.log('📝 Setup request received:', req.body);
    
    const { email, password, firstName, lastName } = req.body;
    
    console.log('🔍 Checking existing admins...');
    const existingAdminCount = await Admin.countDocuments({});
    console.log('👥 Existing admin count:', existingAdminCount);
    
    if (existingAdminCount > 0) {
      return res.status(409).json({ error: 'Admin account already exists' });
    }
    
    console.log('👤 Creating new admin...');
    const admin = new Admin({ 
      email, 
      password, 
      firstName, 
      lastName, 
      role: 'super_admin' 
    });
    
    console.log('💾 Saving admin...');
    await admin.save();
    console.log('✅ Admin saved successfully');
    
    const token = jwt.sign(
      { adminId: admin._id, type: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Admin account created: ${email}`);
    
    res.status(201).json({
      message: 'Admin account created successfully',
      token,
      user: { 
        id: admin._id, 
        email: admin.email, 
        firstName: admin.firstName, 
        lastName: admin.lastName, 
        role: admin.role 
      }
    });
  } catch (error) {
    console.error('❌ Setup error details:', error);
    res.status(500).json({ 
      error: 'Failed to create admin account',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/auth/verify - Verify JWT token
router.get('/verify', verifyToken, async (req, res) => {
  try {
    const admin = await Admin.findById(req.adminId).select('-password');
    if (!admin || !admin.isActive) {
      return res.status(401).json({ valid: false, error: 'Admin not found or inactive' });
    }
    
    res.json({
      valid: true,
      user: {
        id: admin._id,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Token verification error:', error);
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
});

// POST /api/auth/login - Admin login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const admin = await Admin.findOne({ email, isActive: true });
    if (!admin || !(await admin.comparePassword(password))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    
    const token = jwt.sign(
      { adminId: admin._id, type: 'admin' }, 
      process.env.JWT_SECRET, 
      { expiresIn: '24h' }
    );
    
    console.log(`✅ Admin login: ${email}`);
    
    res.json({
      message: 'Login successful',
      token,
      user: { 
        id: admin._id, 
        email: admin.email, 
        firstName: admin.firstName, 
        lastName: admin.lastName, 
        role: admin.role 
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

module.exports = { router, verifyToken };
