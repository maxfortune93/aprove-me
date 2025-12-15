import { Test, TestingModule } from '@nestjs/testing';
import { ProcessBatchCompleteUseCase } from './process-batch-complete.usecase';
import { IMailService } from '../../domain/mail/mail.service.interface';
import { BatchResult } from '../../domain/queue/batch-job.interface';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';

jest.mock('./templates/batch-email.template', () => ({
  generateBatchCompleteEmail: jest.fn((result) => ({
    subject: `Processamento de Lote ${result.batchId} - ${result.success}/${result.total} Sucessos`,
    html: `<html>Batch ${result.batchId} completed</html>`,
    text: `Batch ${result.batchId} completed`,
  })),
}));

describe('ProcessBatchCompleteUseCase', () => {
  let useCase: ProcessBatchCompleteUseCase;
  let mailService: jest.Mocked<IMailService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockMailService = {
      sendMail: jest.fn(),
    };

    const mockLoggerService = {
      createChildLogger: jest.fn().mockReturnThis(),
      logWithMetadata: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessBatchCompleteUseCase,
        {
          provide: TOKENS.IMailService,
          useValue: mockMailService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<ProcessBatchCompleteUseCase>(
      ProcessBatchCompleteUseCase,
    );
    mailService = module.get(TOKENS.IMailService);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.BATCH_NOTIFICATION_EMAIL;
  });

  describe('execute', () => {
    const batchResult: BatchResult = {
      batchId: 'batch-uuid-123',
      total: 10,
      success: 8,
      failed: 2,
      errors: [
        { payableId: 'payable-1', error: 'Assignor não encontrado' },
        { payableId: 'payable-2', error: 'Erro de validação' },
      ],
      processedAt: new Date('2024-01-15'),
    };

    it('deve enviar email de conclusão do lote', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'operations@aproveme.com',
        subject: expect.stringContaining('Processamento de Lote'),
        html: expect.any(String),
        text: expect.any(String),
      });
    });

    it('deve usar email padrão quando variável de ambiente não está definida', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'operations@aproveme.com',
        }),
      );
    });

    it('deve usar email da variável de ambiente quando definida', async () => {
      
      process.env.BATCH_NOTIFICATION_EMAIL = 'custom@example.com';
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'custom@example.com',
        }),
      );
    });

    it('deve logar início do envio de email', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Enviando email de conclusão do lote',
        {
          batchId: 'batch-uuid-123',
          total: 10,
          success: 8,
          failed: 2,
        },
      );
    });

    it('deve logar sucesso do envio de email', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Email enviado com sucesso',
        {
          batchId: 'batch-uuid-123',
          recipient: 'operations@aproveme.com',
        },
      );
    });

    it('deve incluir informações do lote no email', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringMatching(/batch-uuid-123.*8.*10/),
        }),
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await useCase.execute(batchResult);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'ProcessBatchCompleteUseCase',
      );
    });
  });
});
