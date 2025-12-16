import { Payable } from './payable.entity';

export interface IPayableRepository {
  create(payable: Payable): Promise<Payable>;
  findById(id: string): Promise<Payable | null>;
  findAll(): Promise<Payable[]>;
  update(id: string, data: Partial<Payable>): Promise<Payable>;
  delete(id: string): Promise<void>;
}
