import { HttpStatus, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CommonUtil, DateUtil } from '../utils';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  constructor(
    private readonly commonUtil: CommonUtil,
    private readonly dateUtil: DateUtil
  ) {}

  use(req: Request, res: Response, next: NextFunction) {
    const { method, originalUrl } = req;
    const ip = req.header('x-forwarded-for') || req.ip.split(':')[3];
    const userAgent = req.get('user-agent') || '';
    const request_start_time = Date.now();

    res.on('close', () => {
      try {
        const request_end_time = Date.now();
        const { statusCode } = res;
        const data: {
          datetime: string;
          statusCode: number;
          method: string;
          responseTime: string;
          ip: string;
          host: string;
          url: string;
          query?: any;
          params?: any;
          body?: any;
          auth?: any;
          userAgent: string;
        } = {
          statusCode,
          method,
          url: req.url,
          auth: req.headers['authorization']
            ? this.commonUtil.decodeJwtToken(req.headers['authorization'])
            : undefined,
          query:
            req.query &&
            (Object.keys(req.query).length !== 0 ? req.query : undefined),
          params:
            req.params && Object.keys(req.params).length !== 0
              ? req.params
              : undefined,
          body:
            req.body && Object.keys(req.body).length !== 0
              ? req.body
              : undefined,
          datetime: this.dateUtil.dayjs().format('YYYY-MM-DD HH:mm:ss'),
          responseTime: `${request_end_time - request_start_time} ms`,
          ip,
          host: req.hostname,
          userAgent,
        };

        if (statusCode < HttpStatus.BAD_REQUEST) {
          this.logger.log(JSON.stringify(data));
        } else {
          this.logger.error(JSON.stringify(data));
        }
      } catch (error) {
        this.logger.error('LoggerMiddleware', error);
      }
    });
    next();
  }
}
