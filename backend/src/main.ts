import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { config } from './config/app.config';
import * as express from 'express';

async function bootstrap() {
  try {
    console.log('🚀 Starting Wissen Publication Group API...');
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔌 PORT: ${process.env.PORT || config.app.port}`);
    console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
    console.log(`🌐 CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'Not set (using defaults)'}`);
    
    console.log('📦 Creating NestJS application...');
    const app = await NestFactory.create<NestExpressApplication>(AppModule, {
      logger: ['error', 'warn', 'log'],
    });
    console.log('✅ NestJS application created');
  
  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Disable strict routing and trailing slash redirects that cause 308 errors
  expressApp.set('strict routing', false);
  expressApp.set('case sensitive routing', false);
  
  // IMPORTANT: Serve static files BEFORE setting global prefix
  // This ensures /uploads/ routes work without /api prefix
  const uploadsPath = join(process.cwd(), 'uploads');
  const uploadsPathDist = join(__dirname, '..', 'uploads');
  
  console.log(`[Main] Uploads path (cwd): ${uploadsPath}`);
  console.log(`[Main] Uploads path (dist): ${uploadsPathDist}`);
  
  // Use Express static middleware directly - try both paths
  const staticOptions = {
    setHeaders: (res: express.Response, path: string) => {
      // Set proper headers for file downloads
      const ext = path.split('.').pop()?.toLowerCase();
      const contentTypeMap: { [key: string]: string } = {
        'pdf': 'application/pdf',
        'doc': 'application/msword',
        'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'png': 'image/png',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
      };
      const contentType = contentTypeMap[ext || ''] || 'application/octet-stream';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
  };
  
  // Try process.cwd() first (development)
  const fs = require('fs');
  if (fs.existsSync(uploadsPath)) {
    console.log(`[Main] ✅ Using uploads path: ${uploadsPath}`);
    expressApp.use('/uploads', express.static(uploadsPath, staticOptions));
    console.log(`[Main] ✅ Static file serving enabled for /uploads/`);
  }
  // Fallback to dist path (production)
  else if (fs.existsSync(uploadsPathDist)) {
    console.log(`[Main] ✅ Using uploads path: ${uploadsPathDist}`);
    expressApp.use('/uploads', express.static(uploadsPathDist, staticOptions));
    console.log(`[Main] ✅ Static file serving enabled for /uploads/`);
  } else {
    console.error(`[Main] ❌ WARNING: Uploads directory not found!`);
    console.error(`[Main] Tried: ${uploadsPath}`);
    console.error(`[Main] Tried: ${uploadsPathDist}`);
    console.error(`[Main] Current working directory: ${process.cwd()}`);
    console.error(`[Main] __dirname: ${__dirname}`);
  }
  
  // CORS is already enabled globally, so OPTIONS requests are handled automatically
  // No need for explicit OPTIONS handler here
  
  // Also use NestJS static assets as additional fallback
  if (require('fs').existsSync(uploadsPath)) {
    app.useStaticAssets(uploadsPath, {
      prefix: '/uploads/',
      index: false,
    });
  } else if (require('fs').existsSync(uploadsPathDist)) {
    app.useStaticAssets(uploadsPathDist, {
      prefix: '/uploads/',
      index: false,
    });
  }
  
  // Enable CORS BEFORE setting global prefix to ensure it applies to all routes
  // Enable CORS with proper configuration to handle preflight requests
  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }
      
      const allowedOrigins = Array.isArray(config.cors.origin) 
        ? config.cors.origin 
        : [config.cors.origin];
      
      if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        callback(null, true);
      } else {
        console.warn(`⚠️ CORS: Blocked origin: ${origin}`);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: config.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
    exposedHeaders: ['Content-Type', 'Authorization'],
    preflightContinue: false, // Don't continue to next handler for OPTIONS
    optionsSuccessStatus: 200, // Return 200 for OPTIONS instead of 204
  });
  
  // Log CORS configuration
  const allowedOrigins = Array.isArray(config.cors.origin) 
    ? config.cors.origin 
    : [config.cors.origin];
  console.log('🌐 CORS enabled for origins:', allowedOrigins.join(', '));
  
  // Set global prefix for all API routes (this doesn't affect the /uploads route above)
  // IMPORTANT: Do this AFTER CORS to ensure CORS applies to all routes
  app.setGlobalPrefix('api', {
    exclude: ['health', 'uploads'], // Exclude health and uploads from /api prefix
  });
  
    // Use port from config (3001 for local dev, 8080 for Cloud Run)
    const port = Number(process.env.PORT || config.app.port);
    console.log(`🔌 Starting server on port ${port}...`);
    await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Cloud Run
    console.log(`✅ Wissen Publication Group API running on http://0.0.0.0:${port}/api`);
    console.log(`📁 Files available at http://0.0.0.0:${port}/uploads/`);
    console.log(`🌐 Server is ready and listening on port ${port}`);
    console.log(`💚 Health check available at http://0.0.0.0:${port}/health`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    process.exit(1);
  }
}

bootstrap().catch((error) => {
  console.error('❌ Unhandled error during bootstrap:', error);
  process.exit(1);
});
