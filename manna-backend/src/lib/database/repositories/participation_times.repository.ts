import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { ParticipationTimes, Prisma } from '@prisma/client';

@Injectable()
export class ParticipationTimesRepository {
  constructor(private prisma: PrismaService) {}

  async gets(participation_times: Prisma.ParticipationTimesWhereInput, prisma: Prisma.TransactionClient = this.prisma): Promise<ParticipationTimes[] | null> {
    const result = await prisma.participationTimes.findMany({ where: participation_times });

    return result;
  }

  async creates(times: Prisma.ParticipationTimesCreateManyInput[], prisma: Prisma.TransactionClient = this.prisma): Promise<{ count: number }> {
    return await prisma.participationTimes.createMany({ data: times });
  }
}
