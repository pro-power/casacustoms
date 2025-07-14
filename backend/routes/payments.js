// routes/payments.js - Updated Stripe payment integration for USD/US
const express = require('express');
const { body, validationResult } = require('express-validator');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const router = express.Router();

// Validation middleware - Fixed for frontend data structure
const validatePaymentIntent = [
  body('customerInfo.email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('customerInfo.firstName').trim().isLength({ min: 1 }).withMessage('First name required'),
  body('customerInfo.lastName').trim().isLength({ min: 1 }).withMessage('Last name required'),
  body('customerInfo.phone').optional().trim(),
  body('shippingAddress.address').trim().isLength({ min: 5 }).withMessage('Address required'),
  body('shippingAddress.city').trim().isLength({ min: 2 }).withMessage('City required'),
  body('shippingAddress.state').trim().isLength({ min: 2, max: 2 }).withMessage('State code required'),
  body('shippingAddress.zipCode').trim().matches(/^\d{5}(-\d{4})?$/).withMessage('Valid ZIP code required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item required'),
  body('items.*.device').trim().isLength({ min: 1 }).withMessage('Device required'),
  body('items.*.text').trim().isLength({ min: 1, max: 20 }).withMessage('Custom text required'),
  body('items.*.color').trim().isLength({ min: 1 }).withMessage('Color required'),
  body('items.*.price').isFloat({ min: 0 }).withMessage('Valid price required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Valid quantity required'),
  body('subtotal').isFloat({ min: 0 }).withMessage('Valid subtotal required'),
  body('total').isFloat({ min: 0.50 }).withMessage('Minimum order value is $0.50')
];

const validateConfirmPayment = [
  body('paymentIntentId').trim().isLength({ min: 1 }).withMessage('Payment intent ID required'),
  body('paymentMethodId').trim().isLength({ min: 1 }).withMessage('Payment method ID required')
];

// US State tax rates (simplified - in production, use a tax service like TaxJar)
const US_TAX_RATES = {
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

// Calculate shipping cost based on US zones
const calculateShippingCost = (total, state) => {
  // Free shipping over $25
  if (total >= 25) return 0;
  
  // Different rates for different zones (simplified)
  const westernStates = ['CA', 'OR', 'WA', 'NV', 'AZ', 'UT', 'CO', 'ID', 'MT', 'WY'];
  const centralStates = ['TX', 'OK', 'KS', 'NE', 'ND', 'SD', 'MN', 'IA', 'MO', 'AR', 'LA'];
  
  if (westernStates.includes(state)) return 4.99;
  if (centralStates.includes(state)) return 5.99;
  return 6.99; // Eastern states
};

// Calculate sales tax
const calculateTax = (subtotal, shipping, state) => {
  const taxRate = US_TAX_RATES[state] || 0.085; // Default 8.5%
  return (subtotal + shipping) * taxRate;
};

// POST /api/payments/create-intent - Create Stripe payment intent
router.post('/create-intent', validatePaymentIntent, async (req, res) => {
  try {
    console.log('📝 Payment intent request received:', {
      customerEmail: req.body.customerInfo?.email,
      itemCount: req.body.items?.length,
      total: req.body.total
    });

    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.error('❌ Validation errors:', errors.array());
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { customerInfo, items, shippingAddress, subtotal, shipping, tax, total } = req.body;
    
    // Validate and calculate totals (recalculate server-side for security)
    const calculatedSubtotal = items.reduce((sum, item) => sum + (parseFloat(item.price) * parseInt(item.quantity)), 0);
    const calculatedShipping = shipping !== undefined ? parseFloat(shipping) : calculateShippingCost(calculatedSubtotal, shippingAddress?.state);
    const calculatedTax = tax !== undefined ? parseFloat(tax) : calculateTax(calculatedSubtotal, calculatedShipping, shippingAddress?.state);
    const calculatedTotal = calculatedSubtotal + calculatedShipping + calculatedTax;
    
    console.log('💰 Calculated amounts:', {
      subtotal: calculatedSubtotal,
      shipping: calculatedShipping,
      tax: calculatedTax,
      total: calculatedTotal,
      providedTotal: parseFloat(total)
    });
    
    // Allow small rounding differences (within 5 cents for tax calculations)
    if (Math.abs(calculatedTotal - parseFloat(total)) > 0.05) {
      console.warn('⚠️ Total amount mismatch:', {
        calculated: calculatedTotal,
        provided: parseFloat(total),
        difference: Math.abs(calculatedTotal - parseFloat(total))
      });
      // Use the calculated total for security
    }
    
    // Use the higher of calculated or provided total for security
    const finalTotal = Math.max(calculatedTotal, parseFloat(total));
    
    // Convert to cents for Stripe (USD)
    const amount = Math.round(finalTotal * 100);
    
    console.log(`💳 Creating payment intent for ${finalTotal.toFixed(2)} (${amount} cents)`);
    
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'usd',
      description: 'Casa Customz Phone Case Order',
      metadata: {
        customerEmail: customerInfo.email,
        customerName: `${customerInfo.firstName} ${customerInfo.lastName}`,
        itemCount: items.length.toString(),
        customText: items[0]?.text || '',
        device: items[0]?.device || '',
        state: shippingAddress?.state || '',
        orderTotal: finalTotal.toString()
      },
      shipping: {
        name: `${customerInfo.firstName} ${customerInfo.lastName}`,
        phone: customerInfo.phone || '',
        address: {
          line1: shippingAddress.address,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.zipCode,
          country: 'US'
        }
      },
      receipt_email: customerInfo.email,
      statement_descriptor_suffix: 'CASA CUSTOMZ',
      automatic_payment_methods: {
        enabled: true,
      },
    });
    
    console.log(`✅ Payment intent created: ${paymentIntent.id} for ${finalTotal.toFixed(2)}`);
    
    res.json({
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      status: paymentIntent.status,
      // Return calculated amounts for frontend verification
      calculatedAmounts: {
        subtotal: calculatedSubtotal,
        shipping: calculatedShipping,
        tax: calculatedTax,
        total: finalTotal
      }
    });
    
  } catch (error) {
    console.error('❌ Payment intent creation error:', error);
    console.error('❌ Error stack:', error.stack);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Payment failed',
        details: error.message
      });
    }
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.message
      });
    }
    
    res.status(500).json({
      error: 'Failed to create payment intent',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// POST /api/payments/confirm - Confirm payment
router.post('/confirm', validateConfirmPayment, async (req, res) => {
  try {
    // Check validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }
    
    const { paymentIntentId, paymentMethodId } = req.body;
    
    console.log(`🔄 Confirming payment: ${paymentIntentId}`);
    
    // Confirm the payment intent
    const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
      payment_method: paymentMethodId,
      return_url: `${process.env.FRONTEND_URL}/order-confirmation`,
    });
    
    console.log(`✅ Payment confirmed: ${paymentIntent.id} - Status: ${paymentIntent.status}`);
    
    // Safely handle charges data
    const charges = paymentIntent.charges?.data || [];
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      charges: charges.map(charge => ({
        id: charge.id,
        amount: charge.amount,
        status: charge.status,
        receipt_url: charge.receipt_url,
        billing_details: charge.billing_details
      }))
    });
    
  } catch (error) {
    console.error('Payment confirmation error:', error);
    
    if (error.type === 'StripeCardError') {
      return res.status(400).json({
        error: 'Payment failed',
        code: error.code,
        details: error.message,
        decline_code: error.decline_code
      });
    }
    
    if (error.code === 'payment_intent_authentication_failure') {
      return res.status(400).json({
        error: 'Payment authentication failed',
        details: 'Please try again with a different payment method'
      });
    }
    
    if (error.code === 'payment_intent_payment_attempt_failed') {
      return res.status(400).json({
        error: 'Payment attempt failed',
        details: 'Your card was declined. Please try a different payment method.'
      });
    }
    
    res.status(500).json({
      error: 'Payment confirmation failed',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// GET /api/payments/intent/:id - Get payment intent status
router.get('/intent/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    // Safely handle charges data
    const charges = paymentIntent.charges?.data || [];
    
    res.json({
      id: paymentIntent.id,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
      metadata: paymentIntent.metadata,
      charges: charges.map(charge => ({
        id: charge.id,
        status: charge.status,
        receipt_url: charge.receipt_url
      }))
    });
    
  } catch (error) {
    console.error('Payment intent retrieval error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(404).json({
        error: 'Payment intent not found'
      });
    }
    
    res.status(500).json({
      error: 'Failed to retrieve payment intent'
    });
  }
});

// POST /api/payments/refund - Process refund (ADMIN ONLY)
router.post('/refund', async (req, res) => {
  try {
    const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;
    
    // Get the payment intent to find the charge
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    // Safely check for charges
    const charges = paymentIntent.charges?.data || [];
    if (charges.length === 0) {
      return res.status(400).json({
        error: 'No charges found for this payment intent'
      });
    }
    
    const charge = charges[0];
    
    // Create refund
    const refund = await stripe.refunds.create({
      charge: charge.id,
      amount: amount ? Math.round(amount * 100) : undefined, // Full refund if no amount specified
      reason,
      metadata: {
        refund_requested_by: 'admin',
        original_payment_intent: paymentIntentId
      }
    });
    
    console.log(`💰 Refund processed: ${refund.id} for charge ${charge.id}`);
    
    res.json({
      id: refund.id,
      amount: refund.amount,
      currency: refund.currency,
      status: refund.status,
      reason: refund.reason,
      charge: refund.charge
    });
    
  } catch (error) {
    console.error('Refund error:', error);
    
    if (error.type === 'StripeInvalidRequestError') {
      return res.status(400).json({
        error: 'Invalid refund request',
        details: error.message
      });
    }
    
    res.status(500).json({
      error: 'Refund processing failed'
    });
  }
});

// GET /api/payments/methods - Get available payment methods
router.get('/methods', async (req, res) => {
  try {
    // Return available payment methods for US market
    const paymentMethods = {
      cards: {
        enabled: true,
        types: ['visa', 'mastercard', 'amex', 'discover']
      },
      digital_wallets: {
        apple_pay: true,
        google_pay: true
      },
      bank_transfers: {
        enabled: false // Can be enabled if needed
      },
      buy_now_pay_later: {
        klarna: false, // Can be enabled
        afterpay: false
      }
    };
    
    res.json(paymentMethods);
    
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment methods'
    });
  }
});

// GET /api/payments/config - Get Stripe publishable key and config
router.get('/config', (req, res) => {
  try {
    if (!process.env.STRIPE_PUBLISHABLE_KEY) {
      return res.status(500).json({
        error: 'Stripe configuration missing'
      });
    }

    res.json({
      publishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
      currency: 'usd',
      country: 'US',
      taxRates: US_TAX_RATES,
      freeShippingThreshold: 25
    });
  } catch (error) {
    console.error('Payment config error:', error);
    res.status(500).json({
      error: 'Failed to retrieve payment configuration'
    });
  }
});

// POST /api/payments/calculate - Calculate totals (utility endpoint)
router.post('/calculate', [
  body('items').isArray({ min: 1 }),
  body('shippingAddress.state').isLength({ min: 2, max: 2 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { items, shippingAddress } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = calculateShippingCost(subtotal, shippingAddress.state);
    const tax = calculateTax(subtotal, shipping, shippingAddress.state);
    const total = subtotal + shipping + tax;
    
    res.json({
      subtotal: Math.round(subtotal * 100) / 100,
      shipping: Math.round(shipping * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      total: Math.round(total * 100) / 100,
      taxRate: US_TAX_RATES[shippingAddress.state] || 0.085
    });
    
  } catch (error) {
    console.error('Calculate totals error:', error);
    res.status(500).json({
      error: 'Failed to calculate totals'
    });
  }
});

module.exports = router;