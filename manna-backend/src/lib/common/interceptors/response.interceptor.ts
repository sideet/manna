import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';

export interface Res<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Res<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<Res<T>> {
    const ctx = context.switchToHttp();
    const res = ctx.getResponse<Response>();
    res.status(200);
    return next.handle().pipe(map((data) => ({ status: 'success', ...data })));
  }
}
