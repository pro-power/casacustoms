// src/components/ReviewsSection.jsx
import React, { useState, useEffect } from 'react';
import { Star, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const ReviewsSection = () => {
  // Mock review data
  const reviews = [
    {
      id: 1,
      name: "Sarah M.",
      location: "Los Angeles, CA",
      rating: 5,
      text: "This looked amazing on my new case! The quality is incredible and it applied so smoothly. Perfect Islander vibes fr!",
      device: "iPhone 14 Pro",
      customText: "Beach Vibes",
      date: "2 weeks ago"
    },
    {
      id: 2,
      name: "Mike R.",
      location: "New York, NY", 
      rating: 5,
      text: "Transformed my boring case into something unique and the text looks exactly like on the show. Just what I wanted!",
      device: "iPhone 13 Pro Max",
      customText: "NYC Life",
      date: "1 week ago"
    },
    {
      id: 3,
      name: "Emma T.",
      location: "Miami, FL",
      rating: 5,
      text: "Got this for my boyfriend's case and he absolutely loves it! Great quality and the Love Island vibes are perfect. Now we're like our own villa couple!",
      device: "Samsung Galaxy S23",
      customText: "Islander",
      date: "3 days ago"
    },
    {
      id: 4,
      name: "Jason K.",
      location: "Chicago, IL",
      rating: 5,
      text: "Super impressed with how this transformed my case! The custom text is perfectly printed and it feels premium on my phone.",
      device: "iPhone 14",
      customText: "Chi-Town",
      date: "5 days ago"
    },
    {
      id: 5,
      name: "Ashley W.",
      location: "Austin, TX",
      rating: 5,
      text: "Ordered 3 for my family's cases and we all love them! Now our whole family has that Love Island villa energy. Fast shipping and excellent customer service.",
      device: "iPhone 13 Pro",
      customText: "Texas Pride",
      date: "1 week ago"
    },
    {
      id: 6,
      name: "David L.",
      location: "Seattle, WA",
      rating: 5,
      text: "Perfect addition to my phone case! Love how the custom text makes my case stand out. Easy to apply and looks professional.",
      device: "iPhone 14 Pro Max",
      customText: "Emerald City",
      date: "4 days ago"
    },
    {
      id: 7,
      name: "Mia C.",
      location: "Phoenix, AZ",
      rating: 5,
      text: "Amazing quality and super cute on my case! Gets so many compliments. Definitely ordering more to switch up my look for different vibes.",
      device: "iPhone 13",
      customText: "Desert Queen",
      date: "6 days ago"
    },
    {
      id: 8,
      name: "Tyler B.",
      location: "Denver, CO",
      rating: 5,
      text: "Exceeded my expectations! This made my basic case look incredible, and the custom text is exactly what I wanted. Easy application too!",
      device: "Samsung Galaxy S22",
      customText: "Mountain Life",
      date: "2 days ago"
    },
    {
      id: 9,
      name: "Olivia H.",
      location: "Nashville, TN",
      rating: 5,
      text: "Love how this completely changed my case vibe! Now I feel like I'm living in the villa every day. The quality is unmatched!",
      device: "iPhone 14 Pro",
      customText: "Country Gal",
      date: "1 week ago"
    },
    {
      id: 10,
      name: "Marcus J.",
      location: "Atlanta, GA",
      rating: 5,
      text: "Ordered multiple custom stickers to match different moods for my cases. The custom text looks professional and each one applies perfectly!",
      device: "iPhone 13 Pro Max",
      customText: "ATL Vibes",
      date: "3 days ago"
    }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Auto-scroll every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex >= reviews.length - 3 ? 0 : prevIndex + 1
        );
        setIsAnimating(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [reviews.length]);

  // Get visible reviews (3 on desktop, 2 on tablet, 1 on mobile)
  const getVisibleReviews = () => {
    const visibleReviews = [];
    for (let i = 0; i < 3; i++) {
      const index = (currentIndex + i) % reviews.length;
      visibleReviews.push(reviews[index]);
    }
    return visibleReviews;
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? 'text-yellow-400 fill-yellow-400' 
            : 'text-gray-600'
        }`}
      />
    ));
  };

  return (
    <section className="py-16 bg-gray-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500 mr-2" />
            <h2 className="text-3xl font-bold text-white">
              Loved by <span className="text-love-gradient">Thousands</span>
            </h2>
            <Heart className="w-6 h-6 text-pink-500 fill-pink-500 ml-2" />
          </div>
          <p className="text-gray-300 text-lg">
            See what fellow Islanders are saying about their custom cases
          </p>
          
          {/* Overall Rating */}
          <div className="flex items-center justify-center mt-6 space-x-4">
            <div className="flex items-center space-x-1">
              {renderStars(5)}
            </div>
            <span className="text-white font-semibold">5.0 out of 5</span>
            <span className="text-gray-400">•</span>
            <span className="text-gray-400">2,500+ reviews</span>
          </div>
        </div>

        {/* Reviews Container */}
        <div className="relative overflow-hidden">
          <div 
            className={`flex transition-all duration-300 ease-in-out ${
              isAnimating ? 'opacity-75 transform translate-x-2' : 'opacity-100 transform translate-x-0'
            }`}
          >
            {getVisibleReviews().map((review, index) => (
              <div
                key={`${review.id}-${currentIndex}-${index}`}
                className={`flex-shrink-0 px-3 ${
                  index === 2 ? 'hidden lg:block w-1/3' : 
                  index === 1 ? 'hidden md:block md:w-1/2 lg:w-1/3' : 
                  'w-full md:w-1/2 lg:w-1/3'
                }`}
              >
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-6 h-full hover:border-pink-500/30 transition-all duration-200 hover:shadow-lg hover:shadow-pink-500/10">
                  {/* Review Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-semibold">{review.name}</h4>
                      <p className="text-gray-400 text-sm">{review.location}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(review.rating)}
                    </div>
                  </div>

                  {/* Review Text */}
                  <blockquote className="text-gray-300 mb-4 italic">
                    "{review.text}"
                  </blockquote>

                  {/* Review Details */}
                  <div className="border-t border-gray-700 pt-4 mt-4">
                    <div className="flex items-center justify-between text-sm">
                      <div>
                        <p className="text-gray-400">Device:</p>
                        <p className="text-white font-medium">{review.device}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400">Custom Text:</p>
                        <p className="text-pink-400 font-medium">"{review.customText}"</p>
                      </div>
                    </div>
                    <div className="mt-2 text-right">
                      <span className="text-gray-500 text-xs">{review.date}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="flex justify-center mt-8 space-x-2">
          {Array.from({ length: Math.ceil(reviews.length / 3) }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index * 3)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                Math.floor(currentIndex / 3) === index
                  ? 'bg-pink-500 w-6'
                  : 'bg-gray-600 hover:bg-gray-500'
              }`}
            />
          ))}
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
        <p className="text-gray-300 mb-4">
          Join thousands of happy customers
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-8 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all shadow-lg shadow-pink-500/25"
          >
            Create Your Case Now
          </button>
          <Link 
            to="/faq"
            className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-semibold transition-all border border-gray-600 hover:border-gray-500"
          >
            Have Questions? See FAQ
          </Link>
        </div>
      </div>
            </div>
    </section>
  );
};

export default ReviewsSection;