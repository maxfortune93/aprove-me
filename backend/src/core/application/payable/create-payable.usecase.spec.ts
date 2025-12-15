import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { CreatePayableUseCase } from './create-payable.usecase';
import { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { CreatePayableDto } from './dto/create-payable.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';

describe('CreatePayableUseCase', () => {
  let useCase: CreatePayableUseCase;
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
        CreatePayableUseCase,
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

    useCase = module.get<CreatePayableUseCase>(CreatePayableUseCase);
    payableRepository = module.get(TOKENS.IPayableRepository);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const assignorId = 'assignor-uuid-123';
    const payableId = 'payable-uuid-456';
    const createPayableDto: CreatePayableDto = {
      value: 1000.50,
      emissionDate: '2024-01-15T00:00:00.000Z',
      assignor: assignorId,
    };

    const mockAssignor = new Assignor(
      assignorId,
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome do Cedente',
    );

    const mockPayable = new Payable(
      payableId,
      createPayableDto.value,
      new Date(createPayableDto.emissionDate),
      assignorId,
      mockAssignor,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve criar um payable com sucesso quando assignor existe', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      const result = await useCase.execute(createPayableDto);

      
      expect(result).toEqual(mockPayable);
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '',
          value: createPayableDto.value,
          assignorId: assignorId,
        }),
      );
      expect(payableRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não existe', async () => {
      
      assignorRepository.findById.mockResolvedValue(null);

       & Assert
      await expect(useCase.execute(createPayableDto)).rejects.toThrow(
        new NotFoundException(
          `Assignor com id ${assignorId} não encontrado`,
        ),
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.create).not.toHaveBeenCalled();
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Tentativa de criar payable com assignor inexistente',
        {
          payableId: 'será gerado pelo Prisma',
          assignorId: assignorId,
        },
      );
    });

    it('deve criar payable com id vazio quando id não fornecido', async () => {
      
      const dtoWithoutId: CreatePayableDto = {
        ...createPayableDto,
        id: undefined,
      };
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(dtoWithoutId);

      
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '',
        }),
      );
    });

    it('deve criar payable com id fornecido quando presente no DTO', async () => {
      
      const dtoWithId: CreatePayableDto = {
        ...createPayableDto,
        id: 'custom-payable-uuid',
      };
      const payableWithCustomId = new Payable(
        'custom-payable-uuid',
        dtoWithId.value,
        new Date(dtoWithId.emissionDate),
        assignorId,
      );
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(payableWithCustomId);

      
      const result = await useCase.execute(dtoWithId);

      
      expect(result.id).toBe('custom-payable-uuid');
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'custom-payable-uuid',
        }),
      );
    });

    it('deve converter emissionDate string para Date', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(createPayableDto);

      
      expect(payableRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          emissionDate: new Date('2024-01-15T00:00:00.000Z'),
        }),
      );
    });

    it('deve logar início do processo de criação', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(createPayableDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Iniciando criação de payable',
        {
          payableId: 'será gerado pelo Prisma',
          assignorId: assignorId,
        },
      );
    });

    it('deve logar validação bem-sucedida do assignor', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(createPayableDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Assignor validado com sucesso',
        {
          assignorId: assignorId,
        },
      );
    });

    it('deve logar criação bem-sucedida do payable', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(createPayableDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Payable criado com sucesso',
        {
          payableId: payableId,
        },
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      payableRepository.create.mockResolvedValue(mockPayable);

      
      await useCase.execute(createPayableDto);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'CreatePayableUseCase',
      );
    });
  });
});
