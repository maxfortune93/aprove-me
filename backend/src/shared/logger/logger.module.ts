import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LogLevel } from './types';

@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useFactory: () => {
        return new LoggerService({
          context: 'AproveMe',
          level: LogLevel.VERBOSE,
          json: false,
          timestamp: true,
          showContext: true,
          isoTimestamp: true,
        });
      },
    },
  ],
  exports: [LoggerService],
})
export class LoggerModule {}
