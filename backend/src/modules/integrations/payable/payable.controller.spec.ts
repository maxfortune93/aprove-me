import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PayableController } from './payable.controller';
import { CreatePayableUseCase } from '../../../core/application/payable/create-payable.usecase';
import { GetPayableUseCase } from '../../../core/application/payable/get-payable.usecase';
import { UpdatePayableUseCase } from '../../../core/application/payable/update-payable.usecase';
import { DeletePayableUseCase } from '../../../core/application/payable/delete-payable.usecase';
import { Payable } from '../../../core/domain/payable/payable.entity';
import { Assignor } from '../../../core/domain/assignor/assignor.entity';

describe('PayableController', () => {
  let controller: PayableController;
  let createPayableUseCase: jest.Mocked<CreatePayableUseCase>;
  let getPayableUseCase: jest.Mocked<GetPayableUseCase>;
  let updatePayableUseCase: jest.Mocked<UpdatePayableUseCase>;
  let deletePayableUseCase: jest.Mocked<DeletePayableUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayableController],
      providers: [
        {
          provide: CreatePayableUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetPayableUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdatePayableUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeletePayableUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<PayableController>(PayableController);
    createPayableUseCase = module.get(CreatePayableUseCase);
    getPayableUseCase = module.get(GetPayableUseCase);
    updatePayableUseCase = module.get(UpdatePayableUseCase);
    deletePayableUseCase = module.get(DeletePayableUseCase);
  });

  describe('create', () => {
    it('deve criar um payable e retornar DTO de resposta', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );
      const payable = new Payable(
        'payable-uuid',
        1000.50,
        new Date('2024-01-15'),
        'assignor-uuid',
        assignor,
        new Date(),
        new Date(),
      );

      createPayableUseCase.execute.mockResolvedValue(payable);

      const requestDto = {
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid',
      };

      
      const result = await controller.create(requestDto);

      
      expect(result).toEqual({
        id: 'payable-uuid',
        value: 1000.50,
        emissionDate: new Date('2024-01-15'),
        assignorId: 'assignor-uuid',
        assignor: {
          id: 'assignor-uuid',
          name: 'Nome do Cedente',
        },
        createdAt: expect.any(Date),
        updatedAt: expect.any(Date),
      });
      expect(createPayableUseCase.execute).toHaveBeenCalledWith({
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid',
      });
    });

    it('deve retornar DTO sem assignor quando assignor não está incluído', async () => {
      
      const payable = new Payable(
        'payable-uuid',
        1000.50,
        new Date('2024-01-15'),
        'assignor-uuid',
        undefined,
        new Date(),
        new Date(),
      );

      createPayableUseCase.execute.mockResolvedValue(payable);

      const requestDto = {
        value: 1000.50,
        emissionDate: '2024-01-15T00:00:00.000Z',
        assignor: 'assignor-uuid',
      };

      
      const result = await controller.create(requestDto);

      
      expect(result.assignor).toBeUndefined();
      expect(result.assignorId).toBe('assignor-uuid');
    });
  });

  describe('getById', () => {
    it('deve retornar payable por id', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );
      const payable = new Payable(
        'payable-uuid',
        1000.50,
        new Date('2024-01-15'),
        'assignor-uuid',
        assignor,
      );

      getPayableUseCase.execute.mockResolvedValue(payable);

      
      const result = await controller.getById('payable-uuid');

      
      expect(result.id).toBe('payable-uuid');
      expect(result.value).toBe(1000.50);
      expect(result.assignor?.name).toBe('Nome do Cedente');
      expect(getPayableUseCase.execute).toHaveBeenCalledWith('payable-uuid');
    });

    it('deve propagar NotFoundException quando payable não existe', async () => {
      
      getPayableUseCase.execute.mockRejectedValue(
        new NotFoundException('Payable com id payable-uuid não encontrado'),
      );

       & Assert
      await expect(controller.getById('payable-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar payable parcialmente', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );
      const updatedPayable = new Payable(
        'payable-uuid',
        2000.75,
        new Date('2024-01-16'),
        'assignor-uuid',
        assignor,
      );

      updatePayableUseCase.execute.mockResolvedValue(updatedPayable);

      
      const result = await controller.update('payable-uuid', {
        value: 2000.75,
        emissionDate: '2024-01-16T00:00:00.000Z',
      });

      
      expect(result.value).toBe(2000.75);
      expect(updatePayableUseCase.execute).toHaveBeenCalledWith(
        'payable-uuid',
        {
          value: 2000.75,
          emissionDate: new Date('2024-01-16T00:00:00.000Z'),
        },
      );
    });

    it('deve atualizar assignor quando fornecido', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );
      const updatedPayable = new Payable(
        'payable-uuid',
        1000.50,
        new Date('2024-01-15'),
        'new-assignor-uuid',
        assignor,
      );

      updatePayableUseCase.execute.mockResolvedValue(updatedPayable);

      
      const result = await controller.update('payable-uuid', {
        assignor: 'new-assignor-uuid',
      });

      
      expect(result.assignorId).toBe('new-assignor-uuid');
      expect(updatePayableUseCase.execute).toHaveBeenCalledWith(
        'payable-uuid',
        {
          assignorId: 'new-assignor-uuid',
        },
      );
    });

    it('deve ignorar campos undefined no update', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );
      const updatedPayable = new Payable(
        'payable-uuid',
        2000.75,
        new Date('2024-01-15'),
        'assignor-uuid',
        assignor,
      );

      updatePayableUseCase.execute.mockResolvedValue(updatedPayable);

      
      await controller.update('payable-uuid', {
        value: 2000.75,
        emissionDate: undefined,
        assignor: undefined,
      });

      
      expect(updatePayableUseCase.execute).toHaveBeenCalledWith(
        'payable-uuid',
        {
          value: 2000.75,
        },
      );
    });
  });

  describe('delete', () => {
    it('deve deletar payable e retornar mensagem', async () => {
      
      deletePayableUseCase.execute.mockResolvedValue(undefined);

      
      const result = await controller.delete('payable-uuid');

      
      expect(result).toEqual({
        message: 'Payable com id payable-uuid foi deletado com sucesso',
      });
      expect(deletePayableUseCase.execute).toHaveBeenCalledWith('payable-uuid');
    });

    it('deve propagar NotFoundException quando payable não existe', async () => {
      
      deletePayableUseCase.execute.mockRejectedValue(
        new NotFoundException('Payable com id payable-uuid não encontrado'),
      );

       & Assert
      await expect(controller.delete('payable-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
