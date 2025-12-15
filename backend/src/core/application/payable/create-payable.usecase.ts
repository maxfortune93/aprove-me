import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import type { IPayableRepository } from '../../domain/payable/payable.repository.interface';
import type { IAssignorRepository } from '../../domain/assignor/assignor.repository.interface';
import { Payable } from '../../domain/payable/payable.entity';
import { CreatePayableDto } from './dto/create-payable.dto';
import { TOKENS } from '../../../shared/di/tokens';
import { LoggerService } from '../../../shared/logger/logger.service';
import { LogLevel } from '../../../shared/logger/types';

@Injectable()
export class CreatePayableUseCase {
  private readonly logger: LoggerService;

  constructor(
    @Inject(TOKENS.IPayableRepository)
    private readonly payableRepository: IPayableRepository,
    @Inject(TOKENS.IAssignorRepository)
    private readonly assignorRepository: IAssignorRepository,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('CreatePayableUseCase');
  }

  async execute(createPayableDto: CreatePayableDto): Promise<Payable> {
    const payableId = createPayableDto.id || 'será gerado pelo Prisma';
    this.logger.logWithMetadata(
      LogLevel.DEBUG,
      'Iniciando criação de payable',
      {
        payableId,
        assignorId: createPayableDto.assignor,
      },
    );

    const assignor = await this.assignorRepository.findById(
      createPayableDto.assignor,
    );

    if (!assignor) {
      this.logger.logWithMetadata(
        LogLevel.WARN,
        'Tentativa de criar payable com assignor inexistente',
        {
          payableId,
          assignorId: createPayableDto.assignor,
        },
      );
      throw new NotFoundException(
        `Assignor com id ${createPayableDto.assignor} não encontrado`,
      );
    }

    this.logger.logWithMetadata(
      LogLevel.DEBUG,
      'Assignor validado com sucesso',
      {
        assignorId: assignor.id,
      },
    );

    const id = createPayableDto.id || '';

    const payableEntity = new Payable(
      id,
      createPayableDto.value,
      new Date(createPayableDto.emissionDate),
      assignor.id,
    );

    this.logger.logWithMetadata(LogLevel.DEBUG, 'Criando payable', {
      payableId: id || 'será gerado pelo Prisma',
      value: payableEntity.value,
    });
    const payable = await this.payableRepository.create(payableEntity);

    this.logger.logWithMetadata(LogLevel.LOG, 'Payable criado com sucesso', {
      payableId: payable.id,
    });

    return payable;
  }
}
