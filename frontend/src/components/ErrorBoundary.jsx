// src/components/ErrorBoundary.jsx
// Production error boundary with detailed error reporting and recovery options
import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      eventId: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error details
    this.setState({
      error: error,
      errorInfo: errorInfo,
      eventId: this.generateEventId()
    });

    // Log to console for development
    console.error('Error Boundary caught an error:', error, errorInfo);
    
    // In production, you would send this to your error reporting service
    this.logErrorToService(error, errorInfo);
  }

  generateEventId = () => {
    return `ERR-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  logErrorToService = (error, errorInfo) => {
    // In production, integrate with services like:
    // - Sentry: Sentry.captureException(error, { extra: errorInfo });
    // - LogRocket: LogRocket.captureException(error);
    // - Bugsnag: Bugsnag.notify(error, { metadata: errorInfo });
    
    if (process.env.NODE_ENV === 'production') {
      // Example integration with error reporting service
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            componentStack: errorInfo.componentStack,
            eventId: this.state.eventId,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  };

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  handleRefresh = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  reportBug = () => {
    const subject = encodeURIComponent(`Bug Report - ${this.state.eventId}`);
    const body = encodeURIComponent(`
Error ID: ${this.state.eventId}
Error Message: ${this.state.error?.message}
Browser: ${navigator.userAgent}
URL: ${window.location.href}
Timestamp: ${new Date().toISOString()}

Additional Details:
[Please describe what you were doing when this error occurred]
    `);
    
    window.open(`mailto:support@loveislandcases.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, eventId, retryCount } = this.state;
      const { fallback: CustomFallback, showDetails = false } = this.props;

      // If a custom fallback is provided, use it
      if (CustomFallback) {
        return (
          <CustomFallback 
            error={error}
            errorInfo={errorInfo}
            eventId={eventId}
            onRetry={this.handleRetry}
            onRefresh={this.handleRefresh}
          />
        );
      }

      // Default error boundary UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="text-center max-w-2xl mx-auto">
            {/* Error Icon */}
            <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertTriangle className="w-12 h-12 text-red-400" />
            </div>

            {/* Error Message */}
            <h1 className="text-3xl font-bold text-white mb-4">
              Oops! Something went wrong
            </h1>
            
            <p className="text-gray-400 text-lg mb-6">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>

            {/* Error ID */}
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-2">Error ID for support:</p>
              <code className="text-pink-400 font-mono text-sm">{eventId}</code>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4 mb-8">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={this.handleRetry}
                  className="bg-gradient-to-r from-pink-500 to-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-pink-600 hover:to-orange-600 transition-all flex items-center space-x-2 justify-center"
                  disabled={retryCount >= 3}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>{retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}</span>
                </button>

                <button
                  onClick={this.handleRefresh}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center space-x-2 justify-center"
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Refresh Page</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-all flex items-center space-x-2 justify-center"
                >
                  <Home className="w-5 h-5" />
                  <span>Go Home</span>
                </button>
              </div>

              <button
                onClick={this.reportBug}
                className="text-gray-400 hover:text-white transition-colors flex items-center space-x-2 mx-auto"
              >
                <Bug className="w-4 h-4" />
                <span>Report this issue</span>
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {(process.env.NODE_ENV === 'development' || showDetails) && error && (
              <details className="text-left bg-gray-800 rounded-lg p-4 border border-gray-700">
                <summary className="cursor-pointer text-gray-300 font-medium mb-2">
                  Error Details (Development)
                </summary>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="text-red-400 font-medium mb-2">Error Message:</h4>
                    <pre className="text-red-300 whitespace-pre-wrap bg-gray-900 p-3 rounded border border-gray-600 overflow-auto">
                      {error.toString()}
                    </pre>
                  </div>
                  
                  {error.stack && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-2">Stack Trace:</h4>
                      <pre className="text-red-300 whitespace-pre-wrap bg-gray-900 p-3 rounded border border-gray-600 overflow-auto text-xs">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  
                  {errorInfo && errorInfo.componentStack && (
                    <div>
                      <h4 className="text-red-400 font-medium mb-2">Component Stack:</h4>
                      <pre className="text-red-300 whitespace-pre-wrap bg-gray-900 p-3 rounded border border-gray-600 overflow-auto text-xs">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Information */}
            <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-center space-x-2 text-gray-400 text-sm">
                <Mail className="w-4 h-4" />
                <span>Need help? Contact us at support@loveislandcases.com</span>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easy error boundary wrapping
export const withErrorBoundary = (Component, errorBoundaryConfig = {}) => {
  const WrappedComponent = (props) => (
    <ErrorBoundary {...errorBoundaryConfig}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  return WrappedComponent;
};

// Hook for error reporting (can be used in functional components)
export const useErrorHandler = () => {
  const handleError = React.useCallback((error, errorInfo = {}) => {
    // In a real app, this would send to your error reporting service
    console.error('Error reported via useErrorHandler:', error, errorInfo);
    
    if (process.env.NODE_ENV === 'production') {
      // Send to error reporting service
      try {
        fetch('/api/errors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            ...errorInfo,
            timestamp: new Date().toISOString(),
            userAgent: navigator.userAgent,
            url: window.location.href
          })
        });
      } catch (reportingError) {
        console.error('Failed to report error:', reportingError);
      }
    }
  }, []);

  return { handleError };
};

// Simple error fallback component
export const SimpleErrorFallback = ({ error, onRetry }) => (
  <div className="p-8 text-center">
    <AlertTriangle className="w-12 h-12 text-red-400 mx-auto mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">Something went wrong</h3>
    <p className="text-gray-400 mb-4">Please try again or refresh the page.</p>
    <button
      onClick={onRetry}
      className="bg-pink-500 text-white px-4 py-2 rounded-lg hover:bg-pink-600 transition-colors"
    >
      Try Again
    </button>
  </div>
);

export default ErrorBoundary;