import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { UpdateAssignorUseCase } from './update-assignor.usecase';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('UpdateAssignorUseCase', () => {
  let useCase: UpdateAssignorUseCase;
  let assignorRepository: jest.Mocked<IAssignorRepository>;

  beforeEach(async () => {
    
    const mockAssignorRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateAssignorUseCase,
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateAssignorUseCase>(UpdateAssignorUseCase);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const assignorId = 'assignor-uuid-123';
    const existingAssignor = new Assignor(
      assignorId,
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome Original',
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    const updatedAssignor = new Assignor(
      assignorId,
      '12345678901',
      'novoemail@example.com',
      '11888888888',
      'Nome Atualizado',
      new Date('2024-01-15'),
      new Date('2024-01-16'),
    );

    it('deve atualizar assignor quando encontrado', async () => {
      
      const updateData = {
        email: 'novoemail@example.com',
        phone: '11888888888',
        name: 'Nome Atualizado',
      };
      assignorRepository.findById.mockResolvedValue(existingAssignor);
      assignorRepository.update.mockResolvedValue(updatedAssignor);

      
      const result = await useCase.execute(assignorId, updateData);

      
      expect(result).toEqual(updatedAssignor);
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(assignorRepository.update).toHaveBeenCalledWith(
        assignorId,
        updateData,
      );
      expect(assignorRepository.update).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não existe', async () => {
      
      const updateData = { name: 'Nome Atualizado' };
      assignorRepository.findById.mockResolvedValue(null);

       & Assert
      await expect(useCase.execute(assignorId, updateData)).rejects.toThrow(
        new NotFoundException(`Assignor com id ${assignorId} não encontrado`),
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(assignorRepository.update).not.toHaveBeenCalled();
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      
      const updateData = { name: 'Nome Atualizado' };
      const partiallyUpdatedAssignor = new Assignor(
        assignorId,
        existingAssignor.document,
        existingAssignor.email,
        existingAssignor.phone,
        'Nome Atualizado',
        existingAssignor.createdAt,
        new Date('2024-01-16'),
      );
      assignorRepository.findById.mockResolvedValue(existingAssignor);
      assignorRepository.update.mockResolvedValue(partiallyUpdatedAssignor);

      
      const result = await useCase.execute(assignorId, updateData);

      
      expect(result.name).toBe('Nome Atualizado');
      expect(assignorRepository.update).toHaveBeenCalledWith(
        assignorId,
        updateData,
      );
    });

    it('deve atualizar múltiplos campos simultaneamente', async () => {
      
      const updateData = {
        email: 'novoemail@example.com',
        phone: '11888888888',
        name: 'Nome Atualizado',
      };
      assignorRepository.findById.mockResolvedValue(existingAssignor);
      assignorRepository.update.mockResolvedValue(updatedAssignor);

      
      const result = await useCase.execute(assignorId, updateData);

      
      expect(result.email).toBe('novoemail@example.com');
      expect(result.phone).toBe('11888888888');
      expect(result.name).toBe('Nome Atualizado');
      expect(assignorRepository.update).toHaveBeenCalledWith(
        assignorId,
        updateData,
      );
    });

    it('deve atualizar apenas email quando apenas email é fornecido', async () => {
      
      const updateData = { email: 'novoemail@example.com' };
      const emailUpdatedAssignor = new Assignor(
        assignorId,
        existingAssignor.document,
        'novoemail@example.com',
        existingAssignor.phone,
        existingAssignor.name,
        existingAssignor.createdAt,
        new Date('2024-01-16'),
      );
      assignorRepository.findById.mockResolvedValue(existingAssignor);
      assignorRepository.update.mockResolvedValue(emailUpdatedAssignor);

      
      const result = await useCase.execute(assignorId, updateData);

      
      expect(result.email).toBe('novoemail@example.com');
      expect(result.document).toBe(existingAssignor.document);
      expect(result.phone).toBe(existingAssignor.phone);
      expect(result.name).toBe(existingAssignor.name);
    });
  });
});
