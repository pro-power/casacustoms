// Add this to the TOP of your server.js file, right after require('dotenv').config();

// Environment Variable Validation
const validateEnvironment = () => {
    console.log('🔍 Validating environment variables...');
    
    const requiredEnvVars = {
      // Database
      MONGODB_URI: {
        required: true,
        description: 'MongoDB connection string',
        example: 'mongodb+srv://user:pass@cluster.mongodb.net/dbname'
      },
      
      // Authentication
      JWT_SECRET: {
        required: true,
        description: 'JWT signing secret (min 32 characters)',
        validate: (value) => value && value.length >= 32,
        example: 'your-super-secure-jwt-secret-key-here-min-32-chars'
      },
      
      // Stripe Configuration
      STRIPE_SECRET_KEY: {
        required: true,
        description: 'Stripe secret key (sk_test_ or sk_live_)',
        validate: (value) => value && (value.startsWith('sk_test_') || value.startsWith('sk_live_')),
        example: 'sk_test_... or sk_live_...'
      },
      
      STRIPE_PUBLISHABLE_KEY: {
        required: true,
        description: 'Stripe publishable key (pk_test_ or pk_live_)',
        validate: (value) => value && (value.startsWith('pk_test_') || value.startsWith('pk_live_')),
        example: 'pk_test_... or pk_live_...'
      },
      
      STRIPE_WEBHOOK_SECRET: {
        required: true,
        description: 'Stripe webhook endpoint secret',
        validate: (value) => value && value.startsWith('whsec_'),
        example: 'whsec_...'
      },
      
      // App Configuration
      NODE_ENV: {
        required: false,
        default: 'development',
        validate: (value) => ['development', 'production', 'test'].includes(value),
        description: 'Environment mode (development, production, test)'
      },
      
      PORT: {
        required: false,
        default: '3001',
        validate: (value) => !isNaN(parseInt(value)) && parseInt(value) > 0 && parseInt(value) < 65536,
        description: 'Server port number'
      },
      
      FRONTEND_URL: {
        required: false,
        default: 'http://localhost:5173',
        description: 'Frontend URL for CORS',
        example: 'http://localhost:5173 or https://yourdomain.com'
      }
    };
  
    const errors = [];
    const warnings = [];
    
    // Check each environment variable
    Object.entries(requiredEnvVars).forEach(([key, config]) => {
      const value = process.env[key];
      
      // Required variable missing
      if (config.required && !value) {
        errors.push({
          variable: key,
          issue: 'Missing required environment variable',
          description: config.description,
          example: config.example
        });
        return;
      }
      
      // Set default if not provided
      if (!value && config.default) {
        process.env[key] = config.default;
        warnings.push(`⚠️  Using default value for ${key}: ${config.default}`);
        return;
      }
      
      // Validate value if provided
      if (value && config.validate && !config.validate(value)) {
        errors.push({
          variable: key,
          issue: 'Invalid value format',
          description: config.description,
          example: config.example,
          currentValue: value.length > 20 ? value.substring(0, 20) + '...' : value
        });
      }
    });
  
    // Log warnings
    if (warnings.length > 0) {
      console.log('⚠️  Environment Warnings:');
      warnings.forEach(warning => console.log(`   ${warning}`));
      console.log('');
    }
  
    // Handle errors
    if (errors.length > 0) {
      console.error('❌ Environment Validation Failed:');
      console.error('');
      
      errors.forEach((error, index) => {
        console.error(`${index + 1}. ${error.variable}:`);
        console.error(`   Issue: ${error.issue}`);
        console.error(`   Description: ${error.description}`);
        if (error.example) {
          console.error(`   Example: ${error.example}`);
        }
        if (error.currentValue) {
          console.error(`   Current: ${error.currentValue}`);
        }
        console.error('');
      });
  
      console.error('💡 Create a .env file in your backend folder with these variables.');
      console.error('💡 See the project documentation for complete setup instructions.');
      console.error('');
      
      process.exit(1);
    }
  
    // Success validation
    const isProduction = process.env.NODE_ENV === 'production';
    const isTestMode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_');
    
    console.log('✅ Environment validation passed!');
    console.log(`📍 Environment: ${process.env.NODE_ENV}`);
    console.log(`🏦 Database: ${process.env.MONGODB_URI.includes('localhost') ? 'Local' : 'Remote'}`);
    console.log(`💳 Stripe: ${isTestMode ? 'Test Mode' : 'Live Mode'}`);
    console.log(`🌐 Frontend: ${process.env.FRONTEND_URL}`);
    
    // Production warnings
    if (isProduction && isTestMode) {
      console.warn('⚠️  WARNING: Running in production with Stripe test keys!');
      console.warn('⚠️  Make sure to use live Stripe keys for production.');
    }
    
    if (!isProduction && !isTestMode) {
      console.warn('⚠️  WARNING: Using live Stripe keys in development!');
      console.warn('⚠️  Consider using test keys for development.');
    }
    
    console.log('');
  };
  
  // Export for use in server.js
  module.exports = { validateEnvironment };
  
  // If running this file directly (for testing)
  if (require.main === module) {
    require('dotenv').config();
    validateEnvironment();
  }