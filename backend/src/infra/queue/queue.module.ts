import { Module } from '@nestjs/common';
import { BullQueueModule } from './bull/bull-queue.module';

@Module({
  imports: [BullQueueModule],
  exports: [BullQueueModule],
})
export class QueueModule {}
