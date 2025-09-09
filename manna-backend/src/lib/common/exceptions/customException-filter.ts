import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Request, Response } from 'express';
import { CommonUtil } from '../utils';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly commonUtil: CommonUtil
  ) {}

  async catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const { httpAdapter } = this.httpAdapterHost;

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const env = this.configService.get('env');

    const is_prod = env === 'production';

    // 요청 정보
    const url = request.url;
    const method = request.method;
    const inputs = {
      ...(request.params &&
        Object.keys(request.params).length && { params: request.params }),
      ...(request.query &&
        Object.keys(request.query).length && { query: request.query }),
      ...(request.body &&
        Object.keys(request.body).length && { body: request.body }),
    };

    const args =
      Object.keys(inputs).length > 0 ? JSON.stringify(inputs, null, 2) : '';

    // 응답 포맷 정의
    const errorResponse: Record<string, any> = {
      status: httpStatus,
      description: exception.description ?? '',
      message: exception?.message ?? '서버 요청에 실패했습니다.',
    };

    if (exception instanceof HttpException) {
      if (exception instanceof NotFoundException) {
        errorResponse.message = '잘못된 API요청입니다.';
      }
    } else {
      if (is_prod) {
        errorResponse.description = '';
        errorResponse.message = '서버 요청에 실패했습니다.';
      }
    }

    // 개발 환경일 경우 stack 포함
    if (!is_prod) {
      errorResponse.stack = exception.stack;
    }

    if (!(exception instanceof NotFoundException)) {
      this.logger.error(
        exception?.stack ? `${exception.stack}` : `${exception?.message}`
      );
    }

    httpAdapter.reply(ctx.getResponse(), errorResponse, httpStatus);

    const error_payload = {
      method,
      url,
      status: httpStatus,
      message: errorResponse.message,
      inputs: args,
      stack: exception.stack,
    };

    if (httpStatus >= HttpStatus.INTERNAL_SERVER_ERROR)
      await this.commonUtil.sendServerErrorAlert(error_payload);
  }
}
