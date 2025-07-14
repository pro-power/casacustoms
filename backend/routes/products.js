// routes/products.js - Product configuration routes
const express = require('express');
const { body, validationResult } = require('express-validator');
const { ProductConfig } = require('../models');

const router = express.Router();

// GET /api/products/devices - Get available devices (PUBLIC)
router.get('/devices', async (req, res) => {
  try {
    const config = await ProductConfig.findOne({ type: 'devices' });
    
    if (!config) {
      // Return default devices if no config found
      return res.json([
        'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14',
        'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13',
        'Samsung Galaxy S23', 'Samsung Galaxy S22'
      ]);
    }
    
    const activeDevices = config.data
      .filter(device => device.active)
      .map(device => device.name);
    
    res.json(activeDevices);
    
  } catch (error) {
    console.error('Get devices error:', error);
    res.status(500).json({
      error: 'Failed to retrieve devices'
    });
  }
});

// GET /api/products/colors - Get available colors (PUBLIC)
router.get('/colors', async (req, res) => {
  try {
    const config = await ProductConfig.findOne({ type: 'colors' });
    
    if (!config) {
      // Return default colors if no config found
      return res.json([
        { name: 'Hot Pink', hex: '#E91E63' },
        { name: 'Pink', hex: '#F48FB1' },
        { name: 'Orange', hex: '#FF9800' },
        { name: 'Light Orange', hex: '#FFB74D' },
        { name: 'Yellow', hex: '#FFEB3B' },
        { name: 'Teal', hex: '#26C6DA' },
        { name: 'Blue', hex: '#2196F3' },
        { name: 'Purple', hex: '#9C27B0' },
        { name: 'Dark Purple', hex: '#673AB7' }
      ]);
    }
    
    const activeColors = config.data
      .filter(color => color.active)
      .map(color => ({
        name: color.name,
        hex: color.hex
      }));
    
    res.json(activeColors);
    
  } catch (error) {
    console.error('Get colors error:', error);
    res.status(500).json({
      error: 'Failed to retrieve colors'
    });
  }
});

// GET /api/products/fonts - Get available fonts (PUBLIC)
router.get('/fonts', async (req, res) => {
  try {
    const config = await ProductConfig.findOne({ type: 'fonts' });
    
    if (!config) {
      // Return default fonts if no config found
      return res.json([
        { name: 'Pecita', family: 'Pecita, sans-serif' },
        { name: 'Inter', family: 'Inter, sans-serif' },
        { name: 'Poppins', family: 'Poppins, sans-serif' }
      ]);
    }
    
    const activeFonts = config.data
      .filter(font => font.active)
      .map(font => ({
        name: font.name,
        family: font.family
      }));
    
    res.json(activeFonts);
    
  } catch (error) {
    console.error('Get fonts error:', error);
    res.status(500).json({
      error: 'Failed to retrieve fonts'
    });
  }
});

// POST /api/products/validate-text - Validate custom text (PUBLIC)
router.post('/validate-text', [
  body('text').trim().isLength({ min: 1, max: 20 }).withMessage('Text must be 1-20 characters')
], async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({
        valid: false,
        message: errors.array()[0].msg
      });
    }
    
    const { text } = req.body;
    
    // Additional validation rules
    const trimmedText = text.trim();
    
    // Check for profanity or inappropriate content
    const inappropriateWords = [
      // Add your list of inappropriate words here
      'badword1', 'badword2' // placeholder
    ];
    
    const containsInappropriate = inappropriateWords.some(word => 
      trimmedText.toLowerCase().includes(word.toLowerCase())
    );
    
    if (containsInappropriate) {
      return res.json({
        valid: false,
        message: 'Text contains inappropriate content'
      });
    }
    
    // Check for special characters (allow basic punctuation)
    const allowedPattern = /^[a-zA-Z0-9\s\-\.\!\?\&\'\,]+$/;
    if (!allowedPattern.test(trimmedText)) {
      return res.json({
        valid: false,
        message: 'Text contains unsupported characters'
      });
    }
    
    // All checks passed
    res.json({
      valid: true,
      message: 'Text is valid',
      cleanText: trimmedText
    });
    
  } catch (error) {
    console.error('Text validation error:', error);
    res.status(500).json({
      error: 'Text validation failed'
    });
  }
});

// GET /api/products/pricing - Get pricing information (PUBLIC)
router.get('/pricing', async (req, res) => {
  try {
    // In a real app, this might come from a database
    const pricing = {
      basePrice: 5.95,
      originalPrice: 7.45,
      discount: 0.25, // 25% off
      shipping: {
        standard: 0, // Free shipping
        express: 4.99,
        freeShippingThreshold: 25
      },
      tax: {
        rate: 0.20, // 20% VAT for UK
        included: false
      },
      addOns: {
        logo: 0, // Free Love Island logo
        rush: 2.99 // Rush processing
      }
    };
    
    res.json(pricing);
    
  } catch (error) {
    console.error('Get pricing error:', error);
    res.status(500).json({
      error: 'Failed to retrieve pricing'
    });
  }
});

// GET /api/products/case-types - Get available case types (PUBLIC)
router.get('/case-types', async (req, res) => {
  try {
    const caseTypes = [
      {
        id: 'CLASSIC',
        name: 'Classic Case',
        description: 'Slim profile with essential protection',
        price: 5.95,
        features: ['Lightweight', 'Scratch resistant', 'Easy installation']
      },
      {
        id: 'PREMIUM',
        name: 'Premium Case',
        description: 'Enhanced protection with premium materials',
        price: 8.95,
        features: ['Drop protection', 'Raised edges', 'Premium finish']
      }
    ];
    
    res.json(caseTypes);
    
  } catch (error) {
    console.error('Get case types error:', error);
    res.status(500).json({
      error: 'Failed to retrieve case types'
    });
  }
});

// GET /api/products/featured - Get featured designs (PUBLIC)
router.get('/featured', async (req, res) => {
  try {
    // In a real app, this would come from a database of featured designs
    const featuredDesigns = [
      {
        id: 1,
        device: 'iPhone 14 Pro Max',
        text: 'Island Vibes',
        color: 'Hot Pink',
        price: 5.95,
        likes: 247,
        rating: 4.9,
        featured: true
      },
      {
        id: 2,
        device: 'iPhone 14 Pro',
        text: 'Summer Love',
        color: 'Orange',
        price: 5.95,
        likes: 189,
        rating: 4.8,
        featured: true
      },
      {
        id: 3,
        device: 'iPhone 13 Pro Max',
        text: 'Villa Life',
        color: 'Teal',
        price: 5.95,
        likes: 156,
        rating: 4.7,
        featured: true
      },
      {
        id: 4,
        device: 'Samsung Galaxy S23',
        text: 'Grafting',
        color: 'Purple',
        price: 5.95,
        likes: 203,
        rating: 4.9,
        featured: true
      }
    ];
    
    res.json(featuredDesigns);
    
  } catch (error) {
    console.error('Get featured designs error:', error);
    res.status(500).json({
      error: 'Failed to retrieve featured designs'
    });
  }
});

module.exports = router;