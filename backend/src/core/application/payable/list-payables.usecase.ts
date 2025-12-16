import { Injectable, Inject } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class ListPayablesUseCase {
  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
  ) {}

  async execute(): Promise<Payable[]> {
    return await this.payableRepository.findAll();
  }
}

