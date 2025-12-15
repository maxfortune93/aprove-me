export interface IJwtTokenService {
  sign(
    payload: { sub: string; login: string },
    options?: { expiresIn: string },
  ): string;
}
