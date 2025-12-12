import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infra/persistence/prisma/prisma.service';
import { LoggerService } from '../../shared/logger/logger.service';

export interface HealthCheckResponse {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  checks?: {
    database?: {
      status: 'ok' | 'error';
      message?: string;
    };
  };
}

@Injectable()
export class HealthService {
  private readonly logger: LoggerService;

  constructor(
    private readonly prisma: PrismaService,
    private readonly rootLogger: LoggerService,
  ) {
    this.logger = rootLogger.createChildLogger('HealthService');
  }

  async check(): Promise<HealthCheckResponse> {
    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'ok',
        },
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      if (response.checks) {
        response.checks.database = {
          status: 'ok',
        };
      }
    } catch (error) {
      this.logger.error(
        'Database health check failed',
        undefined,
        'HealthCheck',
      );
      response.status = 'error';
      if (response.checks) {
        response.checks.database = {
          status: 'error',
          message: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    }

    return response;
  }

  liveness(): HealthCheckResponse {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async readiness(): Promise<HealthCheckResponse> {
    const response: HealthCheckResponse = {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      checks: {
        database: {
          status: 'ok',
        },
      },
    };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      if (response.checks) {
        response.checks.database = {
          status: 'ok',
        };
      }
    } catch (error) {
      this.logger.error(
        'Readiness check failed - database unavailable',
        undefined,
        'HealthCheck',
      );
      response.status = 'error';
      if (response.checks) {
        response.checks.database = {
          status: 'error',
          message:
            error instanceof Error
              ? error.message
              : 'Database connection failed',
        };
      }
    }

    return response;
  }
}
