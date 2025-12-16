import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class GetPayableUseCase {
  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
  ) {}

  async execute(id: string): Promise<Payable> {
    const payable = await this.payableRepository.findById(id);

    if (!payable) {
      throw new NotFoundException(`Payable com id ${id} não encontrado`);
    }

    return payable;
  }
}
