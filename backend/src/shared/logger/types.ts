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

export function parseLogLevel(
  input: string | undefined,
  fallback: LogLevel,
): LogLevel {
  if (!input) return fallback;

  const normalized = input.trim().toLowerCase();
  const allowed = new Set<string>(Object.values(LogLevel));
  if (allowed.has(normalized)) {
    return normalized as LogLevel;
  }

  return fallback;
}
