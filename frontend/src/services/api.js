// src/services/api.js - Fixed payment API calls
import axios from 'axios';

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
const TIMEOUT = 10000; // 10 seconds

// Create axios instance
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      // Clear invalid token
      localStorage.removeItem('auth_token');
      
      // Redirect to login or refresh token logic here
      window.location.href = '/admin/login';
      
      return Promise.reject(error);
    }

    // Handle network errors
    if (error.code === 'NETWORK_ERROR' || !error.response) {
      console.error('Network error:', error);
      return Promise.reject({
        message: 'Network error. Please check your connection and try again.',
        code: 'NETWORK_ERROR'
      });
    }

    return Promise.reject(error);
  }
);

// Error handler utility
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return {
          message: data.message || 'Invalid request. Please check your input.',
          code: 'BAD_REQUEST'
        };
      case 401:
        return {
          message: 'Authentication required. Please log in.',
          code: 'UNAUTHORIZED'
        };
      case 403:
        return {
          message: 'Access denied. You do not have permission.',
          code: 'FORBIDDEN'
        };
      case 404:
        return {
          message: 'Resource not found.',
          code: 'NOT_FOUND'
        };
      case 409:
        return {
          message: data.message || 'Conflict. Resource already exists.',
          code: 'CONFLICT'
        };
      case 422:
        return {
          message: data.message || 'Validation error.',
          code: 'VALIDATION_ERROR',
          errors: data.errors
        };
      case 429:
        return {
          message: 'Too many requests. Please try again later.',
          code: 'RATE_LIMIT'
        };
      case 500:
        return {
          message: 'Server error. Please try again later.',
          code: 'SERVER_ERROR'
        };
      default:
        return {
          message: data.message || 'An unexpected error occurred.',
          code: 'UNKNOWN_ERROR'
        };
    }
  } else if (error.code === 'NETWORK_ERROR') {
    return {
      message: 'Network error. Please check your connection.',
      code: 'NETWORK_ERROR'
    };
  } else {
    return {
      message: error.message || 'An unexpected error occurred.',
      code: 'UNKNOWN_ERROR'
    };
  }
};

// ============================================================================
// PAYMENT API - FIXED VERSION
// ============================================================================
export const paymentAPI = {
  // Create payment intent - FIXED data structure
  createPaymentIntent: async (orderData) => {
    try {
      console.log('🔧 Sending payment intent request with data:', orderData);
      
      // Transform the data to match backend expectations
      const paymentData = {
        customerInfo: {
          email: orderData.customerInfo.email,
          firstName: orderData.customerInfo.firstName,
          lastName: orderData.customerInfo.lastName,
          phone: orderData.customerInfo.phone || ''
        },
        shippingAddress: {
          address: orderData.shippingAddress.address,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          zipCode: orderData.shippingAddress.zipCode,
          country: orderData.shippingAddress.country || 'United States'
        },
        items: orderData.items.map(item => ({
          device: item.device,
          caseType: item.caseType || 'CLASSIC',
          text: item.text,
          color: item.color,
          font: item.font || 'Pecita',
          fontSize: item.fontSize || 24,
          logo: item.logo || false,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        })),
        subtotal: parseFloat(orderData.subtotal),
        shipping: parseFloat(orderData.shipping || 0),
        tax: parseFloat(orderData.tax || 0),
        total: parseFloat(orderData.total)
      };

      console.log('🚀 Transformed payment data:', paymentData);
      
      const response = await apiClient.post('/payments/create-intent', paymentData);
      console.log('✅ Payment intent response:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('❌ Payment intent creation error:', error);
      console.error('❌ Error response:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Confirm payment
  confirmPayment: async (paymentIntentId, paymentMethodId) => {
    try {
      console.log('🔄 Confirming payment:', { paymentIntentId, paymentMethodId });
      
      const response = await apiClient.post('/payments/confirm', {
        paymentIntentId,
        paymentMethodId
      });
      
      console.log('✅ Payment confirmation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Payment confirmation error:', error);
      console.error('❌ Error response:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get payment methods
  getPaymentMethods: async () => {
    try {
      const response = await apiClient.get('/payments/methods');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get payment config
  getConfig: async () => {
    try {
      const response = await apiClient.get('/payments/config');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Process refund (admin only)
  processRefund: async (paymentIntentId, amount = null) => {
    try {
      const response = await apiClient.post('/payments/refund', {
        paymentIntentId,
        amount
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// ============================================================================
// ORDER API - FIXED VERSION
// ============================================================================
export const orderAPI = {
  // Create new order
  createOrder: async (orderData) => {
    try {
      console.log('📦 Creating order with data:', orderData);
      
      // Transform data to match backend schema
      const transformedOrderData = {
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
        billingAddress: orderData.billingAddress || null,
        items: orderData.items.map(item => ({
          device: item.device,
          caseType: item.caseType || 'CLASSIC',
          text: item.text,
          color: item.color,
          font: item.font || 'Pecita',
          fontSize: item.fontSize || 24,
          logo: item.logo || false,
          price: parseFloat(item.price),
          quantity: parseInt(item.quantity)
        })),
        subtotal: parseFloat(orderData.subtotal),
        shipping: parseFloat(orderData.shipping || 0),
        tax: parseFloat(orderData.tax || 0),
        total: parseFloat(orderData.total),
        paymentInfo: {
          paymentIntentId: orderData.paymentInfo.paymentIntentId,
          paymentMethod: orderData.paymentInfo.paymentMethod || 'card',
          paymentStatus: orderData.paymentInfo.paymentStatus || 'succeeded'
        },
        specialInstructions: orderData.specialInstructions || '',
        marketing: orderData.marketing || false
      };

      console.log('🔄 Transformed order data:', transformedOrderData);
      
      const response = await apiClient.post('/orders', transformedOrderData);
      console.log('✅ Order creation response:', response.data);
      
      return response.data.order;
    } catch (error) {
      console.error('❌ Order creation error:', error);
      console.error('❌ Error response:', error.response?.data);
      throw handleApiError(error);
    }
  },

  // Get orders (admin only)
  getOrders: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          params.append(key, value);
        }
      });
      
      const response = await apiClient.get(`/orders?${params.toString()}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get single order
  getOrder: async (orderId) => {
    try {
      const response = await apiClient.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get customer orders
  getCustomerOrders: async () => {
    try {
      const response = await apiClient.get('/orders/customer');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status, trackingNumber = null) => {
    try {
      const response = await apiClient.patch(`/orders/${orderId}/status`, {
        status,
        trackingNumber
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get analytics (admin only)
  getAnalytics: async (dateRange = '30d') => {
    try {
      const response = await apiClient.get(`/orders/analytics?range=${dateRange}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// ============================================================================
// PRODUCT API
// ============================================================================
export const productAPI = {
  // Get available devices
  getDevices: async () => {
    try {
      const response = await apiClient.get('/products/devices');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get colors
  getColors: async () => {
    try {
      const response = await apiClient.get('/products/colors');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get fonts
  getFonts: async () => {
    try {
      const response = await apiClient.get('/products/fonts');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Validate custom text
  validateText: async (text) => {
    try {
      const response = await apiClient.post('/products/validate-text', { text });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// ============================================================================
// AUTH API
// ============================================================================
export const authAPI = {
  // Login user
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', {
        email,
        password
      });
      
      const { token, user } = response.data;
      
      // Store token
      if (token) {
        localStorage.setItem('auth_token', token);
      }
      
      return { token, user };
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Verify token
  verifyToken: async () => {
    try {
      const response = await apiClient.get('/auth/verify');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Logout
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('auth_token');
    }
  }
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================
export const apiUtils = {
  // Check API health
  healthCheck: async () => {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get API version
  getVersion: async () => {
    try {
      const response = await apiClient.get('/version');
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  }
};

// Default export
export default {
  apiClient,
  handleApiError,
  authAPI,
  orderAPI,
  paymentAPI,
  productAPI,
  apiUtils
};