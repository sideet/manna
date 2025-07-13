import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, PrismaClient, Schedule_participants, Schedules, Users } from '@prisma/client';

export type ScheduleWithParticipants = Prisma.SchedulesGetPayload<{
  include: {
    schedule_participants: true;
  };
}>;

@Injectable()
export class SchedulesRepository {
  constructor(private prisma: PrismaService) {}

  async get(schedule: Prisma.SchedulesWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Schedules | null> {
    const result = await prisma.schedules.findFirst({ where: schedule });

    return result;
  }

  async gets(schedule: Prisma.SchedulesWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ScheduleWithParticipants[]> {
    const result = await prisma.schedules.findMany({
      where: schedule,
      include: {
        schedule_participants: true,
      },
    });

    return result;
  }

  async create(schedule: Prisma.SchedulesCreateInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Schedules> {
    return await prisma.schedules.create({ data: schedule });
  }

  async update(params: { where: Prisma.SchedulesWhereUniqueInput; data: Prisma.SchedulesUpdateInput }, prisma: Prisma.TransactionClient = this.prisma): Promise<Schedules> {
    const { where, data } = params;
    return prisma.schedules.update({
      data,
      where,
    });
  }
}
