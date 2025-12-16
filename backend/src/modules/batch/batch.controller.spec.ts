import { Test, TestingModule } from '@nestjs/testing';
import { BatchController } from './batch.controller';
import { CreateBatchUseCase } from '../../core/application/batch/create-batch.usecase';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mocked-uuid'),
}));

describe('BatchController', () => {
  let controller: BatchController;
  let createBatchUseCase: jest.Mocked<CreateBatchUseCase>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BatchController],
      providers: [
        {
          provide: CreateBatchUseCase,
          useValue: {
            execute: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<BatchController>(BatchController);
    createBatchUseCase = module.get(CreateBatchUseCase);
  });

  describe('createBatch', () => {
    it('deve criar um lote e retornar resposta com batchId', async () => {
      
      const batchId = 'batch-uuid-123';
      createBatchUseCase.execute.mockResolvedValue({ batchId });

      const requestDto = {
        payables: [
          {
            value: 1000.50,
            emissionDate: '2024-01-15T00:00:00.000Z',
            assignor: 'assignor-uuid-1',
          },
          {
            value: 2000.75,
            emissionDate: '2024-01-16T00:00:00.000Z',
            assignor: 'assignor-uuid-2',
          },
        ],
      };

      
      const result = await controller.createBatch(requestDto);

      
      expect(result).toEqual({
        batchId,
        message:
          'Lote criado com sucesso. 2 pagáveis foram enfileirados para processamento.',
        totalPayables: 2,
      });
      expect(createBatchUseCase.execute).toHaveBeenCalledWith([
        {
          value: 1000.50,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid-1',
        },
        {
          value: 2000.75,
          emissionDate: '2024-01-16T00:00:00.000Z',
          assignor: 'assignor-uuid-2',
        },
      ]);
    });

    it('deve mapear corretamente os payables do request para DTO', async () => {
      
      const batchId = 'batch-uuid-123';
      createBatchUseCase.execute.mockResolvedValue({ batchId });

      const requestDto = {
        payables: [
          {
            value: 1000.50,
            emissionDate: '2024-01-15T00:00:00.000Z',
            assignor: 'assignor-uuid-1',
          },
        ],
      };

      
      await controller.createBatch(requestDto);

      
      expect(createBatchUseCase.execute).toHaveBeenCalledWith([
        {
          value: 1000.50,
          emissionDate: '2024-01-15T00:00:00.000Z',
          assignor: 'assignor-uuid-1',
        },
      ]);
    });

    it('deve retornar mensagem correta com total de payables', async () => {
      
      const batchId = 'batch-uuid-123';
      createBatchUseCase.execute.mockResolvedValue({ batchId });

      const requestDto = {
        payables: [
          {
            value: 1000.50,
            emissionDate: '2024-01-15T00:00:00.000Z',
            assignor: 'assignor-uuid-1',
          },
          {
            value: 2000.75,
            emissionDate: '2024-01-16T00:00:00.000Z',
            assignor: 'assignor-uuid-2',
          },
          {
            value: 3000.00,
            emissionDate: '2024-01-17T00:00:00.000Z',
            assignor: 'assignor-uuid-3',
          },
        ],
      };

      
      const result = await controller.createBatch(requestDto);

      
      expect(result.totalPayables).toBe(3);
      expect(result.message).toContain('3 pagáveis foram enfileirados');
    });

    it('deve processar lote vazio', async () => {
      
      const batchId = 'batch-uuid-123';
      createBatchUseCase.execute.mockResolvedValue({ batchId });

      const requestDto = {
        payables: [],
      };

      
      const result = await controller.createBatch(requestDto);

      
      expect(result).toEqual({
        batchId,
        message:
          'Lote criado com sucesso. 0 pagáveis foram enfileirados para processamento.',
        totalPayables: 0,
      });
      expect(createBatchUseCase.execute).toHaveBeenCalledWith([]);
    });
  });
});
