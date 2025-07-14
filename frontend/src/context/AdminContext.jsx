// src/context/AdminContext.jsx - Fixed with proper API calls
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { orderAPI, handleApiError } from '../services/api';
import { useAuth } from './AuthContext';

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within AdminProvider');
  }
  return context;
};

// Order status constants
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  PRINTED: 'printed',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
};

export const STATUS_LABELS = {
  [ORDER_STATUS.PENDING]: 'Pending Payment',
  [ORDER_STATUS.PROCESSING]: 'In Production',
  [ORDER_STATUS.PRINTED]: 'Ready to Ship',
  [ORDER_STATUS.SHIPPED]: 'Shipped',
  [ORDER_STATUS.DELIVERED]: 'Delivered',
  [ORDER_STATUS.CANCELLED]: 'Cancelled'
};

export const AdminProvider = ({ children }) => {
  const { isAdmin, user } = useAuth();
  
  // State
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  
  // Filters and pagination
  const [selectedDateRange, setSelectedDateRange] = useState('30d');
  const [orderFilters, setOrderFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: null,
    dateTo: null,
    page: 1,
    limit: 50
  });

  // Show notification
  const showNotification = useCallback((message, type = 'success') => {
    setNotification({ message, type });
  }, []);

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

  // Load orders when component mounts or filters change
  useEffect(() => {
    if (isAdmin) {
      console.log('👨‍💼 Admin detected, loading orders...');
      loadOrders();
    }
  }, [isAdmin, orderFilters]);

  // Load analytics when date range changes
  useEffect(() => {
    if (isAdmin) {
      console.log('📊 Admin detected, loading analytics...');
      loadAnalytics();
    }
  }, [isAdmin, selectedDateRange]);

  const loadOrders = async () => {
    if (!isAdmin) {
      console.log('❌ Not admin, skipping order load');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📋 Loading orders with filters:', orderFilters);

      const filters = {
        ...orderFilters,
        status: orderFilters.status === 'all' ? undefined : orderFilters.status
      };

      const response = await orderAPI.getOrders(filters);
      console.log('✅ Orders loaded:', response.orders?.length || 0);
      
      setOrders(response.orders || []);
    } catch (error) {
      console.error('❌ Failed to load orders:', error);
      const apiError = handleApiError(error);
      setError(apiError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalytics = async () => {
    if (!isAdmin) {
      console.log('❌ Not admin, skipping analytics load');
      return;
    }

    try {
      console.log('📊 Loading analytics for range:', selectedDateRange);
      
      const analyticsData = await orderAPI.getAnalytics(selectedDateRange);
      console.log('✅ Analytics loaded:', analyticsData);
      
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('❌ Failed to load analytics:', error);
      const apiError = handleApiError(error);
      console.error('Analytics error details:', apiError);
      // Don't set error state for analytics as it's not critical
      // Set empty analytics instead
      setAnalytics({
        totalRevenue: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        conversionRate: 0.15,
        statusCounts: {},
        chartData: [],
        recentActivity: [],
        topProducts: []
      });
    }
  };

  const updateOrderStatus = async (orderId, newStatus, trackingNumber = null) => {
    if (!isAdmin) return;

    try {
      setError(null);
      
      console.log(`📝 Updating order ${orderId} status to ${newStatus}`);
      
      const updatedOrder = await orderAPI.updateOrderStatus(orderId, newStatus, trackingNumber);
      
      // Update local state
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus, trackingNumber, updatedAt: new Date() } : order
      ));

      // Reload analytics to reflect changes
      loadAnalytics();

      showNotification(`Order status updated to ${STATUS_LABELS[newStatus]}`);

      return { success: true, order: updatedOrder };
    } catch (error) {
      console.error('❌ Failed to update order status:', error);
      const apiError = handleApiError(error);
      setError(apiError.message);
      return { success: false, error: apiError.message };
    }
  };

  const getOrder = async (orderId) => {
    try {
      const order = await orderAPI.getOrder(orderId);
      return { success: true, order };
    } catch (error) {
      const apiError = handleApiError(error);
      return { success: false, error: apiError.message };
    }
  };

  // Helper function to calculate order analytics from current orders
  const getStatusCounts = useCallback(() => {
    if (!orders.length) return {};
    
    return Object.values(ORDER_STATUS).reduce((acc, status) => {
      acc[status] = orders.filter(order => order.status === status).length;
      return acc;
    }, {});
  }, [orders]);

  // Get analytics function that AdminOverview expects
  const getAnalytics = useCallback(() => {
    if (!analytics) {
      // Return default analytics structure if not loaded
      return {
        totalRevenue: 0,
        totalOrders: orders.length,
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + (order.total || 0), 0) / orders.length : 0,
        conversionRate: 0.15, // Default 15%
        statusCounts: getStatusCounts(),
        chartData: [],
        topProducts: [],
        recentActivity: []
      };
    }
    
    return {
      ...analytics,
      statusCounts: getStatusCounts() // Always use current status counts
    };
  }, [analytics, orders, getStatusCounts]);

  // Real-time metrics calculation
  const getRealTimeMetrics = useCallback(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const todayOrders = orders.filter(order => new Date(order.createdAt) >= today);
    const weekOrders = orders.filter(order => new Date(order.createdAt) >= thisWeek);
    const monthOrders = orders.filter(order => new Date(order.createdAt) >= thisMonth);

    return {
      today: {
        orders: todayOrders.length,
        revenue: todayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      },
      week: {
        orders: weekOrders.length,
        revenue: weekOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      },
      month: {
        orders: monthOrders.length,
        revenue: monthOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      }
    };
  }, [orders]);

  // Order helpers
  const getOrdersByStatus = useCallback((status) => {
    return orders.filter(order => order.status === status);
  }, [orders]);

  const getPendingOrders = useCallback(() => {
    return getOrdersByStatus(ORDER_STATUS.PENDING);
  }, [getOrdersByStatus]);

  const getProcessingOrders = useCallback(() => {
    return getOrdersByStatus(ORDER_STATUS.PROCESSING);
  }, [getOrdersByStatus]);

  const getShippedOrders = useCallback(() => {
    return getOrdersByStatus(ORDER_STATUS.SHIPPED);
  }, [getOrdersByStatus]);

  // Filter helpers
  const getFilteredOrders = useCallback(() => {
    return orders.filter(order => {
      // Status filter
      if (orderFilters.status !== 'all' && order.status !== orderFilters.status) {
        return false;
      }

      // Search filter
      if (orderFilters.search) {
        const search = orderFilters.search.toLowerCase();
        return (
          order.orderNumber?.toLowerCase().includes(search) ||
          order.customerName?.toLowerCase().includes(search) ||
          order.customerEmail?.toLowerCase().includes(search) ||
          order.device?.toLowerCase().includes(search) ||
          order.customText?.toLowerCase().includes(search)
        );
      }

      // Date range filter
      if (orderFilters.dateFrom || orderFilters.dateTo) {
        const orderDate = new Date(order.createdAt);
        
        if (orderFilters.dateFrom && orderDate < new Date(orderFilters.dateFrom)) {
          return false;
        }
        
        if (orderFilters.dateTo && orderDate > new Date(orderFilters.dateTo)) {
          return false;
        }
      }

      return true;
    });
  }, [orders, orderFilters]);

  const updateFilters = useCallback((newFilters) => {
    setOrderFilters(prev => ({
      ...prev,
      ...newFilters,
      page: newFilters.page || 1 // Reset page when other filters change
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setOrderFilters({
      status: 'all',
      search: '',
      dateFrom: null,
      dateTo: null,
      page: 1,
      limit: 50
    });
  }, []);

  // Manual refresh functions
  const refreshOrders = useCallback(() => {
    console.log('🔄 Manual refresh: Orders');
    loadOrders();
  }, [loadOrders]);

  const refreshAnalytics = useCallback(() => {
    console.log('🔄 Manual refresh: Analytics');
    loadAnalytics();
  }, [loadAnalytics]);

  return (
    <AdminContext.Provider value={{
      // Data
      orders: getFilteredOrders(),
      allOrders: orders,
      analytics: getAnalytics(),
      
      // Loading states
      isLoading,
      error,
      setError,
      notification,
      
      // Order management
      updateOrderStatus,
      getOrder,
      loadOrders,
      refreshOrders,
      
      // Filters and pagination
      orderFilters,
      updateFilters,
      resetFilters,
      selectedDateRange,
      setSelectedDateRange,
      
      // Analytics and metrics
      loadAnalytics,
      refreshAnalytics,
      getAnalytics,
      getStatusCounts,
      getRealTimeMetrics,
      
      // Order helpers
      getOrdersByStatus,
      getPendingOrders,
      getProcessingOrders,
      getShippedOrders,
      
      // Utilities
      showNotification,
      
      // Constants
      ORDER_STATUS,
      STATUS_LABELS
    }}>
      {children}
    </AdminContext.Provider>
  );
};