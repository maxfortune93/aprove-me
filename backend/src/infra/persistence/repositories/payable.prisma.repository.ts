import { Injectable } from '@nestjs/common';
import { IPayableRepository } from '../../../core/domain/payable/payable.repository.interface';
import { Payable } from '../../../core/domain/payable/payable.entity';
import { PrismaService } from '../prisma/prisma.service';
import { PayableMapper } from '../prisma/mappers/payable.mapper';

@Injectable()
export class PayablePrismaRepository implements IPayableRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(payable: Payable): Promise<Payable> {
    const prismaPayable = await this.prisma.payable.create({
      data: PayableMapper.toPrisma(payable),
      include: { assignor: true },
    });

    return PayableMapper.toDomain(prismaPayable);
  }

  async findById(id: string): Promise<Payable | null> {
    const prismaPayable = await this.prisma.payable.findUnique({
      where: { id },
      include: { assignor: true },
    });

    if (!prismaPayable) {
      return null;
    }

    return PayableMapper.toDomain(prismaPayable);
  }

  async update(id: string, data: Partial<Payable>): Promise<Payable> {
    const updateData: {
      value?: number;
      emissionDate?: Date;
      assignorId?: string;
    } = {};

    if (data.value !== undefined) updateData.value = data.value;
    if (data.emissionDate !== undefined)
      updateData.emissionDate = data.emissionDate;
    if (data.assignorId !== undefined) updateData.assignorId = data.assignorId;

    const prismaPayable = await this.prisma.payable.update({
      where: { id },
      data: updateData,
      include: { assignor: true },
    });

    return PayableMapper.toDomain(prismaPayable);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.payable.delete({
      where: { id },
    });
  }
}
