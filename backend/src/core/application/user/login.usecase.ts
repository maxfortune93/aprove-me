import { Injectable, Inject, UnauthorizedException } from '@nestjs/common';
import type { IUserRepository } from '../../domain/user/user.repository.interface';
import type { IJwtTokenService } from '../../domain/auth/jwt-token.service.interface';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class LoginUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IUserRepository)
    private readonly userRepository: IUserRepository,
    @Inject(TOKENS.IJwtTokenService)
    private readonly jwtTokenService: IJwtTokenService,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('LoginUseCase');
  }

  async execute(loginDto: LoginDto): Promise<AuthResponseDto> {
    this.logger.logWithMetadata(LogLevel.DEBUG, 'Iniciando login', {
      login: loginDto.login,
    });

    const user = await this.userRepository.findByLogin(loginDto.login);

    if (!user) {
      this.logger.logWithMetadata(
        LogLevel.WARN,
        'Tentativa de login com credenciais inválidas',
        {
          login: loginDto.login,
        },
      );
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      this.logger.logWithMetadata(
        LogLevel.WARN,
        'Tentativa de login com senha inválida',
        {
          login: loginDto.login,
          userId: user.id,
        },
      );
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const payload = { sub: user.id, login: user.login };

    this.logger.logWithMetadata(LogLevel.LOG, 'Login realizado com sucesso', {
      userId: user.id,
      login: user.login,
    });

    return {
      access_token: this.jwtTokenService.sign(payload, { expiresIn: (process.env.JWT_EXPIRES_IN) as string }),
    };
  }
}
