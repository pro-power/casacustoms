// src/components/admin/AdminOrders.jsx
// Orders management table with search and filtering
import React, { useState } from 'react';
import { Search, Download, Eye } from 'lucide-react';
import { useAdmin, ORDER_STATUS } from '../../context/AdminContext';
import OrderDetailsModal from './OrderDetailsModal';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useAdmin();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Filter orders based on search and status
  const filteredOrders = orders.filter(order => {
    const matchesSearch = !searchTerm || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

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
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  const handleStatusUpdate = (orderId, newStatus) => {
    let trackingNumber = null;
    if (newStatus === ORDER_STATUS.SHIPPED) {
      trackingNumber = `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    updateOrderStatus(orderId, newStatus, trackingNumber);
  };

  const exportOrders = () => {
    const csvContent = [
      ['Order ID', 'Customer', 'Device', 'Text', 'Status', 'Total', 'Date'].join(','),
      ...filteredOrders.map(order => [
        order.orderNumber,
        order.customerName,
        order.device,
        order.customText,
        order.status,
        order.total,
        new Date(order.createdAt).toLocaleDateString()
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `love-island-orders-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search orders by ID, customer name, or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-pink-500 focus:border-transparent"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg min-w-[150px]"
        >
          <option value="all">All Status</option>
          {Object.values(ORDER_STATUS).map(status => (
            <option key={status} value={status}>{status.toUpperCase()}</option>
          ))}
        </select>
        <button 
          onClick={exportOrders}
          className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
        >
          <Download className="w-5 h-5" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Results Summary */}
      <div className="text-gray-400 text-sm">
        Showing {filteredOrders.length} of {orders.length} orders
      </div>

      {/* Orders Table */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Order</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Customer</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Product Details</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Total</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Date</th>
                <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredOrders.map(order => (
                <tr key={order.id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{order.orderNumber}</p>
                      <p className="text-gray-400 text-sm">{order.id}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{order.customerName}</p>
                      <p className="text-gray-400 text-sm">{order.customerEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">{order.device}</p>
                      <p className="text-gray-400 text-sm">"{order.customText}"</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{order.textColor}</span>
                        <span className="text-xs bg-gray-700 px-2 py-1 rounded">{order.font}</span>
                        {order.hasLogo && <span className="text-xs bg-pink-500/20 text-pink-400 px-2 py-1 rounded">Logo</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-white font-medium">${order.total}</p>
                      <p className="text-gray-400 text-sm">Qty: {order.quantity}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-gray-300">{new Date(order.createdAt).toLocaleDateString()}</p>
                      <p className="text-gray-400 text-sm">{new Date(order.createdAt).toLocaleTimeString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-blue-400 hover:text-blue-300 p-1 rounded hover:bg-blue-500/20 transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <select
                        value={order.status}
                        onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                        className="bg-gray-700 border border-gray-600 text-white text-xs px-2 py-1 rounded min-w-[100px]"
                      >
                        {Object.values(ORDER_STATUS).map(status => (
                          <option key={status} value={status}>{status.toUpperCase()}</option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No orders found matching your criteria.</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal 
          order={selectedOrder} 
          onClose={() => setSelectedOrder(null)}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
};

export default AdminOrders;