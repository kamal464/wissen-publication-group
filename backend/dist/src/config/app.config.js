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
        origin: process.env.CORS_ORIGIN
            ? (process.env.CORS_ORIGIN.includes(',')
                ? process.env.CORS_ORIGIN.split(',').map((o) => o.trim())
                : process.env.CORS_ORIGIN)
            : ['http://localhost:3000', 'http://localhost:3002'],
        credentials: true,
    },
};
//# sourceMappingURL=app.config.js.map