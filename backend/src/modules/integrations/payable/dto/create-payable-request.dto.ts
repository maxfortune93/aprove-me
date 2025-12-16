import { IsNotEmpty, IsUUID, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePayableRequestDto {
  @IsNotEmpty({ message: 'O campo value é obrigatório' })
  @IsNumber({}, { message: 'O campo value deve ser um número' })
  @Min(0.01, { message: 'O campo value deve ser maior que zero' })
  value: number;

  @IsNotEmpty({ message: 'O campo emissionDate é obrigatório' })
  @IsDateString(
    {},
    { message: 'O campo emissionDate deve ser uma data válida' },
  )
  emissionDate: string;

  @IsNotEmpty({ message: 'O campo assignor é obrigatório' })
  @IsUUID('4', { message: 'O campo assignor deve ser um UUID válido' })
  assignor: string;
}
