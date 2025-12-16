import { LogEntry } from '../types';

export class JsonFormatter {
  format(entry: LogEntry): string {
    return JSON.stringify(entry);
  }
}
