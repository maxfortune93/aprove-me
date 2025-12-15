import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeletePayableUseCase } from './delete-payable.usecase';
import { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('DeletePayableUseCase', () => {
  let useCase: DeletePayableUseCase;
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
        DeletePayableUseCase,
        {
          provide: TOKENS.IPayableRepository,
          useValue: mockPayableRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeletePayableUseCase>(DeletePayableUseCase);
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

    it('deve deletar payable quando encontrado', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);
      payableRepository.delete.mockResolvedValue(undefined);

      
      await useCase.execute(payableId);

      
      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.delete).toHaveBeenCalledWith(payableId);
      expect(payableRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não existe', async () => {
      
      payableRepository.findById.mockResolvedValue(null);

       & Assert
      await expect(useCase.execute(payableId)).rejects.toThrow(
        new NotFoundException(`Payable com id ${payableId} não encontrado`),
      );

      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.delete).not.toHaveBeenCalled();
    });

    it('deve verificar existência antes de deletar', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);
      payableRepository.delete.mockResolvedValue(undefined);

      
      await useCase.execute(payableId);

      
      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.delete).toHaveBeenCalledWith(payableId);
      
      const findByIdCallOrder = (payableRepository.findById as jest.Mock).mock
        .invocationCallOrder[0];
      const deleteCallOrder = (payableRepository.delete as jest.Mock).mock
        .invocationCallOrder[0];
      expect(findByIdCallOrder).toBeLessThan(deleteCallOrder);
    });

    it('deve retornar void quando deletado com sucesso', async () => {
      
      payableRepository.findById.mockResolvedValue(mockPayable);
      payableRepository.delete.mockResolvedValue(undefined);

      
      const result = await useCase.execute(payableId);

      
      expect(result).toBeUndefined();
    });
  });
});
