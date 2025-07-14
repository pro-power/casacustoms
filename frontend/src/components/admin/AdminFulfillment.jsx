// src/components/admin/AdminFulfillment.jsx
// Fulfillment center for production and shipping management
import React from 'react';
import { Printer, Truck, Package, Download, Check, Clock } from 'lucide-react';
import { useAdmin, ORDER_STATUS } from '../../context/AdminContext';

const AdminFulfillment = () => {
  const { orders, updateOrderStatus } = useAdmin();

  // Filter orders by fulfillment status
  const readyForProduction = orders.filter(order => order.status === ORDER_STATUS.PROCESSING);
  const readyForShipping = orders.filter(order => order.status === ORDER_STATUS.PRINTED);
  const shipped = orders.filter(order => order.status === ORDER_STATUS.SHIPPED);

  const handleStatusUpdate = (orderId, newStatus) => {
    let trackingNumber = null;
    if (newStatus === ORDER_STATUS.SHIPPED) {
      trackingNumber = `TRK${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    }
    updateOrderStatus(orderId, newStatus, trackingNumber);
  };

  const downloadPrintFile = (orderId) => {
    // In real app, this would download the actual print file
    alert(`Downloading print file for order ${orderId}`);
  };

  const ProductionQueueItem = ({ order }) => (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-white font-medium">{order.orderNumber}</p>
            <p className="text-gray-400 text-sm">{order.customerName}</p>
          </div>
          <div className="text-sm text-gray-400">
            <p className="text-white">{order.device} - "{order.customText}"</p>
            <p>Font: {order.font} ({order.fontSize}px) | Color: {order.textColor}</p>
            {order.hasLogo && <p className="text-pink-400">+ Love Island Logo</p>}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => downloadPrintFile(order.id)}
          className="bg-blue-500/20 text-blue-400 px-3 py-2 rounded text-sm hover:bg-blue-500/30 flex items-center space-x-1"
        >
          <Download className="w-4 h-4" />
          <span>Print File</span>
        </button>
        <button
          onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.PRINTED)}
          className="bg-purple-500/20 text-purple-400 px-3 py-2 rounded text-sm hover:bg-purple-500/30 flex items-center space-x-1"
        >
          <Printer className="w-4 h-4" />
          <span>Mark Printed</span>
        </button>
      </div>
    </div>
  );

  const ShippingQueueItem = ({ order }) => (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-white font-medium">{order.orderNumber}</p>
            <p className="text-gray-400 text-sm">{order.customerName}</p>
          </div>
          <div className="text-sm text-gray-400">
            <p className="text-white">{order.shippingAddress.street}</p>
            <p>{order.shippingAddress.city}, {order.shippingAddress.postcode}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400">Printed:</p>
            <p className="text-white">
              {order.fulfillmentData.printedAt 
                ? new Date(order.fulfillmentData.printedAt).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.SHIPPED)}
          className="bg-orange-500/20 text-orange-400 px-3 py-2 rounded text-sm hover:bg-orange-500/30 flex items-center space-x-1"
        >
          <Truck className="w-4 h-4" />
          <span>Mark Shipped</span>
        </button>
      </div>
    </div>
  );

  const ShippedItem = ({ order }) => (
    <div className="bg-gray-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex-1">
        <div className="flex items-center space-x-4">
          <div>
            <p className="text-white font-medium">{order.orderNumber}</p>
            <p className="text-gray-400 text-sm">{order.customerName}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400">Tracking:</p>
            <p className="text-white font-mono">{order.trackingNumber || 'N/A'}</p>
          </div>
          <div className="text-sm">
            <p className="text-gray-400">Shipped:</p>
            <p className="text-white">
              {order.fulfillmentData.shippedAt 
                ? new Date(order.fulfillmentData.shippedAt).toLocaleDateString()
                : 'Unknown'
              }
            </p>
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => handleStatusUpdate(order.id, ORDER_STATUS.DELIVERED)}
          className="bg-green-500/20 text-green-400 px-3 py-2 rounded text-sm hover:bg-green-500/30 flex items-center space-x-1"
        >
          <Check className="w-4 h-4" />
          <span>Mark Delivered</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Fulfillment Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ready for Production</p>
              <p className="text-2xl font-bold text-white">{readyForProduction.length}</p>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <Printer className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Ready for Shipping</p>
              <p className="text-2xl font-bold text-white">{readyForShipping.length}</p>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <Package className="w-6 h-6 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">In Transit</p>
              <p className="text-2xl font-bold text-white">{shipped.length}</p>
            </div>
            <div className="bg-orange-500/20 p-3 rounded-lg">
              <Truck className="w-6 h-6 text-orange-400" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Avg. Processing Time</p>
              <p className="text-2xl font-bold text-white">2.3 days</p>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <Clock className="w-6 h-6 text-green-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Production Queue */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Printer className="w-6 h-6 text-blue-400" />
            <span>Production Queue ({readyForProduction.length})</span>
          </h3>
          <button className="bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg hover:bg-blue-500/30 transition-colors">
            Print All Labels
          </button>
        </div>
        
        <div className="space-y-3">
          {readyForProduction.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Printer className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders ready for production</p>
            </div>
          ) : (
            readyForProduction.map(order => (
              <ProductionQueueItem key={order.id} order={order} />
            ))
          )}
        </div>
      </div>

      {/* Shipping Queue */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Package className="w-6 h-6 text-purple-400" />
            <span>Ready for Shipping ({readyForShipping.length})</span>
          </h3>
          <button className="bg-purple-500/20 text-purple-400 px-4 py-2 rounded-lg hover:bg-purple-500/30 transition-colors">
            Generate Shipping Labels
          </button>
        </div>
        
        <div className="space-y-3">
          {readyForShipping.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Package className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No orders ready for shipping</p>
            </div>
          ) : (
            readyForShipping.map(order => (
              <ShippingQueueItem key={order.id} order={order} />
            ))
          )}
        </div>
      </div>

      {/* Shipped Orders */}
      <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center space-x-2">
            <Truck className="w-6 h-6 text-orange-400" />
            <span>Recently Shipped ({shipped.slice(0, 10).length})</span>
          </h3>
          <button className="bg-orange-500/20 text-orange-400 px-4 py-2 rounded-lg hover:bg-orange-500/30 transition-colors">
            Export Tracking Numbers
          </button>
        </div>
        
        <div className="space-y-3">
          {shipped.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Truck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No recently shipped orders</p>
            </div>
          ) : (
            shipped.slice(0, 10).map(order => (
              <ShippedItem key={order.id} order={order} />
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminFulfillment;