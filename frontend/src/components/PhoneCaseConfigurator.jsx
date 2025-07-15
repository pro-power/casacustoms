// src/components/PhoneCaseConfigurator.jsx
// Features: Multi-product configurator with product types
import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Star, ShoppingCart, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import ReviewsSection from './ReviewsSection';
import Footer from './Footer';
import { Link } from 'react-router-dom';

const COLORS = [
  { name: 'Hot Pink', hex: '#E91E63' },
  { name: 'Pink', hex: '#F48FB1' },
  { name: 'Orange', hex: '#FF9800' },
  { name: 'Light Orange', hex: '#FFB74D' },
  { name: 'Yellow', hex: '#FFEB3B' },
  { name: 'Teal', hex: '#26C6DA' },
  { name: 'Blue', hex: '#2196F3' },
  { name: 'Purple', hex: '#9C27B0' },
  { name: 'Dark Purple', hex: '#673AB7' }
];

const PRODUCT_TYPES = [
  {
    id: 'phone-case',
    name: 'Phone Case',
    icon: '📱',
    variants: [
      'iPhone 14 Pro Max', 'iPhone 14 Pro', 'iPhone 14',
      'iPhone 13 Pro Max', 'iPhone 13 Pro', 'iPhone 13',
      'Samsung Galaxy S23', 'Samsung Galaxy S22'
    ],
    mockups: {
      'iPhone 14 Pro Max': '/images/mockups/iphone16pro.png',
      'iPhone 14 Pro': '/images/mockups/iphone16pro.png',
      'iPhone 14': '/images/mockups/iphone16pro.png',
      'iPhone 13 Pro Max': '/images/mockups/iphone16pro.png',
      'iPhone 13 Pro': '/images/mockups/iphone16pro.png',
      'iPhone 13': '/images/mockups/iphone16pro.png',
      'Samsung Galaxy S23': '/images/mockups/iphone16pro.png',
      'Samsung Galaxy S22': '/images/mockups/iphone16pro.png'
    },
    textConfig: {
      fontSize: 88,
      position: { x: 'right-200', y: 'center' }
    }
  },
  {
    id: 'water-bottle',
    name: 'Water Bottle',
    icon: '🍼',
    variants: [
      'Standard Bottle', 'Large Bottle'
    ],
    mockups: {
      'Standard Bottle': '/images/mockups/waterbottles.png',
      'Large Bottle': '/images/mockups/waterbottles.png'
    },
    textConfig: {
      fontSize: 55,
      position: { x: 'center', y: 'center' }
    }
  },
  {
    id: 'champagne-glass',
    name: 'Champagne Glass',
    icon: '🥂',
    variants: [
      'Standard Glass'
    ],
    mockups: {
      'Standard Glass': '/images/mockups/flute.png'
    },
    textConfig: {
      fontSize: 55,
      position: { x: 'center', y: 'lower-third' }
    }
  }
];

const PhoneCaseConfigurator = () => {
  const { addToCart } = useApp();
  
  // State management
  const [selectedProductType, setSelectedProductType] = useState('phone-case');
  const [selectedVariant, setSelectedVariant] = useState('iPhone 14 Pro Max');
  const [selectedCaseType, setSelectedCaseType] = useState('CLASSIC');
  const [customText, setCustomText] = useState('');
  const [selectedColor, setSelectedColor] = useState('Hot Pink');
  const [showLogo, setShowLogo] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [mockupImage, setMockupImage] = useState(null);

  const canvasRef = useRef(null);
  const maxCharacters = 20;

  // Computed values
  const currentColor = useMemo(() => 
    COLORS.find(c => c.name === selectedColor) || COLORS[0], 
    [selectedColor]
  );

  const currentProduct = useMemo(() => 
    PRODUCT_TYPES.find(p => p.id === selectedProductType) || PRODUCT_TYPES[0], 
    [selectedProductType]
  );

  const remainingCharacters = maxCharacters - customText.length;
  const isConfigurationValid = customText.length > 0 && selectedProductType && selectedVariant && selectedColor;

  // Update variant when product type changes and clear text
  useEffect(() => {
    setSelectedVariant(currentProduct.variants[0]);
    // Clear text when switching product types
    setCustomText('');
  }, [currentProduct]);

  // Load mockup image when product type or variant changes
  useEffect(() => {
    const loadMockupImage = () => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        setMockupImage(img);
      };
      
      img.onerror = () => {
        // Silently fallback to canvas drawing
        setMockupImage(null);
      };
      
      const mockupPath = currentProduct.mockups[selectedVariant];
      if (mockupPath) {
        img.src = mockupPath;
      }
    };

    loadMockupImage();
  }, [currentProduct, selectedVariant]);

  // Enhanced canvas drawing with transparent background and 90% sizing
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { width, height } = canvas;
    
    // Clear canvas completely - transparent background
    ctx.clearRect(0, 0, width, height);
    
    if (mockupImage) {
      // Draw real mockup image at 90% size
      const imgAspectRatio = mockupImage.width / mockupImage.height;
      const canvasAspectRatio = width / height;
      
      let drawWidth, drawHeight, drawX, drawY;
      
      if (imgAspectRatio > canvasAspectRatio) {
        drawWidth = width * 0.9;
        drawHeight = drawWidth / imgAspectRatio;
        drawX = (width - drawWidth) / 2;
        drawY = (height - drawHeight) / 2;
      } else {
        drawHeight = height * 0.9;
        drawWidth = drawHeight * imgAspectRatio;
        drawX = (width - drawWidth) / 2;
        drawY = (height - drawHeight) / 2;
      }
      
      ctx.drawImage(mockupImage, drawX, drawY, drawWidth, drawHeight);
      
      // Draw custom text on mockup with product-specific positioning
      if (customText) {
        ctx.save();
        
        const textConfig = currentProduct.textConfig;
        let textX, textY;
        
        // Calculate position based on product configuration
        if (textConfig.position.x === 'center') {
          textX = drawX + drawWidth / 2;
        } else if (textConfig.position.x === 'right-200') {
          textX = drawX + drawWidth - 200;
        } else {
          textX = drawX + drawWidth / 2; // default to center
        }

        let yOffset = 0;
        if (selectedProductType === 'water-bottle') {
          yOffset = 220; // Move water bottle text down more
        } else if (selectedProductType === 'phone-case') {
          yOffset = 220; // Move phone case text down slightly
        } else if (selectedProductType === 'champagne-glass') {
          yOffset = -120; // Move champagne glass text up slightly
        }
        
        if (textConfig.position.y === 'center') {
          textY = drawY + drawHeight / 2 + yOffset;
        } else if (textConfig.position.y === 'lower-third') {
          textY = drawY + (drawHeight * 0.7) + yOffset;
        } else {
          textY = drawY + drawHeight / 2 + yOffset;
        }
        
        ctx.translate(textX, textY);
        ctx.rotate(-Math.PI / 2); // All text rotated -90 degrees as standard
        
        // Product-specific font sizing with overflow prevention
        if (selectedProductType === 'champagne-glass') {
          // Champagne glass needs smaller text due to narrow top
          const champagneFontSize = Math.min(
            textConfig.fontSize * 0.8, // Start with 70% of base size
            Math.floor(250 / customText.length * 1.5) // Scale based on text length
          );
          ctx.font = `bold ${champagneFontSize}px Pecita`;
        } else {
          // Dynamic font sizing for other products
          let fontSize = textConfig.fontSize;
          const maxTextWidth = drawHeight * 0.8; // Max width is 80% of image height (since rotated)
          const minFontSize = 20; // Minimum readable font size
          
          // Start with configured font size and reduce if text is too wide
          do {
            ctx.font = `bold ${fontSize}px Pecita`;
            const textMetrics = ctx.measureText(customText);
            
            if (textMetrics.width <= maxTextWidth || fontSize <= minFontSize) {
              break; // Text fits or we've reached minimum size
            }
            
            fontSize -= 5; // Reduce font size by 5px increments
          } while (fontSize > minFontSize);
          
          // Additional check for very long text
          if (customText.length > 15) {
            fontSize = Math.min(fontSize, textConfig.fontSize * 0.7); // Reduce by 30% for long text
          }
          
          ctx.font = `bold ${fontSize}px Pecita`;
        }
        
        ctx.fillStyle = currentColor.hex;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
        ctx.shadowBlur = 3;
        ctx.shadowOffsetX = 1;
        ctx.shadowOffsetY = 1;
        
        ctx.fillText(customText, 0, 0);
        
        ctx.restore();
      }
    }
    
    // logo
    if (showLogo) {
      ctx.fillStyle = '#EC4899';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('♥ Future Islander', width / 2, height - 50);
    }
  }, [customText, currentColor.hex, showLogo, mockupImage, currentProduct, selectedProductType]);

  // Redraw canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Handle product type change with loading state
  const handleProductTypeChange = useCallback(async (productType) => {
    setIsLoading(true);
    setSelectedProductType(productType);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  }, []);

  // Handle variant change with loading state
  const handleVariantChange = useCallback(async (variant) => {
    setIsLoading(true);
    setSelectedVariant(variant);
    await new Promise(resolve => setTimeout(resolve, 800));
    setIsLoading(false);
  }, []);

  // Handle add to cart with loading state
  const handleAddToCart = useCallback(async () => {
    setIsAddingToCart(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const item = {
        productType: selectedProductType,
        variant: selectedVariant,
        device: selectedVariant, // Keep for backward compatibility
        caseType: selectedCaseType,
        text: customText,
        color: selectedColor,
        logo: showLogo,
        price: 5.95
      };
      
      addToCart(item);
      
      // Reset form after successful add
      setCustomText('');
      setShowLogo(false);
      
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  }, [selectedProductType, selectedVariant, selectedCaseType, customText, selectedColor, showLogo, addToCart]);

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Product Preview - Clean, transparent, large */}
          <div className="relative flex items-center justify-center min-h-[700px]">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center z-10 backdrop-blur-sm">
                <div className="text-center bg-gray-900/80 rounded-2xl p-6">
                  <Loader2 className="w-12 h-12 animate-spin text-pink-500 mx-auto mb-3" />
                  <p className="text-gray-300 text-base">Loading {currentProduct.name}...</p>
                </div>
              </div>
            )}
            
            <canvas
              ref={canvasRef}
              width={600}
              height={600}
              className="max-w-full max-h-full"
            />
          </div>


          {/* Configuration Panel */}
          <div className="space-y-8">
            {/* Product Header */}
            <div className="space-y-4">
              <h1 className="text-4xl font-bold text-love-gradient">
                Custom Islander Products
              </h1>
              <p className="text-xl text-gray-300">Personalized Items with Custom Text</p>

              {/* ADD THIS STRATEGIC LINK */}
              <div className="text-center">
                <Link 
                  to="/how-it-works" 
                  className="text-pink-400 hover:text-pink-300 font-medium text-sm underline"
                >
                  New to Casa Customs? Learn how our design process works →
                </Link>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-gray-400">(247 reviews)</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-baseline space-x-2">
                  <span className="text-4xl font-bold text-white">$5.95</span>
                  <span className="text-gray-400 line-through">$7.45</span>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="bg-green-500/20 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                    FREE Shipping
                  </span>
                  <span className="bg-pink-500/20 text-pink-400 px-3 py-1 rounded-full text-sm font-medium">
                    25% OFF
                  </span>
                </div>
              </div>
            </div>

            {/* Product Type Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Select Product Type
              </label>
              <div className="grid grid-cols-3 gap-3">
                {PRODUCT_TYPES.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleProductTypeChange(product.id)}
                    disabled={isLoading}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      selectedProductType === product.id
                        ? 'border-pink-500 bg-pink-500/20'
                        : 'border-gray-600 bg-gray-800 hover:border-gray-500'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    <div className="text-white font-medium text-sm">{product.name}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Text Input */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">
                  Your Custom Text
                </label>
                <span className={`text-sm ${remainingCharacters < 5 ? 'text-orange-400' : 'text-gray-500'}`}>
                  {remainingCharacters} characters left
                </span>
              </div>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                maxLength={maxCharacters}
                placeholder="Enter your text..."
                className="input-love"
              />
            </div>

            {/* Color Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Text Color ({selectedColor})
              </label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={`w-10 h-10 rounded-full border-3 transition-all hover:scale-110 ${
                      selectedColor === color.name
                        ? 'border-white ring-2 ring-pink-500 ring-offset-2 ring-offset-gray-900 scale-110'
                        : 'border-gray-600 hover:border-gray-400'
                    }`}
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            {/* Preview & Logo Toggle */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-300">
                Preview
              </label>
              <div className="flex justify-between items-center p-4 bg-gray-800 rounded-xl border border-gray-600">
                <span
                  className="text-2xl font-bold"
                  style={{ 
                    color: currentColor.hex,
                    fontFamily: 'Pecita, sans-serif'
                  }}
                >
                  {customText || 'Custom Text Preview...'}
                </span>
              </div>
            </div>

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={!isConfigurationValid || isAddingToCart}
              className={`w-full p-4 rounded-xl font-semibold transition-all flex items-center justify-center space-x-3 ${
                isConfigurationValid && !isAddingToCart
                  ? 'btn-love shadow-lg shadow-pink-500/25'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isAddingToCart ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Adding to Cart...</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>ADD TO CART - $5.95</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      <ReviewsSection />
    </div>
  );
};

export default PhoneCaseConfigurator;