import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/app.config';

@Injectable()
export class CorsOptionsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // Handle OPTIONS requests immediately, before any routing or redirects
    if (req.method === 'OPTIONS') {
      console.log(`[CORS] Handling OPTIONS request for: ${req.url} from origin: ${req.headers.origin || 'none'}`);
      
      const allowedOrigins = Array.isArray(config.cors.origin) 
        ? config.cors.origin 
        : [config.cors.origin];
      
      const origin = req.headers.origin as string | undefined;
      
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
        console.log(`[CORS] ✅ OPTIONS handled (no origin): ${req.url}`);
        return res.status(200).end();
      }
      
      // Check if origin is allowed
      const isAllowed = allowedOrigins.includes(origin) || allowedOrigins.includes('*');
      
      if (isAllowed) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.setHeader('Access-Control-Allow-Credentials', config.cors.credentials ? 'true' : 'false');
        res.setHeader('Access-Control-Max-Age', '86400'); // 24 hours
        console.log(`[CORS] ✅ OPTIONS handled (allowed origin): ${req.url} from ${origin}`);
        return res.status(200).end();
      } else {
        console.warn(`⚠️ CORS: Blocked OPTIONS request from origin: ${origin} for ${req.url}`);
        return res.status(403).json({ error: 'Not allowed by CORS' });
      }
    }
    next();
  }
}
