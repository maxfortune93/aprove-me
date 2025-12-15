import { Module, Global } from '@nestjs/common';
import { BullQueueService } from './bull-queue.service';
import { TOKENS } from '../../../shared/di/tokens';

@Global()
@Module({
  providers: [
    {
      provide: TOKENS.IQueueService,
      useClass: BullQueueService,
    },
  ],
  exports: [TOKENS.IQueueService],
})
export class BullQueueModule {}
