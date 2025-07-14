// src/components/AdminLogin.jsx - FIXED VERSION
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Eye, EyeOff, Loader2, AlertCircle, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const AdminLogin = ({ redirectTo = '/admin' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // FIX: Properly destructure all needed values including 'user'
  const { 
    login, 
    isAuthenticated, 
    isAdmin, 
    isLoading, 
    user 
  } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [setupRequired, setSetupRequired] = useState(false);
  
  // Check if admin setup is required
  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/status`);
        const data = await response.json();
        setSetupRequired(data.setupRequired);
      } catch (error) {
        console.error('Failed to check admin status:', error);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Redirect if already authenticated as admin
  useEffect(() => {
    console.log('AdminLogin redirect check:', { 
      isAuthenticated, 
      isAdmin, 
      userRole: user?.role 
    });
    
    if (isAuthenticated && isAdmin) {
      const redirect = location.state?.from?.pathname || redirectTo;
      console.log('Redirecting admin to:', redirect);
      navigate(redirect, { replace: true });
    }
  }, [isAuthenticated, isAdmin, user, navigate, location.state, redirectTo]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (error) {
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      
      if (result.success) {
        console.log('Login successful, user:', result.user);
        // Redirect will happen via useEffect
      } else {
        setError(result.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-4" />
          <p className="text-gray-300">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-gradient-to-r from-pink-500 to-orange-500 p-3 rounded-full">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            Admin Portal
          </h2>
          <p className="text-gray-400">
            Casa Customz Management Dashboard
          </p>
        </div>

        {/* Login Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          {/* Error Message */}
          {error && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors"
              placeholder="admin@example.com"
              disabled={isSubmitting}
            />
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-colors pr-10"
                placeholder="••••••••"
                disabled={isSubmitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                disabled={isSubmitting}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !formData.email || !formData.password}
            className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 px-4 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign in to Dashboard</span>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
            <Heart className="w-4 h-4 text-pink-500 fill-pink-500" />
            <span>Casa Customz Admin Portal</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;