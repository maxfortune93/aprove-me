import { Injectable, Inject } from '@nestjs/common';
import type { IMailService } from '../../domain/mail/mail.service.interface';
import type { BatchResult } from '../../domain/queue/batch-job.interface';
import { generateBatchCompleteEmail } from './templates/batch-email.template';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';

@Injectable()
export class ProcessBatchCompleteUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IMailService)
    private readonly mailService: IMailService,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('ProcessBatchCompleteUseCase');
  }

  async execute(result: BatchResult): Promise<void> {
    this.logger.logWithMetadata(
      LogLevel.LOG,
      'Enviando email de conclusão do lote',
      {
        batchId: result.batchId,
        total: result.total,
        success: result.success,
        failed: result.failed,
      },
    );

    const emailContent = generateBatchCompleteEmail(result);

    const recipientEmail =
      process.env.BATCH_NOTIFICATION_EMAIL || 'operations@aproveme.com';

    await this.mailService.sendMail({
      to: recipientEmail,
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text,
    });

    this.logger.logWithMetadata(LogLevel.LOG, 'Email enviado com sucesso', {
      batchId: result.batchId,
      recipient: recipientEmail,
    });
  }
}
