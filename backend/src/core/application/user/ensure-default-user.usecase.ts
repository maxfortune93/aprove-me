import { Injectable, Inject } from '@nestjs/common';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import { User } from '../../domain/user/user.entity';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class EnsureDefaultUserUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('EnsureDefaultUserUseCase');
  }

  async execute(): Promise<void> {
    this.logger.logWithMetadata(
      LogLevel.DEBUG,
      'Verificando usuário padrão',
      {},
    );

    const defaultUser = await this.userRepository.findByLogin('aprovame');

    if (!defaultUser) {
      this.logger.logWithMetadata(LogLevel.LOG, 'Criando usuário padrão', {});

      const hashedPassword = await bcrypt.hash('aprovame', 10);
      const userEntity = new User(uuidv4(), 'aprovame', hashedPassword);

      await this.userRepository.create(userEntity);

      this.logger.logWithMetadata(
        LogLevel.LOG,
        'Usuário padrão criado com sucesso',
        {},
      );
    } else {
      this.logger.logWithMetadata(
        LogLevel.DEBUG,
        'Usuário padrão já existe',
        {},
      );
    }
  }
}
