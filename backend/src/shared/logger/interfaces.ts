import { LogLevel } from './types';

export interface LoggerConfig {
  context?: string;
  level?: LogLevel;
  json?: boolean;
  timestamp?: boolean;
  showContext?: boolean;
  isoTimestamp?: boolean;
  contextColor?: string | ((text: string) => string);
}
