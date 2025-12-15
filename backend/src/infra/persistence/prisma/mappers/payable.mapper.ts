import { Payable } from '../../../../core/domain/payable/payable.entity';
import { AssignorMapper } from './assignor.mapper';
import { Prisma } from '@prisma/client';

type PayableWithAssignor = Prisma.PayableGetPayload<{
  include: { assignor: true };
}>;

export class PayableMapper {
  static toDomain(
    prismaPayable:
      | PayableWithAssignor
      | Prisma.PayableGetPayload<Record<string, never>>,
  ): Payable {
    const assignor =
      'assignor' in prismaPayable && prismaPayable.assignor
        ? AssignorMapper.toDomain(prismaPayable.assignor)
        : undefined;

    return new Payable(
      prismaPayable.id,
      prismaPayable.value,
      prismaPayable.emissionDate,
      prismaPayable.assignorId,
      assignor,
      prismaPayable.createdAt,
      prismaPayable.updatedAt,
    );
  }

  static toPrisma(payable: Payable): Prisma.PayableCreateInput {
    const data: Prisma.PayableCreateInput = {
      value: payable.value,
      emissionDate: payable.emissionDate,
      assignor: {
        connect: { id: payable.assignorId },
      },
    };

    if (payable.id && payable.id.trim() !== '') {
      data.id = payable.id;
    }

    return data;
  }
}
