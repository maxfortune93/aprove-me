import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { LogLevel } from './shared/logger/types';

process.on('uncaughtException', (err) => {
  console.error('🔥 Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('🔥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const logLevel =
    (process.env.LOG_LEVEL?.toUpperCase() as LogLevel) ||
    (isProduction ? LogLevel.LOG : LogLevel.DEBUG);
  const logFormat = process.env.LOG_FORMAT || (isProduction ? 'json' : 'color');

  const logger = new LoggerService({
    context: 'AproveMe',
    level: logLevel,
    json: logFormat === 'json',
    timestamp: true,
    showContext: true,
    isoTimestamp: true,
  });

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Aplicação rodando na porta ${port}`);
}

bootstrap();
