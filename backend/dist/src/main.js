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
const core_1 = require("@nestjs/core");
const path_1 = require("path");
const app_module_1 = require("./app.module");
const app_config_1 = require("./config/app.config");
const express = __importStar(require("express"));
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    const expressApp = app.getHttpAdapter().getInstance();
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
    app.setGlobalPrefix('api');
    app.enableCors({
        origin: app_config_1.config.cors.origin,
        credentials: app_config_1.config.cors.credentials,
    });
    const port = Number(process.env.PORT ?? 3001);
    await app.listen(port, '0.0.0.0');
    console.log(`🚀 Wissen Publication Group API running on http://localhost:${port}/api`);
    console.log(`📁 Files available at http://localhost:${port}/uploads/`);
    console.log(`📁 Files also at http://localhost:${port}/api/uploads/ (via controller)`);
    console.log(`📄 Test file: http://localhost:${port}/uploads/93496f5c3a68fe9e38acee222098f6a6.pdf`);
}
bootstrap();
//# sourceMappingURL=main.js.map