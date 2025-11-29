import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { config } from './config/app.config';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Get the underlying Express instance
  const expressApp = app.getHttpAdapter().getInstance();
  
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
  
  // Set global prefix for all API routes (this doesn't affect the /uploads route above)
  app.setGlobalPrefix('api');
  
  app.enableCors({
    origin: config.cors.origin,
    credentials: config.cors.credentials,
  });
  
  const port = Number(process.env.PORT ?? 3001);
  await app.listen(port, '0.0.0.0'); // Listen on all interfaces for Cloud Run
  console.log(`🚀 Wissen Publication Group API running on http://localhost:${port}/api`);
  console.log(`📁 Files available at http://localhost:${port}/uploads/`);
  console.log(`📁 Files also at http://localhost:${port}/api/uploads/ (via controller)`);
  console.log(`📄 Test file: http://localhost:${port}/uploads/93496f5c3a68fe9e38acee222098f6a6.pdf`);
}

bootstrap();
