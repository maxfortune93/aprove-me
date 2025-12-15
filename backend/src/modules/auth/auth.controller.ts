import { Controller, Post, Body } from '@nestjs/common';
import { CreateUserUseCase } from '../../core/application/user/create-user.usecase';
import { LoginUseCase } from '../../core/application/user/login.usecase';
import { CreateUserRequestDto } from './dto/create-user-request.dto';
import { LoginRequestDto } from './dto/login-request.dto';
import { CreateUserDto } from '../../core/application/user/dto/create-user.dto';
import { LoginDto } from '../../core/application/user/dto/login.dto';
import { Public } from './decorators/public.decorator';

@Controller('integrations')
export class AuthController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly loginUseCase: LoginUseCase,
  ) {}

  @Post('auth')
  @Public()
  async login(@Body() loginRequestDto: LoginRequestDto) {
    const loginDto: LoginDto = {
      login: loginRequestDto.login,
      password: loginRequestDto.password,
    };

    return this.loginUseCase.execute(loginDto);
  }

  @Post('users')
  @Public()
  async createUser(@Body() createUserRequestDto: CreateUserRequestDto) {
    const createUserDto: CreateUserDto = {
      login: createUserRequestDto.login,
      password: createUserRequestDto.password,
    };

    return this.createUserUseCase.execute(createUserDto);
  }
}
