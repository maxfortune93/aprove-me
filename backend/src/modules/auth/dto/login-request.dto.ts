import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class LoginRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
