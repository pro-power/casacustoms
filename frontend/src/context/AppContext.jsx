// src/context/AppContext.jsx
// Fixed app context with working payment processing
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderAPI, paymentAPI, productAPI, handleApiError } from '../services/api';
import { useAuth } from './AuthContext';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// Cart item interface
const createCartItem = (item) => ({
  id: Date.now() + Math.random(),
  device: item.device,
  caseType: item.caseType || 'CLASSIC',
  text: item.text,
  color: item.color,
  font: item.font || 'Pecita',
  fontSize: item.fontSize || 24,
  logo: item.logo || false,
  price: item.price || 5.95,
  quantity: item.quantity || 1,
  addedAt: new Date().toISOString(),
  ...item
});

export const AppProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  
  // State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Product data
  const [availableDevices, setAvailableDevices] = useState([]);
  const [availableColors, setAvailableColors] = useState([]);
  const [availableFonts, setAvailableFonts] = useState([]);
  
  // Order state
  const [lastOrder, setLastOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);

  // Load cart from localStorage on app start
  useEffect(() => {
    const loadCart = () => {
      try {
        const savedCart = localStorage.getItem('casa_customz_cart');
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart);
          // Validate cart items
          const validItems = parsedCart.filter(item => 
            item.device && item.text && item.color && item.price
          );
          setCartItems(validItems);
        }
      } catch (error) {
        console.error('Failed to load cart from localStorage:', error);
        localStorage.removeItem('casa_customz_cart');
      }
    };

    loadCart();
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('casa_customz_cart', JSON.stringify(cartItems));
    } catch (error) {
      console.error('Failed to save cart to localStorage:', error);
    }
  }, [cartItems]);

  // Clear error and notification after timeout
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load product data on app start
  useEffect(() => {
    const loadProductData = async () => {
      try {
        const [devices, colors, fonts] = await Promise.all([
          productAPI.getDevices(),
          productAPI.getColors(),
          productAPI.getFonts()
        ]);
        
        setAvailableDevices(devices);
        setAvailableColors(colors);
        setAvailableFonts(fonts);
      } catch (error) {
        console.error('Failed to load product data:', error);
        // Use fallback data if API fails
        setAvailableDevices([
          'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14',
          'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13',
          'Samsung Galaxy S23', 'Samsung Galaxy S22'
        ]);
        setAvailableColors([
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
        setAvailableFonts([
          { name: 'Pecita', family: 'Pecita, sans-serif' },
          { name: 'Inter', family: 'Inter, sans-serif' },
          { name: 'Poppins', family: 'Poppins, sans-serif' }
        ]);
      }
    };

    loadProductData();
  }, []);

  // Load customer order history when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadOrderHistory();
    } else {
      setOrderHistory([]);
    }
  }, [isAuthenticated]);

  const loadOrderHistory = async () => {
    try {
      const orders = await orderAPI.getCustomerOrders();
      setOrderHistory(orders);
    } catch (error) {
      console.error('Failed to load order history:', error);
    }
  };

  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

  const addToCart = useCallback((item) => {
    try {
      setCartItems(prev => {
        const existingItem = prev.find(cartItem => 
          cartItem.device === item.device &&
          cartItem.caseType === item.caseType &&
          cartItem.text === item.text &&
          cartItem.color === item.color &&
          cartItem.font === item.font &&
          cartItem.fontSize === item.fontSize &&
          cartItem.logo === item.logo
        );

        if (existingItem) {
          showNotification('Quantity updated in cart!');
          return prev.map(cartItem =>
            cartItem === existingItem
              ? { ...cartItem, quantity: cartItem.quantity + 1 }
              : cartItem
          );
        }

        showNotification('Added to cart!');
        return [...prev, createCartItem(item)];
      });
    } catch (error) {
      console.error('Failed to add item to cart:', error);
      setError('Failed to add item to cart');
    }
  }, [showNotification]);

  const removeFromCart = useCallback((itemId) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
    showNotification('Item removed from cart', 'info');
  }, [showNotification]);

  const updateQuantity = useCallback((itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCartItems(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setCartItems([]);
    localStorage.removeItem('casa_customz_cart');
    showNotification('Cart cleared', 'info');
  }, [showNotification]);

  // Cart calculations with US currency
  const getCartTotal = useCallback(() => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [cartItems]);

  const getCartItemCount = useCallback(() => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  }, [cartItems]);

  const getShippingCost = useCallback(() => {
    const total = getCartTotal();
    return total >= 2 ? 0 : 4.99; // Free shipping over $25
  }, [getCartTotal]);

  const getTaxAmount = useCallback(() => {
    // US sales tax (varies by state, using average of ~8.5%)
    return (getCartTotal() + getShippingCost()) * 0.085;
  }, [getCartTotal, getShippingCost]);

  const getFinalTotal = useCallback(() => {
    return getCartTotal() + getShippingCost() + getTaxAmount();
  }, [getCartTotal, getShippingCost, getTaxAmount]);

  // Validate cart items
  const validateCart = useCallback(() => {
    const errors = [];
    
    if (cartItems.length === 0) {
      errors.push('Cart is empty');
    }

    cartItems.forEach((item, index) => {
      if (!item.text || item.text.trim().length === 0) {
        errors.push(`Item ${index + 1}: Custom text is required`);
      }
      if (item.text && item.text.length > 20) {
        errors.push(`Item ${index + 1}: Text exceeds 20 character limit`);
      }
      if (!item.device) {
        errors.push(`Item ${index + 1}: Device selection is required`);
      }
      if (!item.color) {
        errors.push(`Item ${index + 1}: Color selection is required`);
      }
      if (item.price <= 0) {
        errors.push(`Item ${index + 1}: Invalid price`);
      }
    });

    return errors;
  }, [cartItems]);

  // Validate custom text
  const validateCustomText = async (text) => {
    try {
      const result = await productAPI.validateText(text);
      return result;
    } catch (error) {
      console.error('Text validation failed:', error);
      // Fallback validation
      return {
        valid: text.length > 0 && text.length <= 20,
        message: text.length > 20 ? 'Text too long' : 'Text is valid'
      };
    }
  };

  // FIXED: Process order with payment - now operational
  const processOrder = async (orderData, paymentData) => {
    setIsLoading(true);
    setError(null);
  
    try {
      console.log('🛒 Processing order with cart items:', cartItems);
      console.log('💳 Payment data:', paymentData);
      console.log('📦 Order data:', orderData);
      
      // Validate cart before processing
      const cartErrors = validateCart();
      if (cartErrors.length > 0) {
        throw new Error(cartErrors.join(', '));
      }
  
      // Step 1: Create payment intent with correct structure
      console.log('📝 Creating payment intent...');
      const paymentIntentData = {
        customerInfo: orderData.customerInfo,
        shippingAddress: orderData.shippingAddress,
        items: cartItems,
        total: getFinalTotal(),
        subtotal: getCartTotal(),
        shipping: getShippingCost(),
        tax: getTaxAmount()
      };
  
      console.log('💰 Payment intent data:', paymentIntentData);
  
      // Check if API is reachable
      try {
        const healthCheck = await fetch(`${import.meta.env.VITE_API_URL}/health`);
        console.log('🏥 Health check status:', healthCheck.status);
      } catch (healthError) {
        console.error('❌ API not reachable:', healthError);
        throw new Error('Cannot connect to server. Please check if the backend is running.');
      }
  
      const paymentIntent = await paymentAPI.createPaymentIntent(paymentIntentData);
      console.log('✅ Payment intent created:', paymentIntent);
  
      // Step 2: Confirm payment with Stripe
      console.log('💰 Confirming payment...');
      const paymentResult = await paymentAPI.confirmPayment(
        paymentIntent.id,
        paymentData.paymentMethodId
      );
      console.log('💳 Payment result:', paymentResult);
  
      if (paymentResult.status === 'succeeded') {
        // Step 3: Create order in database with payment confirmed
        console.log('📦 Creating order in database...');
        const finalOrderData = {
          ...orderData,
          items: cartItems,
          subtotal: getCartTotal(),
          shipping: getShippingCost(),
          tax: getTaxAmount(),
          total: getFinalTotal(),
          paymentInfo: {
            paymentIntentId: paymentIntent.id,
            paymentMethod: 'card',
            paymentStatus: 'succeeded'
          }
        };
  
        console.log('📝 Final order data being sent:', finalOrderData);
  
        const order = await orderAPI.createOrder(finalOrderData);
        console.log('✅ Order created successfully:', order);
  
        // Update state
        setLastOrder(order);
        
        // Clear cart after successful order
        clearCart();
        
        // Reload order history
        if (isAuthenticated) {
          await loadOrderHistory();
        }
  
        showNotification('Order placed successfully!');
  
        return {
          success: true,
          order: order,
          paymentIntent: paymentResult
        };
      } else if (paymentResult.status === 'requires_action') {
        // Handle 3D Secure or other authentication
        throw new Error('Payment requires additional authentication. Please try again.');
      } else {
        throw new Error(`Payment failed with status: ${paymentResult.status}`);
      }
    } catch (error) {
      console.error('❌ Order processing failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      
      let errorMessage = 'Order processing failed. Please try again.';
      let errorCode = error.code || 'ORDER_FAILED';
      
      // Check if we have a specific API error response
      if (error.response?.data) {
        const { details, error: errorType, decline_code, message } = error.response.data;
        
        // Priority 1: Use specific details from payment processing
        if (details) {
          errorMessage = details; // "Your card was declined.", "Insufficient funds", etc.
        }
        // Priority 2: Handle specific payment error types
        else if (errorType === 'card_declined') {
          switch (decline_code) {
            case 'insufficient_funds':
              errorMessage = 'Insufficient funds. Please try a different card.';
              break;
            case 'expired_card':
              errorMessage = 'Your card has expired. Please use a different card.';
              break;
            case 'incorrect_cvc':
              errorMessage = 'Incorrect security code. Please check your CVC and try again.';
              break;
            case 'processing_error':
              errorMessage = 'Payment processing error. Please try again.';
              break;
            case 'your card was declined':
            default:
              errorMessage = 'Your card was declined. Please try a different payment method.';
              break;
          }
          errorCode = 'CARD_DECLINED';
        }
        else if (errorType === 'authentication_required') {
          errorMessage = 'Additional authentication required. Please complete the verification and try again.';
          errorCode = 'AUTH_REQUIRED';
        }
        else if (errorType === 'payment_failed') {
          errorMessage = 'Payment failed. Please check your card details and try again.';
          errorCode = 'PAYMENT_FAILED';
        }
        // Priority 3: Use API message if available
        else if (message) {
          errorMessage = message;
        }
        // Priority 4: Use error type as fallback
        else if (errorType) {
          errorMessage = errorType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        }
      }
      // Handle network and connection errors
      else if (error.message?.includes('network') || error.message?.includes('fetch') || error.code === 'NETWORK_ERROR') {
        errorMessage = 'Network error. Please check your connection and try again.';
        errorCode = 'NETWORK_ERROR';
      }
      // Handle timeout errors
      else if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        errorMessage = 'Request timed out. Please try again.';
        errorCode = 'TIMEOUT';
      }
      // Handle specific HTTP status codes
      else if (error.response?.status) {
        switch (error.response.status) {
          case 400:
            errorMessage = error.response.data?.message || 'Invalid order data. Please check your information.';
            errorCode = 'BAD_REQUEST';
            break;
          case 401:
            errorMessage = 'Authentication required. Please refresh the page and try again.';
            errorCode = 'UNAUTHORIZED';
            break;
          case 402:
            errorMessage = 'Payment required. Please check your payment details.';
            errorCode = 'PAYMENT_REQUIRED';
            break;
          case 403:
            errorMessage = 'Access denied. Please contact support if this persists.';
            errorCode = 'FORBIDDEN';
            break;
          case 404:
            errorMessage = 'Service temporarily unavailable. Please try again.';
            errorCode = 'NOT_FOUND';
            break;
          case 409:
            errorMessage = 'Order conflict detected. Please try again.';
            errorCode = 'CONFLICT';
            break;
          case 422:
            errorMessage = error.response.data?.message || 'Invalid order information. Please check your details.';
            errorCode = 'VALIDATION_ERROR';
            break;
          case 429:
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            errorCode = 'RATE_LIMITED';
            break;
          case 500:
            errorMessage = 'Server error. Please try again or contact support if this persists.';
            errorCode = 'SERVER_ERROR';
            break;
          case 502:
          case 503:
          case 504:
            errorMessage = 'Service temporarily unavailable. Please try again in a few moments.';
            errorCode = 'SERVICE_UNAVAILABLE';
            break;
          default:
            errorMessage = `Unexpected error (${error.response.status}). Please try again or contact support.`;
            errorCode = 'UNKNOWN_HTTP_ERROR';
        }
      }
      // Fallback for any other error types
      else if (error.message) {
        // Check for common error patterns in the message
        if (error.message.includes('payment')) {
          errorMessage = 'Payment processing failed. Please check your payment details and try again.';
          errorCode = 'PAYMENT_ERROR';
        } else if (error.message.includes('validation')) {
          errorMessage = 'Invalid information provided. Please check your details and try again.';
          errorCode = 'VALIDATION_ERROR';
        } else {
          errorMessage = 'An unexpected error occurred. Please try again.';
          errorCode = 'UNKNOWN_ERROR';
        }
      }
      
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        code: errorCode
      };
     } finally {
      setIsLoading(false);
     }
    };

  // Track order
  const trackOrder = async (orderNumber) => {
    try {
      setIsLoading(true);
      const order = await orderAPI.getOrder(orderNumber);
      return order;
    } catch (error) {
      const apiError = handleApiError(error);
      setError(apiError.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Apply discount code
  const applyDiscountCode = async (code) => {
    try {
      // This would call a discount API endpoint
      // const discount = await orderAPI.validateDiscount(code);
      // For now, simulate discount validation
      const validCodes = {
        'SAVE10': { type: 'percentage', value: 10 },
        'WELCOME5': { type: 'fixed', value: 5 },
        'FREESHIP': { type: 'shipping', value: 0 }
      };

      if (validCodes[code.toUpperCase()]) {
        showNotification(`Discount code "${code}" applied!`);
        return validCodes[code.toUpperCase()];
      } else {
        throw new Error('Invalid discount code');
      }
    } catch (error) {
      setError(error.message);
      return null;
    }
  };

  return (
    <AppContext.Provider value={{
      // State
      cartItems,
      isCartOpen,
      setIsCartOpen,
      isLoading,
      error,
      setError,
      notification,
      lastOrder,
      orderHistory,
      
      // Product data
      availableDevices,
      availableColors,
      availableFonts,
      
      // Cart actions
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      
      // Cart calculations
      getCartTotal,
      getCartItemCount,
      getShippingCost,
      getTaxAmount,
      getFinalTotal,
      validateCart,
      
      // Text validation
      validateCustomText,
      
      // Order processing
      processOrder,
      trackOrder,
      loadOrderHistory,
      
      // Discounts
      applyDiscountCode,
      
      // Utilities
      showNotification
    }}>
      {children}
    </AppContext.Provider>
  );
};