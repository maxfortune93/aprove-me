import { Injectable } from '@nestjs/common';
import { IUserRepository } from '../../../core/domain/user/user.repository.interface';
import { User } from '../../../core/domain/user/user.entity';
import { PrismaService } from '../prisma/prisma.service';
import { UserMapper } from '../prisma/mappers/user.mapper';

@Injectable()
export class UserPrismaRepository implements IUserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(user: User): Promise<User> {
    const prismaUser = await this.prisma.user.create({
      data: UserMapper.toPrisma(user),
    });

    return UserMapper.toDomain(prismaUser);
  }

  async findByLogin(login: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { login },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }

  async findById(id: string): Promise<User | null> {
    const prismaUser = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!prismaUser) {
      return null;
    }

    return UserMapper.toDomain(prismaUser);
  }
}
