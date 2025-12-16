import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreatePayableUseCase } from '../../../core/application/payable/create-payable.usecase';
import { GetPayableUseCase } from '../../../core/application/payable/get-payable.usecase';
import { ListPayablesUseCase } from '../../../core/application/payable/list-payables.usecase';
import { UpdatePayableUseCase } from '../../../core/application/payable/update-payable.usecase';
import { DeletePayableUseCase } from '../../../core/application/payable/delete-payable.usecase';
import { CreatePayableRequestDto } from './dto/create-payable-request.dto';
import { CreatePayableDto } from '../../../core/application/payable/dto/create-payable.dto';
import { PayableResponseDto } from '../../../core/application/payable/dto/payable-response.dto';
import { Payable } from '../../../core/domain/payable/payable.entity';

@Controller('integrations/payable')
export class PayableController {
  constructor(
    private readonly createPayableUseCase: CreatePayableUseCase,
    private readonly getPayableUseCase: GetPayableUseCase,
    private readonly listPayablesUseCase: ListPayablesUseCase,
    private readonly updatePayableUseCase: UpdatePayableUseCase,
    private readonly deletePayableUseCase: DeletePayableUseCase,
  ) {}

  @Post()
  async create(@Body() createPayableRequestDto: CreatePayableRequestDto) {
    const createPayableDto: CreatePayableDto = {
      value: createPayableRequestDto.value,
      emissionDate: createPayableRequestDto.emissionDate,
      assignor: createPayableRequestDto.assignor,
    };

    const payable = await this.createPayableUseCase.execute(createPayableDto);
    return this.toResponseDto(payable);
  }

  @Get()
  async getAll() {
    const payables = await this.listPayablesUseCase.execute();
    return payables.map((payable) => this.toResponseDto(payable));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const payable = await this.getPayableUseCase.execute(id);
    return this.toResponseDto(payable);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePayableDto: Partial<CreatePayableRequestDto>,
  ) {
    const updateData: {
      value?: number;
      emissionDate?: Date;
      assignorId?: string;
    } = {};

    if (updatePayableDto.value !== undefined) {
      updateData.value = updatePayableDto.value;
    }
    if (updatePayableDto.emissionDate !== undefined) {
      updateData.emissionDate = new Date(updatePayableDto.emissionDate);
    }
    if (updatePayableDto.assignor !== undefined) {
      updateData.assignorId = updatePayableDto.assignor;
    }

    const payable = await this.updatePayableUseCase.execute(id, updateData);
    return this.toResponseDto(payable);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deletePayableUseCase.execute(id);
    return { message: `Payable com id ${id} foi deletado com sucesso` };
  }

  private toResponseDto(payable: Payable): PayableResponseDto {
    return {
      id: payable.id,
      value: payable.value,
      emissionDate: payable.emissionDate,
      assignorId: payable.assignorId,
      assignor: payable.assignor
        ? {
            id: payable.assignor.id,
            name: payable.assignor.name,
          }
        : undefined,
      createdAt: payable.createdAt,
      updatedAt: payable.updatedAt,
    };
  }
}
