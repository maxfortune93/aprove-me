import { Assignor } from './assignor.entity';

export interface IAssignorRepository {
  create(assignor: Assignor): Promise<Assignor>;
  findById(id: string): Promise<Assignor | null>;
  findByDocument(document: string): Promise<Assignor | null>;
  findAll(): Promise<Assignor[]>;
  update(id: string, data: Partial<Assignor>): Promise<Assignor>;
  delete(id: string): Promise<void>;
  upsert(assignor: Assignor): Promise<Assignor>;
}
