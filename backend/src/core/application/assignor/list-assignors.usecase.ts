import { Injectable, Inject } from '@nestjs/common';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class ListAssignorsUseCase {
  constructor(
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
  ) {}

  async execute(): Promise<Assignor[]> {
    return await this.assignorRepository.findAll();
  }
}

