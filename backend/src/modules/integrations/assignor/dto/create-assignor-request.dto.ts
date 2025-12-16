import { IsNotEmpty, IsString, MaxLength, Matches } from 'class-validator';
import { IsCpfCnpj } from '../../../../shared/validators/cpf-cnpj.validator';
import { IsValidEmail } from '../../../../shared/validators/email.validator';

export class CreateAssignorRequestDto {
  @IsNotEmpty({ message: 'O campo document é obrigatório' })
  @IsString({ message: 'O campo document deve ser uma string' })
  @Matches(/^\d+$/, {
    message: 'O campo document deve conter apenas números',
  })
  @IsCpfCnpj({
    message: 'O campo document deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido',
  })
  document: string;

  @IsNotEmpty({ message: 'O campo email é obrigatório' })
  @IsString({ message: 'O campo email deve ser uma string' })
  @IsValidEmail({
    message: 'O campo email deve ter um formato válido (exemplo: usuario@dominio.com)',
  })
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
