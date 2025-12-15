import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class UpdatePayableUseCase {
  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
  ) {}

  async execute(id: string, updateData: Partial<Payable>): Promise<Payable> {
    const payable = await this.payableRepository.findById(id);

    if (!payable) {
      throw new NotFoundException(`Payable com id ${id} não encontrado`);
    }

    if (updateData.assignorId) {
      const assignor = await this.assignorRepository.findById(
        updateData.assignorId,
      );

      if (!assignor) {
        throw new NotFoundException(
          `Assignor com id ${updateData.assignorId} não encontrado`,
        );
      }
    }

    return this.payableRepository.update(id, updateData);
  }
}
