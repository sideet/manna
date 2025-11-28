import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Response } from 'express';
import { Observable, map } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { DATE_CONVERSION } from '../decorators';
import { DateUtil } from '../utils';

export interface Res<T> {
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, Res<T>> {
  constructor(
    private readonly reflector: Reflector,
    private readonly dateUtil: DateUtil
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<Res<T>> {
    const ctx = context.switchToHttp();

    const req = ctx.getRequest<Request>();

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
        const payload = is_convert ? this.dateUtil.convertData(data) : data;

        return { status: 'success', ...payload };
      })
    );
  }
}
