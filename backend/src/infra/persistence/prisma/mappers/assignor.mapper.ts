import { Assignor } from '../../../../core/domain/assignor/assignor.entity';
import { Prisma } from '@prisma/client';

export class AssignorMapper {
  static toDomain(
    prismaAssignor: Prisma.AssignorGetPayload<Record<string, never>>,
  ): Assignor {
    return new Assignor(
      prismaAssignor.id,
      prismaAssignor.document,
      prismaAssignor.email,
      prismaAssignor.phone,
      prismaAssignor.name,
      prismaAssignor.createdAt,
      prismaAssignor.updatedAt,
    );
  }

  static toPrisma(assignor: Assignor): Prisma.AssignorCreateInput {
    const data: Prisma.AssignorCreateInput = {
      document: assignor.document,
      email: assignor.email,
      phone: assignor.phone,
      name: assignor.name,
    };

    if (assignor.id && assignor.id.trim() !== '') {
      data.id = assignor.id;
    }

    return data;
  }
}
