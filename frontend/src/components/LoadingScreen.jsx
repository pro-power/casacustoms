// src/components/LoadingScreen.jsx
// Production loading screen component with animations and progress tracking
import React, { useState, useEffect } from 'react';
import { Heart, Loader2 } from 'lucide-react';

const LoadingScreen = ({ 
  message = "Loading your Love Island experience...", 
  showProgress = false,
  progress = 0,
  variant = 'default' // 'default', 'minimal', 'splash'
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [dots, setDots] = useState('');

  // Animate progress bar
  useEffect(() => {
    if (showProgress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [progress, showProgress]);

  // Animate loading dots
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'minimal') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-pink-500 mx-auto mb-2" />
          <p className="text-gray-300 text-sm">{message}</p>
        </div>
      </div>
    );
  }

  if (variant === 'splash') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center z-50">
        <div className="text-center max-w-md mx-auto px-4">
          {/* Animated Logo */}
          <div className="relative mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="relative">
                <Heart className="w-20 h-20 text-pink-500 fill-pink-500 animate-pulse" />
                <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 rounded-full animate-ping"></div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-orange-500 to-pink-500 bg-clip-text text-transparent animate-pulse">
              Love Island Cases
            </h1>
            <p className="text-gray-400 text-lg mt-2">Personalized Phone Cases</p>
          </div>

          {/* Loading Animation */}
          <div className="space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            
            <p className="text-gray-300 text-lg">{message}{dots}</p>
            
            {showProgress && (
              <div className="w-full max-w-xs mx-auto">
                <div className="flex justify-between text-sm text-gray-400 mb-2">
                  <span>Loading</span>
                  <span>{Math.round(animatedProgress)}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${animatedProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Loading Steps Animation */}
            <div className="flex justify-center space-x-2">
              {[0, 1, 2].map((index) => (
                <div
                  key={index}
                  className="w-3 h-3 bg-pink-500 rounded-full animate-bounce"
                  style={{
                    animationDelay: `${index * 0.2}s`,
                    animationDuration: '1s'
                  }}
                ></div>
              ))}
            </div>
          </div>

          {/* Fun Facts */}
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
            <p className="text-gray-400 text-sm">
              💡 <span className="text-pink-400">Fun Fact:</span> Over 10,000 Love Island fans have personalized their cases!
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        {/* Logo Section */}
        <div className="flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse mr-3" />
          <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Love Island Cases
          </span>
        </div>

        {/* Loading Spinner */}
        <div className="relative mb-6">
          <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-pink-500/20 rounded-full mx-auto"></div>
        </div>

        {/* Loading Message */}
        <p className="text-gray-300 text-lg mb-4">{message}{dots}</p>

        {/* Progress Bar */}
        {showProgress && (
          <div className="w-full max-w-sm mx-auto mb-6">
            <div className="flex justify-between text-sm text-gray-400 mb-2">
              <span>Progress</span>
              <span>{Math.round(animatedProgress)}%</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-pink-500 to-orange-500 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${animatedProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Loading Details */}
        <div className="space-y-2 text-sm text-gray-400">
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Connecting to servers</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
            <span>Loading product catalog</span>
          </div>
          <div className="flex items-center justify-center space-x-2">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
            <span>Preparing customization tools</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="mt-8 flex justify-center space-x-1">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="w-2 h-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-full animate-bounce"
              style={{
                animationDelay: `${i * 0.1}s`,
                animationDuration: '1.5s'
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Loading Screen with Custom Hook for Progress Simulation
export const useLoadingProgress = (duration = 3000) => {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        const increment = 100 / (duration / 100);
        const newProgress = prev + increment;
        
        if (newProgress >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        
        return newProgress;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [duration]);

  return { progress, isComplete };
};

// Loading Screen with Simulated Steps
export const SteppedLoadingScreen = ({ steps = [], currentStep = 0 }) => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <div className="flex items-center justify-center mb-6">
          <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse mr-3" />
          <span className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-orange-500 bg-clip-text text-transparent">
            Love Island Cases
          </span>
        </div>

        <div className="w-16 h-16 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>

        {/* Steps */}
        <div className="space-y-3">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`flex items-center space-x-3 p-3 rounded-lg transition-all ${
                index === currentStep
                  ? 'bg-pink-500/20 border border-pink-500/30'
                  : index < currentStep
                  ? 'bg-green-500/20 border border-green-500/30'
                  : 'bg-gray-800 border border-gray-700'
              }`}
            >
              <div className={`w-4 h-4 rounded-full flex items-center justify-center ${
                index === currentStep
                  ? 'bg-pink-500'
                  : index < currentStep
                  ? 'bg-green-500'
                  : 'bg-gray-600'
              }`}>
                {index < currentStep ? (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                ) : index === currentStep ? (
                  <Loader2 className="w-3 h-3 text-white animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
              </div>
              <span className={`text-sm ${
                index <= currentStep ? 'text-white' : 'text-gray-400'
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingScreen;