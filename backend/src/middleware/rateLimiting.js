// Create a new file: backend/middleware/rateLimiting.js

const rateLimit = require('express-rate-limit');

// General API rate limiting
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many requests from this IP',
    message: 'Please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn(`⚠️  Rate limit exceeded for IP: ${req.ip}, Path: ${req.path}`);
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Strict rate limiting for payment endpoints
const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Allow only 5 payment attempts per 10 minutes per IP
  message: {
    error: 'Too many payment attempts',
    message: 'Please wait before trying again.',
    retryAfter: '10 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false, // Count successful requests
  skipFailedRequests: false, // Count failed requests
  handler: (req, res) => {
    console.warn(`🚨 Payment rate limit exceeded for IP: ${req.ip}`);
    console.warn(`🚨 Request details:`, {
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      path: req.path,
      timestamp: new Date().toISOString()
    });
    
    res.status(429).json({
      error: 'Too many payment attempts',
      message: 'For security reasons, please wait before attempting another payment.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      code: 'PAYMENT_RATE_LIMITED'
    });
  },
  keyGenerator: (req) => {
    // Use IP + User Agent for more specific limiting
    return `${req.ip}-${req.get('User-Agent') || 'unknown'}`;
  }
});

// Very strict rate limiting for order creation
const orderCreationLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 3, // Only 3 order creation attempts per 5 minutes
  message: {
    error: 'Too many order attempts',
    message: 'Please wait before creating another order.',
    retryAfter: '5 minutes'
  },
  handler: (req, res) => {
    console.warn(`🚨 Order creation rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many order attempts',
      message: 'For security reasons, please wait before creating another order.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      code: 'ORDER_RATE_LIMITED'
    });
  }
});

// Authentication rate limiting (login attempts)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Allow 5 login attempts per 15 minutes
  skipSuccessfulRequests: true, // Don't count successful logins
  message: {
    error: 'Too many login attempts',
    message: 'Account temporarily locked. Please try again later.',
    retryAfter: '15 minutes'
  },
  handler: (req, res) => {
    console.warn(`🚨 Auth rate limit exceeded for IP: ${req.ip}, Email: ${req.body?.email}`);
    res.status(429).json({
      error: 'Too many login attempts',
      message: 'Account temporarily locked due to multiple failed attempts.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
      code: 'AUTH_RATE_LIMITED'
    });
  }
});

// Webhook rate limiting (protect against webhook spam)
const webhookLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 100, // Allow 100 webhook calls per minute (Stripe can send many)
  message: {
    error: 'Webhook rate limit exceeded',
    message: 'Too many webhook requests'
  },
  handler: (req, res) => {
    console.warn(`🚨 Webhook rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Webhook rate limit exceeded'
    });
  }
});

// Admin panel rate limiting
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Higher limit for admin operations
  message: {
    error: 'Admin rate limit exceeded',
    message: 'Please slow down admin operations.'
  },
  handler: (req, res) => {
    console.warn(`⚠️  Admin rate limit exceeded for IP: ${req.ip}`);
    res.status(429).json({
      error: 'Too many admin requests',
      message: 'Please wait before making more requests.',
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000)
    });
  }
});

// Progressive rate limiting based on user behavior
const createProgressiveLimiter = (baseMax, windowMs = 15 * 60 * 1000) => {
  return rateLimit({
    windowMs,
    max: (req) => {
      // Reduce limit if user has been flagged for suspicious behavior
      const suspiciousPatterns = [
        req.get('User-Agent')?.includes('bot'),
        req.get('User-Agent')?.includes('crawler'),
        !req.get('User-Agent'), // No user agent
        req.ip === '127.0.0.1' && process.env.NODE_ENV === 'production' // Localhost in prod
      ];
      
      const isSuspicious = suspiciousPatterns.some(pattern => pattern);
      return isSuspicious ? Math.floor(baseMax * 0.5) : baseMax;
    },
    message: {
      error: 'Rate limit exceeded',
      message: 'Request limit reached. Please try again later.'
    }
  });
};

// Export all limiters
module.exports = {
  generalLimiter,
  paymentLimiter,
  orderCreationLimiter,
  authLimiter,
  webhookLimiter,
  adminLimiter,
  createProgressiveLimiter
};

// Rate limiting configuration for different environments
const getRateLimitConfig = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  return {
    // More lenient in development
    payment: {
      windowMs: isDevelopment ? 2 * 60 * 1000 : 10 * 60 * 1000,
      max: isDevelopment ? 20 : 5
    },
    order: {
      windowMs: isDevelopment ? 1 * 60 * 1000 : 5 * 60 * 1000,
      max: isDevelopment ? 10 : 3
    },
    auth: {
      windowMs: 15 * 60 * 1000,
      max: isDevelopment ? 20 : 5
    }
  };
};

module.exports.getRateLimitConfig = getRateLimitConfig;