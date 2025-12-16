import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetPayableUseCase } from './get-payable.usecase';
import { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('GetPayableUseCase', () => {
  let useCase: GetPayableUseCase;
  let payableRepository: jest.Mocked<IPayableRepository>;

  beforeEach(async () => {
    
    const mockPayableRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPayableUseCase,
        {
          provide: TOKENS.IPayableRepository,
          useValue: mockPayableRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetPayableUseCase>(GetPayableUseCase);
    payableRepository = module.get(TOKENS.IPayableRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const payableId = 'payable-uuid-123';
    const assignor = new Assignor(
      'assignor-uuid',
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome do Cedente',
    );
    const mockPayable = new Payable(
      payableId,
      1000.50,
      new Date('2024-01-15'),
      'assignor-uuid',
      assignor,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve retornar payable quando encontrado', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);

      
      const result = await useCase.execute(payableId);

      
      expect(result).toEqual(mockPayable);
      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não existe', async () => {
      
      payableRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(payableId)).rejects.toThrow(
        new NotFoundException(`Payable com id ${payableId} não encontrado`),
      );

      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('deve retornar payable com todos os campos preenchidos', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);

      
      const result = await useCase.execute(payableId);

      
      expect(result).toHaveProperty('id', payableId);
      expect(result).toHaveProperty('value', 1000.50);
      expect(result).toHaveProperty('emissionDate');
      expect(result).toHaveProperty('assignorId', 'assignor-uuid');
      expect(result).toHaveProperty('assignor');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('deve retornar payable com assignor quando incluído', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);

      
      const result = await useCase.execute(payableId);

      
      expect(result.assignor).toBeDefined();
      expect(result.assignor?.id).toBe('assignor-uuid');
      expect(result.assignor?.name).toBe('Nome do Cedente');
    });
  });
});
