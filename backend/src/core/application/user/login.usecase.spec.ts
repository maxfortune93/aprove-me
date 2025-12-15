import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { LoginUseCase } from './login.usecase';
import { IUserRepository } from '../../domain/user/user.repository.interface';
import { IJwtTokenService } from '../../domain/auth/jwt-token.service.interface';
import { User } from '../../domain/user/user.entity';
import { LoginDto } from './dto/login.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase: LoginUseCase;
  let userRepository: jest.Mocked<IUserRepository>;
  let jwtTokenService: jest.Mocked<IJwtTokenService>;
  let loggerService: jest.Mocked<LoggerService>;

  beforeEach(async () => {
    
    const mockUserRepository = {
      create: jest.fn(),
      findByLogin: jest.fn(),
      findById: jest.fn(),
    };

    const mockJwtTokenService = {
      sign: jest.fn(),
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
        LoginUseCase,
        {
          provide: TOKENS.IUserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: TOKENS.IJwtTokenService,
          useValue: mockJwtTokenService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    useCase = module.get<LoginUseCase>(LoginUseCase);
    userRepository = module.get(TOKENS.IUserRepository);
    jwtTokenService = module.get(TOKENS.IJwtTokenService);
    loggerService = module.get<LoggerService>(LoggerService) as jest.Mocked<LoggerService>;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute', () => {
    const loginDto: LoginDto = {
      login: 'aprovame',
      password: 'aprovame',
    };

    const hashedPassword = '$2a$10$hashedpassword';
    const mockUser = new User(
      'user-uuid-123',
      'aprovame',
      hashedPassword,
      new Date('2024-01-15'),
      new Date('2024-01-15'),
    );

    it('deve retornar access_token quando credenciais são válidas', async () => {
      
      userRepository.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtTokenService.sign.mockReturnValue('jwt-token-123');

      
      const result = await useCase.execute(loginDto);

      
      expect(result).toEqual({ access_token: 'jwt-token-123' });
      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('aprovame', hashedPassword);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(jwtTokenService.sign).toHaveBeenCalledWith(
        { sub: 'user-uuid-123', login: 'aprovame' },
        { expiresIn: '1m' },
      );
      expect(jwtTokenService.sign).toHaveBeenCalledTimes(1);
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Login realizado com sucesso',
        {
          userId: 'user-uuid-123',
          login: 'aprovame',
        },
      );
    });

    it('deve lançar UnauthorizedException quando usuário não existe', async () => {
      
      userRepository.findByLogin.mockResolvedValue(null);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );

      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwtTokenService.sign).not.toHaveBeenCalled();
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Tentativa de login com credenciais inválidas',
        {
          login: 'aprovame',
        },
      );
    });

    it('deve lançar UnauthorizedException quando senha é inválida', async () => {
      
      userRepository.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(useCase.execute(loginDto)).rejects.toThrow(
        new UnauthorizedException('Credenciais inválidas'),
      );

      expect(userRepository.findByLogin).toHaveBeenCalledWith('aprovame');
      expect(userRepository.findByLogin).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledWith('aprovame', hashedPassword);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
      expect(jwtTokenService.sign).not.toHaveBeenCalled();
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Tentativa de login com senha inválida',
        {
          login: 'aprovame',
          userId: 'user-uuid-123',
        },
      );
    });

    it('deve logar início do processo de login', async () => {
      
      userRepository.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtTokenService.sign.mockReturnValue('jwt-token-123');

      
      await useCase.execute(loginDto);

      
      expect(loggerService.logWithMetadata).toHaveBeenCalledWith(
        expect.anything(),
        'Iniciando login',
        {
          login: 'aprovame',
        },
      );
    });

    it('deve usar expiresIn de 1 minuto no token JWT', async () => {
      
      userRepository.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtTokenService.sign.mockReturnValue('jwt-token-123');

      
      await useCase.execute(loginDto);

      
      expect(jwtTokenService.sign).toHaveBeenCalledWith(
        expect.objectContaining({
          sub: 'user-uuid-123',
          login: 'aprovame',
        }),
        { expiresIn: '1m' },
      );
    });

    it('deve criar logger filho com nome correto', async () => {
      
      userRepository.findByLogin.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtTokenService.sign.mockReturnValue('jwt-token-123');

      
      await useCase.execute(loginDto);

      
      expect(loggerService.createChildLogger).toHaveBeenCalledWith(
        'LoginUseCase',
      );
    });
  });
});
