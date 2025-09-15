import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { DEFAULT_TIME_ZONE, convertDate } from '../utils/time-zone.util';
import { Reflector } from '@nestjs/core';
import { DATE_CONVERSION } from '../decorators';

export interface Res<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Res<T>> {
  constructor(private readonly reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Res<T>> {
    const ctx = context.switchToHttp();

    const req = ctx.getRequest<Request>();
    const tz = (req?.headers?.['x-tz'] as string) || DEFAULT_TIME_ZONE;

    const res = ctx.getResponse<Response>();

    // 변환여부
    const is_convert =
      this.reflector.getAllAndOverride<boolean>(
        DATE_CONVERSION,
        [context.getHandler()] //  메서드의 메타데이터 반환
      ) ?? false;

    res.status(200);
    return next.handle().pipe(
      map((data) => {
        const payload = is_convert ? convertDate(data, tz) : data;
        return { status: 'success', ...payload };
      })
    );
  }
}
