import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ScheduleParticipants } from '@prisma/client';
import { ScheduleParticipantWithTimesAndUnits } from '../types';

@Injectable()
export class ScheduleParticipantsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(schedule_participants: Prisma.ScheduleParticipantsWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleParticipantWithTimesAndUnits[]> {
    return await prisma.scheduleParticipants.findMany({
      where: schedule_participants,
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
}
