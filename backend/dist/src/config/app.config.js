"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    app: {
        name: 'Wissen Publication Group API',
        version: '1.0.0',
        env: process.env.NODE_ENV || 'development',
        port: process.env.PORT || 3001,
    },
    database: {
        url: process.env.DATABASE_URL,
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'your-secret-key',
        expiresIn: '1d',
    },
    cors: {
        origin: (() => {
            const fromEnv = process.env.CORS_ORIGIN
                ? (process.env.CORS_ORIGIN.includes(',')
                    ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim()).filter(Boolean)
                    : [process.env.CORS_ORIGIN.trim()])
                : [];
            const isDev = !process.env.NODE_ENV || process.env.NODE_ENV === 'development';
            const localOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:3002', 'http://127.0.0.1:3002'];
            const combined = isDev ? [...new Set([...localOrigins, ...fromEnv])] : (fromEnv.length ? fromEnv : localOrigins);
            return combined.length ? combined : ['http://localhost:3000'];
        })(),
        credentials: true,
    },
};
//# sourceMappingURL=app.config.js.map