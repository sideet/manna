import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Participation_times, Prisma, Schedule_units, Schedules, Users } from '@prisma/client';

@Injectable()
export class ParticipationTimesRepository {
  constructor(private prisma: PrismaService) {}

  async gets(participation_times: Prisma.Participation_timesWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<Participation_times[] | null> {
    const result = await prisma.participation_times.findMany({ where: participation_times });

    return result;
  }

  async creates(times: Prisma.Participation_timesCreateManyInput[], prisma: Prisma.TransactionClient = this.prisma): Promise<{ count: number }> {
    return await prisma.participation_times.createMany({ data: times });
  }
}
