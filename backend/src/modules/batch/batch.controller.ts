import { Controller, Post, Body } from '@nestjs/common';
import { CreateBatchUseCase } from '../../core/application/batch/create-batch.usecase';
import { CreateBatchRequestDto } from './dto/create-batch-request.dto';
import { CreatePayableDto } from '../../core/application/payable/dto/create-payable.dto';

@Controller('integrations/payable')
export class BatchController {
  constructor(private readonly createBatchUseCase: CreateBatchUseCase) {}

  @Post('batch')
  async createBatch(@Body() createBatchRequestDto: CreateBatchRequestDto) {
    const payables: CreatePayableDto[] = createBatchRequestDto.payables.map(
      (payable) => ({
        value: payable.value,
        emissionDate: payable.emissionDate,
        assignor: payable.assignor,
      }),
    );

    const result = await this.createBatchUseCase.execute(payables);

    return {
      batchId: result.batchId,
      message: `Lote criado com sucesso. ${payables.length} pagáveis foram enfileirados para processamento.`,
      totalPayables: payables.length,
    };
  }
}
