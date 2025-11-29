FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install production dependencies only
RUN npm ci --only=production

# Generate Prisma Client for production
RUN npx prisma generate

# Copy built application
COPY --from=builder /app/dist ./dist

# Create uploads directory
RUN mkdir -p uploads

# Copy migration scripts
COPY scripts ./scripts

# Make scripts executable
RUN chmod +x scripts/run-migrations.sh

# Expose port
EXPOSE 8080

# Create entrypoint script that runs migrations then starts the app
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "🔄 Running database migrations..."' >> /app/entrypoint.sh && \
    echo 'npx prisma migrate deploy || echo "⚠️ Migration failed or already applied"' >> /app/entrypoint.sh && \
    echo 'echo "✅ Starting application..."' >> /app/entrypoint.sh && \
    echo 'exec node dist/src/main.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Start application (runs migrations first)
CMD ["/app/entrypoint.sh"]

