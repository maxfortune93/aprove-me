import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdatePayableUseCase } from './update-payable.usecase';
import { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('UpdatePayableUseCase', () => {
  let useCase: UpdatePayableUseCase;
  let payableRepository: jest.Mocked<IPayableRepository>;
  let assignorRepository: jest.Mocked<IAssignorRepository>;

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

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdatePayableUseCase,
        {
          provide: TOKENS.IPayableRepository,
          useValue: mockPayableRepository,
        },
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdatePayableUseCase>(UpdatePayableUseCase);
    payableRepository = module.get(TOKENS.IPayableRepository);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const payableId = 'payable-uuid-123';
    const existingAssignor = new Assignor(
      'assignor-uuid-123',
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome Original',
    );
    const existingPayable = new Payable(
      payableId,
      1000.50,
      new Date('2024-01-15'),
      'assignor-uuid-123',
      existingAssignor,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    const newAssignor = new Assignor(
      'assignor-uuid-456',
      '98765432100',
      'novoassignor@example.com',
      '11888888888',
      'Novo Cedente',
    );

    const updatedPayable = new Payable(
      payableId,
      2000.75,
      new Date('2024-01-16'),
      'assignor-uuid-456',
      newAssignor,
      new Date('2024-01-15'),
      new Date('2024-01-16'),
    );

    it('deve atualizar payable quando encontrado', async () => {
      
      const updateData = {
        value: 2000.75,
        emissionDate: new Date('2024-01-16'),
      };
      payableRepository.findById.mockResolvedValue(existingPayable);
      payableRepository.update.mockResolvedValue(updatedPayable);

      
      const result = await useCase.execute(payableId, updateData);

      
      expect(result).toEqual(updatedPayable);
      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.update).toHaveBeenCalledWith(
        payableId,
        updateData,
      );
      expect(payableRepository.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando payable não existe', async () => {
      
      const updateData = { value: 2000.75 };
      payableRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(payableId, updateData)).rejects.toThrow(
        new NotFoundException(`Payable com id ${payableId} não encontrado`),
      );

      expect(payableRepository.findById).toHaveBeenCalledWith(payableId);
      expect(payableRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.update).not.toHaveBeenCalled();
    });

    it('deve validar assignor quando assignorId é fornecido', async () => {
      
      const updateData = { assignorId: 'assignor-uuid-456' };
      payableRepository.findById.mockResolvedValue(existingPayable);
      assignorRepository.findById.mockResolvedValue(newAssignor);
      const payableWithNewAssignor = new Payable(
        payableId,
        existingPayable.value,
        existingPayable.emissionDate,
        'assignor-uuid-456',
        newAssignor,
      );
      payableRepository.update.mockResolvedValue(payableWithNewAssignor);

      
      const result = await useCase.execute(payableId, updateData);

      
      expect(assignorRepository.findById).toHaveBeenCalledWith(
        'assignor-uuid-456',
      );
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(payableRepository.update).toHaveBeenCalledWith(
        payableId,
        updateData,
      );
      expect(result.assignorId).toBe('assignor-uuid-456');
    });

    it('deve lançar NotFoundException quando assignor não existe no update', async () => {
      
      const updateData = { assignorId: 'non-existent-assignor' };
      payableRepository.findById.mockResolvedValue(existingPayable);
      assignorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(payableId, updateData)).rejects.toThrow(
        new NotFoundException(
          `Assignor com id non-existent-assignor não encontrado`,
        ),
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(
        'non-existent-assignor',
      );
      expect(payableRepository.update).not.toHaveBeenCalled();
    });

    it('deve atualizar apenas campos fornecidos sem validar assignor', async () => {
      
      const updateData = { value: 2000.75 };
      const partiallyUpdatedPayable = new Payable(
        payableId,
        2000.75,
        existingPayable.emissionDate,
        existingPayable.assignorId,
        existingAssignor,
        existingPayable.createdAt,
        new Date('2024-01-16'),
      );
      payableRepository.findById.mockResolvedValue(existingPayable);
      payableRepository.update.mockResolvedValue(partiallyUpdatedPayable);

      
      const result = await useCase.execute(payableId, updateData);

      
      expect(result.value).toBe(2000.75);
      expect(assignorRepository.findById).not.toHaveBeenCalled();
      expect(payableRepository.update).toHaveBeenCalledWith(
        payableId,
        updateData,
      );
    });

    it('deve atualizar múltiplos campos simultaneamente', async () => {
      
      const updateData = {
        value: 2000.75,
        emissionDate: new Date('2024-01-16'),
        assignorId: 'assignor-uuid-456',
      };
      payableRepository.findById.mockResolvedValue(existingPayable);
      assignorRepository.findById.mockResolvedValue(newAssignor);
      payableRepository.update.mockResolvedValue(updatedPayable);

      
      const result = await useCase.execute(payableId, updateData);

      
      expect(result.value).toBe(2000.75);
      expect(result.assignorId).toBe('assignor-uuid-456');
      expect(assignorRepository.findById).toHaveBeenCalledWith(
        'assignor-uuid-456',
      );
      expect(payableRepository.update).toHaveBeenCalledWith(
        payableId,
        updateData,
      );
    });
  });
});
