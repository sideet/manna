// src/database/prisma/prisma.service.ts
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    super();

    // 타임스탬프 자동 세팅을 적용할 모델
    const MODELS_WITH_TIMESTAMPS = new Set(['Users', 'Schedules', 'ScheduleParticipants', 'ParticipationTimes']);

    this.$use(async (params, next) => {
      if (!params.model || !MODELS_WITH_TIMESTAMPS.has(params.model)) {
        return next(params);
      }

      // data 안전 초기화
      if (!params.args) params.args = {};

      const now = DateTime.now().setZone('Asia/Seoul').toJSDate();

      switch (params.action) {
        case 'create': {
          if (!params.args.data) params.args.data = {};

          if (params.args.data.create_datetime == null) {
            params.args.data.create_datetime = now;
          }
          break;
        }

        case 'update':
        case 'updateMany': {
          if (!params.args.data) params.args.data = {};
          // 업데이트마다 항상 갱신
          params.args.data.update_datetime = now;
          break;
        }

        default:
          break;
      }

      return next(params);
    });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
