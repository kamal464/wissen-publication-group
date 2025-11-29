export const config = {
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
    // Support both string (comma-separated) and array formats
    origin: process.env.CORS_ORIGIN 
      ? (process.env.CORS_ORIGIN.includes(',') 
          ? process.env.CORS_ORIGIN.split(',').map((o: string) => o.trim())
          : process.env.CORS_ORIGIN)
      : ['http://localhost:3000', 'http://localhost:3002'],
    credentials: true,
  },
};