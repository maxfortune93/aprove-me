import { User } from '../../../../core/domain/user/user.entity';
import { Prisma } from '@prisma/client';

type PrismaUser = Prisma.UserGetPayload<Record<string, never>>;

export class UserMapper {
  static toDomain(prismaUser: PrismaUser): User {
    return new User(
      prismaUser.id,
      prismaUser.login,
      prismaUser.password,
      prismaUser.createdAt,
      prismaUser.updatedAt,
    );
  }

  static toPrisma(user: User): Prisma.UserCreateInput {
    return {
      id: user.id,
      login: user.login,
      password: user.password,
    };
  }
}
