// src/components/Checkout.jsx - Complete Fixed Version
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Loader2, Check, ArrowLeft, Lock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

// Initialize Stripe with error handling
const getStripePromise = () => {
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
  
  if (!publishableKey) {
    console.error('❌ VITE_STRIPE_PUBLISHABLE_KEY is not set in environment variables');
    return null;
  }
  
  if (!publishableKey.startsWith('pk_')) {
    console.error('❌ Invalid Stripe publishable key format');
    return null;
  }
  
  // console.log('✅ Initializing Stripe with key:', publishableKey.substring(0, 12) + '...');
  return loadStripe(publishableKey);
};

const stripePromise = getStripePromise();

// Enhanced Card Element options for better styling
const CARD_ELEMENT_OPTIONS = {
  style: {
    base: {
      color: '#ffffff',
      fontFamily: 'Inter, system-ui, sans-serif',
      fontSmoothing: 'antialiased',
      fontSize: '16px',
      lineHeight: '24px',
      '::placeholder': {
        color: '#9CA3AF',
      },
    },
    invalid: {
      color: '#EF4444',
      iconColor: '#EF4444',
    },
    complete: {
      color: '#10B981',
      iconColor: '#10B981',
    },
  },
  hidePostalCode: false,
  iconStyle: 'solid',
};

const CheckoutForm = () => {
  const navigate = useNavigate();
  const stripe = useStripe();
  const elements = useElements();
  const { 
    cartItems, 
    getCartTotal, 
    getShippingCost, 
    getTaxAmount, 
    getFinalTotal,
    processOrder, 
    clearCart,
    isLoading,
    error,
    setError,
    validateCart
  } = useApp();
  const { user, isAuthenticated } = useAuth();

  const [currentStep, setCurrentStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);
  const [stripeReady, setStripeReady] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [cardError, setCardError] = useState('');
  
  const [formData, setFormData] = useState({
    // Customer info
    email: user?.email || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    phone: user?.phone || '',
    
    // Shipping address - US defaults
    address: '',
    city: '',
    state: 'CA', // Default to California
    zipCode: '',
    country: 'United States',
    
    // Billing
    sameAsShipping: true,
    billingAddress: '',
    billingCity: '',
    billingState: 'CA',
    billingZipCode: '',
    billingCountry: 'United States',
    
    // Order preferences
    marketing: false,
    specialInstructions: ''
  });

  const [formErrors, setFormErrors] = useState({});

  // US States for dropdown
  const US_STATES = [
    { code: 'AL', name: 'Alabama' }, { code: 'AK', name: 'Alaska' }, { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' }, { code: 'CA', name: 'California' }, { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' }, { code: 'DE', name: 'Delaware' }, { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' }, { code: 'HI', name: 'Hawaii' }, { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' }, { code: 'IN', name: 'Indiana' }, { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' }, { code: 'KY', name: 'Kentucky' }, { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' }, { code: 'MD', name: 'Maryland' }, { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' }, { code: 'MN', name: 'Minnesota' }, { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' }, { code: 'MT', name: 'Montana' }, { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' }, { code: 'NH', name: 'New Hampshire' }, { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' }, { code: 'NY', name: 'New York' }, { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' }, { code: 'OH', name: 'Ohio' }, { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' }, { code: 'PA', name: 'Pennsylvania' }, { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' }, { code: 'SD', name: 'South Dakota' }, { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' }, { code: 'UT', name: 'Utah' }, { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' }, { code: 'WA', name: 'Washington' }, { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' }, { code: 'WY', name: 'Wyoming' }
  ];

  // Check Stripe readiness
  useEffect(() => {
    const checkStripeReadiness = async () => {
      if (stripe && elements) {
        console.log('✅ Stripe and Elements are ready');
        setStripeReady(true);
      } else {
        console.log('⏳ Waiting for Stripe to load...');
        setStripeReady(false);
      }
    };

    checkStripeReadiness();
  }, [stripe, elements]);

  // Handle card element changes
  const handleCardChange = (event) => {
    console.log('Card element change:', event);
    
    if (event.error) {
      setCardError(event.error.message);
      setCardComplete(false);
    } else {
      setCardError('');
      setCardComplete(event.complete);
    }
  };

  // Validate cart on component mount
  useEffect(() => {
    const cartErrors = validateCart();
    if (cartErrors.length > 0) {
      setError(cartErrors.join(', '));
    }
  }, [validateCart, setError]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear field error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // US-specific validation
  const validateStep = (step) => {
    const errors = {};

    if (step === 1) {
      // Customer info validation
      if (!formData.email) errors.email = 'Email is required';
      else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Invalid email format';
      
      if (!formData.firstName) errors.firstName = 'First name is required';
      if (!formData.lastName) errors.lastName = 'Last name is required';
      if (!formData.phone) errors.phone = 'Phone number is required';
      else if (!/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/.test(formData.phone)) {
        errors.phone = 'Invalid US phone number format';
      }
      
      // US Shipping address validation
      if (!formData.address) errors.address = 'Address is required';
      if (!formData.city) errors.city = 'City is required';
      if (!formData.state) errors.state = 'State is required';
      if (!formData.zipCode) errors.zipCode = 'ZIP code is required';
      else if (!/^\d{5}(-\d{4})?$/.test(formData.zipCode)) {
        errors.zipCode = 'Invalid ZIP code format (12345 or 12345-6789)';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(2);
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh and try again.');
      return;
    }

    if (!validateStep(1)) {
      setCurrentStep(1);
      return;
    }

    if (!cardComplete) {
      setCardError('Please enter complete card details');
      return;
    }

    setIsProcessing(true);
    setError('');
    setCardError('');

    try {
      const card = elements.getElement(CardElement);

      // Create payment method
      const { error: stripeError, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: card,
        billing_details: {
          name: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
          address: {
            line1: formData.sameAsShipping ? formData.address : formData.billingAddress,
            city: formData.sameAsShipping ? formData.city : formData.billingCity,
            state: formData.sameAsShipping ? formData.state : formData.billingState,
            postal_code: formData.sameAsShipping ? formData.zipCode : formData.billingZipCode,
            country: 'US',
          },
        },
      });

      if (stripeError) {
        setCardError(stripeError.message);
        setIsProcessing(false);
        return;
      }

      // Process order with updated US structure
      const orderData = {
        customerInfo: {
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        },
        shippingAddress: {
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zipCode: formData.zipCode,
          country: formData.country,
        },
        billingAddress: formData.sameAsShipping ? null : {
          address: formData.billingAddress,
          city: formData.billingCity,
          state: formData.billingState,
          zipCode: formData.billingZipCode,
          country: formData.billingCountry,
        },
        items: cartItems,
        subtotal: getCartTotal(),
        shipping: getShippingCost(),
        tax: getTaxAmount(),
        total: getFinalTotal(),
        specialInstructions: formData.specialInstructions,
        marketing: formData.marketing,
      };

      const result = await processOrder(orderData, {
        paymentMethodId: paymentMethod.id
      });

      if (result.success) {
        setCompletedOrder(result.order);
        setOrderComplete(true);
        
        // Track conversion event for analytics
        if (window.gtag) {
          window.gtag('event', 'purchase', {
            transaction_id: result.order.orderNumber,
            value: getFinalTotal(),
            currency: 'USD',
            items: cartItems.map(item => ({
              item_id: `${item.device}-${item.text}`,
              item_name: item.device,
              category: item.caseType,
              quantity: item.quantity,
              price: item.price
            }))
          });
        }
      } else {
        setError(result.error || 'Payment failed. Please try again.');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Show Stripe loading state
  if (!stripeReady) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-300">Loading secure payment system...</p>
          <p className="text-gray-500 text-sm mt-2">Powered by Stripe</p>
        </div>
      </div>
    );
  }

  if (orderComplete && completedOrder) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Order Complete!</h2>
          <p className="text-gray-400 mb-6">
            Thank you for your purchase! Your custom phone case is being prepared.
          </p>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Order Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Order Number:</span>
                <span className="text-white font-mono">{completedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Total:</span>
                <span className="text-white font-bold">${completedOrder.total?.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{completedOrder.customerEmail}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <p className="text-sm text-gray-400">
              A confirmation email has been sent to {completedOrder.customerEmail}
            </p>
            <button
              onClick={() => {
                navigate('/');
                setOrderComplete(false);
                setCompletedOrder(null);
              }}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-pink-400 hover:text-pink-300 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Shop</span>
          </button>
          <h1 className="text-3xl font-bold text-white">Secure Checkout</h1>
          
          {/* Progress Indicator */}
          <div className="flex items-center space-x-4 mt-6">
            <div className={`flex items-center space-x-2 ${currentStep >= 1 ? 'text-pink-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-pink-500' : 'bg-gray-700'}`}>
                <span className="text-white text-sm font-medium">1</span>
              </div>
              <span className="text-sm font-medium">Shipping</span>
            </div>
            <div className={`h-0.5 w-16 ${currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-700'}`}></div>
            <div className={`flex items-center space-x-2 ${currentStep >= 2 ? 'text-pink-400' : 'text-gray-500'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-pink-500' : 'bg-gray-700'}`}>
                <span className="text-white text-sm font-medium">2</span>
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {(error || cardError) && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-400 text-sm">{error || cardError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {currentStep === 1 && (
                <div className="space-y-6">
                  {/* Customer Information */}
                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className={`input-love ${formErrors.email ? 'border-red-500' : ''}`}
                          placeholder="your@email.com"
                        />
                        {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className={`input-love ${formErrors.phone ? 'border-red-500' : ''}`}
                          placeholder="(555) 123-4567"
                        />
                        {formErrors.phone && <p className="text-red-400 text-sm mt-1">{formErrors.phone}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">First Name *</label>
                        <input
                          type="text"
                          name="firstName"
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className={`input-love ${formErrors.firstName ? 'border-red-500' : ''}`}
                          placeholder="John"
                        />
                        {formErrors.firstName && <p className="text-red-400 text-sm mt-1">{formErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Last Name *</label>
                        <input
                          type="text"
                          name="lastName"
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className={`input-love ${formErrors.lastName ? 'border-red-500' : ''}`}
                          placeholder="Doe"
                        />
                        {formErrors.lastName && <p className="text-red-400 text-sm mt-1">{formErrors.lastName}</p>}
                      </div>
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6">Shipping Address</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                        <input
                          type="text"
                          name="address"
                          value={formData.address}
                          onChange={handleInputChange}
                          className={`input-love ${formErrors.address ? 'border-red-500' : ''}`}
                          placeholder="123 Main Street, Apt 4B"
                        />
                        {formErrors.address && <p className="text-red-400 text-sm mt-1">{formErrors.address}</p>}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                          <input
                            type="text"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            className={`input-love ${formErrors.city ? 'border-red-500' : ''}`}
                            placeholder="Los Angeles"
                          />
                          {formErrors.city && <p className="text-red-400 text-sm mt-1">{formErrors.city}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                          <select
                            name="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            className={`input-love ${formErrors.state ? 'border-red-500' : ''}`}
                          >
                            {US_STATES.map(state => (
                              <option key={state.code} value={state.code}>{state.name}</option>
                            ))}
                          </select>
                          {formErrors.state && <p className="text-red-400 text-sm mt-1">{formErrors.state}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code *</label>
                          <input
                            type="text"
                            name="zipCode"
                            value={formData.zipCode}
                            onChange={handleInputChange}
                            className={`input-love ${formErrors.zipCode ? 'border-red-500' : ''}`}
                            placeholder="90210"
                          />
                          {formErrors.zipCode && <p className="text-red-400 text-sm mt-1">{formErrors.zipCode}</p>}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Special Instructions */}
                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <h2 className="text-xl font-bold text-white mb-6">Order Preferences</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Special Instructions (Optional)</label>
                        <textarea
                          name="specialInstructions"
                          value={formData.specialInstructions}
                          onChange={handleInputChange}
                          rows={3}
                          className="input-love"
                          placeholder="Any special delivery instructions..."
                        />
                      </div>
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="marketing"
                          checked={formData.marketing}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                        />
                        <label className="text-sm text-gray-300">
                          I'd like to receive updates about new collections and special offers
                        </label>
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all"
                  >
                    Continue to Payment
                  </button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  {/* Payment Information */}
                  <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                    <div className="flex items-center space-x-2 mb-6">
                      <Lock className="w-5 h-5 text-green-400" />
                      <h2 className="text-xl font-bold text-white">Secure Payment</h2>
                      <ShieldCheck className="w-5 h-5 text-green-400" />
                    </div>
                    
                    {/* Card Element Container */}
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Card Details *
                      </label>
                      <div className="bg-gray-700 rounded-lg p-4 border border-gray-600 focus-within:border-pink-500 focus-within:ring-2 focus-within:ring-pink-500 focus-within:ring-opacity-20 transition-all">
                        <CardElement 
                          options={CARD_ELEMENT_OPTIONS}
                          onChange={handleCardChange}
                        />
                      </div>
                      {cardError && (
                        <p className="text-red-400 text-sm mt-2 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{cardError}</span>
                        </p>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400 mb-4 flex items-center space-x-2">
                      <ShieldCheck className="w-4 h-4 text-green-400" />
                      <span>Your payment information is encrypted and secure. Powered by Stripe.</span>
                    </div>

                    {/* Billing Address */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          name="sameAsShipping"
                          checked={formData.sameAsShipping}
                          onChange={handleInputChange}
                          className="w-5 h-5 text-pink-500 bg-gray-700 border-gray-600 rounded focus:ring-pink-500"
                        />
                        <label className="text-sm text-gray-300">
                          Billing address same as shipping address
                        </label>
                      </div>

                      {!formData.sameAsShipping && (
                        <div className="space-y-4 pt-4 border-t border-gray-600">
                          <h3 className="text-lg font-semibold text-white">Billing Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-300 mb-2">Street Address *</label>
                              <input
                                type="text"
                                name="billingAddress"
                                value={formData.billingAddress}
                                onChange={handleInputChange}
                                className="input-love"
                                placeholder="123 Billing Street"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">City *</label>
                              <input
                                type="text"
                                name="billingCity"
                                value={formData.billingCity}
                                onChange={handleInputChange}
                                className="input-love"
                                placeholder="Billing City"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">State *</label>
                              <select
                                name="billingState"
                                value={formData.billingState}
                                onChange={handleInputChange}
                                className="input-love"
                              >
                                {US_STATES.map(state => (
                                  <option key={state.code} value={state.code}>{state.name}</option>
                                ))}
                              </select>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">ZIP Code *</label>
                              <input
                                type="text"
                                name="billingZipCode"
                                value={formData.billingZipCode}
                                onChange={handleInputChange}
                                className="input-love"
                                placeholder="12345"
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex-1 bg-gray-700 text-white py-4 rounded-lg font-semibold hover:bg-gray-600 transition-all"
                    >
                      Back to Shipping
                    </button>
                    <button
                      type="submit"
                      disabled={!stripe || isProcessing || !cardComplete}
                      className="flex-2 bg-gradient-to-r from-pink-500 to-orange-500 text-white py-4 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Processing...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          <span>Complete Order - ${getFinalTotal().toFixed(2)}</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 sticky top-8">
              <h2 className="text-xl font-bold text-white mb-6">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-start">
                    <div className="flex-1">
                      {/* <h3 className="text-white font-medium text-sm">{item.device}</h3> */}
                      <p className="text-xs text-gray-400">{item.caseType} Design</p>
                      <p className="text-xs text-pink-400">"{item.text}"</p>
                      <div className="flex items-center space-x-1 mt-1">
                        <span className="text-xs text-gray-400">{item.color}</span>
                        {/* <span className="text-xs text-gray-400">• {item.font}</span> */}
                        {item.logo && <span className="text-xs text-pink-400">• Logo</span>}
                      </div>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <span className="text-white font-medium text-sm">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-700 pt-4 space-y-3">
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Subtotal</span>
                  <span>${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Shipping</span>
                  <span className={getShippingCost() === 0 ? 'text-green-400 font-medium' : ''}>
                    {getShippingCost() === 0 ? 'FREE' : `${getShippingCost().toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-gray-300 text-sm">
                  <span>Sales Tax</span>
                  <span>${getTaxAmount().toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-700 pt-3 flex justify-between text-white font-bold text-lg">
                  <span>Total</span>
                  <span className="text-pink-400">${getFinalTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-gray-700/50 rounded-lg">
                <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                  <Check className="w-4 h-4" />
                  <span>Free shipping on all orders over $25</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400 text-sm mb-2">
                  <Check className="w-4 h-4" />
                  <span>30-day return policy</span>
                </div>
                <div className="flex items-center space-x-2 text-green-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Secure payment with SSL encryption</span>
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="mt-4 flex items-center justify-center space-x-4 text-gray-500 text-xs">
                <div className="flex items-center space-x-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Stripe</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Lock className="w-4 h-4" />
                  <span>SSL Secure</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Checkout Component with Enhanced Error Handling
const Checkout = () => {
  const [stripeError, setStripeError] = useState(null);

  useEffect(() => {
    // Check if Stripe key is available
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY) {
      setStripeError('Stripe configuration is missing. Please contact support.');
    }
  }, []);

  if (stripeError) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Payment System Unavailable</h2>
          <p className="text-gray-400 mb-4">{stripeError}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-300">Initializing secure payment system...</p>
        </div>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default Checkout;