import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateUserRequestDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(140)
  login: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
