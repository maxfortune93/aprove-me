import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { AssignorController } from './assignor.controller';
import { CreateAssignorUseCase } from '../../../core/application/assignor/create-assignor.usecase';
import { GetAssignorUseCase } from '../../../core/application/assignor/get-assignor.usecase';
import { UpdateAssignorUseCase } from '../../../core/application/assignor/update-assignor.usecase';
import { DeleteAssignorUseCase } from '../../../core/application/assignor/delete-assignor.usecase';
import { ListAssignorsUseCase } from '../../../core/application/assignor/list-assignors.usecase';
import { Assignor } from '../../../core/domain/assignor/assignor.entity';

describe('AssignorController', () => {
  let controller: AssignorController;
  let createAssignorUseCase: jest.Mocked<CreateAssignorUseCase>;
  let getAssignorUseCase: jest.Mocked<GetAssignorUseCase>;
  let updateAssignorUseCase: jest.Mocked<UpdateAssignorUseCase>;
  let deleteAssignorUseCase: jest.Mocked<DeleteAssignorUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AssignorController],
      providers: [
        {
          provide: CreateAssignorUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: GetAssignorUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: ListAssignorsUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: UpdateAssignorUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
        {
          provide: DeleteAssignorUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AssignorController>(AssignorController);
    createAssignorUseCase = module.get(CreateAssignorUseCase);
    getAssignorUseCase = module.get(GetAssignorUseCase);
    updateAssignorUseCase = module.get(UpdateAssignorUseCase);
    deleteAssignorUseCase = module.get(DeleteAssignorUseCase);
  });

  describe('create', () => {
    it('deve criar um assignor e retornar o resultado', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
        new Date(),
        new Date(),
      );

      createAssignorUseCase.execute.mockResolvedValue(assignor);

      const requestDto = {
        document: '12345678901',
        email: 'assignor@example.com',
        phone: '11999999999',
        name: 'Nome do Cedente',
      };

      
      const result = await controller.create(requestDto);

      
      expect(result).toEqual(assignor);
      expect(createAssignorUseCase.execute).toHaveBeenCalledWith({
        document: '12345678901',
        email: 'assignor@example.com',
        phone: '11999999999',
        name: 'Nome do Cedente',
      });
    });
  });

  describe('getById', () => {
    it('deve retornar assignor por id', async () => {
      
      const assignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome do Cedente',
      );

      getAssignorUseCase.execute.mockResolvedValue(assignor);

      
      const result = await controller.getById('assignor-uuid');

      
      expect(result).toEqual(assignor);
      expect(getAssignorUseCase.execute).toHaveBeenCalledWith('assignor-uuid');
    });

    it('deve propagar NotFoundException quando assignor não existe', async () => {
      
      getAssignorUseCase.execute.mockRejectedValue(
        new NotFoundException('Assignor com id assignor-uuid não encontrado'),
      );

      await expect(controller.getById('assignor-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('deve atualizar assignor parcialmente', async () => {
      
      const updatedAssignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'novoemail@example.com',
        '11888888888',
        'Nome Atualizado',
      );

      updateAssignorUseCase.execute.mockResolvedValue(updatedAssignor);

      
      const result = await controller.update('assignor-uuid', {
        email: 'novoemail@example.com',
        phone: '11888888888',
        name: 'Nome Atualizado',
      });

      
      expect(result).toEqual(updatedAssignor);
      expect(updateAssignorUseCase.execute).toHaveBeenCalledWith(
        'assignor-uuid',
        {
          email: 'novoemail@example.com',
          phone: '11888888888',
          name: 'Nome Atualizado',
        },
      );
    });

    it('deve atualizar apenas campos fornecidos', async () => {
      
      const updatedAssignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'assignor@example.com',
        '11999999999',
        'Nome Atualizado',
      );

      updateAssignorUseCase.execute.mockResolvedValue(updatedAssignor);

      
      const result = await controller.update('assignor-uuid', {
        name: 'Nome Atualizado',
      });

      
      expect(result).toEqual(updatedAssignor);
      expect(updateAssignorUseCase.execute).toHaveBeenCalledWith(
        'assignor-uuid',
        {
          name: 'Nome Atualizado',
        },
      );
    });

    it('deve ignorar campos undefined no update', async () => {
      
      const updatedAssignor = new Assignor(
        'assignor-uuid',
        '12345678901',
        'novoemail@example.com',
        '11999999999',
        'Nome do Cedente',
      );

      updateAssignorUseCase.execute.mockResolvedValue(updatedAssignor);

      
      await controller.update('assignor-uuid', {
        email: 'novoemail@example.com',
        document: undefined,
        phone: undefined,
        name: undefined,
      });

      
      expect(updateAssignorUseCase.execute).toHaveBeenCalledWith(
        'assignor-uuid',
        {
          email: 'novoemail@example.com',
        },
      );
    });
  });

  describe('delete', () => {
    it('deve deletar assignor e retornar mensagem', async () => {
      
      deleteAssignorUseCase.execute.mockResolvedValue(undefined);

      
      const result = await controller.delete('assignor-uuid');

      
      expect(result).toEqual({
        message: 'Assignor com id assignor-uuid foi deletado com sucesso',
      });
      expect(deleteAssignorUseCase.execute).toHaveBeenCalledWith(
        'assignor-uuid',
      );
    });

    it('deve propagar NotFoundException quando assignor não existe', async () => {
      
      deleteAssignorUseCase.execute.mockRejectedValue(
        new NotFoundException('Assignor com id assignor-uuid não encontrado'),
      );

      await expect(controller.delete('assignor-uuid')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
