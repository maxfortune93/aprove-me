export interface BatchJobData {
  batchId: string;
  payable: {
    id: string;
    value: number;
    emissionDate: string;
    assignor: string;
  };
  totalPayablesInBatch: number;
  attempt?: number;
}

export interface BatchResult {
  batchId: string;
  total: number;
  success: number;
  failed: number;
  errors: Array<{
    payableId: string;
    error: string;
  }>;
  processedAt: Date;
}
