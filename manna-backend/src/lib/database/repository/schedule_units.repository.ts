import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Schedule_units, Schedules, Users } from '@prisma/client';

@Injectable()
export class ScheduleUnitsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(schedule: Prisma.Schedule_unitsWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Schedule_units[] | null> {
    const result = await prisma.schedule_units.findMany({ where: schedule });

    return result;
  }

  async creates(schedule: Prisma.Schedule_unitsCreateManyInput[], prisma: Prisma.TransactionClient = this.prisma): Promise<{ count: number }> {
    return await prisma.schedule_units.createMany({ data: schedule });
  }
}
