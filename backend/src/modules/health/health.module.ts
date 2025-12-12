import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { PrismaModule } from '../../infra/persistence/prisma/prisma.module';
import { LoggerModule } from '../../shared/logger/logger.module';

@Module({
  imports: [PrismaModule, LoggerModule],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
