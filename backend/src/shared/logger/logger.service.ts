import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
// eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-unsafe-assignment
const chalk: any = require('chalk');

import { LogLevel, LogEntry } from './types';
import type { LoggerConfig } from './interfaces';
import { JsonFormatter } from './formatters/json-formatter';

type InternalLoggerConfig = LoggerConfig & {
  context: string;
  level: LogLevel;
  json: boolean;
  timestamp: boolean;
  showContext: boolean;
  isoTimestamp: boolean;
};

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly config: InternalLoggerConfig;
  private readonly jsonFormatter: JsonFormatter;

  constructor(config: LoggerConfig = {}) {
    const context =
      config.context ||
      process.env.SERVICE_NAME ||
      process.env.APP_NAME ||
      'Application';

    this.config = {
      ...config,
      context,
      level: config.level ?? LogLevel.VERBOSE,
      json: config.json ?? false,
      timestamp: config.timestamp ?? true,
      showContext: config.showContext ?? true,
      isoTimestamp: config.isoTimestamp ?? true,
    };

    this.jsonFormatter = new JsonFormatter();

    if (
      this.config.level === LogLevel.DEBUG ||
      this.config.level === LogLevel.VERBOSE
    ) {
      console.log(
        `[LoggerService] Initialized with context: ${this.config.context}`,
      );
    }
  }

  getContext(): string {
    return this.config.context;
  }

  createChildLogger(context: string): LoggerService {
    const childContext = context
      ? `${this.config.context}::${context}`
      : this.config.context;

    return new LoggerService({
      ...this.config,
      context: childContext,
    });
  }

  error(message: any, trace?: string, context?: string): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      const entry: LogEntry = this.createLogEntry(
        LogLevel.ERROR,
        message,
        context,
        undefined,
        trace,
      );
      this.output(entry);
    }
  }

  warn(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.WARN)) {
      const entry: LogEntry = this.createLogEntry(
        LogLevel.WARN,
        message,
        context,
      );
      this.output(entry);
    }
  }

  log(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.LOG)) {
      const entry: LogEntry = this.createLogEntry(
        LogLevel.LOG,
        message,
        context,
      );
      this.output(entry);
    }
  }

  debug(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      const entry: LogEntry = this.createLogEntry(
        LogLevel.DEBUG,
        message,
        context,
      );
      this.output(entry);
    }
  }

  verbose(message: any, context?: string): void {
    if (this.shouldLog(LogLevel.VERBOSE)) {
      const entry: LogEntry = this.createLogEntry(
        LogLevel.VERBOSE,
        message,
        context,
      );
      this.output(entry);
    }
  }

  logWithMetadata(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    context?: string,
  ): void {
    if (this.shouldLog(level)) {
      const entry: LogEntry = this.createLogEntry(
        level,
        message,
        context,
        metadata,
      );
      this.output(entry);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: any,
    context?: string,
    metadata?: Record<string, unknown>,
    trace?: string,
  ): LogEntry {
    const finalContext = context
      ? `${this.config.context}::${context}`
      : this.config.context;

    const entry: LogEntry = {
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message),
      context: finalContext,
      metadata,
    };

    if (this.config.timestamp) {
      entry.timestamp = this.config.isoTimestamp
        ? new Date().toISOString()
        : new Date().toLocaleString();
    }

    if (trace) {
      entry.trace = trace;
    }

    if (message instanceof Error) {
      entry.error = message.message;
      entry.trace = message.stack;
    }

    return entry;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [
      LogLevel.ERROR,
      LogLevel.WARN,
      LogLevel.LOG,
      LogLevel.DEBUG,
      LogLevel.VERBOSE,
    ];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  private output(entry: LogEntry): void {
    if (this.config.json) {
      console.log(this.jsonFormatter.format(entry));
      return;
    }

    this.formatAndLog(entry);
  }

  private formatAndLog(entry: LogEntry): void {
    const parts: string[] = [];

    if (entry.timestamp) {
      parts.push(chalk.gray(`[${entry.timestamp}]`));
    }

    parts.push(this.colorizeLevelLabel(entry.level));

    if (this.config.showContext && entry.context) {
      const formattedContext = this.formatContext(entry.context);
      if (formattedContext) {
        parts.push(formattedContext);
      }
    }

    parts.push(this.colorizeLevelMessage(entry.level, entry.message));

    const logMessage = parts.join(' ');

    switch (entry.level) {
      case LogLevel.ERROR:
        console.error(logMessage);
        if (entry.trace) {
          console.error(chalk.red(entry.trace));
        }
        break;
      case LogLevel.WARN:
        console.warn(logMessage);
        break;
      case LogLevel.DEBUG:
        console.debug(logMessage);
        break;
      default:
        console.log(logMessage);
    }

    if (entry.metadata && Object.keys(entry.metadata).length > 0) {
      const metadataLabel = chalk.gray('  Metadata:');
      console.log(
        `${metadataLabel} ${chalk.white(JSON.stringify(entry.metadata, null, 2))}`,
      );
    }
  }

  private formatContext(rawContext: string): string {
    const [root, ...rest] = rawContext.split('::');
    const formattedParts: string[] = [];

    if (root) {
      formattedParts.push(this.colorizeContext(root));
    }

    if (rest.length > 0) {
      const separator = chalk.gray(' : : ') as string;
      const tail = rest
        .filter(Boolean)
        .map((segment) => chalk.white(`[${segment}]`) as string)
        .join(separator);

      if (tail) {
        formattedParts.push(separator + tail);
      }
    }

    return formattedParts.join('');
  }

  private colorizeContext(context: string): string {
    const label = `[${context}]`;
    const contextColor = this.config.contextColor;

    if (!contextColor) {
      return chalk.blue(label) as string;
    }

    if (typeof contextColor === 'function') {
      return contextColor(label);
    }

    try {
      const trimmed = contextColor.trim();

      if (trimmed.startsWith('#')) {
        return chalk.hex(trimmed)(label) as string;
      }

      const normalized = trimmed.toLowerCase();
      const chalkFn = (
        chalk as unknown as Record<string, (text: string) => string>
      )[normalized];
      if (typeof chalkFn === 'function') {
        return chalkFn(label);
      }

      return chalk.keyword(normalized)(label) as string;
    } catch {
      console.warn(
        '[LoggerService] Invalid contextColor provided. Falling back to default.',
      );
      return chalk.blue(label) as string;
    }
  }

  private colorizeLevelLabel(level: LogLevel): string {
    const label = `[${level.toUpperCase()}]`;

    switch (level) {
      case LogLevel.ERROR:
        return chalk.bgRed.white(label) as string;
      case LogLevel.WARN:
        return chalk.bgYellow.black(label) as string;
      case LogLevel.DEBUG:
        return chalk.bgCyan.black(label) as string;
      case LogLevel.VERBOSE:
        return chalk.bgGray.white(label) as string;
      default:
        return chalk.bgGreen.black(label) as string;
    }
  }

  private colorizeLevelMessage(level: LogLevel, message: string): string {
    switch (level) {
      case LogLevel.ERROR:
        return chalk.red(message) as string;
      case LogLevel.WARN:
        return chalk.yellow(message) as string;
      case LogLevel.DEBUG:
        return chalk.cyan(message) as string;
      case LogLevel.VERBOSE:
        return chalk.gray(message) as string;
      default:
        return chalk.white(message) as string;
    }
  }
}
