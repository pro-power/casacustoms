// src/components/CartSidebar.jsx - Fixed with React Router navigation
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingCart, Minus, Plus, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

const CartSidebar = () => {
  const navigate = useNavigate(); // Add this
  const { 
    cartItems, 
    isCartOpen, 
    setIsCartOpen, 
    removeFromCart, 
    updateQuantity, 
    getCartTotal,
    // Remove setCurrentPage - we don't need it anymore
  } = useApp();

  const handleCheckout = () => {
    setIsCartOpen(false);
    navigate('/checkout'); // Use navigate instead of setCurrentPage
  };

  const getColorHex = (colorName) => {
    const colorMap = {
      'Hot Pink': '#E91E63',
      'Pink': '#F48FB1',
      'Orange': '#FF9800',
      'Light Orange': '#FFB74D',
      'Yellow': '#FFEB3B',
      'Teal': '#26C6DA',
      'Blue': '#2196F3',
      'Purple': '#9C27B0',
      'Dark Purple': '#673AB7'
    };
  
    return colorMap[colorName] || '#9CA3AF'; // Default to gray if color not found
  };

  return (
    <>
      {/* Overlay */}
      {isCartOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsCartOpen(false)}
        />
      )}

      {/* Cart Sidebar */}
      <div className={`fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-pink-500/20 z-50 transform transition-transform duration-300 shadow-2xl ${
        isCartOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
            <button
              onClick={() => setIsCartOpen(false)}
              className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 max-h-[calc(100vh-200px)]">
          {cartItems.length === 0 ? (
            <div className="text-center text-gray-400 mt-16">
              <ShoppingCart className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Your cart is empty</h3>
              <p className="text-sm">Add some Casa Customz cases to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-pink-500/30 transition-colors">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      {/* <h3 className="font-medium text-white mb-1">{item.device}</h3> */}
                      <p className="text-sm text-gray-400">{item.caseType} Design</p>
                      <p className="text-sm text-pink-400 font-medium">"{item.text}"</p>
                      <div className="flex items-center space-x-2 mt-1">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-600"
                        style={{ backgroundColor: getColorHex(item.color) }}
                      />
                        <span className="text-sm text-gray-400">{item.color}</span>
                      </div>
                      {item.logo && (
                        <p className="text-sm text-gray-400 flex items-center">
                          <span className="text-pink-400 mr-1">♥</span>
                          Casa Customz Logo
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-400 p-1 rounded transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium w-8 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-white hover:bg-gray-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-white font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cartItems.length > 0 && (
          <div className="p-6 border-t border-gray-700 bg-gray-800/50">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center text-gray-300">
                <span>Subtotal:</span>
                <span>${getCartTotal().toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-gray-300">
                <span>Shipping:</span>
                <span className="text-green-400 font-medium">FREE</span>
              </div>
              <div className="flex justify-between items-center border-t border-gray-700 pt-3">
                <span className="text-lg font-bold text-white">Total:</span>
                <span className="text-2xl font-bold text-pink-400">${getCartTotal().toFixed(2)}</span>
              </div>
            </div>
            <button
              onClick={handleCheckout}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg shadow-pink-500/25"
            >
              Proceed to Checkout
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartSidebar;