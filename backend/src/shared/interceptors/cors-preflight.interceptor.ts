import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class CorsPreflightInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    if (request.method === 'OPTIONS') {
      const origin = request.headers.origin;
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',').map((o: string) => o.trim())
        : ['http://localhost:3001', 'http://localhost:3000'];

      // Adicionar headers CORS necessários
      if (origin && allowedOrigins.includes(origin)) {
        response.header('Access-Control-Allow-Origin', origin);
      }
      response.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      response.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
      response.header('Access-Control-Allow-Credentials', 'true');
      response.header('Access-Control-Max-Age', '86400');
      
      response.status(204).end();
      return new Observable((subscriber) => {
        subscriber.complete();
      });
    }

    return next.handle();
  }
}
