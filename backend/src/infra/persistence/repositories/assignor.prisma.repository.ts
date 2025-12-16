import { Injectable } from '@nestjs/common';
import { IAssignorRepository } from '../../../core/domain/assignor/assignor.repository.interface';
import { Assignor } from '../../../core/domain/assignor/assignor.entity';
import { PrismaService } from '../prisma/prisma.service';
import { AssignorMapper } from '../prisma/mappers/assignor.mapper';

@Injectable()
export class AssignorPrismaRepository implements IAssignorRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(assignor: Assignor): Promise<Assignor> {
    const prismaAssignor = await this.prisma.assignor.create({
      data: AssignorMapper.toPrisma(assignor),
    });

    return AssignorMapper.toDomain(prismaAssignor);
  }

  async findById(id: string): Promise<Assignor | null> {
    const prismaAssignor = await this.prisma.assignor.findUnique({
      where: { id },
    });

    if (!prismaAssignor) {
      return null;
    }

    return AssignorMapper.toDomain(prismaAssignor);
  }

  async findByDocument(document: string): Promise<Assignor | null> {
    const prismaAssignor = await this.prisma.assignor.findFirst({
      where: { document },
    });

    if (!prismaAssignor) {
      return null;
    }

    return AssignorMapper.toDomain(prismaAssignor);
  }

  async findAll(): Promise<Assignor[]> {
    const prismaAssignors = await this.prisma.assignor.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return prismaAssignors.map((assignor) => AssignorMapper.toDomain(assignor));
  }

  async update(id: string, data: Partial<Assignor>): Promise<Assignor> {
    const updateData: {
      document?: string;
      email?: string;
      phone?: string;
      name?: string;
    } = {};

    if (data.document !== undefined) updateData.document = data.document;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.name !== undefined) updateData.name = data.name;

    const prismaAssignor = await this.prisma.assignor.update({
      where: { id },
      data: updateData,
    });

    return AssignorMapper.toDomain(prismaAssignor);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.assignor.delete({
      where: { id },
    });
  }

  async upsert(assignor: Assignor): Promise<Assignor> {
    const prismaAssignor = await this.prisma.assignor.upsert({
      where: { id: assignor.id },
      update: {
        document: assignor.document,
        email: assignor.email,
        phone: assignor.phone,
        name: assignor.name,
      },
      create: AssignorMapper.toPrisma(assignor),
    });

    return AssignorMapper.toDomain(prismaAssignor);
  }
}
