import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DeleteAssignorUseCase } from './delete-assignor.usecase';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('DeleteAssignorUseCase', () => {
  let useCase: DeleteAssignorUseCase;
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
        DeleteAssignorUseCase,
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteAssignorUseCase>(DeleteAssignorUseCase);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const assignorId = 'assignor-uuid-123';
    const mockAssignor = new Assignor(
      assignorId,
      '12345678901',
      'assignor@example.com',
      '11999999999',
      'Nome do Cedente',
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve deletar assignor quando encontrado', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      assignorRepository.delete.mockResolvedValue(undefined);

      
      await useCase.execute(assignorId);

      
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(assignorRepository.delete).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não existe', async () => {
      
      assignorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor com id ${assignorId} não encontrado`),
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
      expect(assignorRepository.delete).not.toHaveBeenCalled();
    });

    it('deve verificar existência antes de deletar', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      assignorRepository.delete.mockResolvedValue(undefined);

      
      await useCase.execute(assignorId);

      
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.delete).toHaveBeenCalledWith(assignorId);
      
      const findByIdCallOrder = (assignorRepository.findById as jest.Mock).mock.invocationCallOrder[0];
      const deleteCallOrder = (assignorRepository.delete as jest.Mock).mock.invocationCallOrder[0];
      expect(findByIdCallOrder).toBeLessThan(deleteCallOrder);
    });

    it('deve retornar void quando deletado com sucesso', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);
      assignorRepository.delete.mockResolvedValue(undefined);

      
      const result = await useCase.execute(assignorId);

      
      expect(result).toBeUndefined();
    });
  });
});
