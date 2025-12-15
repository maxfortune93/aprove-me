import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
} from '@nestjs/common';
import { CreateAssignorUseCase } from '../../../core/application/assignor/create-assignor.usecase';
import { GetAssignorUseCase } from '../../../core/application/assignor/get-assignor.usecase';
import { UpdateAssignorUseCase } from '../../../core/application/assignor/update-assignor.usecase';
import { DeleteAssignorUseCase } from '../../../core/application/assignor/delete-assignor.usecase';
import { CreateAssignorRequestDto } from './dto/create-assignor-request.dto';
import { CreateAssignorDto } from '../../../core/application/assignor/dto/create-assignor.dto';

@Controller('integrations/assignor')
export class AssignorController {
  constructor(
    private readonly createAssignorUseCase: CreateAssignorUseCase,
    private readonly getAssignorUseCase: GetAssignorUseCase,
    private readonly updateAssignorUseCase: UpdateAssignorUseCase,
    private readonly deleteAssignorUseCase: DeleteAssignorUseCase,
  ) {}

  @Post()
  async create(@Body() createAssignorRequestDto: CreateAssignorRequestDto) {
    const createAssignorDto: CreateAssignorDto = {
      document: createAssignorRequestDto.document,
      email: createAssignorRequestDto.email,
      phone: createAssignorRequestDto.phone,
      name: createAssignorRequestDto.name,
    };

    return this.createAssignorUseCase.execute(createAssignorDto);
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.getAssignorUseCase.execute(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateAssignorDto: Partial<CreateAssignorRequestDto>,
  ) {
    const updateData: {
      document?: string;
      email?: string;
      phone?: string;
      name?: string;
    } = {};

    if (updateAssignorDto.document !== undefined) {
      updateData.document = updateAssignorDto.document;
    }
    if (updateAssignorDto.email !== undefined) {
      updateData.email = updateAssignorDto.email;
    }
    if (updateAssignorDto.phone !== undefined) {
      updateData.phone = updateAssignorDto.phone;
    }
    if (updateAssignorDto.name !== undefined) {
      updateData.name = updateAssignorDto.name;
    }

    return this.updateAssignorUseCase.execute(id, updateData);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.deleteAssignorUseCase.execute(id);
    return { message: `Assignor com id ${id} foi deletado com sucesso` };
  }
}
