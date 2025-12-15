import { Injectable, Inject, ConflictException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class CreateUserUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('CreateUserUseCase');
  }

  async execute(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    this.logger.logWithMetadata(
      LogLevel.DEBUG,
      'Iniciando criação de usuário',
      {
        login: createUserDto.login,
      },
    );

    const existingUser = await this.userRepository.findByLogin(
      createUserDto.login,
    );

    if (existingUser) {
      this.logger.logWithMetadata(
        LogLevel.WARN,
        'Tentativa de criar usuário com login duplicado',
        {
          login: createUserDto.login,
        },
      );
      throw new ConflictException('Usuário com este login já existe');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    const userEntity = new User(uuidv4(), createUserDto.login, hashedPassword);

    this.logger.logWithMetadata(LogLevel.DEBUG, 'Criando usuário', {
      userId: userEntity.id,
      login: userEntity.login,
    });

    const user = await this.userRepository.create(userEntity);

    this.logger.logWithMetadata(LogLevel.LOG, 'Usuário criado com sucesso', {
      userId: user.id,
      login: user.login,
    });

    const { password: _password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
