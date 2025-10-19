import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'DrivetoSurvive API - Ready to race! 🏎️';
  }
}

