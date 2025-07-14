// src/components/admin/AdminOverview.jsx - Updated to handle missing data
import React from 'react';
import { 
  DollarSign, 
  Package, 
  TrendingUp, 
  Users, 
  BarChart3 
} from 'lucide-react';
import { useAdmin, ORDER_STATUS } from '../../context/AdminContext';

const AdminOverview = () => {
  const { getAnalytics } = useAdmin();
  
  // FIXED: Add error handling for getAnalytics
  let analytics;
  try {
    analytics = getAnalytics();
  } catch (error) {
    console.error('Error getting analytics:', error);
    analytics = {
      totalRevenue: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      conversionRate: 0.15,
      statusCounts: {},
      chartData: [],
      recentActivity: []
    };
  }

  // Status badge styling
  const getStatusBadge = (status) => {
    const styles = {
      [ORDER_STATUS.PENDING]: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      [ORDER_STATUS.PROCESSING]: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      [ORDER_STATUS.PRINTED]: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      [ORDER_STATUS.SHIPPED]: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      [ORDER_STATUS.DELIVERED]: 'bg-green-500/20 text-green-400 border-green-500/30',
      [ORDER_STATUS.CANCELLED]: 'bg-red-500/20 text-red-400 border-red-500/30'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-500/20 text-gray-400 border-gray-500/30'}`}>
        {status?.toUpperCase() || 'UNKNOWN'}
      </span>
    );
  };

  return (
    <div className="space-y-8">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Revenue</p>
              <p className="text-2xl font-bold text-white">${(analytics.totalRevenue || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <DollarSign className="w-6 h-6 text-green-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+12.5%</span>
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Orders</p>
              <p className="text-2xl font-bold text-white">{analytics.totalOrders || 0}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-blue-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+8.2%</span>
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg Order Value</p>
              <p className="text-2xl font-bold text-white">${(analytics.averageOrderValue || 0).toFixed(2)}</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+3.1%</span>
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Conversion Rate</p>
              <p className="text-2xl font-bold text-white">{((analytics.conversionRate || 0) * 100).toFixed(1)}%</p>
            </div>
            <div className="bg-pink-500/20 p-3 rounded-lg">
              <Users className="w-6 h-6 text-pink-400" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm">
            <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
            <span className="text-green-400">+5.7%</span>
            <span className="text-gray-400 ml-1">vs last period</span>
          </div>
        </div>
      </div>

      {/* Order Status Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Order Status Breakdown</h3>
          <div className="space-y-4">
            {Object.entries(analytics.statusCounts || {}).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getStatusBadge(status)}
                  <span className="text-gray-300 capitalize">{status}</span>
                </div>
                <span className="text-white font-semibold">{count}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <button className="w-full bg-pink-500/20 border border-pink-500/30 text-pink-400 py-3 rounded-lg hover:bg-pink-500/30 transition-colors">
              Export Order Data
            </button>
            <button className="w-full bg-blue-500/20 border border-blue-500/30 text-blue-400 py-3 rounded-lg hover:bg-blue-500/30 transition-colors">
              Generate Fulfillment Report
            </button>
            <button className="w-full bg-green-500/20 border border-green-500/30 text-green-400 py-3 rounded-lg hover:bg-green-500/30 transition-colors">
              View Analytics Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;