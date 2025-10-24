import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { DriversModule } from './drivers/drivers.module';
import { TestModule } from './test/test.module';
import { F1DataModule } from './f1-data/f1-data.module';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
    PrismaModule, 
    DriversModule, 
    TestModule,
    F1DataModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

