import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ScheduleUnitsRepository {
  constructor(private prisma: PrismaService) {}

  async gets<T extends Prisma.ScheduleUnitsFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ScheduleUnitsFindManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.ScheduleUnitsGetPayload<T>[]> {
    return prisma.scheduleUnits.findMany(args);
  }

  async creates<T extends Prisma.ScheduleUnitsCreateManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ScheduleUnitsCreateManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return await prisma.scheduleUnits.createMany(args);
  }

  async delete<T extends Prisma.ScheduleUnitsDeleteManyArgs>(args: Prisma.SelectSubset<T, Prisma.SchedulesDeleteManyArgs>, pool: Prisma.TransactionClient = this.prisma): Promise<Prisma.BatchPayload> {
    return pool.scheduleUnits.deleteMany(args);
  }
}
