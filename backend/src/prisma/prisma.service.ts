import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);
  private modifiedUrl: string | undefined;

  constructor() {
    const originalUrl = process.env.DATABASE_URL;
    const modifiedUrl = originalUrl
      ? PrismaService.ensurePgbouncerCompatibility(originalUrl)
      : undefined;
    
    super({
      datasources: {
        db: {
          url: modifiedUrl,
        },
      },
    });
    
    // Store for logging in onModuleInit (after super() call)
    this.modifiedUrl = modifiedUrl;
  }

  /**
   * Ensures the connection string is compatible with PgBouncer (connection pooler)
   * by adding ?pgbouncer=true which disables prepared statements
   * This fixes the "prepared statement does not exist" error
   */
  private static ensurePgbouncerCompatibility(url: string): string {
    if (!url) return url;
    
    try {
      // Use URL parsing to properly handle query parameters
      const urlObj = new URL(url);
      
      // Check if pgbouncer=true is already present
      if (urlObj.searchParams.has('pgbouncer')) {
        return url;
      }
      
      // Add pgbouncer=true parameter
      urlObj.searchParams.set('pgbouncer', 'true');
      return urlObj.toString();
    } catch (error) {
      // Fallback to string manipulation if URL parsing fails
      // (e.g., for connection strings with special formats)
      if (url.includes('pgbouncer=true')) {
        return url;
      }
      if (url.includes('?')) {
        return `${url}&pgbouncer=true`;
      }
      return `${url}?pgbouncer=true`;
    }
  }

  async onModuleInit() {
    try {
      // Log the modification for debugging (without exposing password)
      const originalUrl = process.env.DATABASE_URL;
      if (originalUrl && this.modifiedUrl && this.modifiedUrl !== originalUrl) {
        const sanitizedUrl = originalUrl.replace(/:[^:@]+@/, ':****@');
        this.logger.log(`🔧 Modified DATABASE_URL for PgBouncer compatibility`);
      }
      
      await this.$connect();
      this.logger.log('✅ Database connected successfully');
    } catch (error) {
      this.logger.error('❌ Failed to connect to database:', error);
      this.logger.warn('⚠️ Application will continue but database operations may fail');
      // Don't throw - allow app to start even if DB connection fails
      // The app can retry connections on first use
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}