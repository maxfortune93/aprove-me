import { Injectable, Inject } from '@nestjs/common';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Assignor } from '../../domain/assignor/assignor.entity';
import { CreateAssignorDto } from './dto/create-assignor.dto';
import { TOKENS } from '../../../shared/di/tokens';

@Injectable()
export class CreateAssignorUseCase {
  constructor(
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
  ) {}

  async execute(createAssignorDto: CreateAssignorDto): Promise<Assignor> {

    const id = createAssignorDto.id || '';

    const assignorEntity = new Assignor(
      id,
      createAssignorDto.document,
      createAssignorDto.email,
      createAssignorDto.phone,
      createAssignorDto.name,
    );

    return this.assignorRepository.create(assignorEntity);
  }
}
