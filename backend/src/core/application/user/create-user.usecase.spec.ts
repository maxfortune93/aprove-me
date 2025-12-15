import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException } from '@nestjs/common';
import { CreateUserUseCase } from './create-user.usecase';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';


jest.mock('bcryptjs');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockUserRepository = {
      create: jest.fn(),
      findByLogin: jest.fn(),
      findById: jest.fn(),
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
        CreateUserUseCase,
        {
          provide: TOKENS.IUserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<CreateUserUseCase>(CreateUserUseCase);
    userRepository = module.get(TOKENS.IUserRepository);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const createUserDto: CreateUserDto = {
      login: 'novousuario',
      password: 'senha123',
    };

    const hashedPassword = '$2a$10$hashedpassword';
    const mockCreatedUser = new User(
      'mocked-uuid-123',
      'novousuario',
      hashedPassword,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve criar um usuário com sucesso quando login não existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      const result = await useCase.execute(createUserDto);

      
      expect(result).toEqual({
        id: 'mocked-uuid-123',
        login: 'novousuario',
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(result).not.toHaveProperty('password');
      expect(userRepository.findByLogin).toHaveBeenCalledWith('novousuario');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid-123',
          login: 'novousuario',
          password: hashedPassword,
        }),
      );
      expect(userRepository.create).toHaveBeenCalledTimes(1);
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Usuário criado com sucesso',
        {
          userId: 'mocked-uuid-123',
          login: 'novousuario',
        },
      );
    });

    it('deve lançar ConflictException quando login já existe', async () => {
      
      const existingUser = new User(
        'existing-uuid',
        'novousuario',
        hashedPassword,
      );
      userRepository.findByLogin.mockResolvedValue(existingUser);

      await expect(useCase.execute(createUserDto)).rejects.toThrow(
        new ConflictException('Usuário com este login já existe'),
      );

      expect(userRepository.findByLogin).toHaveBeenCalledWith('novousuario');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Tentativa de criar usuário com login duplicado',
        {
          login: 'novousuario',
        },
      );
    });

    it('deve gerar UUID para o novo usuário', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(uuidv4).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid-123',
        }),
      );
    });

    it('deve fazer hash da senha antes de criar usuário', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
    });

    it('deve retornar usuário sem campo password', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      const result = await useCase.execute(createUserDto);

      
      expect(result).not.toHaveProperty('password');
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('login');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');
    });

    it('deve logar início do processo de criação', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Iniciando criação de usuário',
        {
          login: 'novousuario',
        },
      );
    });

    it('deve logar criação do usuário antes de salvar', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Criando usuário',
        {
          userId: 'mocked-uuid-123',
          login: 'novousuario',
        },
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'CreateUserUseCase',
      );
    });

    it('deve usar salt rounds 10 para hash da senha', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(mockCreatedUser);

      
      await useCase.execute(createUserDto);

      
      expect(bcrypt.hash).toHaveBeenCalledWith('senha123', 10);
    });
  });
});
