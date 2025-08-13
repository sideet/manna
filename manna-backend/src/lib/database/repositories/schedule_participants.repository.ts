import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ScheduleParticipants } from '@prisma/client';
import { GetsScheduleParticipantsInput, ScheduleParticipantWithTimesAndUnits } from '../types';

@Injectable()
export class ScheduleParticipantsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(input: GetsScheduleParticipantsInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleParticipantWithTimesAndUnits[]> {
    const { where, take = 10, cursor, sort = 'asc' } = input;

    return await prisma.scheduleParticipants.findMany({
      where,
      take,
      ...(cursor && {
        skip: 1,
        cursor: {
          no: cursor.no,
        },
      }),
      orderBy: [{ no: sort }],
      include: {
        participation_times: {
          include: {
            schedule_unit: true,
          },
        },
      },
    });
  }

  async create(answer: Prisma.ScheduleParticipantsCreateInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleParticipants> {
    return await prisma.scheduleParticipants.create({ data: answer });
  }

  async delete(
    where: Prisma.ScheduleParticipantsWhereInput,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<{
    count: number;
  }> {
    return prisma.scheduleParticipants.deleteMany({
      where,
    });
  }
}
