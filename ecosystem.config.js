// Try to load environment variables from .env file if dotenv is available
try {
  require('dotenv').config({ path: './backend/.env' });
} catch (e) {
  // dotenv not available, will rely on system environment variables
  console.log('Note: dotenv not available, using system environment variables');
}

module.exports = {
  apps: [
    {
      name: 'wissen-backend',
      cwd: './backend',
      script: 'node',
      args: 'dist/src/main.js',
      // PM2 will automatically read .env file from cwd (./backend)
      // But we also explicitly pass env vars from process.env as fallback
      env: {
        NODE_ENV: process.env.NODE_ENV || 'production',
        PORT: process.env.PORT || 3001,
        DATABASE_URL: process.env.DATABASE_URL,
        CORS_ORIGIN: process.env.CORS_ORIGIN,
        AWS_REGION: process.env.AWS_REGION,
        AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
        AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
        S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
        CLOUDFRONT_URL: process.env.CLOUDFRONT_URL,
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '500M',
      instances: 1,
      exec_mode: 'fork',
    },
    {
      name: 'wissen-frontend',
      cwd: './frontend',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      autorestart: true,
      max_memory_restart: '1G',
      instances: 1,
      exec_mode: 'fork',
    },
  ],
};

