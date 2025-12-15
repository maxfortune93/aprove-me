import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProcessBatchItemUseCase } from './process-batch-item.usecase';
import { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { BatchJobData } from '../../domain/queue/batch-job.interface';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('ProcessBatchItemUseCase', () => {
  let useCase: ProcessBatchItemUseCase;
  let payableRepository: jest.Mocked<IPayableRepository>;
  let assignorRepository: jest.Mocked<IAssignorRepository>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockPayableRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const mockAssignorRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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
        ProcessBatchItemUseCase,
        {
          provide: TOKENS.IPayableRepository,
          useValue: mockPayableRepository,
        },
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<ProcessBatchItemUseCase>(ProcessBatchItemUseCase);
    payableRepository = module.get(TOKENS.IPayableRepository);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const batchId = 'batch-uuid-123';
    const assignorId = 'assignor-uuid-123';
    const jobData: BatchJobData = {
      batchId,
      payable: {
        id: 'payable-uuid-456',
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: assignorId,
      },
      totalPayablesInBatch: 10,
    };

    const mockAssignor = new Assignor(
      assignorId,
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome do Cedente',
    );

    const mockPayable = new Payable(
      'payable-uuid-456',
      jobData.payable.value,
      new Date(jobData.payable.emissionDate),
      assignorId,
    );

    it('deve processar item do lote com sucesso', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobData);

      
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'payable-uuid-456',
          value: 1000.50,
          assignorId: assignorId,
        }),
      );
      expect(payableRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não existe', async () => {
      
      assignorRepository.findById.mockResolvedValue(null);

       & Assert
      await expect(useCase.execute(jobData)).rejects.toThrow(
        NotFoundException,
      );
      await expect(useCase.execute(jobData)).rejects.toThrow(
        `Assignor com id ${assignorId} não encontrado`,
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(payableRepository.create).not.toHaveBeenCalled();
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        `Assignor com id ${assignorId} não encontrado`,
        {
          batchId,
          payableId: 'payable-uuid-456',
        },
      );
    });

    it('deve converter emissionDate string para Date', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobData);

      
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          emissionDate: new Date('2024-01-15T00:00:00.000Z'),
        }),
      );
    });

    it('deve usar id vazio quando payable não tem id', async () => {
      
      const jobDataWithoutId: BatchJobData = {
        ...jobData,
        payable: {
          ...jobData.payable,
          id: '',
        },
      };
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobDataWithoutId);

      
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '',
        }),
      );
    });

    it('deve logar início do processamento do item', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobData);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Processando item do lote',
        {
          batchId,
          payableId: 'payable-uuid-456',
          attempt: 1,
        },
      );
    });

    it('deve logar tentativa quando attempt é fornecido', async () => {
      
      const jobDataWithAttempt: BatchJobData = {
        ...jobData,
        attempt: 3,
      };
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobDataWithAttempt);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Processando item do lote',
        {
          batchId,
          payableId: 'payable-uuid-456',
          attempt: 3,
        },
      );
    });

    it('deve logar sucesso após processar item', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobData);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Item processado com sucesso',
        {
          batchId,
          payableId: 'payable-uuid-456',
        },
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(jobData);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'ProcessBatchItemUseCase',
      );
    });
  });
});
