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

# Create entrypoint script that starts the app
# Note: Migrations are now run in the GitHub Actions workflow before deployment
RUN echo '#!/bin/sh' > /app/entrypoint.sh && \
    echo 'set -e' >> /app/entrypoint.sh && \
    echo 'echo "🚀 Starting Wissen Publication Group API..."' >> /app/entrypoint.sh && \
    echo 'echo "📊 Environment: ${NODE_ENV}"' >> /app/entrypoint.sh && \
    echo 'echo "🔌 PORT: ${PORT}"' >> /app/entrypoint.sh && \
    echo 'echo "💾 DATABASE_URL: $([ -n "$DATABASE_URL" ] && echo "Set" || echo "Not set")"' >> /app/entrypoint.sh && \
    echo 'exec node dist/src/main.js' >> /app/entrypoint.sh && \
    chmod +x /app/entrypoint.sh

# Start application
# Note: Migrations are handled by GitHub Actions workflow before deployment
CMD ["/app/entrypoint.sh"]

