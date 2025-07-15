// Enhanced Gallery Component with Random 8 Samples
import React, { useState, useEffect } from 'react';
import { Heart, ShoppingCart, Star, Filter, Search, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext'; // Import your cart context

const Gallery = () => {
  const { addToCart } = useApp(); // Get addToCart function from context
  
  const [featuredCases, setFeaturedCases] = useState([]);
  const [filteredCases, setFilteredCases] = useState([]);
  const [randomizedCases, setRandomizedCases] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDevice, setSelectedDevice] = useState('all');
  const [selectedColor, setSelectedColor] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid'); // grid or list
  const [isLoading, setIsLoading] = useState(true);

  // Sample data with image URLs (you can replace with your actual images)
  const sampleCases = [
    {
      id: 1,
      device: 'iPhone 14 Pro Max',
      text: 'Islander',
      color: 'Hot Pink',
      price: 5.95,
      likes: 247,
      rating: 4.9,
      image: '/images/mockups/islander.png',
      description: 'Perfect for summer vibes with bold pink text'
    },
    {
      id: 2,
      device: 'iPhone 14 Pro',
      text: 'Crashout Queen',
      color: 'Blue',
      price: 5.95,
      likes: 189,
      rating: 4.8,
      image: '/images/mockups/crashoutqueen.png',
      description: 'Blue tones for the perfect calm but will Crashout case'
    },
    {
      id: 3,
      device: 'iPhone 13 Pro Max',
      text: 'Villa Life',
      color: 'Hot Pink',
      price: 5.95,
      likes: 156,
      rating: 4.7,
      image: '/images/mockups/villalife.png',
      description: 'Cool hot pink vibes for villa lifestyle enthusiasts'
    },
    {
      id: 4,
      device: 'Samsung Galaxy S23',
      text: 'Casa Girly',
      color: 'Orange',
      price: 5.95,
      likes: 203,
      rating: 4.9,
      image: '/images/mockups/casagirly.png',
      description: 'Bold orange statement for the bold islander feel'
    },
    {
      id: 5,
      device: 'iPhone 14',
      text: 'Jane Doe',
      color: 'Pink',
      price: 5.95,
      likes: 312,
      rating: 5.0,
      image: '/images/mockups/janedoe.png',
      description: 'Bright pink energy for any name'
    },
    {
      id: 6,
      device: 'iPhone 13 Pro',
      text: 'Mamasita',
      color: 'Pink',
      price: 5.95,
      likes: 178,
      rating: 4.6,
      image: '/images/mockups/mamasita.png',
      description: 'Cool pink mama vibes'
    },
    {
      id: 7,
      device: 'Samsung Galaxy S22',
      text: 'notyourtea',
      color: 'Hot Pink',
      price: 5.95,
      likes: 234,
      rating: 4.8,
      image: '/images/mockups/notyourtea.png',
      description: 'Mysterious Hot Pink for not your type.'
    },
    {
      id: 8,
      device: 'Water Bottle',
      text: 'Danielle',
      color: 'Hot Pink',
      price: 5.95,
      likes: 217,
      rating: 4.8,
      image: '/images/mockups/waterbottle-c.png',
      description: 'Elegant Hot Pink for attention at the gym.'
    },
    {
      id: 9,
      device: 'Samsung Galaxy S25 ultra',
      text: 'Closed Off',
      color: 'Purple',
      price: 5.95,
      likes: 167,
      rating: 4.7,
      image: '/images/mockups/closedoff.png',
      description: 'Soft Purple romance for exclusivity'
    }
  ];

  const colorMap = {
    'Hot Pink': '#E91E63',
    'Pink': '#F48FB1',
    'Orange': '#FF9800',
    'Yellow': '#FFEB3B',
    'Teal': '#26C6DA',
    'Blue': '#2196F3',
    'Purple': '#9C27B0',
    'Dark Purple': '#673AB7'
  };

  const devices = ['all', 'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14', 'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13', 'Samsung Galaxy S23', 'Samsung Galaxy S22'];
  const colors = ['all', 'Hot Pink', 'Pink', 'Orange', 'Yellow', 'Teal', 'Blue', 'Purple', 'Dark Purple'];

  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setFeaturedCases(sampleCases);
      setFilteredCases(sampleCases);
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Filter and sort logic
  useEffect(() => {
    let filtered = [...featuredCases];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.device.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.color.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Device filter
    if (selectedDevice !== 'all') {
      filtered = filtered.filter(item => item.device === selectedDevice);
    }

    // Color filter
    if (selectedColor !== 'all') {
      filtered = filtered.filter(item => item.color === selectedColor);
    }

    // Sort
    switch (sortBy) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => b.id - a.id);
        break;
      default:
        break;
    }

    setFilteredCases(filtered);
  }, [featuredCases, searchTerm, selectedDevice, selectedColor, sortBy]);

  // Random selection of 8 items - updates when filteredCases changes
  useEffect(() => {
    const shuffled = [...filteredCases].sort(() => Math.random() - 0.5);
    setRandomizedCases(shuffled.slice(0, 8));
  }, [filteredCases]);

  // FIXED: Now properly integrates with your cart system
  const handleQuickAdd = (caseData) => {
    try {
      // Transform gallery item to cart item format
      const cartItem = {
        device: caseData.device,
        caseType: 'CLASSIC', // Default case type
        text: caseData.text,
        color: caseData.color,
        font: 'Pecita', // Default font
        fontSize: 24, // Default font size
        logo: false, // Default no logo
        price: caseData.price,
        quantity: 1
      };

      // Add to cart using your existing cart context
      addToCart(cartItem);
      
      console.log('Successfully added to cart:', cartItem);
    } catch (error) {
      console.error('Error adding to cart:', error);
      // Fallback alert if there's an error
      alert('Error adding item to cart. Please try again.');
    }
  };

  const handleLike = (id) => {
    setFeaturedCases(prev => prev.map(item => 
      item.id === id ? { ...item, likes: item.likes + 1 } : item
    ));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-300">Loading community designs...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-orange-400 bg-clip-text text-transparent mb-4">
            Community Gallery
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Discover popular designs from the Love Island community
          </p>
          
          <div className="flex items-center justify-center space-x-8 text-gray-400">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">150+</div>
              <div className="text-sm">Custom Designs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">2500+</div>
              <div className="text-sm">Happy Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-white">4.8★</div>
              <div className="text-sm">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {randomizedCases.map((caseItem) => (
              <div key={caseItem.id} className="bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 hover:border-pink-500/50 transition-all group hover:scale-105">
                <div className="relative">
                  {/* Product Image */}
                  <div className="aspect-[3/4] overflow-hidden">
                    <img
                      src={caseItem.image}
                      alt={`${caseItem.device} case with "${caseItem.text}" text`}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback to gradient background if image fails to load
                        e.target.style.display = 'none';
                        e.target.parentElement.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
                      }}
                    />
                  </div>
                  
                  {/* Overlay with likes and rating */}
                  <div className="absolute top-4 right-4 bg-gray-900/80 rounded-full p-2 flex items-center space-x-1">
                    <button
                      onClick={() => handleLike(caseItem.id)}
                      className="flex items-center space-x-1 hover:text-pink-400 transition-colors"
                    >
                      <Heart className="w-3 h-3 text-pink-400" />
                      <span className="text-white text-xs">{caseItem.likes}</span>
                    </button>
                  </div>

                  <div className="absolute bottom-4 left-4 bg-gray-900/80 rounded-full px-2 py-1 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-white text-xs">{caseItem.rating}</span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="mb-3">
                    {/* <h3 className="font-bold text-white mb-1 text-sm">{caseItem.device}</h3> */}
                    <p className="text-pink-400 font-medium text-sm">"{caseItem.text}"</p>
                    <p className="text-gray-400 text-xs mt-1">{caseItem.description}</p>
                    <div className="flex items-center space-x-2 mt-2">
                      <div 
                        className="w-3 h-3 rounded-full border border-gray-600"
                        style={{ backgroundColor: colorMap[caseItem.color] }}
                      />
                      <span className="text-gray-400 text-xs">{caseItem.color}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-white">${caseItem.price}</span>
                    <button
                      onClick={() => handleQuickAdd(caseItem)}
                      className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-4 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-600 transition-all flex items-center space-x-1 text-sm"
                    >
                      <ShoppingCart className="w-3 h-3" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* List View */
          <div className="space-y-4">
            {randomizedCases.map((caseItem) => (
              <div key={caseItem.id} className="bg-gray-800 rounded-2xl border border-gray-700 hover:border-pink-500/50 transition-all">
                <div className="flex items-center p-6">
                  <div className="w-20 h-28 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={caseItem.image}
                      alt={`${caseItem.device} case`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 ml-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-bold text-white text-lg">{caseItem.device}</h3>
                        <p className="text-pink-400 font-medium">"{caseItem.text}"</p>
                        <p className="text-gray-400 text-sm mt-1">{caseItem.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-3 h-3 rounded-full border border-gray-600"
                              style={{ backgroundColor: colorMap[caseItem.color] }}
                            />
                            <span className="text-gray-400 text-sm">{caseItem.color}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                            <span className="text-white text-sm">{caseItem.rating}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 text-pink-400" />
                            <span className="text-white text-sm">{caseItem.likes}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-white mb-2">${caseItem.price}</div>
                        <button
                          onClick={() => handleQuickAdd(caseItem)}
                          className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:from-pink-600 hover:to-orange-600 transition-all flex items-center space-x-2"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>Add to Cart</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Show total available vs displayed */}
        <div className="text-center mt-12">
          <button 
            onClick={() => {
              // Shuffle and get new random 8
              const shuffled = [...filteredCases].sort(() => Math.random() - 0.5);
              setRandomizedCases(shuffled.slice(0, 8));
            }}
            className="bg-gray-800 border border-gray-600 text-white px-8 py-3 rounded-lg hover:border-pink-500/50 transition-all font-medium"
          >
            More Designs
          </button>
        </div>
      </div>
    </div>
  );
};

export default Gallery;