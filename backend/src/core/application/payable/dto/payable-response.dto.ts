import { AssignorSummaryDto } from '../../assignor/dto/assignor-summary.dto';

export class PayableResponseDto {
  id: string;
  value: number;
  emissionDate: Date;
  assignorId: string;
  assignor?: AssignorSummaryDto;
  createdAt?: Date;
  updatedAt?: Date;
}
