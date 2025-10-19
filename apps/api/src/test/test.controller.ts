import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('test')
export class TestController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async test() {
    try {
      const driverCount = await this.prisma.driver.count();
      const teamCount = await this.prisma.team.count();
      return {
        message: 'Database connection successful',
        driverCount,
        teamCount,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        error: 'Database connection failed',
        details: error.message
      };
    }
  }
}

