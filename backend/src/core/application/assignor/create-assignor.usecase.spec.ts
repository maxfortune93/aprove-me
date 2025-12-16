import { Test, TestingModule } from '@nestjs/testing';
import { CreateAssignorUseCase } from './create-assignor.usecase';
import { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { CreateAssignorDto } from './dto/create-assignor.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { ConflictException } from '@nestjs/common';

describe('CreateAssignorUseCase', () => {
  let useCase: CreateAssignorUseCase;
  let assignorRepository: jest.Mocked<IAssignorRepository>;

  beforeEach(async () => {
   
    const mockAssignorRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByDocument: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateAssignorUseCase,
        {
          provide: TOKENS.IAssignorRepository,
          useValue: mockAssignorRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateAssignorUseCase>(CreateAssignorUseCase);
    assignorRepository = module.get(TOKENS.IAssignorRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createAssignorDto: CreateAssignorDto = {
      document: '12345678901',
      email: 'assignor@example.com',
      phone: '11999999999',
      name: 'Nome do Cedente',
    };

    const mockCreatedAssignor = new Assignor(
      'assignor-uuid-123',
      createAssignorDto.document,
      createAssignorDto.email,
      createAssignorDto.phone,
      createAssignorDto.name,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve criar um assignor com sucesso quando dados são válidos', async () => {
      
      assignorRepository.findByDocument.mockResolvedValue(null);
      assignorRepository.create.mockResolvedValue(mockCreatedAssignor);

      
      const result = await useCase.execute(createAssignorDto);

      
      expect(result).toEqual(mockCreatedAssignor);
      expect(assignorRepository.findByDocument).toHaveBeenCalledWith('12345678901');
      expect(assignorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '',
          document: '12345678901',
          email: 'assignor@example.com',
          phone: '11999999999',
          name: 'Nome do Cedente',
        }),
      );
      expect(assignorRepository.create).toHaveBeenCalledTimes(1);
    });

    it('deve lançar ConflictException quando documento já existe', async () => {
      
      const existingAssignor = new Assignor(
        'existing-uuid',
        '12345678901',
        'existing@example.com',
        '11888888888',
        'Cedente Existente',
      );
      assignorRepository.findByDocument.mockResolvedValue(existingAssignor);

      
      await expect(useCase.execute(createAssignorDto)).rejects.toThrow(
        new ConflictException('Cedente com este documento já existe'),
      );

      
      expect(assignorRepository.findByDocument).toHaveBeenCalledWith('12345678901');
      expect(assignorRepository.findByDocument).toHaveBeenCalledTimes(1);
      expect(assignorRepository.create).not.toHaveBeenCalled();
    });

    it('deve criar assignor com id vazio quando id não fornecido', async () => {
      
      const dtoWithoutId: CreateAssignorDto = {
        ...createAssignorDto,
        id: undefined,
      };
      assignorRepository.findByDocument.mockResolvedValue(null);
      assignorRepository.create.mockResolvedValue(mockCreatedAssignor);

      
      await useCase.execute(dtoWithoutId);

      
      expect(assignorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: '',
        }),
      );
    });

    it('deve criar assignor com id fornecido quando presente no DTO', async () => {
      
      const dtoWithId: CreateAssignorDto = {
        ...createAssignorDto,
        id: 'custom-uuid-456',
      };
      const assignorWithCustomId = new Assignor(
        'custom-uuid-456',
        dtoWithId.document,
        dtoWithId.email,
        dtoWithId.phone,
        dtoWithId.name,
      );
      assignorRepository.findByDocument.mockResolvedValue(null);
      assignorRepository.create.mockResolvedValue(assignorWithCustomId);

      
      const result = await useCase.execute(dtoWithId);

      
      expect(result.id).toBe('custom-uuid-456');
      expect(assignorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'custom-uuid-456',
        }),
      );
    });

    it('deve criar assignor com todos os campos corretos', async () => {
      
      assignorRepository.findByDocument.mockResolvedValue(null);
      assignorRepository.create.mockResolvedValue(mockCreatedAssignor);

      
      await useCase.execute(createAssignorDto);

      
      expect(assignorRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          document: '12345678901',
          email: 'assignor@example.com',
          phone: '11999999999',
          name: 'Nome do Cedente',
        }),
      );
    });
  });
});
