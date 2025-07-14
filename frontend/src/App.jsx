// src/App.jsx - Updated with React Router
import React, { Suspense, useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Heart, Loader2, AlertTriangle, RefreshCw } from 'lucide-react';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { AppProvider, useApp } from './context/AppContext';
import { AdminProvider } from './context/AdminContext';

// Components
import Header from './components/Header';
import PhoneCaseConfigurator from './components/PhoneCaseConfigurator';
import Gallery from './components/Gallery';
import Checkout from './components/Checkout';
import CartSidebar from './components/CartSidebar';
import AdminDashboard from './components/AdminDashboard';
import LoadingScreen from './components/LoadingScreen';
import ErrorBoundary from './components/ErrorBoundary';
import AdminLogin from './components/AdminLogin';

// API Health Check
import { apiUtils } from './services/api';
import Footer from './components/Footer';

// ============================================================================
// ERROR BOUNDARY COMPONENT
// ============================================================================
class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    console.error('App Error Boundary caught an error:', error, errorInfo);
    
    if (process.env.NODE_ENV === 'production') {
      // Example: Sentry.captureException(error);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center max-w-md mx-auto px-4">
            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-10 h-10 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            <p className="text-gray-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all flex items-center space-x-2 mx-auto"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Refresh Page</span>
            </button>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="mt-8 text-left bg-gray-800 rounded-lg p-4 text-red-400 text-sm">
                <h3 className="font-bold mb-2">Error Details (Development):</h3>
                <pre className="whitespace-pre-wrap">{this.state.error && this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre className="whitespace-pre-wrap mt-2">{this.state.errorInfo.componentStack}</pre>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ============================================================================
// LOADING SCREEN COMPONENT
// ============================================================================
const AppLoadingScreen = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="text-center">
      <div className="flex items-center justify-center mb-6">
        <Heart className="w-12 h-12 text-pink-500 fill-pink-500 animate-pulse" />
        <span className="ml-3 text-3xl font-bold text-love-gradient">
          Casa Customz
        </span>
      </div>
      <div className="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-gray-300">Loading your Love Island experience...</p>
    </div>
  </div>
);

// ============================================================================
// API STATUS CHECKER
// ============================================================================
const ApiStatusChecker = ({ children }) => {
  const [apiStatus, setApiStatus] = useState('checking');
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const checkApiHealth = async () => {
    try {
      setApiStatus('checking');
      await apiUtils.healthCheck();
      setApiStatus('healthy');
      setRetryCount(0);
    } catch (error) {
      console.error('API health check failed:', error);
      setApiStatus('unhealthy');
    }
  };

  const handleRetry = async () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      await checkApiHealth();
    }
  };

  useEffect(() => {
    checkApiHealth();
  }, []);

  if (apiStatus === 'checking') {
    return <AppLoadingScreen />;
  }

  if (apiStatus === 'unhealthy') {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-10 h-10 text-yellow-400" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-4">
            Connection Issue
          </h1>
          <p className="text-gray-400 mb-6">
            We're having trouble connecting to our servers. This might be a temporary issue.
          </p>
          <div className="space-y-3">
            <button
              onClick={handleRetry}
              disabled={retryCount >= maxRetries}
              className="w-full bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-5 h-5" />
              <span>
                {retryCount >= maxRetries ? 'Max Retries Reached' : `Retry (${retryCount}/${maxRetries})`}
              </span>
            </button>
            
            {retryCount >= maxRetries && (
              <button
                onClick={() => setApiStatus('healthy')}
                className="w-full bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all"
              >
                Continue in Offline Mode
              </button>
            )}
          </div>
          
          <p className="text-gray-500 text-sm mt-4">
            If this problem persists, please contact support.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

// ============================================================================
// PROTECTED ADMIN ROUTE
// ============================================================================
const ProtectedAdminRoute = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  console.log('ProtectedAdminRoute check:', { 
    isAuthenticated, 
    userRole: user?.role, 
    isAdmin: user?.role === 'admin' || user?.role === 'super_admin' 
  }); // Debug log

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  // Check if user is authenticated AND has admin role
  const isAdmin = user?.role === 'admin' || user?.role === 'super_admin';
  
  if (!isAuthenticated || !isAdmin) {
    console.log('Redirecting to login, auth:', isAuthenticated, 'admin:', isAdmin);
    return <AdminLogin redirectTo={location.pathname} />;
  }

  return children;
};

// ============================================================================
// MAIN ROUTES COMPONENT
// ============================================================================
const AppRoutes = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      {/* Header - hide on admin routes */}
      {!isAdminRoute && <Header />}
      
      {/* Main content - flex-1 to push footer down */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PhoneCaseConfigurator />} />
          <Route path="/customize" element={<PhoneCaseConfigurator />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/checkout" element={<Checkout />} />
          
          {/* Admin Routes */}
          <Route 
            path="/admin/login" 
            element={<AdminLogin />} 
          />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedAdminRoute>
                <AdminProvider>
                  <AdminDashboard />
                </AdminProvider>
              </ProtectedAdminRoute>
            } 
          />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      
      {/* Footer - hide on admin routes */}
      {!isAdminRoute && <Footer />}
      
      {/* Cart Sidebar - hide on admin routes */}
      {!isAdminRoute && <CartSidebar />}
    </div>
   );
};

// ============================================================================
// AUTHENTICATED APP CONTENT
// ============================================================================
const AuthenticatedApp = () => {
  const { isLoading } = useAuth();

  if (isLoading) {
    return <AppLoadingScreen />;
  }

  return (
    <AppProvider>
      <AppRoutes />
    </AppProvider>
  );
};

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================
const App = () => {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsInitialized(true);
      } catch (error) {
        console.error('App initialization failed:', error);
        setIsInitialized(true);
      }
    };

    initializeApp();
  }, []);

  if (!isInitialized) {
    return <AppLoadingScreen />;
  }

  return (
    <AppErrorBoundary>
      <ApiStatusChecker>
        <AuthProvider>
          <AuthenticatedApp />
        </AuthProvider>
      </ApiStatusChecker>
    </AppErrorBoundary>
  );
};

export default App;