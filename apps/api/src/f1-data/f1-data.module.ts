import { Module } from '@nestjs/common';
import { F1DataController } from './f1-data.controller';
import { F1DataService } from './f1-data.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [F1DataController],
  providers: [F1DataService],
  exports: [F1DataService],
})
export class F1DataModule {}