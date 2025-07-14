// src/components/admin/OrderDetailsModal.jsx
// Detailed order view modal with full customer and product information
import React from 'react';
import { X, MapPin, User, Package, Palette, Type, Download } from 'lucide-react';
import { ORDER_STATUS } from '../../context/AdminContext';

const OrderDetailsModal = ({ order, onClose, onStatusUpdate }) => {
  if (!order) return null;

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium border ${styles[status]}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-2xl font-bold text-white">Order Details</h2>
            <p className="text-gray-400">{order.orderNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Order Status and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-gray-400">Status:</span>
              {getStatusBadge(order.status)}
            </div>
            <select
              value={order.status}
              onChange={(e) => onStatusUpdate(order.id, e.target.value)}
              className="bg-gray-700 border border-gray-600 text-white px-3 py-2 rounded-lg"
            >
              {Object.values(ORDER_STATUS).map(status => (
                <option key={status} value={status}>{status.toUpperCase()}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Customer Information */}
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <User className="w-5 h-5 text-pink-400" />
                  <h3 className="text-lg font-semibold text-white">Customer Information</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Name</p>
                    <p className="text-white font-medium">{order.customerName}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Email</p>
                    <p className="text-white">{order.customerEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Order Date</p>
                    <p className="text-white">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <MapPin className="w-5 h-5 text-pink-400" />
                  <h3 className="text-lg font-semibold text-white">Shipping Address</h3>
                </div>
                <div className="text-white">
                  <p>{order.shippingAddress.street}</p>
                  <p>{order.shippingAddress.city}</p>
                  <p>{order.shippingAddress.postcode}</p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            </div>

            {/* Product Information */}
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <div className="flex items-center space-x-2 mb-4">
                  <Package className="w-5 h-5 text-pink-400" />
                  <h3 className="text-lg font-semibold text-white">Product Details</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400 text-sm">Device</p>
                    <p className="text-white font-medium">{order.device}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Case Type</p>
                    <p className="text-white">{order.caseType}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Custom Text</p>
                    <p className="text-white font-medium">"{order.customText}"</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Text Color</p>
                      <div className="flex items-center space-x-2">
                        <Palette className="w-4 h-4 text-pink-400" />
                        <p className="text-white">{order.textColor}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Font</p>
                      <div className="flex items-center space-x-2">
                        <Type className="w-4 h-4 text-pink-400" />
                        <p className="text-white">{order.font} ({order.fontSize}px)</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Add-ons</p>
                    <p className="text-white">
                      {order.hasLogo ? '♥ Love Island Logo' : 'No additional logos'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-white mb-4">Order Summary</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Quantity</span>
                    <span className="text-white">{order.quantity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Unit Price</span>
                    <span className="text-white">${order.price}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t border-gray-600 pt-2">
                    <span className="text-white">Total</span>
                    <span className="text-pink-400">${order.total}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Fulfillment Information */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-white mb-4">Fulfillment Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Print File</p>
                <div className="flex items-center space-x-2 mt-1">
                  {order.fulfillmentData.printFile ? (
                    <button className="flex items-center space-x-1 text-blue-400 hover:text-blue-300">
                      <Download className="w-4 h-4" />
                      <span className="text-sm">Download</span>
                    </button>
                  ) : (
                    <span className="text-gray-500 text-sm">Not generated</span>
                  )}
                </div>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Printed At</p>
                <p className="text-white text-sm">
                  {order.fulfillmentData.printedAt 
                    ? new Date(order.fulfillmentData.printedAt).toLocaleString()
                    : 'Not printed'
                  }
                </p>
              </div>
              <div>
                <p className="text-gray-400 text-sm">Shipped At</p>
                <p className="text-white text-sm">
                  {order.fulfillmentData.shippedAt 
                    ? new Date(order.fulfillmentData.shippedAt).toLocaleString()
                    : 'Not shipped'
                  }
                </p>
              </div>
            </div>
            
            {order.trackingNumber && (
              <div className="mt-4 p-3 bg-gray-600 rounded-lg">
                <p className="text-gray-400 text-sm">Tracking Number</p>
                <p className="text-white font-mono">{order.trackingNumber}</p>
              </div>
            )}
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Notes</h3>
              <p className="text-gray-300">{order.notes}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-800/50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            Close
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Print Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;