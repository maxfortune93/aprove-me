export interface QueueMessage<T = any> {
  id?: string;
  data: T;
  attempts?: number;
  timestamp?: Date;
}

export interface QueueJobStatus {
  id: string;
  status: 'waiting' | 'active' | 'completed' | 'failed' | 'delayed';
  attempts: number;
  progress?: number;
  error?: string;
  createdAt?: Date;
  processedAt?: Date;
}
