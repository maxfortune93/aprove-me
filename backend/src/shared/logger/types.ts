export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  LOG = 'log',
  DEBUG = 'debug',
  VERBOSE = 'verbose',
}

export interface LogEntry {
  level: LogLevel;
  message: string;
  context: string;
  timestamp?: string;
  trace?: string;
  error?: string;
  metadata?: Record<string, unknown>;
}
