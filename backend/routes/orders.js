// routes/orders.js - Fixed order creation route for US addresses
const express = require('express');
const { body, query, validationResult } = require('express-validator');
const { Order } = require('../models');
const { verifyToken } = require('./auth');



const router = express.Router();

console.log('✅ Order routes defined');

// Validation middleware for US addresses
const validateCreateOrder = [
  body('customerInfo.firstName').trim().isLength({ min: 2 }).withMessage('First name required'),
  body('customerInfo.lastName').trim().isLength({ min: 2 }).withMessage('Last name required'),
  body('customerInfo.email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('customerInfo.phone').trim().isLength({ min: 10 }).withMessage('Valid phone number required'),
  body('shippingAddress.address').trim().isLength({ min: 5 }).withMessage('Address required'),
  body('shippingAddress.city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('shippingAddress.state').trim().isLength({ min: 2, max: 2 }).withMessage('State code required'),
  body('shippingAddress.zipCode').trim().matches(/^\d{5}(-\d{4})?$/).withMessage('Valid ZIP code required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.device').trim().isLength({ min: 1 }).withMessage('Device required'),
  body('items.*.text').trim().isLength({ min: 1, max: 20 }).withMessage('Custom text required (max 20 chars)'),
  body('items.*.color').trim().isLength({ min: 1 }).withMessage('Color required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('total').isFloat({ min: 0 }).withMessage('Valid total required'),
  body('paymentInfo.paymentIntentId').trim().isLength({ min: 1 }).withMessage('Payment intent ID required')
];

// POST /api/orders - Create new order (PUBLIC)
router.post('/', validateCreateOrder, async (req, res) => {
  try {
    console.log('📦 Order creation request received:', {
      customerEmail: req.body.customerInfo?.email,
      itemCount: req.body.items?.length,
      total: req.body.total
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation failed:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const orderData = req.body;
    
    console.log(`📦 Creating order for ${orderData.customerInfo.email}`);
    console.log('📍 Shipping to:', {
      city: orderData.shippingAddress.city,
      state: orderData.shippingAddress.state,
      zipCode: orderData.shippingAddress.zipCode
    });

    // Create order with US address structure
    const order = new Order({
      customerInfo: {
        firstName: orderData.customerInfo.firstName,
        lastName: orderData.customerInfo.lastName,
        email: orderData.customerInfo.email,
        phone: orderData.customerInfo.phone
      },
      shippingAddress: {
        address: orderData.shippingAddress.address,
        city: orderData.shippingAddress.city,
        state: orderData.shippingAddress.state,
        zipCode: orderData.shippingAddress.zipCode,
        country: orderData.shippingAddress.country || 'United States'
      },
      billingAddress: orderData.billingAddress ? {
        address: orderData.billingAddress.address,
        city: orderData.billingAddress.city,
        state: orderData.billingAddress.state,
        zipCode: orderData.billingAddress.zipCode,
        country: orderData.billingAddress.country || 'United States'
      } : null,
      items: orderData.items.map(item => ({
        device: item.device,
        caseType: item.caseType || 'CLASSIC',
        text: item.text,
        color: item.color,
        font: item.font || 'Pecita',
        fontSize: item.fontSize || 24,
        logo: item.logo || false,
        price: item.price,
        quantity: item.quantity
      })),
      subtotal: orderData.subtotal,
      shipping: orderData.shipping || 0,
      tax: orderData.tax,
      total: orderData.total,
      paymentInfo: {
        paymentIntentId: orderData.paymentInfo.paymentIntentId,
        paymentMethod: orderData.paymentInfo.paymentMethod || 'card',
        paymentStatus: orderData.paymentInfo.paymentStatus || 'succeeded'
      },
      specialInstructions: orderData.specialInstructions || '',
      marketing: orderData.marketing || false,
      status: 'processing' // Start as processing since payment is confirmed
    });
    
    console.log('🔍 Order before save:', {
      hasOrderNumber: !!order.orderNumber,
      customerEmail: order.customerInfo.email,
      total: order.total,
      itemCount: order.items.length
    });
    
    console.log('💾 Saving order to database...');

    if (!order.orderNumber) {
      console.log('🔢 Generating order number...');
      
      // Generate with collision detection
      let isUnique = false;
      let attempts = 0;
      
      while (!isUnique && attempts < 5) {
        order.orderNumber = order.generateOrderNumber();
        
        // Check if this order number already exists
        const existing = await Order.findOne({ orderNumber: order.orderNumber });
        if (!existing) {
          isUnique = true;
        } else {
          console.log(`🔄 Order number ${order.orderNumber} exists, retrying...`);
        }
        attempts++;
      }
      
      if (!isUnique) {
        throw new Error('Could not generate unique order number');
      }
      
      console.log('✅ Generated unique order number:', order.orderNumber);
    }
    await order.save();
    
    console.log(`✅ Order created successfully: ${order.orderNumber}`);
    
    // Return order data that matches frontend expectations
    const responseOrder = {
      id: order._id,
      orderNumber: order.orderNumber,
      total: order.total,
      status: order.status,
      customerEmail: order.customerInfo.email,
      customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      items: order.items,
      shippingAddress: order.shippingAddress,
      createdAt: order.createdAt,
      paymentInfo: {
        paymentIntentId: order.paymentInfo.paymentIntentId,
        paymentStatus: order.paymentInfo.paymentStatus
      }
    };
    
    res.status(201).json({
      message: 'Order created successfully',
      order: responseOrder
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    // Provide more specific error messages
    let errorMessage = 'Failed to create order';
    let statusCode = 500;
    
    if (error.name === 'ValidationError') {
      errorMessage = 'Order validation failed: ' + Object.values(error.errors).map(e => e.message).join(', ');
      statusCode = 400;
    } else if (error.code === 11000) {
      errorMessage = 'Order number conflict. Please try again.';
      statusCode = 409;
    } else if (error.message.includes('payment')) {
      errorMessage = 'Payment verification failed';
      statusCode = 402;
    }
    
    res.status(statusCode).json({
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/analytics', verifyToken, async (req, res) => {
  try {
    const { range = '30d' } = req.query;
    
    console.log(`📊 Getting analytics for range: ${range}`);
    
    // Calculate date range
    let startDate = new Date();
    switch(range) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }
    
    const [totalStats, statusCounts, recentOrders] = await Promise.all([
      // Total stats
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            averageOrderValue: { $avg: '$total' }
          }
        }
      ]),
      
      // Status counts
      Order.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]),
      
      // Recent orders
      Order.find({ createdAt: { $gte: startDate } })
        .sort({ createdAt: -1 })
        .limit(10)
        .select('orderNumber customerInfo status createdAt total')
    ]);
    
    const stats = totalStats[0] || { totalOrders: 0, totalRevenue: 0, averageOrderValue: 0 };
    
    // Format status counts
    const statusMap = {};
    statusCounts.forEach(item => {
      statusMap[item._id] = item.count;
    });
    
    // Recent activity
    const recentActivity = recentOrders.map(order => ({
      type: 'ORDER_CREATED',
      message: `New order ${order.orderNumber} from ${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      timestamp: order.createdAt,
      orderId: order._id
    }));
    
    const analytics = {
      totalRevenue: stats.totalRevenue || 0,
      totalOrders: stats.totalOrders || 0,
      averageOrderValue: stats.averageOrderValue || 0,
      conversionRate: 0.15,
      statusCounts: statusMap,
      chartData: [],
      recentActivity,
      topProducts: []
    };
    
    console.log(`✅ Analytics calculated: ${analytics.totalOrders} orders, $${analytics.totalRevenue}`);
    res.json(analytics);
    
  } catch (error) {
    console.error('❌ Analytics error:', error);
    res.status(500).json({
      error: 'Failed to calculate analytics'
    });
  }
});

// GET /api/orders - List all orders (ADMIN ONLY)
router.get('/', verifyToken, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      status,
      search,
      dateFrom,
      dateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    console.log(`📋 Getting orders: page=${page}, limit=${limit}, status=${status}`);
    
    // Build filter
    const filter = {};
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (search) {
      filter.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { 'customerInfo.firstName': { $regex: search, $options: 'i' } },
        { 'customerInfo.lastName': { $regex: search, $options: 'i' } },
        { 'customerInfo.email': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (dateFrom || dateTo) {
      filter.createdAt = {};
      if (dateFrom) filter.createdAt.$gte = new Date(dateFrom);
      if (dateTo) filter.createdAt.$lte = new Date(dateTo);
    }
    
    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    // Execute query
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [orders, totalCount] = await Promise.all([
      Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Order.countDocuments(filter)
    ]);
    
    // Format orders for admin view
    const formattedOrders = orders.map(order => ({
      id: order._id,
      orderNumber: order.orderNumber,
      customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      customerEmail: order.customerInfo.email,
      device: order.items[0]?.device || 'Multiple',
      customText: order.items[0]?.text || '',
      textColor: order.items[0]?.color || '',
      font: order.items[0]?.font || '',
      fontSize: order.items[0]?.fontSize || 24,
      hasLogo: order.items[0]?.logo || false,
      caseType: order.items[0]?.caseType || 'CLASSIC',
      quantity: order.items.reduce((sum, item) => sum + item.quantity, 0),
      total: order.total,
      status: order.status,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.fulfillment?.trackingNumber,
      fulfillmentData: {
        printedAt: order.fulfillment?.printedAt,
        shippedAt: order.fulfillment?.shippedAt,
        deliveredAt: order.fulfillment?.deliveredAt,
        printFile: null
      },
      createdAt: order.createdAt,
      updatedAt: order.updatedAt
    }));
    
    console.log(`✅ Found ${orders.length} orders (total: ${totalCount})`);
    
    res.json({
      orders: formattedOrders,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalOrders: totalCount,
        hasNextPage: skip + parseInt(limit) < totalCount,
        hasPrevPage: parseInt(page) > 1
      }
    });
    
  } catch (error) {
    console.error('❌ Orders list error:', error);
    res.status(500).json({
      error: 'Failed to retrieve orders'
    });
  }
});

// PATCH /api/orders/:id/status - Update order status (ADMIN ONLY)
router.patch('/:id/status', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, trackingNumber } = req.body;
    
    console.log(`🔄 Updating order ${id} status to ${status}`);
    
    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({
        error: 'Order not found'
      });
    }
    
    // Update status using the model method
    await order.updateStatus(status, trackingNumber);
    
    console.log(`✅ Order ${order.orderNumber} status updated to ${status}`);
    
    res.json({
      message: 'Order status updated successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        trackingNumber: order.fulfillment?.trackingNumber,
        updatedAt: order.updatedAt
      }
    });
    
  } catch (error) {
    console.error('❌ Status update error:', error);
    res.status(500).json({
      error: 'Failed to update order status'
    });
  }
});


// GET /api/orders/:orderNumber - Track order by number (PUBLIC)
router.get('/:orderNumber', async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    console.log(`🔍 Looking up order: ${orderNumber}`);
    
    const order = await Order.findOne({ orderNumber }).select(
      'orderNumber status items total shippingAddress fulfillment createdAt customerInfo.firstName customerInfo.lastName'
    );
    
    if (!order) {
      console.log(`❌ Order not found: ${orderNumber}`);
      return res.status(404).json({
        error: 'Order not found'
      });
    }
    
    console.log(`✅ Order found: ${orderNumber}, status: ${order.status}`);
    
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      customerName: `${order.customerInfo.firstName} ${order.customerInfo.lastName}`,
      items: order.items,
      total: order.total,
      shippingAddress: order.shippingAddress,
      trackingNumber: order.fulfillment?.trackingNumber,
      estimatedDelivery: order.fulfillment?.estimatedDelivery,
      createdAt: order.createdAt,
      timeline: {
        ordered: order.createdAt,
        processing: order.status !== 'pending' ? order.updatedAt : null,
        printed: order.fulfillment?.printedAt,
        shipped: order.fulfillment?.shippedAt,
        delivered: order.fulfillment?.deliveredAt
      }
    });
    
  } catch (error) {
    console.error('❌ Order tracking error:', error);
    res.status(500).json({
      error: 'Failed to retrieve order'
    });
  }
});

// Health check for orders API
router.get('/health/check', (req, res) => {
  res.json({
    status: 'OK',
    service: 'Orders API',
    timestamp: new Date().toISOString()
  });
});

// Test route for debugging (remove in production)
if (process.env.NODE_ENV !== 'production') {
  router.post('/test', (req, res) => {
    console.log('🧪 Test order request received:', req.body);
    res.json({
      message: 'Test route working',
      receivedData: req.body,
      timestamp: new Date().toISOString()
    });
  });
}

module.exports = router;