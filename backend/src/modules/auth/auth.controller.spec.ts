import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { CreateUserUseCase } from '../../core/application/user/create-user.usecase';
import { LoginUseCase } from '../../core/application/user/login.usecase';
import { User } from '../../core/domain/user/user.entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('AuthController', () => {
  let controller: AuthController;
  let createUserUseCase: jest.Mocked<CreateUserUseCase>;
  let loginUseCase: jest.Mocked<LoginUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: CreateUserUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: LoginUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    createUserUseCase = module.get(CreateUserUseCase);
    loginUseCase = module.get(LoginUseCase);
  });

  describe('login', () => {
    it('deve fazer login e retornar access_token', async () => {
      
      const loginResponse = {
        access_token: 'jwt-token-123',
      };
      loginUseCase.execute.mockResolvedValue(loginResponse);

      const loginRequestDto = {
        login: 'aprovame',
        password: 'aprovame',
      };

      
      const result = await controller.login(loginRequestDto);

      
      expect(result).toEqual(loginResponse);
      expect(loginUseCase.execute).toHaveBeenCalledWith({
        login: 'aprovame',
        password: 'aprovame',
      });
    });

    it('deve propagar UnauthorizedException quando credenciais são inválidas', async () => {
      
      loginUseCase.execute.mockRejectedValue(
        new UnauthorizedException('Credenciais inválidas'),
      );

      const loginRequestDto = {
        login: 'aprovame',
        password: 'senha-errada',
      };

      await expect(controller.login(loginRequestDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('createUser', () => {
    it('deve criar um usuário e retornar dados sem senha', async () => {
      
      const user = new User(
        'user-uuid-123',
        'novousuario',
        'hashed-password',
        new Date('2024-01-15'),
        new Date('2024-01-15'),
      );
      const { password, ...userWithoutPassword } = user;
      createUserUseCase.execute.mockResolvedValue(userWithoutPassword);

      const createUserRequestDto = {
        login: 'novousuario',
        password: 'senha123',
      };

      
      const result = await controller.createUser(createUserRequestDto);

      
      expect(result).toEqual(userWithoutPassword);
      expect(result).not.toHaveProperty('password');
      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        login: 'novousuario',
        password: 'senha123',
      });
    });

    it('deve propagar ConflictException quando login já existe', async () => {
      
      createUserUseCase.execute.mockRejectedValue(
        new ConflictException('Usuário com este login já existe'),
      );

      const createUserRequestDto = {
        login: 'usuario-existente',
        password: 'senha123',
      };

      await expect(controller.createUser(createUserRequestDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve mapear corretamente os dados do request para DTO', async () => {
      
      const user = new User(
        'user-uuid-123',
        'novousuario',
        'hashed-password',
      );
      const { password, ...userWithoutPassword } = user;
      createUserUseCase.execute.mockResolvedValue(userWithoutPassword);

      const createUserRequestDto = {
        login: 'novousuario',
        password: 'senha123',
      };

      
      await controller.createUser(createUserRequestDto);

      
      expect(createUserUseCase.execute).toHaveBeenCalledWith({
        login: 'novousuario',
        password: 'senha123',
      });
    });
  });
});
