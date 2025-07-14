// src/components/Header.jsx - Remove admin tab from navigation
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { getCartItemCount, setIsCartOpen } = useApp();

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="bg-gray-900 border-b border-pink-500/20 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-4">
  <button
    onClick={() => navigate('/')}
    className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
  >
    <img
      src="/Logo.png"
      alt="Casa Customs Logo"
      className="w-20 h-20 object-contain"
      onError={(e) => {
        // Fallback to heart icon if logo fails to load
        e.target.style.display = 'none';
        e.target.nextElementSibling.style.display = 'inline-block';
      }}
    />
  </button>
</div>

          {/* Navigation - REMOVED ADMIN TAB */}
          <nav className="hidden md:flex items-center space-x-8">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-pink-400'
                  : 'text-gray-300 hover:text-pink-400'
              }`}
            >
              Customize
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className={`text-sm font-medium transition-colors ${
                isActive('/gallery')
                  ? 'text-pink-400'
                  : 'text-gray-300 hover:text-pink-400'
              }`}
            >
              Gallery
            </button>
            
            {/* REMOVED: Admin Link - No longer visible in public header */}
          </nav>

          {/* Cart */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gray-400 hover:text-pink-400 transition-colors"
            >
              <ShoppingCart className="w-6 h-6" />
              {getCartItemCount() > 0 && (
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {getCartItemCount()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - ALSO REMOVED ADMIN */}
        <div className="md:hidden pb-4">
          <div className="flex space-x-4">
            <button
              onClick={() => navigate('/')}
              className={`text-sm font-medium transition-colors ${
                isActive('/') && location.pathname === '/'
                  ? 'text-pink-400'
                  : 'text-gray-300 hover:text-pink-400'
              }`}
            >
              Customize
            </button>
            <button
              onClick={() => navigate('/gallery')}
              className={`text-sm font-medium transition-colors ${
                isActive('/gallery')
                  ? 'text-pink-400'
                  : 'text-gray-300 hover:text-pink-400'
              }`}
            >
              Gallery
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;