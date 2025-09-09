import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SchedulesRepository {
  constructor(private prisma: PrismaService) {}

  async get<T extends Prisma.SchedulesFindFirstArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesFindFirstArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.SchedulesGetPayload<T> | null> {
    return prisma.schedules.findFirst(args);
  }

  async gets<T extends Prisma.SchedulesFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesFindManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.SchedulesGetPayload<T>[]> {
    return prisma.schedules.findMany(args);
  }

  async create<T extends Prisma.SchedulesCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesCreateArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.SchedulesGetPayload<T>> {
    return await prisma.schedules.create(args);
  }

  async update<T extends Prisma.SchedulesUpdateArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesUpdateArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.SchedulesGetPayload<T>> {
    return pool.schedules.update(args);
  }

  async delete<T extends Prisma.SchedulesDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesDeleteManyArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return pool.schedules.deleteMany(args);
  }

  async getCount<T extends Prisma.SchedulesCountArgs>(
    args: Prisma.SelectSubset<T, Prisma.SchedulesCountArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ) {
    return pool.schedules.count(args);
  }
}
