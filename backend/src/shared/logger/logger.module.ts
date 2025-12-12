import { Module, Global } from '@nestjs/common';
import { LoggerService } from './logger.service';
import { LogLevel } from './types';

@Global()
@Module({
  providers: [
    {
      provide: LoggerService,
      useFactory: () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const logLevel =
          (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) ||
          (isProduction ? LogLevel.LOG : LogLevel.DEBUG);
        const logFormat =
          process.env.LOG_FORMAT || (isProduction ? 'json' : 'color');

        return new LoggerService({
          context: 'AproveMe',
          level: logLevel,
          json: logFormat === 'json',
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
