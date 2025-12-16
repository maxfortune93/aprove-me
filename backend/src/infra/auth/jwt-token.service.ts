import { Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import type { IJwtTokenService } from '../../core/domain/auth/jwt-token.service.interface';

@Injectable()
export class JwtTokenService implements IJwtTokenService {
  constructor(private readonly jwtService: JwtService) {}

  sign(
    payload: { sub: string; login: string },
    options?: { expiresIn: string },
  ): string {
    const jwtOptions: JwtSignOptions | undefined = options
      ? ({ expiresIn: options.expiresIn } as JwtSignOptions)
      : undefined;
    return this.jwtService.sign(payload, jwtOptions);
  }
}
