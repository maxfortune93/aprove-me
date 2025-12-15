import { IsNotEmpty, IsString, MaxLength, IsEmail } from 'class-validator';

export class CreateAssignorRequestDto {
  @IsNotEmpty({ message: 'O campo document é obrigatório' })
  @IsString({ message: 'O campo document deve ser uma string' })
  @MaxLength(30, {
    message: 'O campo document não pode ter mais de 30 caracteres',
  })
  document: string;

  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  @IsEmail({}, { message: 'O campo email deve ser um email válido' })
  @MaxLength(140, {
    message: 'O campo email não pode ter mais de 140 caracteres',
  })
  email: string;

  @IsNotEmpty({ message: 'O campo phone é obrigatório' })
  @IsString({ message: 'O campo phone deve ser uma string' })
  @MaxLength(20, {
    message: 'O campo phone não pode ter mais de 20 caracteres',
  })
  phone: string;

  @IsNotEmpty({ message: 'O campo name é obrigatório' })
  @IsString({ message: 'O campo name deve ser uma string' })
  @MaxLength(140, {
    message: 'O campo name não pode ter mais de 140 caracteres',
  })
  name: string;
}
