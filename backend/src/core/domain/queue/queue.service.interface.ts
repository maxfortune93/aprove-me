import { QueueJobStatus } from './queue-message.interface';
import { QueueOptions, QueueProcessorOptions } from './queue-options.interface';

export interface QueueProcessor<T = any> {
  (data: T, jobId: string): Promise<void>;
}

export interface IQueueService {
  /**
   * Adiciona uma mensagem à fila
   */
  enqueue<T = any>(
    queueName: string,
    data: T,
    options?: QueueOptions,
  ): Promise<string>;

  /**
   * Processa mensagens da fila
   */
  process<T = any>(
    queueName: string,
    processor: QueueProcessor<T>,
    options?: QueueProcessorOptions,
  ): void;

  /**
   * Obtém o status de um job
   */
  getJobStatus(
    jobId: string,
    queueName: string,
  ): Promise<QueueJobStatus | null>;

  /**
   * Remove um job da fila
   */
  removeJob(jobId: string, queueName: string): Promise<void>;

  /**
   * Limpa uma fila (remove todos os jobs)
   */
  cleanQueue(queueName: string, grace?: number): Promise<void>;
}
