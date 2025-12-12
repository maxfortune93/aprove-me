import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './modules/health/health.module';
import { LoggerModule } from './shared/logger/logger.module';

@Module({
  imports: [LoggerModule, HealthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
