import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class DeletePayableUseCase {
  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
  ) {}

  async execute(id: string): Promise<void> {
    const payable = await this.payableRepository.findById(id);

    if (!payable) {
      throw new NotFoundException(`Payable com id ${id} não encontrado`);
    }

    await this.payableRepository.delete(id);
  }
}
