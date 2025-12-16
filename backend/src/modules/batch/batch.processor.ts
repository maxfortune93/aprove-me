import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import type { IQueueService } from '../../core/domain/queue/queue.service.interface';
import type { IMailService } from '../../core/domain/mail/mail.service.interface';
import { ProcessBatchItemUseCase } from '../../core/application/batch/process-batch-item.usecase';
import { ProcessBatchCompleteUseCase } from '../../core/application/batch/process-batch-complete.usecase';
import type {
  BatchJobData,
  BatchResult,
} from '../../core/domain/queue/batch-job.interface';
import { TOKENS } from '../../shared/di/tokens';
import { LoggerService } from '../../shared/logger/logger.service';
import { LogLevel } from '../../shared/logger/types';
import { generateDeadLetterEmail } from '../../core/application/batch/templates/batch-email.template';

@Injectable()
export class BatchProcessor implements OnModuleInit {
  private readonly logger: LoggerService;
  private batchResults: Map<string, BatchResult> = new Map();

  constructor(
    @Inject(TOKENS.IQueueService)
    private readonly queueService: IQueueService,
    @Inject(TOKENS.IMailService)
    private readonly mailService: IMailService,
    private readonly processBatchItemUseCase: ProcessBatchItemUseCase,
    private readonly processBatchCompleteUseCase: ProcessBatchCompleteUseCase,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('BatchProcessor');
  }

  onModuleInit(): void {
    try {
      this.queueService.process<BatchJobData>(
        'payable-batch',
        async (data, jobId) => {
          await this.processPayableItem(data, jobId);
        },
        {
          concurrency: 5,
          limiter: {
            max: 100,
            duration: 1000,
          },
        },
      );

      this.queueService.process<BatchJobData>(
        'payable-batch-dlq',
        async (data) => {
          await this.processDeadLetterItem(data);
        },
        {
          concurrency: 1,
        },
      );

      this.logger.logWithMetadata(
        LogLevel.LOG,
        'Batch processors iniciados',
        {},
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      this.logger.logWithMetadata(
        LogLevel.ERROR,
        'Erro ao inicializar batch processors',
        { error: errorMessage },
      );
    }
  }

  private async processPayableItem(
    data: BatchJobData,
    jobId: string,
  ): Promise<void> {
    const batchId = data.batchId;
    const expectedTotal = data.totalPayablesInBatch;

    try {
      if (!this.batchResults.has(batchId)) {
        const initialResult: BatchResult = {
          batchId,
          total: expectedTotal,
          success: 0,
          failed: 0,
          errors: [],
          processedAt: new Date(),
        };
        this.batchResults.set(batchId, initialResult);
      }

      const result = this.batchResults.get(batchId)!;

      await this.processBatchItemUseCase.execute(data);

      result.success++;

      this.logger.logWithMetadata(LogLevel.DEBUG, 'Item processado', {
        batchId,
        payableId: data.payable.id,
        success: result.success,
        total: result.total,
        expectedTotal,
      });

      this.checkBatchComplete(batchId, result);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      const result = this.batchResults.get(batchId);
      if (result) {
        result.failed++;
        result.errors.push({
          payableId: data.payable.id,
          error: errorMessage,
        });
      }

      this.logger.logWithMetadata(LogLevel.ERROR, 'Erro ao processar item', {
        batchId,
        payableId: data.payable.id,
        error: errorMessage,
        jobId,
      });

      throw error;
    }
  }

  private async checkBatchComplete(
    batchId: string,
    result: BatchResult,
  ): Promise<void> {
    const expectedTotal = result.total;

    if (result.success + result.failed >= expectedTotal) {
      result.processedAt = new Date();

      this.logger.logWithMetadata(LogLevel.LOG, 'Lote concluído', {
        batchId,
        total: result.total,
        success: result.success,
        failed: result.failed,
      });

      await this.processBatchCompleteUseCase.execute(result);

      this.batchResults.delete(batchId);
    }
  }

  private async processDeadLetterItem(data: BatchJobData): Promise<void> {
    this.logger.logWithMetadata(
      LogLevel.WARN,
      'Processando item da Dead Letter Queue',
      {
        batchId: data.batchId,
        payableId: data.payable.id,
      },
    );

    const emailContent = generateDeadLetterEmail({
      payableId: data.payable.id,
      batchId: data.batchId,
      error: 'Item falhou após 4 tentativas',
      attempts: 4,
    });

    const recipientEmail =
      process.env.DLQ_NOTIFICATION_EMAIL ||
      process.env.BATCH_NOTIFICATION_EMAIL ||
      'operations@aproveme.com';

    await this.mailService.sendMail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    this.logger.logWithMetadata(LogLevel.LOG, 'Email DLQ enviado', {
      batchId: data.batchId,
      payableId: data.payable.id,
    });
  }
}
