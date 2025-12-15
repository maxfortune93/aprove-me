import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service';
import { Public } from '../../modules/auth/decorators/public.decorator';

@Controller('health')
@Public()
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  async check() {
    return this.healthService.check();
  }

  @Get('liveness')
  liveness() {
    return this.healthService.liveness();
  }

  @Get('readiness')
  async readiness() {
    return this.healthService.readiness();
  }
}
