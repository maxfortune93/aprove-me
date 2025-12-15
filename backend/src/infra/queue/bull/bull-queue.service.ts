import { Injectable, OnModuleDestroy, Logger } from '@nestjs/common';
import Queue from 'bull';
import Redis from 'ioredis';
import type { IQueueService } from '../../../core/domain/queue/queue.service.interface';
import type { QueueJobStatus } from '../../../core/domain/queue/queue-message.interface';
import type {
  QueueOptions,
  QueueProcessorOptions,
} from '../../../core/domain/queue/queue-options.interface';
import type { QueueProcessor } from '../../../core/domain/queue/queue.service.interface';

type BullQueue = ReturnType<typeof Queue>;

@Injectable()
export class BullQueueService implements IQueueService, OnModuleDestroy {
  private queues: Map<string, BullQueue> = new Map();
  private readonly logger = new Logger(BullQueueService.name);

  constructor() {
    this.logger.log('BullQueueService initialized');
  }

  private getQueue(
    queueName: string,
    options?: QueueProcessorOptions,
  ): BullQueue {
    if (this.queues.has(queueName)) {
      if (options?.limiter) {
        this.logger.warn(
          `Limiter requested for existing queue ${queueName}. Limiter is only applied on queue creation.`,
        );
      }
      return this.queues.get(queueName)!;
    }

    try {
      this.logger.log(`Creating queue: ${queueName}`);

      const clientsByType: Record<string, Redis> = {};
      const createBullRedisClient = (type: string): Redis => {
        if (clientsByType[type]) return clientsByType[type];

        const client = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD || undefined,
          retryStrategy: (times) => {
            const delay = Math.min(times * 50, 2000);
            this.logger.warn(
              `Redis retry (queue=${queueName}, type=${type}) attempt ${times}, waiting ${delay}ms`,
            );
            return delay;
          },
          connectTimeout: 10000,
          enableReadyCheck: false,
          maxRetriesPerRequest: null,
        });

        client.on('error', (err) => {
          this.logger.error(
            `Redis error (queue=${queueName}, type=${type}): ${err.message}`,
          );
        });
        client.on('connect', () => {
          this.logger.log(`Redis connected (queue=${queueName}, type=${type})`);
        });
        client.on('ready', () => {
          this.logger.log(`Redis ready (queue=${queueName}, type=${type})`);
        });
        client.on('reconnecting', () => {
          this.logger.warn(
            `Redis reconnecting (queue=${queueName}, type=${type})`,
          );
        });
        client.on('close', () => {
          this.logger.warn(`Redis closed (queue=${queueName}, type=${type})`);
        });

        clientsByType[type] = client;
        return client;
      };

      const queueOptions: any = {
        createClient: (type: string) => {
          return createBullRedisClient(type);
        },
        defaultJobOptions: {
          removeOnComplete: 100,
          removeOnFail: 50,
        },
      };

      if (options?.limiter) {
        queueOptions.limiter = {
          max: options.limiter.max,
          duration: options.limiter.duration,
        };
        this.logger.log(
          `Applying limiter to queue ${queueName} (max=${options.limiter.max}, duration=${options.limiter.duration}ms)`,
        );
      }

      const queue = new Queue(queueName, queueOptions);

      queue.on('error', (error) => {
        this.logger.error(`Queue ${queueName} error: ${error.message}`);
      });

      queue.on('waiting', (jobId) => {
        this.logger.debug(`Job ${jobId} waiting in queue ${queueName}`);
      });

      queue.on('active', (job: any) => {
        this.logger.log(
          `Job ${job?.id ?? 'unknown'} active in queue ${queueName}`,
        );
      });

      queue.on('completed', (job: any) => {
        this.logger.log(
          `Job ${job?.id ?? 'unknown'} completed in queue ${queueName}`,
        );
      });

      queue.on('stalled', (job: any) => {
        this.logger.warn(
          `Job ${job?.id ?? 'unknown'} stalled in queue ${queueName}`,
        );
      });

      queue.on('progress', (job: any, progress: any) => {
        this.logger.debug(
          `Job ${job?.id ?? 'unknown'} progress in queue ${queueName}: ${typeof progress === 'string' ? progress : JSON.stringify(progress)}`,
        );
      });

      this.queues.set(queueName, queue);
      this.logger.log(`Queue ${queueName} created successfully`);

      queue.on('failed', (job: any, err: Error) => {
        void this.handleFailedJob(queueName, job, err);
      });
    } catch (error) {
      this.logger.error(
        `Failed to create queue ${queueName}: ${error instanceof Error ? error.message : String(error)}`,
      );
      throw error;
    }
    return this.queues.get(queueName)!;
  }

  private async handleFailedJob(
    queueName: string,
    job: any,
    err: Error,
  ): Promise<void> {
    this.logger.error(
      `Job ${job?.id ?? 'unknown'} failed in queue ${queueName} (attemptsMade=${job?.attemptsMade ?? 'unknown'}): ${err.message}`,
    );

    if (job.attemptsMade >= 4) {
      try {
        if (queueName === 'payable-batch-dlq') return;

        const dlqQueue = this.getQueue('payable-batch-dlq');
        await dlqQueue.add(job.data, {
          removeOnComplete: false,
          removeOnFail: false,
        });
      } catch (dlqError) {
        this.logger.error(
          `Failed to send job to DLQ: ${dlqError instanceof Error ? dlqError.message : String(dlqError)}`,
        );
      }
    }
  }

  async enqueue<T = any>(
    queueName: string,
    data: T,
    options?: QueueOptions,
  ): Promise<string> {
    const queue = this.getQueue(queueName);

    const jobOptions: any = {
      attempts: options?.attempts || 4,
      delay: options?.delay || 0,
      removeOnComplete: options?.removeOnComplete ?? 100,
      removeOnFail: options?.removeOnFail ?? 50,
    };

    if (options?.backoff) {
      jobOptions.backoff = {
        type: options.backoff.type === 'exponential' ? 'exponential' : 'fixed',
        delay: options.backoff.delay,
      };
    }

    const job = await queue.add(data, jobOptions);
    return job.id.toString();
  }

  process<T = any>(
    queueName: string,
    processor: QueueProcessor<T>,
    options?: QueueProcessorOptions,
  ): void {
    const queue = this.getQueue(queueName, options);

    const concurrency = options?.concurrency || 1;

    this.logger.log(
      `Registering processor for queue ${queueName} (concurrency=${concurrency})`,
    );

    queue.process(concurrency, async (job: any) => {
      try {
        await processor(job.data, job.id.toString());
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        throw new Error(errorMessage);
      }
    });
  }

  async getJobStatus(
    jobId: string,
    queueName: string,
  ): Promise<QueueJobStatus | null> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (!job) {
      return null;
    }

    const state = await job.getState();

    return {
      id: job.id.toString(),
      status: this.mapBullStatusToQueueStatus(state),
      attempts: job.attemptsMade,
      progress: job.progress(),
      error: job.failedReason || undefined,
      createdAt: new Date(job.timestamp),
      processedAt: job.processedOn ? new Date(job.processedOn) : undefined,
    };
  }

  async removeJob(jobId: string, queueName: string): Promise<void> {
    const queue = this.getQueue(queueName);
    const job = await queue.getJob(jobId);

    if (job) {
      await job.remove();
    }
  }

  async cleanQueue(queueName: string, grace: number = 1000): Promise<void> {
    const queue = this.getQueue(queueName);
    await queue.clean(grace, 'completed');
    await queue.clean(grace, 'failed');
  }

  private mapBullStatusToQueueStatus(state: string): QueueJobStatus['status'] {
    switch (state) {
      case 'waiting':
      case 'delayed':
        return 'waiting';
      case 'active':
        return 'active';
      case 'completed':
        return 'completed';
      case 'failed':
        return 'failed';
      default:
        return 'waiting';
    }
  }

  async onModuleDestroy() {
    for (const queue of this.queues.values()) {
      await queue.close();
    }
    this.queues.clear();
  }
}
