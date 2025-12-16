import { Test, TestingModule } from '@nestjs/testing';
import { CreateBatchUseCase } from './create-batch.usecase';
import { IQueueService } from '../../domain/queue/queue.service.interface';
import { CreatePayableDto } from '../payable/dto/create-payable.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { v4 as uuidv4 } from 'uuid';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-batch-uuid-123'),
}));

describe('CreateBatchUseCase', () => {
  let useCase: CreateBatchUseCase;
  let queueService: jest.Mocked<IQueueService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockQueueService = {
      enqueue: jest.fn(),
      process: jest.fn(),
      getJobStatus: jest.fn(),
      removeJob: jest.fn(),
      cleanQueue: jest.fn(),
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
        CreateBatchUseCase,
        {
          provide: TOKENS.IQueueService,
          useValue: mockQueueService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<CreateBatchUseCase>(CreateBatchUseCase);
    queueService = module.get(TOKENS.IQueueService);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const payables: CreatePayableDto[] = [
      {
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid-1',
      },
      {
        value: 2000.75,
        emissionDate: '2024-01-16T00:00:00.000Z',
        assignor: 'assignor-uuid-2',
      },
    ];

    it('deve criar um lote e enfileirar todos os payables', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id-1');
      (queueService.enqueue as jest.Mock).mockResolvedValueOnce('job-id-1');
      (queueService.enqueue as jest.Mock).mockResolvedValueOnce('job-id-2');

      
      const result = await useCase.execute(payables);

      
      expect(result).toEqual({ batchId: 'mocked-batch-uuid-123' });
      expect(uuidv4).toHaveBeenCalledTimes(1);
      expect(queueService.enqueue).toHaveBeenCalledTimes(2);
      expect(queueService.enqueue).toHaveBeenCalledWith(
        'payable-batch',
        expect.objectContaining({
          batchId: 'mocked-batch-uuid-123',
          payable: {
            id: '',
            value: 1000.50,
            emissionDate: '2024-01-15T00:00:00.000Z',
            assignor: 'assignor-uuid-1',
          },
          totalPayablesInBatch: 2,
        }),
        {
          attempts: 4,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
    });

    it('deve incluir totalPayablesInBatch em cada job', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payables);

      
      expect(queueService.enqueue).toHaveBeenCalledWith(
        'payable-batch',
        expect.objectContaining({
          totalPayablesInBatch: 2,
        }),
        expect.any(Object),
      );
    });

    it('deve usar configurações corretas de retry na fila', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payables);

      
      expect(queueService.enqueue).toHaveBeenCalledWith(
        'payable-batch',
        expect.any(Object),
        {
          attempts: 4,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      );
    });

    it('deve logar início da criação do lote', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payables);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Iniciando criação de lote',
        {
          batchId: 'mocked-batch-uuid-123',
          totalPayables: 2,
        },
      );
    });

    it('deve logar conclusão da criação do lote', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payables);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Lote criado com sucesso',
        {
          batchId: 'mocked-batch-uuid-123',
          totalPayables: 2,
        },
      );
    });

    it('deve processar lote vazio sem erros', async () => {
      
      const emptyPayables: CreatePayableDto[] = [];
      queueService.enqueue.mockResolvedValue('job-id');

      
      const result = await useCase.execute(emptyPayables);

      
      expect(result).toEqual({ batchId: 'mocked-batch-uuid-123' });
      expect(queueService.enqueue).not.toHaveBeenCalled();
    });

    it('deve usar id vazio quando payable não tem id', async () => {
      
      const payablesWithoutId: CreatePayableDto[] = [
        {
          value: 1000.50,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid-1',
        },
      ];
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payablesWithoutId);

      
      expect(queueService.enqueue).toHaveBeenCalledWith(
        'payable-batch',
        expect.objectContaining({
          payable: expect.objectContaining({
            id: '',
          }),
        }),
        expect.any(Object),
      );
    });

    it('deve usar id fornecido quando presente no payable', async () => {
      
      const payablesWithId: CreatePayableDto[] = [
        {
          id: 'custom-payable-uuid',
          value: 1000.50,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid-1',
        },
      ];
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payablesWithId);

      
      expect(queueService.enqueue).toHaveBeenCalledWith(
        'payable-batch',
        expect.objectContaining({
          payable: expect.objectContaining({
            id: 'custom-payable-uuid',
          }),
        }),
        expect.any(Object),
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      queueService.enqueue.mockResolvedValue('job-id');

      
      await useCase.execute(payables);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'CreateBatchUseCase',
      );
    });
  });
});
