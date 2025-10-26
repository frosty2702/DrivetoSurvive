import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database');
    } catch (error: any) {
      this.logger.warn(`Failed to connect to database: ${error?.message || 'Unknown error'}`);
      // In serverless environments, connection might fail - that's okay for now
      if (process.env.VERCEL_ENV) {
        this.logger.warn('Running in Vercel - database connection skipped (SQLite not supported in serverless)');
      }
    }
  }

  async onModuleDestroy() {
    try {
      await this.$disconnect();
    } catch (error: any) {
      this.logger.warn(`Error disconnecting from database: ${error?.message || 'Unknown error'}`);
    }
  }
}

