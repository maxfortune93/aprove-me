import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { GetAssignorUseCase } from './get-assignor.usecase';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

describe('GetAssignorUseCase', () => {
  let useCase: GetAssignorUseCase;
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
        GetAssignorUseCase,
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetAssignorUseCase>(GetAssignorUseCase);
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

    it('deve retornar assignor quando encontrado', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);

      
      const result = await useCase.execute(assignorId);

      
      expect(result).toEqual(mockAssignor);
      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('deve lançar NotFoundException quando assignor não existe', async () => {
      
      assignorRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(assignorId)).rejects.toThrow(
        new NotFoundException(`Assignor com id ${assignorId} não encontrado`),
      );

      expect(assignorRepository.findById).toHaveBeenCalledWith(assignorId);
      expect(assignorRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('deve retornar assignor com todos os campos preenchidos', async () => {
      
      assignorRepository.findById.mockResolvedValue(mockAssignor);

      
      const result = await useCase.execute(assignorId);

      
      expect(result).toHaveProperty('id', assignorId);
      expect(result).toHaveProperty('document', '12345678901');
      expect(result).toHaveProperty('email', 'assignor@example.com');
      expect(result).toHaveProperty('phone', '11999999999');
      expect(result).toHaveProperty('name', 'Nome do Cedente');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });
  });
});
