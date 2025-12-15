import { Assignor } from './assignor.entity';

export interface IAssignorRepository {
  create(assignor: Assignor): Promise<Assignor>;
  findById(id: string): Promise<Assignor | null>;
  update(id: string, data: Partial<Assignor>): Promise<Assignor>;
  delete(id: string): Promise<void>;
  upsert(assignor: Assignor): Promise<Assignor>;
}
