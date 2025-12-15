import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import type { IQueueService } from '../../domain/queue/queue.service.interface';
import type { BatchJobData } from '../../domain/queue/batch-job.interface';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';
import { CreatePayableDto } from '../payable/dto/create-payable.dto';

@Injectable()
export class CreateBatchUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IQueueService)
    private readonly queueService: IQueueService,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('CreateBatchUseCase');
  }

  async execute(payables: CreatePayableDto[]): Promise<{ batchId: string }> {
    const batchId = uuidv4();
    const totalPayables = payables.length;

    this.logger.logWithMetadata(LogLevel.DEBUG, 'Iniciando criação de lote', {
      batchId,
      totalPayables,
    });

    const queuePromises = payables.map((payable) => {
      const payableId = payable.id || '';

      const jobData: BatchJobData = {
        batchId,
        payable: {
          id: payableId,
          value: payable.value,
          emissionDate: payable.emissionDate,
          assignor: payable.assignor,
        },
        totalPayablesInBatch: totalPayables,
      };

      return this.queueService.enqueue('payable-batch', jobData, {
        attempts: 4,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 50,
      });
    });

    await Promise.all(queuePromises);

    this.logger.logWithMetadata(LogLevel.LOG, 'Lote criado com sucesso', {
      batchId,
      totalPayables,
    });

    return { batchId };
  }
}
