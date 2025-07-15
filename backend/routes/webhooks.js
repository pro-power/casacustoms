// routes/webhooks.js - Stripe webhook handler
const express = require('express');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { Order } = require('../models');

const router = express.Router();

// POST /api/webhooks/stripe - Handle Stripe webhooks
router.post('/stripe', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
        
      case 'charge.dispute.created':
        await handleChargeDispute(event.data.object);
        break;
        
      case 'invoice.payment_succeeded':
        // Handle subscription payments if you add them later
        console.log('Invoice payment succeeded:', event.data.object.id);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
    
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ error: 'Webhook handler failed' });
  }
});

// Handle successful payment
const handlePaymentSucceeded = async (paymentIntent) => {
  try {
    // console.log(`💳 Payment succeeded: ${paymentIntent.id}`);
    
    // Find order by payment intent ID
    const order = await Order.findOne({
      'paymentInfo.paymentIntentId': paymentIntent.id
    });
    
    if (!order) {
      console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update payment status
    order.paymentInfo.paymentStatus = 'succeeded';
    order.status = 'processing'; // Move to processing after successful payment
    order.updatedAt = new Date();
    
    await order.save();
    
    // console.log(`✅ Order ${order.orderNumber} payment confirmed and moved to processing`);
    
    // Here you could send confirmation email, notify fulfillment, etc.
    // await sendOrderConfirmationEmail(order);
    // await notifyFulfillmentCenter(order);
    
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Handle failed payment
const handlePaymentFailed = async (paymentIntent) => {
  try {
    console.log(`❌ Payment failed: ${paymentIntent.id}`);
    
    // Find order by payment intent ID
    const order = await Order.findOne({
      'paymentInfo.paymentIntentId': paymentIntent.id
    });
    
    if (!order) {
      // console.error(`Order not found for payment intent: ${paymentIntent.id}`);
      return;
    }
    
    // Update payment status
    order.paymentInfo.paymentStatus = 'failed';
    order.status = 'cancelled'; // Cancel order on payment failure
    order.updatedAt = new Date();
    
    await order.save();
    
    console.log(`❌ Order ${order.orderNumber} cancelled due to payment failure`);
    
    // Here you could send payment failure email
    // await sendPaymentFailureEmail(order);
    
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Handle charge dispute
const handleChargeDispute = async (dispute) => {
  try {
    // console.log(`⚠️  Charge dispute created: ${dispute.id} for charge ${dispute.charge}`);
    
    // Get the charge to find the payment intent
    const charge = await stripe.charges.retrieve(dispute.charge);
    const paymentIntentId = charge.payment_intent;
    
    // Find order
    const order = await Order.findOne({
      'paymentInfo.paymentIntentId': paymentIntentId
    });
    
    if (!order) {
      console.error(`Order not found for disputed charge: ${dispute.charge}`);
      return;
    }
    
    // Add dispute information to order
    order.paymentInfo.disputeId = dispute.id;
    order.paymentInfo.disputeStatus = dispute.status;
    order.paymentInfo.disputeReason = dispute.reason;
    order.fulfillment.notes = `Dispute created: ${dispute.reason}`;
    order.updatedAt = new Date();
    
    await order.save();
    
    console.log(`⚠️  Order ${order.orderNumber} marked with dispute ${dispute.id}`);
    
    // Here you could notify admin about dispute
    // await notifyAdminOfDispute(order, dispute);
    
  } catch (error) {
    console.error('Error handling charge dispute:', error);
  }
};

// GET /api/webhooks/test - Test webhook endpoint (development only)
if (process.env.NODE_ENV !== 'production') {
  router.get('/test', (req, res) => {
    res.json({
      message: 'Webhook endpoint is working',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  });
  
  // POST /api/webhooks/test-payment - Simulate payment success (development only)
  router.post('/test-payment', async (req, res) => {
    try {
      const { paymentIntentId } = req.body;
      
      if (!paymentIntentId) {
        return res.status(400).json({
          error: 'paymentIntentId required'
        });
      }
      
      // Simulate payment success
      await handlePaymentSucceeded({ id: paymentIntentId });
      
      res.json({
        message: 'Payment success simulated',
        paymentIntentId
      });
      
    } catch (error) {
      console.error('Test payment error:', error);
      res.status(500).json({
        error: 'Failed to simulate payment'
      });
    }
  });
}

module.exports = router;