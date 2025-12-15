import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class GetAssignorUseCase {
  constructor(
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
  ) {}

  async execute(id: string): Promise<Assignor> {
    const assignor = await this.assignorRepository.findById(id);

    if (!assignor) {
      throw new NotFoundException(`Assignor com id ${id} não encontrado`);
    }

    return assignor;
  }
}
