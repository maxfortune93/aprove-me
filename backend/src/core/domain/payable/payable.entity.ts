import { Assignor } from '../assignor/assignor.entity';

export class Payable {
  constructor(
    public readonly id: string,
    public readonly value: number,
    public readonly emissionDate: Date,
    public readonly assignorId: string,
    public readonly assignor?: Assignor,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}
}
