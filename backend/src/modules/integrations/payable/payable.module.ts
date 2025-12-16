import { Module } from '@nestjs/common';
import { PayableController } from './payable.controller';
import { CreatePayableUseCase } from '../../../core/application/payable/create-payable.usecase';
import { GetPayableUseCase } from '../../../core/application/payable/get-payable.usecase';
import { ListPayablesUseCase } from '../../../core/application/payable/list-payables.usecase';
import { UpdatePayableUseCase } from '../../../core/application/payable/update-payable.usecase';
import { DeletePayableUseCase } from '../../../core/application/payable/delete-payable.usecase';
import { PersistenceModule } from '../../../infra/persistence/persistence.module';

@Module({
  imports: [PersistenceModule],
  controllers: [PayableController],
  providers: [
    CreatePayableUseCase,
    GetPayableUseCase,
    ListPayablesUseCase,
    UpdatePayableUseCase,
    DeletePayableUseCase,
  ],
})
export class PayableModule {}
