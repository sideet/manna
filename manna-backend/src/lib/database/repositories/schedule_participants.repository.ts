import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, Schedule_participants } from '@prisma/client';
import { ScheduleParticipantWithTimesAndUnits } from '../types';

@Injectable()
export class ScheduleParticipantsRepository {
  constructor(private prisma: PrismaService) {}

  async gets(schedule_participants: Prisma.Schedule_participantsWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleParticipantWithTimesAndUnits[]> {
    return await prisma.schedule_participants.findMany({
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

  async create(answer: Prisma.Schedule_participantsCreateInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Schedule_participants> {
    return await prisma.schedule_participants.create({ data: answer });
  }
}
