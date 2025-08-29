import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Prisma, ScheduleParticipants } from '@prisma/client';

@Injectable()
export class ScheduleParticipantsRepository {
  constructor(private prisma: PrismaService) {}

  async gets<T extends Prisma.ScheduleParticipantsFindManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ScheduleParticipantsFindManyArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.ScheduleParticipantsGetPayload<T>[]> {
    return prisma.scheduleParticipants.findMany(args);
  }

  async create<T extends Prisma.ScheduleParticipantsCreateArgs>(
    args: Prisma.SelectSubset<T, Prisma.ScheduleParticipantsCreateArgs>,
    prisma: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.ScheduleParticipantsGetPayload<T>> {
    return await prisma.scheduleParticipants.create(args);
  }

  async delete<T extends Prisma.ScheduleParticipantsDeleteManyArgs>(
    args: Prisma.SelectSubset<T, Prisma.ScheduleParticipantsDeleteManyArgs>,
    pool: Prisma.TransactionClient = this.prisma
  ): Promise<Prisma.BatchPayload> {
    return pool.scheduleParticipants.deleteMany(args);
  }
}
