"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = require("dotenv");
const path_1 = require("path");
const fs_1 = require("fs");
(0, dotenv_1.config)({ path: (0, path_1.join)(process.cwd(), '.env') });
(0, dotenv_1.config)({ path: (0, path_1.join)(process.cwd(), '..', '.env') });
(0, dotenv_1.config)({ path: (0, path_1.join)(process.cwd(), 'backend', '.env') });
const isLocal = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
const S3_KEYS = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION', 'S3_BUCKET_NAME', 'CLOUDFRONT_URL'];
if (isLocal) {
    const prodPaths = [
        (0, path_1.join)(process.cwd(), 'prod.env'),
        (0, path_1.join)(process.cwd(), 'backend', 'prod.env'),
        (0, path_1.join)(process.cwd(), '..', 'backend', 'prod.env'),
    ];
    for (const p of prodPaths) {
        if ((0, fs_1.existsSync)(p)) {
            const content = (0, fs_1.readFileSync)(p, 'utf8');
            const lines = content.split('\n').filter((l) => l.trim() && !l.trim().startsWith('#'));
            for (const line of lines) {
                const eq = line.indexOf('=');
                if (eq === -1)
                    continue;
                const key = line.slice(0, eq).trim();
                const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '').trim();
                if (S3_KEYS.includes(key) && val)
                    process.env[key] = val;
            }
            break;
        }
    }
}
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const app_config_1 = require("./config/app.config");
const http_exception_filter_1 = require("./filters/http-exception.filter");
const express = __importStar(require("express"));
process.on('uncaughtException', (error) => {
    console.error('❌ UNCAUGHT EXCEPTION - Logging but NOT exiting:', error.message);
    console.error('Stack:', error.stack);
});
process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ UNHANDLED REJECTION - Logging but NOT exiting:', reason);
    if (reason instanceof Error) {
        console.error('Stack:', reason.stack);
    }
});
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
        console.log(`🔌 PORT: ${process.env.PORT || app_config_1.config.app.port}`);
        console.log(`💾 DATABASE_URL: ${process.env.DATABASE_URL ? 'Set' : 'Not set'}`);
        console.log(`🌐 CORS_ORIGIN: ${process.env.CORS_ORIGIN || 'Not set (using defaults)'}`);
        console.log('📦 Creating NestJS application...');
        const app = await core_1.NestFactory.create(app_module_1.AppModule, {
            logger: ['error', 'warn', 'log'],
        });
        console.log('✅ NestJS application created');
        app.useGlobalFilters(new http_exception_filter_1.AllExceptionsFilter());
        const expressApp = app.getHttpAdapter().getInstance();
        expressApp.set('strict routing', false);
        expressApp.set('case sensitive routing', false);
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
        expressApp.use((err, req, res, next) => {
            if (err instanceof SyntaxError && 'body' in err) {
                console.warn('[Body-Parser] Invalid request body:', req.url, err.message);
                return res.status(400).json({
                    error: 'Invalid request body',
                    message: 'Request body is too large or malformed',
                    details: process.env.NODE_ENV === 'development' ? err.message : undefined
                });
            }
            if (err.type === 'entity.too.large') {
                console.warn('[Body-Parser] Request entity too large:', req.url);
                return res.status(413).json({
                    error: 'Request entity too large',
                    message: 'Request body exceeds 10MB limit'
                });
            }
            next(err);
        });
        expressApp.use((req, res, next) => {
            if (req.method === 'OPTIONS') {
                console.log(`[CORS] 🔥 CAUGHT OPTIONS: ${req.method} ${req.url} from ${req.headers.origin || 'no origin'}`);
                const allowedOrigins = Array.isArray(app_config_1.config.cors.origin)
                    ? app_config_1.config.cors.origin
                    : [app_config_1.config.cors.origin];
                const origin = req.headers.origin;
                const isAllowed = !origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*');
                if (isAllowed) {
                    res.setHeader('Access-Control-Allow-Origin', origin || '*');
                    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
                    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
                    res.setHeader('Access-Control-Allow-Credentials', app_config_1.config.cors.credentials ? 'true' : 'false');
                    res.setHeader('Access-Control-Max-Age', '86400');
                    console.log(`[CORS] ✅ SENDING 200 for OPTIONS: ${req.url}`);
                    res.writeHead(200);
                    res.end();
                    return;
                }
                else {
                    console.warn(`[CORS] ⚠️ Blocked OPTIONS from: ${origin}`);
                    res.writeHead(403);
                    res.end(JSON.stringify({ error: 'Not allowed by CORS' }));
                    return;
                }
            }
            next();
        });
        console.log('✅ [CORS] OPTIONS handler registered - FIRST middleware');
        const uploadsPath = (0, path_1.join)(process.cwd(), 'uploads');
        const uploadsPathDist = (0, path_1.join)(__dirname, '..', 'uploads');
        console.log(`[Main] Uploads path (cwd): ${uploadsPath}`);
        console.log(`[Main] Uploads path (dist): ${uploadsPathDist}`);
        const staticOptions = {
            setHeaders: (res, path) => {
                const ext = path.split('.').pop()?.toLowerCase();
                const contentTypeMap = {
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
        const fs = require('fs');
        if (fs.existsSync(uploadsPath)) {
            console.log(`[Main] ✅ Using uploads path: ${uploadsPath}`);
            expressApp.use('/uploads', express.static(uploadsPath, staticOptions));
            console.log(`[Main] ✅ Static file serving enabled for /uploads/`);
        }
        else if (fs.existsSync(uploadsPathDist)) {
            console.log(`[Main] ✅ Using uploads path: ${uploadsPathDist}`);
            expressApp.use('/uploads', express.static(uploadsPathDist, staticOptions));
            console.log(`[Main] ✅ Static file serving enabled for /uploads/`);
        }
        else {
            console.error(`[Main] ❌ WARNING: Uploads directory not found!`);
            console.error(`[Main] Tried: ${uploadsPath}`);
            console.error(`[Main] Tried: ${uploadsPathDist}`);
            console.error(`[Main] Current working directory: ${process.cwd()}`);
            console.error(`[Main] __dirname: ${__dirname}`);
        }
        if (require('fs').existsSync(uploadsPath)) {
            app.useStaticAssets(uploadsPath, {
                prefix: '/uploads/',
                index: false,
            });
        }
        else if (require('fs').existsSync(uploadsPathDist)) {
            app.useStaticAssets(uploadsPathDist, {
                prefix: '/uploads/',
                index: false,
            });
        }
        app.enableCors({
            origin: (origin, callback) => {
                if (!origin) {
                    return callback(null, true);
                }
                const allowedOrigins = Array.isArray(app_config_1.config.cors.origin)
                    ? app_config_1.config.cors.origin
                    : [app_config_1.config.cors.origin];
                if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
                    callback(null, true);
                }
                else {
                    console.warn(`⚠️ CORS: Blocked origin: ${origin}`);
                    callback(new Error('Not allowed by CORS'));
                }
            },
            credentials: app_config_1.config.cors.credentials,
            methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
            allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
            exposedHeaders: ['Content-Type', 'Authorization'],
            preflightContinue: false,
            optionsSuccessStatus: 200,
        });
        const allowedOrigins = Array.isArray(app_config_1.config.cors.origin)
            ? app_config_1.config.cors.origin
            : [app_config_1.config.cors.origin];
        console.log('🌐 CORS enabled for origins:', allowedOrigins.join(', '));
        app.setGlobalPrefix('api', {
            exclude: ['health', 'uploads'],
        });
        const port = Number(process.env.PORT || app_config_1.config.app.port);
        console.log(`🔌 Starting server on port ${port}...`);
        const server = await app.listen(port, '0.0.0.0');
        server.timeout = 30000;
        server.keepAliveTimeout = 65000;
        server.headersTimeout = 66000;
        console.log(`✅ Wissen Publication Group API running on http://0.0.0.0:${port}/api`);
        console.log(`📁 Files available at http://0.0.0.0:${port}/uploads/`);
        console.log(`🌐 Server is ready and listening on port ${port}`);
        console.log(`💚 Health check available at http://0.0.0.0:${port}/health`);
        console.log(`🛡️ Server timeout: 30s, Keep-alive: 65s (prevents hanging connections)`);
    }
    catch (error) {
        console.error('❌ Failed to start application:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        setTimeout(() => {
            process.exit(1);
        }, 10000);
    }
}
bootstrap().catch((error) => {
    console.error('❌ Unhandled error during bootstrap:', error);
    setTimeout(() => {
        process.exit(1);
    }, 5000);
});
//# sourceMappingURL=main.js.map