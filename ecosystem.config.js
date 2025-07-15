module.exports = {
  apps: [
    {
      name: 'casacustoms-backend',
      script: 'backend/server.js',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: '5001'
      },
      env_file: './backend/.env'  // Use the .env file instead
    },
    {
      name: 'casacustoms-frontend',
      script: 'npx',
      args: 'serve -s frontend/dist -p 4000',
      exec_mode: 'fork',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
