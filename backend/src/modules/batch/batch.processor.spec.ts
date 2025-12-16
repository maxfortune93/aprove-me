import { Test, TestingModule } from '@nestjs/testing';
import { BatchProcessor } from './batch.processor';
import { IQueueService } from '../../core/domain/queue/queue.service.interface';
import { IMailService } from '../../core/domain/mail/mail.service.interface';
import { ProcessBatchItemUseCase } from '../../core/application/batch/process-batch-item.usecase';
import { ProcessBatchCompleteUseCase } from '../../core/application/batch/process-batch-complete.usecase';
import { BatchJobData, BatchResult } from '../../core/domain/queue/batch-job.interface';
import { TOKENS } from '../../shared/di/tokens';
import { LoggerService } from '../../shared/logger/logger.service';
import { NotFoundException } from '@nestjs/common';

jest.mock('../../core/application/batch/templates/batch-email.template', () => ({
  generateDeadLetterEmail: jest.fn((data) => ({
    subject: `[FILA MORTA] Payable ${data.payableId} - Requer Atenção`,
    html: `<html>DLQ email for ${data.payableId}</html>`,
    text: `DLQ email for ${data.payableId}`,
  })),
}));

describe('BatchProcessor', () => {
  let processor: BatchProcessor;
  let queueService: jest.Mocked<IQueueService>;
  let mailService: jest.Mocked<IMailService>;
  let processBatchItemUseCase: jest.Mocked<ProcessBatchItemUseCase>;
  let processBatchCompleteUseCase: jest.Mocked<ProcessBatchCompleteUseCase>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockQueueService = {
      enqueue: jest.fn(),
      process: jest.fn(),
      getJobStatus: jest.fn(),
      removeJob: jest.fn(),
      cleanQueue: jest.fn(),
    };

    const mockMailService = {
      sendMail: jest.fn(),
    };

    const mockProcessBatchItemUseCase = {
      execute: jest.fn(),
    };

    const mockProcessBatchCompleteUseCase = {
      execute: jest.fn(),
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
        BatchProcessor,
        {
          provide: TOKENS.IQueueService,
          useValue: mockQueueService,
        },
        {
          provide: TOKENS.IMailService,
          useValue: mockMailService,
        },
        {
          provide: ProcessBatchItemUseCase,
          useValue: mockProcessBatchItemUseCase,
        },
        {
          provide: ProcessBatchCompleteUseCase,
          useValue: mockProcessBatchCompleteUseCase,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    processor = module.get<BatchProcessor>(BatchProcessor);
    queueService = module.get(TOKENS.IQueueService);
    mailService = module.get(TOKENS.IMailService);
    processBatchItemUseCase = module.get(ProcessBatchItemUseCase);
    processBatchCompleteUseCase = module.get(ProcessBatchCompleteUseCase);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
    delete process.env.DLQ_NOTIFICATION_EMAIL;
    delete process.env.BATCH_NOTIFICATION_EMAIL;
  });

  describe('onModuleInit', () => {
    it('deve registrar processor para fila payable-batch', () => {
      
      processor.onModuleInit();

      
      expect(queueService.process).toHaveBeenCalledWith(
        'payable-batch',
        expect.any(Function),
        {
          concurrency: 5,
          limiter: {
            max: 100,
            duration: 1000,
          },
        },
      );
    });

    it('deve registrar processor para fila payable-batch-dlq', () => {
      
      processor.onModuleInit();

      
      expect(queueService.process).toHaveBeenCalledWith(
        'payable-batch-dlq',
        expect.any(Function),
        {
          concurrency: 1,
        },
      );
    });

    it('deve logar sucesso na inicialização', () => {
      
      processor.onModuleInit();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Batch processors iniciados',
        {},
      );
    });

    it('deve logar erro quando inicialização falha', () => {
      
      queueService.process.mockImplementation(() => {
        throw new Error('Queue initialization failed');
      });

      
      processor.onModuleInit();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Erro ao inicializar batch processors',
        { error: 'Queue initialization failed' },
      );
    });
  });

  describe('processPayableItem', () => {
    const batchId = 'batch-uuid-123';
    const jobId = 'job-uuid-456';
    const jobData: BatchJobData = {
      batchId,
      payable: {
        id: 'payable-uuid-1',
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid',
      },
      totalPayablesInBatch: 3,
    };

    it('deve processar item com sucesso e incrementar contador de sucesso', async () => {
      
      processBatchItemUseCase.execute.mockResolvedValue(undefined);

      
      await processor['processPayableItem'](jobData, jobId);

      
      expect(processBatchItemUseCase.execute).toHaveBeenCalledWith(jobData);
      expect(processBatchItemUseCase.execute).toHaveBeenCalledTimes(1);
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Item processado',
        {
          batchId,
          payableId: 'payable-uuid-1',
          success: 1,
          total: 3,
          expectedTotal: 3,
        },
      );
    });

    it('deve inicializar resultado do lote quando não existe', async () => {
      
      processBatchItemUseCase.execute.mockResolvedValue(undefined);

      
      await processor['processPayableItem'](jobData, jobId);

      
      const result = processor['batchResults'].get(batchId);
      expect(result).toBeDefined();
      expect(result?.batchId).toBe(batchId);
      expect(result?.total).toBe(3);
      expect(result?.success).toBe(1);
      expect(result?.failed).toBe(0);
      expect(result?.errors).toEqual([]);
    });

    it('deve incrementar contador de falhas quando processamento falha', async () => {
      
      const error = new NotFoundException('Assignor não encontrado');
      processBatchItemUseCase.execute.mockRejectedValue(error);

      await expect(
        processor['processPayableItem'](jobData, jobId),
      ).rejects.toThrow(NotFoundException);

      const result = processor['batchResults'].get(batchId);
      expect(result?.failed).toBe(1);
      expect(result?.success).toBe(0);
      expect(result?.errors).toHaveLength(1);
      expect(result?.errors[0]).toEqual({
        payableId: 'payable-uuid-1',
        error: 'Assignor não encontrado',
      });
    });

    it('deve logar erro quando processamento falha', async () => {
      
      const error = new Error('Erro ao processar');
      processBatchItemUseCase.execute.mockRejectedValue(error);

      
      await expect(
        processor['processPayableItem'](jobData, jobId),
      ).rejects.toThrow();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Erro ao processar item',
        {
          batchId,
          payableId: 'payable-uuid-1',
          error: 'Erro ao processar',
          jobId,
        },
      );
    });

    it('deve verificar conclusão do lote após processar item', async () => {
      
      processBatchItemUseCase.execute.mockResolvedValue(undefined);
      const checkBatchCompleteSpy = jest.spyOn(
        processor as any,
        'checkBatchComplete',
      );

      
      await processor['processPayableItem'](jobData, jobId);

      
      expect(checkBatchCompleteSpy).toHaveBeenCalled();
      checkBatchCompleteSpy.mockRestore();
    });

    it('deve processar múltiplos itens do mesmo lote corretamente', async () => {
      
      processBatchItemUseCase.execute.mockResolvedValue(undefined);
      const jobDataWithMoreItems: BatchJobData = {
        ...jobData,
        totalPayablesInBatch: 5,
      };
      const jobData2: BatchJobData = {
        ...jobDataWithMoreItems,
        payable: {
          ...jobData.payable,
          id: 'payable-uuid-2',
        },
      };
      const jobData3: BatchJobData = {
        ...jobDataWithMoreItems,
        payable: {
          ...jobData.payable,
          id: 'payable-uuid-3',
        },
      };

      
      await processor['processPayableItem'](jobDataWithMoreItems, jobId);
      await processor['processPayableItem'](jobData2, 'job-id-2');
      await processor['processPayableItem'](jobData3, 'job-id-3');

      
      const result = processor['batchResults'].get(batchId);
      expect(result?.success).toBe(3);
      expect(result?.total).toBe(5);
      expect(processBatchItemUseCase.execute).toHaveBeenCalledTimes(3);
    });
  });

  describe('checkBatchComplete', () => {
    const batchId = 'batch-uuid-123';

    it('deve executar ProcessBatchCompleteUseCase quando lote está completo', async () => {
      
      const result: BatchResult = {
        batchId,
        total: 3,
        success: 2,
        failed: 1,
        errors: [{ payableId: 'payable-1', error: 'Erro' }],
        processedAt: new Date(),
      };
      processor['batchResults'].set(batchId, result);
      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['checkBatchComplete'](batchId, result);

      
      expect(processBatchCompleteUseCase.execute).toHaveBeenCalledWith(result);
      expect(processBatchCompleteUseCase.execute).toHaveBeenCalledTimes(1);
      expect(processor['batchResults'].has(batchId)).toBe(false);
    });

    it('deve logar conclusão do lote', async () => {
      
      const result: BatchResult = {
        batchId,
        total: 3,
        success: 3,
        failed: 0,
        errors: [],
        processedAt: new Date(),
      };
      processor['batchResults'].set(batchId, result);
      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['checkBatchComplete'](batchId, result);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Lote concluído',
        {
          batchId,
          total: 3,
          success: 3,
          failed: 0,
        },
      );
    });

    it('deve atualizar processedAt quando lote está completo', async () => {
      
      const result: BatchResult = {
        batchId,
        total: 2,
        success: 1,
        failed: 1,
        errors: [],
        processedAt: new Date('2024-01-01'),
      };
      processor['batchResults'].set(batchId, result);
      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['checkBatchComplete'](batchId, result);

      
      expect(result.processedAt).not.toEqual(new Date('2024-01-01'));
      expect(result.processedAt).toBeInstanceOf(Date);
    });

    it('não deve executar ProcessBatchCompleteUseCase quando lote não está completo', async () => {
      
      const result: BatchResult = {
        batchId,
        total: 3,
        success: 1,
        failed: 0,
        errors: [],
        processedAt: new Date(),
      };
      processor['batchResults'].set(batchId, result);

      
      await processor['checkBatchComplete'](batchId, result);

      
      expect(processBatchCompleteUseCase.execute).not.toHaveBeenCalled();
      expect(processor['batchResults'].has(batchId)).toBe(true);
    });

    it('deve considerar lote completo quando success + failed = total', async () => {
      
      const result: BatchResult = {
        batchId,
        total: 5,
        success: 3,
        failed: 2,
        errors: [],
        processedAt: new Date(),
      };
      processor['batchResults'].set(batchId, result);
      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['checkBatchComplete'](batchId, result);

      
      expect(processBatchCompleteUseCase.execute).toHaveBeenCalled();
      expect(processor['batchResults'].has(batchId)).toBe(false);
    });
  });

  describe('processDeadLetterItem', () => {
    const jobData: BatchJobData = {
      batchId: 'batch-uuid-123',
      payable: {
        id: 'payable-uuid-456',
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid',
      },
      totalPayablesInBatch: 10,
    };

    it('deve enviar email para item da Dead Letter Queue', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(mailService.sendMail).toHaveBeenCalledTimes(1);
      expect(mailService.sendMail).toHaveBeenCalledWith({
        to: 'operations@aproveme.com',
        subject: expect.stringContaining('[FILA MORTA]'),
        html: expect.any(String),
        text: expect.any(String),
      });
    });

    it('deve usar email padrão quando variáveis de ambiente não estão definidas', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'operations@aproveme.com',
        }),
      );
    });

    it('deve usar DLQ_NOTIFICATION_EMAIL quando definida', async () => {
      
      process.env.DLQ_NOTIFICATION_EMAIL = 'dlq@example.com';
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'dlq@example.com',
        }),
      );
    });

    it('deve usar BATCH_NOTIFICATION_EMAIL como fallback quando DLQ_NOTIFICATION_EMAIL não está definida', async () => {
      
      process.env.BATCH_NOTIFICATION_EMAIL = 'batch@example.com';
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          to: 'batch@example.com',
        }),
      );
    });

    it('deve logar início do processamento de item da DLQ', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Processando item da Dead Letter Queue',
        {
          batchId: 'batch-uuid-123',
          payableId: 'payable-uuid-456',
        },
      );
    });

    it('deve logar sucesso do envio de email DLQ', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Email DLQ enviado',
        {
          batchId: 'batch-uuid-123',
          payableId: 'payable-uuid-456',
        },
      );
    });

    it('deve incluir informações corretas no email', async () => {
      
      mailService.sendMail.mockResolvedValue(undefined);

      
      await processor['processDeadLetterItem'](jobData);

      
      expect(mailService.sendMail).toHaveBeenCalledWith(
        expect.objectContaining({
          subject: expect.stringContaining('payable-uuid-456'),
        }),
      );
    });
  });

  describe('integração - fluxo completo', () => {
    it('deve processar lote completo e executar ProcessBatchCompleteUseCase', async () => {
      
      const batchId = 'batch-uuid-complete';
      const jobData1: BatchJobData = {
        batchId,
        payable: {
          id: 'payable-1',
          value: 1000,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid',
        },
        totalPayablesInBatch: 2,
      };
      const jobData2: BatchJobData = {
        batchId,
        payable: {
          id: 'payable-2',
          value: 2000,
          emissionDate: '2024-01-16T00:00:00.000Z',
          assignor: 'assignor-uuid',
        },
        totalPayablesInBatch: 2,
      };

      processBatchItemUseCase.execute.mockResolvedValue(undefined);
      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['processPayableItem'](jobData1, 'job-1');
      await processor['processPayableItem'](jobData2, 'job-2');

      
      expect(processBatchItemUseCase.execute).toHaveBeenCalledTimes(2);
      expect(processBatchCompleteUseCase.execute).toHaveBeenCalledTimes(1);
      expect(processBatchCompleteUseCase.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          batchId,
          total: 2,
          success: 2,
          failed: 0,
        }),
      );
      expect(processor['batchResults'].has(batchId)).toBe(false);
    });

    it('deve processar lote com falhas e executar ProcessBatchCompleteUseCase quando último item processa com sucesso', async () => {
      
      const batchId = 'batch-uuid-with-failures';
      const jobData1: BatchJobData = {
        batchId,
        payable: {
          id: 'payable-1',
          value: 1000,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid',
        },
        totalPayablesInBatch: 3,
      };
      const jobData2: BatchJobData = {
        batchId,
        payable: {
          id: 'payable-2',
          value: 2000,
          emissionDate: '2024-01-16T00:00:00.000Z',
          assignor: 'assignor-uuid',
        },
        totalPayablesInBatch: 3,
      };
      const jobData3: BatchJobData = {
        batchId,
        payable: {
          id: 'payable-3',
          value: 3000,
          emissionDate: '2024-01-17T00:00:00.000Z',
          assignor: 'assignor-uuid',
        },
        totalPayablesInBatch: 3,
      };

      processBatchItemUseCase.execute
        .mockResolvedValueOnce(undefined)
        .mockRejectedValueOnce(new Error('Erro ao processar'))
        .mockResolvedValueOnce(undefined);

      processBatchCompleteUseCase.execute.mockResolvedValue(undefined);

      
      await processor['processPayableItem'](jobData1, 'job-1');
      await expect(
        processor['processPayableItem'](jobData2, 'job-2'),
      ).rejects.toThrow();
      await processor['processPayableItem'](jobData3, 'job-3');

      expect(processBatchCompleteUseCase.execute).toHaveBeenCalled();
    });
  });
});
