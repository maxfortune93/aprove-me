import { User } from './user.entity';

export interface IUserRepository {
  create(user: User): Promise<User>;
  findByLogin(login: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}
