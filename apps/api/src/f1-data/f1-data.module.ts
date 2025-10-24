import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { F1DataService } from './f1-data.service';
import { F1DataController } from './f1-data.controller';

@Module({
  imports: [
    HttpModule.register({
      timeout: 10000,
      maxRedirects: 5,
    }),
  ],
  controllers: [F1DataController],
  providers: [F1DataService],
  exports: [F1DataService],
})
export class F1DataModule {}
