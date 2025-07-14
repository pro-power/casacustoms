// src/components/AdminDashboard.jsx
// Main admin dashboard component with navigation
import React, { useState } from 'react';
import { BarChart3, Package, Truck, Settings } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';
import AdminOverview from './admin/AdminOverview';
import AdminOrders from './admin/AdminOrders';
import AdminFulfillment from './admin/AdminFulfillment';
import { useAuth } from '../context/AuthContext';

const AdminDashboard = () => {
  const { logout, user } = useAuth();
  const { isLoading, selectedDateRange, setSelectedDateRange } = useAdmin();
  const [currentView, setCurrentView] = useState('overview');

  const handleLogout = async () => {
    await logout();
    window.location.href = '/'; // Redirect to home after logout
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-300">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <h1 className="text-2xl font-bold text-love-gradient">CasaCustoms Admin</h1>
              
              <nav className="flex space-x-1">
                <button
                  onClick={() => setCurrentView('overview')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'overview' 
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                      : 'text-gray-300 hover:text-pink-400 hover:bg-gray-700'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Overview</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('orders')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'orders' 
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                      : 'text-gray-300 hover:text-pink-400 hover:bg-gray-700'
                  }`}
                >
                  <Package className="w-4 h-4" />
                  <span>Orders</span>
                </button>
                
                <button
                  onClick={() => setCurrentView('fulfillment')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    currentView === 'fulfillment' 
                      ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30' 
                      : 'text-gray-300 hover:text-pink-400 hover:bg-gray-700'
                  }`}
                >
                  <Truck className="w-4 h-4" />
                  <span>Fulfillment</span>
                </button>
              </nav>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Date Range Selector */}
              <select
                value={selectedDateRange}
                onChange={(e) => setSelectedDateRange(e.target.value)}
                className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>

              {/* Add Admin User Info & Logout */}
              <div className="flex items-center space-x-3">
                <span className="text-gray-400 text-sm">
                  {user?.firstName} {user?.lastName}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-white text-sm bg-gray-700 px-3 py-1 rounded transition-colors"
                >
                  Logout
                </button>
              </div>
              
              {/* Settings Button */}
              <button className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700 transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'overview' && <AdminOverview />}
        {currentView === 'orders' && <AdminOrders />}
        {currentView === 'fulfillment' && <AdminFulfillment />}
      </main>
    </div>
  );
};

export default AdminDashboard;