// frontend/src/pages/HowItWorks.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Star, Palette, Truck, Shield } from 'lucide-react';

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-purple-900/20 to-pink-900/20 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-love-gradient mb-6">
            How CasaCustoms Does It
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 mb-8 leading-relaxed">
            Create personalized stickers and custom phone case decals in minutes. 
            Our villa-inspired designs makes it easy to get professional-quality 
            custom Lovely Islander vibe stickers for any device or surface.
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg shadow-pink-500/25"
          >
            Start Designing Now <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* Step-by-Step Process */}
      <div className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-love-gradient text-center mb-16">
            Design Your Custom Stickers in 4 Easy Steps
          </h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="bg-gray-800 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div className="bg-pink-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <Palette className="w-8 h-8 text-pink-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Choose Your Product</h3>
              <p className="text-gray-300">
                Select from phone cases, water bottles, or champagne flute. Each product 
                is optimized for custom text placement and comes with multiple device options 
                sizing for different products.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-gray-800 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div className="bg-orange-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Add Custom Text</h3>
              <p className="text-gray-300">
                Enter your personalized text. Perfect for names, 
                quotes, or memes. Our villa-inspired designs ensure your custom 
                sticker captures that summer Islander romance aesthetic.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-gray-800 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div className="bg-purple-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Pick Your Color</h3>
              <p className="text-gray-300">
                Choose from 9 vibrant colors including Hot Pink, Orange, Teal, Purple, 
                and more. All colors are UV-resistant and designed to maintain their 
                vibrancy on any surface - from phone cases to water bottles even suitcases.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-gray-800 rounded-2xl p-6 text-center relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-pink-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                4
              </div>
              <div className="bg-green-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-4">Order & Receive</h3>
              <p className="text-gray-300">
                Preview your design and add to cart for just $5.95. We'll create your 
                custom sticker with premium materials and ship it free. Perfect adhesion 
                on phone cases, laptops, and water bottles.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* What Makes Our Stickers Special */}
      <div className="py-20 bg-gray-800/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-love-gradient text-center mb-16">
            What Makes CasaCustoms Special?
          </h2>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="bg-pink-500/20 p-3 rounded-lg">
                  <Shield className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Premium Vinyl Material</h3>
                  <p className="text-gray-300">
                    Our custom stickers are made with high-grade vinyl that's waterproof, 
                    scratch-resistant, and UV-protected. Perfect for phone cases, water bottles, 
                    laptops, and outdoor use. Lasts 3-5 years without fading or peeling.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-orange-500/20 p-3 rounded-lg">
                  <Palette className="w-6 h-6 text-orange-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Villa-Inspired Design</h3>
                  <p className="text-gray-300">
                    Our custom text stickers feature designs and colors inspired by romantic 
                    Islander aesthetics. Perfect for reality TV fans who Love that summer Island 
                    vibes. Each personalized sticker captures the attention of those around.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-500/20 p-3 rounded-lg">
                  <Truck className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">Fast & Free US Shipping</h3>
                  <p className="text-gray-300">
                    Every order ships free within 2-3 business days. 
                    We use protective packaging to ensure your personalized phone case 
                    stickers or water bottle decals arrive in perfect condition.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-pink-500/20 to-orange-500/20 p-8 rounded-2xl">
              <h3 className="text-2xl font-bold text-white mb-6">Perfect For:</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>iPhone,Samsung and other phone cases</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Water bottles and tumblers</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Laptops and tablets</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Car windows and mirrors</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Notebooks and planners</span>
                </li>
                <li className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span>Any smooth, clean surface</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Application Instructions */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-love-gradient text-center mb-16">
            How to Apply Your Custom Stickers
          </h2>

          <div className="bg-gray-800 rounded-2xl p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-bold text-pink-400 mb-4">For Phone Cases:</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Clean your phone case with the provided alcohol wipe and let dry completely</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>Peel backing paper slowly while positioning sticker</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Apply from center outward, smoothing air bubbles</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-pink-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <span>Press firmly for 30 seconds for best adhesion</span>
                  </li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-bold text-orange-400 mb-4">For Water Bottles:</h3>
                <ol className="space-y-3 text-gray-300">
                  <li className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</span>
                    <span>Wash bottle thoroughly and dry completely</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</span>
                    <span>Position sticker while backing is still on to test placement</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</span>
                    <span>Remove backing and apply in smooth motion</span>
                  </li>
                  <li className="flex items-start space-x-3">
                    <span className="bg-orange-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">4</span>
                    <span>Wait 24 hours before first wash for best durability</span>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Reviews */}
      <div className="py-20 bg-gray-800/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-love-gradient text-center mb-16">
            What Our Customers Say
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Perfect for my water bottle! The custom text looks amazing and hasn't 
                faded after months of daily use. Love the villa aesthetic!"
              </p>
              <p className="text-pink-400 font-semibold">- Sarah M.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "These phone case stickers are incredible quality. Easy to apply and 
                the colors are so vibrant. Exactly what I wanted!"
              </p>
              <p className="text-pink-400 font-semibold">- Jake T.</p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <div className="flex items-center mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-gray-300 mb-4">
                "Fast shipping and perfect quality. My laptop sticker gets compliments 
                every day. The custom text design process was so easy!"
              </p>
              <p className="text-pink-400 font-semibold">- Emma L.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-love-gradient mb-6">
            Ready to Create Your Custom Sticker?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Design personalized stickers for your phone case, water bottle, or any device. 
            Villa-inspired fonts, vibrant colors, and premium quality vinyl. Free shipping on all orders!
          </p>
          <Link 
            to="/" 
            className="inline-flex items-center bg-gradient-to-r from-pink-500 to-orange-500 text-white px-12 py-6 rounded-xl font-semibold text-xl hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg shadow-pink-500/25"
          >
            Start Designing Your Sticker <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;