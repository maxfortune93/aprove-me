import { Test, TestingModule } from '@nestjs/testing';
import { EnsureDefaultUserUseCase } from './ensure-default-user.usecase';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.entity';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';


jest.mock('bcryptjs');
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid-123'),
}));

describe('EnsureDefaultUserUseCase', () => {
  let useCase: EnsureDefaultUserUseCase;
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
        EnsureDefaultUserUseCase,
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

    useCase = module.get<EnsureDefaultUserUseCase>(EnsureDefaultUserUseCase);
    userRepository = module.get(TOKENS.IUserRepository);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const hashedPassword = '$2a$10$hashedpassword';
    const existingUser = new User(
      'existing-uuid',
      'aprovame',
      hashedPassword,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve criar usuário padrão quando não existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      const createdUser = new User(
        'mocked-uuid-123',
        'aprovame',
        hashedPassword,
      );
      userRepository.create.mockResolvedValue(createdUser);

      
      await useCase.execute();

      
      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).toHaveBeenCalledWith('aprovame', 10);
      expect(bcrypt.hash).toHaveBeenCalledTimes(1);
      expect(uuidv4).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid-123',
          login: 'aprovame',
          password: hashedPassword,
        }),
      );
      expect(userRepository.create).toHaveBeenCalledTimes(1);
    });

    it('não deve criar usuário quando já existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(existingUser);

      
      await useCase.execute();

      
      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(uuidv4).not.toHaveBeenCalled();
      expect(userRepository.create).not.toHaveBeenCalled();
    });

    it('deve usar login "aprovame" para busca', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
    });

    it('deve usar senha "aprovame" para hash', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(bcrypt.hash).toHaveBeenCalledWith('aprovame', 10);
    });

    it('deve usar salt rounds 10 para hash da senha', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(bcrypt.hash).toHaveBeenCalledWith('aprovame', 10);
    });

    it('deve gerar UUID para novo usuário', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(uuidv4).toHaveBeenCalled();
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'mocked-uuid-123',
        }),
      );
    });

    it('deve logar verificação do usuário padrão', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Verificando usuário padrão',
        {},
      );
    });

    it('deve logar criação do usuário padrão quando não existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Criando usuário padrão',
        {},
      );
    });

    it('deve logar sucesso da criação do usuário padrão', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Usuário padrão criado com sucesso',
        {},
      );
    });

    it('deve logar que usuário padrão já existe quando encontrado', async () => {
      
      userRepository.findByLogin.mockResolvedValue(existingUser);

      
      await useCase.execute();

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Usuário padrão já existe',
        {},
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'EnsureDefaultUserUseCase',
      );
    });

    it('deve criar usuário com login "aprovame"', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          login: 'aprovame',
        }),
      );
    });

    it('deve criar usuário com senha hasheada', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      await useCase.execute();

      
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          password: hashedPassword,
        }),
      );
      const createCall = (userRepository.create as jest.Mock).mock.calls[0][0];
      expect(createCall.password).not.toBe('aprovame');
      expect(createCall.password).toBe(hashedPassword);
    });

    it('deve retornar void quando executado com sucesso', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);
      userRepository.create.mockResolvedValue(
        new User('mocked-uuid-123', 'aprovame', hashedPassword),
      );

      
      const result = await useCase.execute();

      
      expect(result).toBeUndefined();
    });

    it('deve retornar void quando usuário já existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(existingUser);

      
      const result = await useCase.execute();

      
      expect(result).toBeUndefined();
    });
  });
});
