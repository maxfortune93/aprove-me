import { Module } from '@nestjs/common';
import { BatchController } from './batch.controller';
import { CreateBatchUseCase } from '../../core/application/batch/create-batch.usecase';
import { ProcessBatchItemUseCase } from '../../core/application/batch/process-batch-item.usecase';
import { ProcessBatchCompleteUseCase } from '../../core/application/batch/process-batch-complete.usecase';
import { BatchProcessor } from './batch.processor';
import { QueueModule } from '../../infra/queue/queue.module';
import { MailModule } from '../../infra/mail/mail.module';
import { PersistenceModule } from '../../infra/persistence/persistence.module';
import { LoggerModule } from '../../shared/logger/logger.module';

@Module({
  imports: [QueueModule, MailModule, PersistenceModule, LoggerModule],
  controllers: [BatchController],
  providers: [
    CreateBatchUseCase,
    ProcessBatchItemUseCase,
    ProcessBatchCompleteUseCase,
    BatchProcessor,
  ],
  exports: [BatchProcessor],
})
export class BatchModule {}
