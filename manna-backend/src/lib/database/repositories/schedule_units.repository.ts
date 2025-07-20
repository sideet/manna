import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma } from '@prisma/client';
import { ScheduleUnitWithParticipants } from '../types';

@Injectable()
export class ScheduleUnitsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(schedule: Prisma.Schedule_unitsWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleUnitWithParticipants[]> {
    const result = await prisma.schedule_units.findMany({
      where: schedule,
      include: {
        participation_times: {
          include: {
            schedule_participants: true,
          },
        },
      },
    });

    return result;
  }

  async creates(schedule: Prisma.Schedule_unitsCreateManyInput[], prisma: Prisma.TransactionClient = this.prisma): Promise<{ count: number }> {
    return await prisma.schedule_units.createMany({ data: schedule });
  }
}
