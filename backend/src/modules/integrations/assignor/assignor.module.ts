import { Module } from '@nestjs/common';
import { AssignorController } from './assignor.controller';
import { CreateAssignorUseCase } from '../../../core/application/assignor/create-assignor.usecase';
import { GetAssignorUseCase } from '../../../core/application/assignor/get-assignor.usecase';
import { ListAssignorsUseCase } from '../../../core/application/assignor/list-assignors.usecase';
import { UpdateAssignorUseCase } from '../../../core/application/assignor/update-assignor.usecase';
import { DeleteAssignorUseCase } from '../../../core/application/assignor/delete-assignor.usecase';
import { PersistenceModule } from '../../../infra/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [AssignorController],
  providers: [
    CreateAssignorUseCase,
    GetAssignorUseCase,
    ListAssignorsUseCase,
    UpdateAssignorUseCase,
    DeleteAssignorUseCase,
  ],
})
export class AssignorModule {}
