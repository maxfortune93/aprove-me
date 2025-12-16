import {
  IsNotEmpty,
  IsArray,
  ArrayMaxSize,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePayableRequestDto } from '../../integrations/payable/dto/create-payable-request.dto';

export class CreateBatchRequestDto {
  @IsNotEmpty({ message: 'O campo payables é obrigatório' })
  @IsArray({ message: 'O campo payables deve ser um array' })
  @ArrayMinSize(1, { message: 'O array deve conter pelo menos 1 pagável' })
  @ArrayMaxSize(10000, {
    message: 'O array não pode conter mais de 10.000 pagáveis',
  })
  @ValidateNested({ each: true })
  @Type(() => CreatePayableRequestDto)
  payables: CreatePayableRequestDto[];
}
