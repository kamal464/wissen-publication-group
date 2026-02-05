import { config as dotenvConfig } from 'dotenv';
import { join } from 'path';
import { readFileSync, existsSync } from 'fs';

// Load .env so DATABASE_URL is set on server (PM2 may run from backend/ or project root)
dotenvConfig({ path: join(process.cwd(), '.env') });
dotenvConfig({ path: join(process.cwd(), '..', '.env') });
dotenvConfig({ path: join(process.cwd(), 'backend', '.env') });

// Local dev: S3 credentials from prod.env OVERRIDE .env so prod keys are always used for uploads
const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const S3_KEYS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME', 'CLOUDFRONT_URL'];
if (isLocal) {
  const prodPaths = [
    join(process.cwd(), 'prod.env'),
    join(process.cwd(), 'backend', 'prod.env'),
    join(process.cwd(), '..', 'backend', 'prod.env'),
  ];
  for (const p of prodPaths) {
    if (existsSync(p)) {
      const content = readFileSync(p, 'utf8');
      const lines = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
      for (const line of lines) {
        const eq = line.indexOf('=');
        if (eq === -1) continue;
        const key = line.slice(0, eq).trim();
        const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '').trim();
        if (S3_KEYS.includes(key) && val) process.env[key] = val;
      }
      break;
    }
  }
}

import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { config } from './config/app.config';
import { AllExceptionsFilter } from './filters/http-exception.filter';
import * as express from 'express';

// CRITICAL: Register error handlers FIRST before anything else runs
// This ensures the server NEVER stops unexpectedly
process.on('uncaughtException', (error: Error) => {
  console.error('❌ UNCAUGHT EXCEPTION - Logging but NOT exiting:', error.message);
  console.error('Stack:', error.stack);
  // Don't exit - let PM2 handle restart if needed
  // This prevents the server from stopping on unexpected errors
});

process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
  console.error('❌ UNHANDLED REJECTION - Logging but NOT exiting:', reason);
  if (reason instanceof Error) {
    console.error('Stack:', reason.stack);
  }
  // Don't exit - let PM2 handle restart if needed
  // This prevents the server from stopping on unhandled promise rejections
});

// Handle graceful shutdown signals
process.on('SIGTERM', () => {
  console.log('⚠️ SIGTERM received - PM2 will handle graceful shutdown');
});

process.on('SIGINT', () => {
  console.log('⚠️ SIGINT received - PM2 will handle graceful shutdown');
});

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
    
    // Add global exception filter for better error handling
    app.useGlobalFilters(new AllExceptionsFilter());
  
  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  
  // Disable strict routing and trailing slash redirects that cause 308 errors
  expressApp.set('strict routing', false);
  expressApp.set('case sensitive routing', false);

  // Configure body-parser limits to prevent crashes from large requests
  // This prevents "request entity too large" and body-parser errors
  expressApp.use(express.json({ 
    limit: '10mb',
    strict: true,
    type: 'application/json'
  }));
  
  expressApp.use(express.urlencoded({ 
    limit: '10mb',
    extended: true,
    parameterLimit: 1000,
    type: 'application/x-www-form-urlencoded'
  }));

  // Add error handler for body-parser errors
  expressApp.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (err instanceof SyntaxError && 'body' in err) {
      // Log as warn (expected error for malformed requests)
      console.warn('[Body-Parser] Invalid request body:', req.url, err.message);
      return res.status(400).json({ 
        error: 'Invalid request body', 
        message: 'Request body is too large or malformed',
        details: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    }
    if (err.type === 'entity.too.large') {
      // Log as warn (expected error for large requests)
      console.warn('[Body-Parser] Request entity too large:', req.url);
      return res.status(413).json({ 
        error: 'Request entity too large', 
        message: 'Request body exceeds 10MB limit' 
      });
    }
    next(err);
  });
  
  // CRITICAL: Handle OPTIONS at the VERY FIRST Express middleware
  // This MUST run before ANY other middleware, including static files
  // This prevents "Redirect is not allowed for a preflight request" errors
  expressApp.use((req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Intercept OPTIONS requests immediately
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] 🔥 CAUGHT OPTIONS: ${req.method} ${req.url} from ${req.headers.origin || 'no origin'}`);
      
      const allowedOrigins = Array.isArray(config.cors.origin) 
        ? config.cors.origin 
        : [config.cors.origin];
      
      const origin = req.headers.origin as string | undefined;
      const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*');
      
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin || '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', config.cors.credentials ? 'true' : 'false');
        res.setHeader('Access-Control-Max-Age', '86400');
        console.log(`[CORS] ✅ SENDING 200 for OPTIONS: ${req.url}`);
        res.writeHead(200);
        res.end();
        return; // CRITICAL: Stop processing here
      } else {
        console.warn(`[CORS] ⚠️ Blocked OPTIONS from: ${origin}`);
        res.writeHead(403);
        res.end(JSON.stringify({ error: 'Not allowed by CORS' }));
        return;
      }
    }
    next();
  });
  console.log('✅ [CORS] OPTIONS handler registered - FIRST middleware');
  
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
  // Note: Our custom OPTIONS handler above will catch OPTIONS requests first
  // This CORS config handles CORS headers for actual requests (GET, POST, etc.)
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
    preflightContinue: false, // Don't continue to next handler for OPTIONS (but our handler catches it first)
    optionsSuccessStatus: 200, // Return 200 for OPTIONS instead of 204
  });
  
  // Log CORS configuration
  const allowedOrigins = Array.isArray(config.cors.origin) 
    ? config.cors.origin 
    : [config.cors.origin];
  console.log('🌐 CORS enabled for origins:', allowedOrigins.join(', '));
  
  // Set global prefix for all API routes (this doesn't affect the /uploads route above)
  // IMPORTANT: Do this AFTER CORS to ensure CORS applies to all routes
  // Our OPTIONS handler at Express level should catch OPTIONS before this causes redirects
  app.setGlobalPrefix('api', {
    exclude: ['health', 'uploads'], // Exclude health and uploads from /api prefix
  });
  
    // Use port from config (3001 for local dev, 8080 for Cloud Run)
    const port = Number(process.env.PORT || config.app.port);
    console.log(`🔌 Starting server on port ${port}...`);
    
    // Add request timeout to prevent hanging requests
    const server = await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Cloud Run
    
    // Set server timeout to prevent hanging connections (30 seconds)
    server.timeout = 30000;
    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;
    
    console.log(`✅ Wissen Publication Group API running on http://0.0.0.0:${port}/api`);
    console.log(`📁 Files available at http://0.0.0.0:${port}/uploads/`);
    console.log(`🌐 Server is ready and listening on port ${port}`);
    console.log(`💚 Health check available at http://0.0.0.0:${port}/health`);
    console.log(`🛡️ Server timeout: 30s, Keep-alive: 65s (prevents hanging connections)`);
  } catch (error) {
    console.error('❌ Failed to start application:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    // Don't exit immediately - let PM2 handle restart
    // Wait a bit to allow PM2 to detect the failure
    setTimeout(() => {
      process.exit(1);
    }, 10000);
  }
}


bootstrap().catch((error) => {
  console.error('❌ Unhandled error during bootstrap:', error);
  // Don't exit immediately - let PM2 restart
  // Wait a bit then exit to allow PM2 to detect and restart
  setTimeout(() => {
    process.exit(1);
  }, 5000);
});
