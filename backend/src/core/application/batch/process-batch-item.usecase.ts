import { Injectable, Inject } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import type { BatchJobData } from '../../domain/queue/batch-job.interface';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ProcessBatchItemUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('ProcessBatchItemUseCase');
  }

  async execute(jobData: BatchJobData): Promise<void> {
    this.logger.logWithMetadata(LogLevel.DEBUG, 'Processando item do lote', {
      batchId: jobData.batchId,
      payableId: jobData.payable.id,
      attempt: jobData.attempt || 1,
    });

    const assignor = await this.assignorRepository.findById(
      jobData.payable.assignor,
    );

    if (!assignor) {
      const error = `Assignor com id ${jobData.payable.assignor} não encontrado`;
      this.logger.logWithMetadata(LogLevel.ERROR, error, {
        batchId: jobData.batchId,
        payableId: jobData.payable.id,
      });
      throw new NotFoundException(error);
    }

    const payableEntity = new Payable(
      jobData.payable.id || '',
      jobData.payable.value,
      new Date(jobData.payable.emissionDate),
      assignor.id,
    );

    await this.payableRepository.create(payableEntity);

    this.logger.logWithMetadata(LogLevel.LOG, 'Item processado com sucesso', {
      batchId: jobData.batchId,
      payableId: jobData.payable.id,
    });
  }
}
