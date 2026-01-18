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
   * 
   * Note: For AWS RDS, we typically don't need pgbouncer=true unless using a connection pooler
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
      
      // Check if this is an AWS RDS connection
      // RDS endpoints typically contain .rds.amazonaws.com
      const isRDS = urlObj.hostname.includes('.rds.amazonaws.com');
      
      // For RDS connections, only add pgbouncer if not using SSL or if explicitly needed
      // Most RDS connections use SSL and don't need pgbouncer=true
      if (isRDS) {
        // If sslmode is already set, preserve it and don't add pgbouncer
        // RDS connections work fine without pgbouncer=true
        if (urlObj.searchParams.has('sslmode')) {
          return url; // Return as-is for RDS with SSL
        }
        // If no sslmode but it's RDS, we might still want to add it for compatibility
        // But typically RDS doesn't need pgbouncer=true
        return url;
      }
      
      // For non-RDS connections (like Supabase, localhost, etc.), add pgbouncer=true
      urlObj.searchParams.set('pgbouncer', 'true');
      return urlObj.toString();
    } catch (error) {
      // Fallback to string manipulation if URL parsing fails
      // (e.g., for connection strings with special formats)
      if (url.includes('pgbouncer=true')) {
        return url;
      }
      
      // Check if it's RDS connection (simple string check)
      if (url.includes('.rds.amazonaws.com')) {
        // RDS connections typically don't need pgbouncer=true
        return url;
      }
      
      // For other connections, add pgbouncer=true
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