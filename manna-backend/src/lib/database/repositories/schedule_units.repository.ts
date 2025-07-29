import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ScheduleUnitWithParticipants } from '../types';

@Injectable()
export class ScheduleUnitsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(schedule: Prisma.ScheduleUnitsWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleUnitWithParticipants[]> {
    const result = await prisma.scheduleUnits.findMany({
      where: schedule,
      include: {
        participation_times: {
          include: {
            schedule_participant: true,
          },
        },
      },
    });

    return result;
  }

  async creates(schedule: Prisma.ScheduleUnitsCreateManyInput[], prisma: Prisma.TransactionClient = this.prisma): Promise<{ count: number }> {
    return await prisma.scheduleUnits.createMany({ data: schedule });
  }

  async delete(
    where: Prisma.ScheduleUnitsWhereInput,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<{
    count: number;
  }> {
    return prisma.scheduleUnits.deleteMany({
      where,
    });
  }
}
