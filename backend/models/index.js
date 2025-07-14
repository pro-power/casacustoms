// models/index.js - Updated MongoDB Models for US-based addressing
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Order Schema - Updated for US addressing
const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true,
    required: true,
    index: true
  },
  
  // Customer Information (no user account required)
  customerInfo: {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true }
  },
  
  // US Shipping Address
  shippingAddress: {
    address: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true }, // US State code (CA, NY, etc.)
    zipCode: { type: String, required: true, trim: true }, // US ZIP code
    country: { type: String, required: true, default: 'United States' }
  },
  
  // US Billing Address (optional - can be same as shipping)
  billingAddress: {
    address: { type: String, trim: true },
    city: { type: String, trim: true },
    state: { type: String, trim: true },
    zipCode: { type: String, trim: true },
    country: { type: String, default: 'United States' }
  },
  
  // Product Details
  items: [{
    device: { type: String, required: true },
    caseType: { type: String, required: true, default: 'CLASSIC' },
    text: { type: String, required: true, maxlength: 20 },
    color: { type: String, required: true },
    font: { type: String, default: 'Pecita' },
    fontSize: { type: Number, default: 24 },
    logo: { type: Boolean, default: false },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 }
  }],
  
  // Order Totals (USD)
  subtotal: { type: Number, required: true },
  shipping: { type: Number, default: 0 },
  tax: { type: Number, required: true }, // US sales tax
  total: { type: Number, required: true },
  
  // Order Status
  status: {
    type: String,
    enum: ['pending', 'processing', 'printed', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  
  // Payment Information
  paymentInfo: {
    paymentIntentId: { type: String, required: true },
    paymentMethod: { type: String, default: 'card' },
    paymentStatus: {
      type: String,
      enum: ['pending', 'succeeded', 'failed', 'refunded'],
      default: 'pending'
    }
  },
  
  // Fulfillment Information
  fulfillment: {
    trackingNumber: { type: String },
    carrier: { type: String, default: 'USPS' }, // USPS, UPS, FedEx
    printedAt: { type: Date },
    shippedAt: { type: Date },
    deliveredAt: { type: Date },
    estimatedDelivery: { type: Date },
    notes: { type: String }
  },
  
  // Additional Information
  specialInstructions: { type: String },
  marketing: { type: Boolean, default: false },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, {
  timestamps: true
});

// Order indexes for performance
orderSchema.index({ 'customerInfo.email': 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
orderSchema.index({ 'paymentInfo.paymentIntentId': 1 });
orderSchema.index({ 'shippingAddress.state': 1 }); // For US state-based queries

// Order virtual fields
orderSchema.virtual('customerName').get(function() {
  return `${this.customerInfo.firstName} ${this.customerInfo.lastName}`;
});

orderSchema.virtual('customerEmail').get(function() {
  return this.customerInfo.email;
});

orderSchema.virtual('fullShippingAddress').get(function() {
  const addr = this.shippingAddress;
  return `${addr.address}, ${addr.city}, ${addr.state} ${addr.zipCode}`;
});

// Order methods - Updated generateOrderNumber method
orderSchema.methods.generateOrderNumber = function() {
  const now = new Date();
  const year = now.getFullYear().toString().slice(-2);
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const day = now.getDate().toString().padStart(2, '0');
  const dateStr = `${year}${month}${day}`;
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LICC${dateStr}${random}`;
};

orderSchema.methods.updateStatus = function(newStatus, trackingNumber = null, carrier = 'USPS') {
  this.status = newStatus;
  this.updatedAt = new Date();
  
  // Update fulfillment timestamps
  switch(newStatus) {
    case 'printed':
      this.fulfillment.printedAt = new Date();
      break;
    case 'shipped':
      this.fulfillment.shippedAt = new Date();
      if (trackingNumber) {
        this.fulfillment.trackingNumber = trackingNumber;
        this.fulfillment.carrier = carrier;
        // Estimate delivery (3-5 business days for USPS)
        const estimatedDays = carrier === 'USPS' ? 5 : carrier === 'UPS' ? 3 : 4;
        this.fulfillment.estimatedDelivery = new Date(Date.now() + estimatedDays * 24 * 60 * 60 * 1000);
      }
      break;
    case 'delivered':
      this.fulfillment.deliveredAt = new Date();
      break;
  }
  
  return this.save();
};

// Calculate sales tax based on US state
orderSchema.methods.calculateTax = function() {
  // US state tax rates (simplified - in production, use a tax service)
  const stateTaxRates = {
    'AL': 0.04, 'AK': 0.00, 'AZ': 0.056, 'AR': 0.065, 'CA': 0.0725,
    'CO': 0.029, 'CT': 0.0635, 'DE': 0.00, 'FL': 0.06, 'GA': 0.04,
    'HI': 0.04, 'ID': 0.06, 'IL': 0.0625, 'IN': 0.07, 'IA': 0.06,
    'KS': 0.065, 'KY': 0.06, 'LA': 0.045, 'ME': 0.055, 'MD': 0.06,
    'MA': 0.0625, 'MI': 0.06, 'MN': 0.06875, 'MS': 0.07, 'MO': 0.04225,
    'MT': 0.00, 'NE': 0.055, 'NV': 0.0685, 'NH': 0.00, 'NJ': 0.06625,
    'NM': 0.05125, 'NY': 0.08, 'NC': 0.0475, 'ND': 0.05, 'OH': 0.0575,
    'OK': 0.045, 'OR': 0.00, 'PA': 0.06, 'RI': 0.07, 'SC': 0.06,
    'SD': 0.045, 'TN': 0.07, 'TX': 0.0625, 'UT': 0.0485, 'VT': 0.06,
    'VA': 0.053, 'WA': 0.065, 'WV': 0.06, 'WI': 0.05, 'WY': 0.04
  };
  
  const taxRate = stateTaxRates[this.shippingAddress.state] || 0.085; // Default 8.5%
  return (this.subtotal + this.shipping) * taxRate;
};

// Simplified pre-save middleware - NO ORDER NUMBER GENERATION
orderSchema.pre('save', async function(next) {
  try {
    // Only handle tax calculation and timestamps
    if (this.isModified('subtotal') || this.isModified('shipping') || this.isModified('shippingAddress.state')) {
      if (!this.tax || this.tax === 0) {
        this.tax = this.calculateTax();
        console.log(`🧮 Auto-calculated tax: ${this.tax}`);
      }
    }
    
    this.updatedAt = new Date();
    next();
  } catch (error) {
    console.error('❌ Pre-save middleware error:', error);
    next(error);
  }
});

// Admin Schema (unchanged)
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please enter a valid email']
  },
  
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  
  role: {
    type: String,
    default: 'admin',
    enum: ['admin', 'super_admin']
  },
  
  isActive: {
    type: Boolean,
    default: true
  },
  
  lastLogin: {
    type: Date
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});


// Admin virtual fields
adminSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Hash password before saving
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw error;
  }
};

// Product Configuration Schema (updated for US market)
const productConfigSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['devices', 'colors', 'fonts', 'carriers']
  },
  
  data: [{
    name: { type: String, required: true },
    value: { type: String },
    hex: { type: String }, // For colors
    family: { type: String }, // For fonts
    code: { type: String }, // For carriers/states
    active: { type: Boolean, default: true }
  }],
  
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Product config indexes
productConfigSchema.index({ type: 1 });

// Create models
const Order = mongoose.model('Order', orderSchema);
const Admin = mongoose.model('Admin', adminSchema);
const ProductConfig = mongoose.model('ProductConfig', productConfigSchema);

// Initialize default product configurations (updated for US market)
const initializeProductConfigs = async () => {
  try {
    const configs = await ProductConfig.find({});
    
    if (configs.length === 0) {
      console.log('🔧 Initializing product configurations...');
      
      const defaultConfigs = [
        {
          type: 'devices',
          data: [
            { name: 'iPhone 15 Pro Max', active: true },
            { name: 'iPhone 15 Pro', active: true },
            { name: 'iPhone 15', active: true },
            { name: 'iPhone 14 Pro Max', active: true },
            { name: 'iPhone 14 Pro', active: true },
            { name: 'iPhone 14', active: true },
            { name: 'iPhone 13 Pro Max', active: true },
            { name: 'iPhone 13 Pro', active: true },
            { name: 'iPhone 13', active: true },
            { name: 'Samsung Galaxy S24', active: true },
            { name: 'Samsung Galaxy S23', active: true },
            { name: 'Samsung Galaxy S22', active: true }
          ]
        },
        {
          type: 'colors',
          data: [
            { name: 'Hot Pink', hex: '#E91E63', active: true },
            { name: 'Pink', hex: '#F48FB1', active: true },
            { name: 'Orange', hex: '#FF9800', active: true },
            { name: 'Light Orange', hex: '#FFB74D', active: true },
            { name: 'Yellow', hex: '#FFEB3B', active: true },
            { name: 'Teal', hex: '#26C6DA', active: true },
            { name: 'Blue', hex: '#2196F3', active: true },
            { name: 'Purple', hex: '#9C27B0', active: true },
            { name: 'Dark Purple', hex: '#673AB7', active: true },
            { name: 'Black', hex: '#000000', active: true },
            { name: 'White', hex: '#FFFFFF', active: true },
            { name: 'Red', hex: '#F44336', active: true }
          ]
        },
        {
          type: 'fonts',
          data: [
            { name: 'Pecita', family: 'Pecita, sans-serif', active: true },
            { name: 'Inter', family: 'Inter, sans-serif', active: true },
            { name: 'Poppins', family: 'Poppins, sans-serif', active: true },
            { name: 'Roboto', family: 'Roboto, sans-serif', active: true },
            { name: 'Montserrat', family: 'Montserrat, sans-serif', active: true }
          ]
        },
        {
          type: 'carriers',
          data: [
            { name: 'USPS', code: 'usps', active: true },
            { name: 'UPS', code: 'ups', active: true },
            { name: 'FedEx', code: 'fedex', active: true },
            { name: 'DHL', code: 'dhl', active: false }
          ]
        }
      ];
      
      await ProductConfig.insertMany(defaultConfigs);
      console.log('✅ Product configurations initialized');
    }
  } catch (error) {
    console.error('Error initializing product configs:', error);
  }
};

// Initialize on startup
mongoose.connection.once('open', initializeProductConfigs);

module.exports = {
  Order,
  Admin,
  ProductConfig
};