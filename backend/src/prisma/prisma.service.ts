import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
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