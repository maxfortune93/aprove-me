export interface QueueOptions {
  delay?: number;
  attempts?: number;
  backoff?: BackoffOptions;
  removeOnComplete?: boolean | number;
  removeOnFail?: boolean | number;
}

export interface BackoffOptions {
  type: 'fixed' | 'exponential';
  delay: number;
}

export interface QueueProcessorOptions {
  concurrency?: number;
  limiter?: {
    max: number;
    duration: number;
  };
}
