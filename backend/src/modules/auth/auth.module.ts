import { Module, OnModuleInit } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { CreateUserUseCase } from '../../core/application/user/create-user.usecase';
import { LoginUseCase } from '../../core/application/user/login.usecase';
import { EnsureDefaultUserUseCase } from '../../core/application/user/ensure-default-user.usecase';
import { JwtTokenService } from '../../infra/auth/jwt-token.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { PersistenceModule } from '../../infra/persistence/persistence.module';
import { TOKENS } from '../../shared/di/tokens';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoggerModule } from '../../shared/logger/logger.module';

@Module({
  imports: [
    PersistenceModule,
    PassportModule,
    LoggerModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
      signOptions: { expiresIn: '1m' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    CreateUserUseCase,
    LoginUseCase,
    EnsureDefaultUserUseCase,
    JwtStrategy,
    JwtAuthGuard,
    {
      provide: TOKENS.IJwtTokenService,
      useClass: JwtTokenService,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [CreateUserUseCase, LoginUseCase, JwtStrategy, JwtAuthGuard],
})
export class AuthModule implements OnModuleInit {
  constructor(
    private readonly ensureDefaultUserUseCase: EnsureDefaultUserUseCase,
  ) {}

  async onModuleInit() {
    await this.ensureDefaultUserUseCase.execute();
  }
}
