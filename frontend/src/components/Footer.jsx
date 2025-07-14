// src/components/Footer.jsx
import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between">
          {/* Copyright */}
          <div className="flex items-center space-x-2 text-gray-400 text-sm mb-2 sm:mb-0">
            <span>© {currentYear} Casa Customs</span>
            <Heart className="w-3 h-3 text-pink-500 fill-pink-500" />
            <span>All rights reserved</span>
          </div>

          {/* Contact */}
          <div className="flex items-center space-x-6 text-sm">
            <a
              href="mailto:support@casacustomz.com"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Contact Us
            </a>
            <a
              href="mailto:support@casacustomz.com"
              className="text-gray-400 hover:text-pink-400 transition-colors"
            >
              Support
            </a>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500 text-xs">
              Made with ♥
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;